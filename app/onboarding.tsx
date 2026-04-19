import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SwipeCard } from '../src/components/SwipeCard';
import { useTasteStore, FoodItem } from '../src/stores/tasteStore';
import { ONBOARDING_CARDS } from '../src/data/onboardingCards';
import { analytics } from '../src/analytics';

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { recordSwipe, completeOnboarding } = useTasteStore();

  const handleSwipeLeft = useCallback((food: FoodItem) => {
    recordSwipe(food, false);
    
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= ONBOARDING_CARDS.length) {
          analytics.trackFeedMePressed();
          completeOnboarding();
          router.replace('/(tabs)');
        }
        return nextIndex;
      });
    }, 300);
  }, [recordSwipe, completeOnboarding]);

  const handleSwipeRight = useCallback((food: FoodItem) => {
    recordSwipe(food, true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= ONBOARDING_CARDS.length) {
          analytics.trackFeedMePressed();
          completeOnboarding();
          router.replace('/(tabs)');
        }
        return nextIndex;
      });
    }, 300);
  }, [recordSwipe, completeOnboarding]);

  const visibleCards = ONBOARDING_CARDS.slice(currentIndex, currentIndex + 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Build Your Taste Profile</Text>
        <Text style={styles.subtitle}>Swipe right if you'd eat it, left if you wouldn't</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex) / ONBOARDING_CARDS.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentIndex}/{ONBOARDING_CARDS.length}</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {visibleCards.map((food, index) => (
          <SwipeCard
            key={food.id}
            food={food}
            onSwipeLeft={() => handleSwipeLeft(food)}
            onSwipeRight={() => handleSwipeRight(food)}
            isTop={index === visibleCards.length - 1}
          />
        )).reverse()}
      </View>

      <View style={styles.footer}>
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>← Swipe left</Text>
          <Text style={styles.hintText}>Swipe right →</Text>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#2D2D2D',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  hintText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
});