import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { analytics } from '../../src/analytics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FeedScreen() {
  const scale = useSharedValue(1);

  // Pulse animation
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [scale]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFeedMe = () => {
    analytics.trackFeedMePressed();
    router.push('/match');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TasteMatch</Text>
        <Text style={styles.subtitle}>What are you in the mood for?</Text>
      </View>

      <View style={styles.content}>
        <AnimatedTouchable
          style={[styles.feedMeButton, buttonStyle]}
          onPress={handleFeedMe}
          activeOpacity={0.9}
        >
          <Text style={styles.feedMeText}>Feed Me 🍽️</Text>
        </AnimatedTouchable>

        <Text style={styles.hint}>
          Tap to get personalized recommendations
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Swipe right to save favorites
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedMeButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 40,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  feedMeText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  hint: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
});