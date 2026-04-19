import { useEffect } from 'react';
import { router } from 'expo-router';
import { useTasteStore } from '../src/stores/tasteStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const hasCompletedOnboarding = useTasteStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});