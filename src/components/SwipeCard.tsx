import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FoodItem } from '../stores/tasteStore';
import { analytics } from '../analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  food: FoodItem;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export function SwipeCard({ food, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwipeLeft = () => {
    analytics.trackOnboardingSwipeLeft(food.id);
    onSwipeLeft();
  };

  const handleSwipeRight = () => {
    analytics.trackOnboardingSwipeRight(food.id);
    onSwipeRight();
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        rotation.value = withTiming(-30, { duration: 300 });
        runOnJS(triggerHaptic)();
        runOnJS(handleSwipeLeft)();
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        rotation.value = withTiming(30, { duration: 300 });
        runOnJS(triggerHaptic)();
        runOnJS(handleSwipeRight)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri: food.image_url }} style={styles.image} resizeMode="cover" />
        
        <Animated.View style={[styles.label, styles.likeLabel, likeOpacity]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        
        <Animated.View style={[styles.label, styles.nopeLabel, nopeOpacity]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        <View style={styles.infoContainer}>
          <Text style={styles.dishName}>{food.dish_name}</Text>
          <Text style={styles.restaurantName}>{food.restaurant_name}</Text>
          <View style={styles.tagsContainer}>
            {food.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
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
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 10,
  },
  likeLabel: {
    right: 20,
    borderColor: '#4ADE80',
    transform: [{ rotate: '15deg' }],
  },
  nopeLabel: {
    left: 20,
    borderColor: '#EF4444',
    transform: [{ rotate: '-15deg' }],
  },
  likeText: {
    color: '#4ADE80',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nopeText: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
});