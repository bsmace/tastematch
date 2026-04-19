import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTasteStore } from '../src/stores/tasteStore';
import { analytics } from '../src/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MATCH_THRESHOLD = 0.98;
const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes in seconds
const MAX_REJECTS = 3;

interface MatchOffer {
  id: string;
  restaurant_name: string;
  dish_name: string;
  image_url: string;
  tags: string[];
  confidence_score: number;
  expires_at: Date;
}

export default function MatchScreen() {
  const [matchOffer, setMatchOffer] = useState<MatchOffer | null>(null);
  const [rejectCount, setRejectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [showMatch, setShowMatch] = useState(true);
  
  const tasteProfile = useTasteStore((state) => state.tasteProfile);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  // Generate mock match based on taste profile
  const generateMatch = useCallback((): MatchOffer => {
    const matchingTags = tasteProfile.likedTags.slice(0, 4);
    const confidence = Math.random() * 0.05 + MATCH_THRESHOLD;
    
    return {
      id: `match-${Date.now()}`,
      restaurant_name: 'TasteMatch Picks',
      dish_name: 'Your Perfect Match',
      image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      tags: matchingTags.length > 0 ? matchingTags : ['Recommended'],
      confidence_score: Math.round(confidence * 100),
      expires_at: new Date(Date.now() + COUNTDOWN_SECONDS * 1000),
    };
  }, [tasteProfile.likedTags]);

  useEffect(() => {
    const match = generateMatch();
    setMatchOffer(match);
  }, [generateMatch]);

  // Countdown timer
  useEffect(() => {
    if (!showMatch) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Timer expired - could trigger logic here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showMatch]);

  // Pulse animation for button
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const handleAccept = () => {
    if (!matchOffer) return;
    
    analytics.trackOfferAccepted(matchOffer.id, matchOffer.confidence_score);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Show success and navigate
    setShowMatch(false);
    router.replace('/(tabs)/review');
  };

  const handleReject = () => {
    if (!matchOffer) return;
    
    const newRejectCount = rejectCount + 1;
    setRejectCount(newRejectCount);
    
    analytics.trackOfferRejected(matchOffer.id, matchOffer.confidence_score);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (newRejectCount >= MAX_REJECTS) {
      analytics.trackRejectLimitReached(newRejectCount);
      // Could show "come back later" screen
      router.back();
      return;
    }
    
    // Generate next match
    const newMatch = generateMatch();
    setMatchOffer(newMatch);
    setTimeLeft(COUNTDOWN_SECONDS);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 50) {
        handleAccept();
      } else if (event.translationX < -50) {
        handleReject();
      }
      translateX.value = withSpring(0);
    });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!matchOffer) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Finding your perfect match...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>We Found Your Match!</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{matchOffer.confidence_score}% Match</Text>
        </View>
      </View>

      {/* Countdown */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Offer expires in</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Match Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.Image
            source={{ uri: matchOffer.image_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay}>
            <Text style={styles.dishName}>{matchOffer.dish_name}</Text>
            <Text style={styles.restaurantName}>{matchOffer.restaurant_name}</Text>
            <View style={styles.tagsContainer}>
              {matchOffer.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Reject Counter */}
      <View style={styles.rejectCounter}>
        <Text style={styles.rejectText}>
          {MAX_REJECTS - rejectCount} rejects remaining
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Animated.View style={buttonStyle}>
          <Animated.Text 
            style={styles.feedMeButton}
            onPress={handleAccept}
          >
            Accept 🎯
          </Animated.Text>
        </Animated.View>
        <Text style={styles.swipeHint}>or swipe to decide</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confidenceBadge: {
    marginTop: 12,
    backgroundColor: '#4ADE80',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  timerLabel: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  timer: {
    color: '#FF6B35',
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  card: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    marginTop: 24,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  dishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  restaurantName: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectCounter: {
    marginTop: 16,
  },
  rejectText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  actions: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
  },
  feedMeButton: {
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    overflow: 'hidden',
  },
  swipeHint: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 12,
  },
});