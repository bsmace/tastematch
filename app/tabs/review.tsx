import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const MIN_RATING = 1;
const MAX_RATING = 10;

export default function ReviewScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  const sliderWidth = useSharedValue(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleRatingChange = (value: number) => {
    setRating(value);
    Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate upload delay
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    
    // In production, this would upload to Supabase
    // const { data, error } = await supabase.from('reviews').insert({...})
    
    setIsSubmitting(false);
    Alert.alert(
      'Review Submitted! 🎉',
      'Thanks for your feedback.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleRetake = () => {
    setRating(5);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ratingPercentage = ((rating - MIN_RATING) / (MAX_RATING - MIN_RATING)) * 100;

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.overlay}>
          <Text style={styles.guideText}>Center your dish in frame</Text>
        </View>
      </CameraView>

      {/* Rating Section */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>How was it?</Text>
        
        {/* Rating Value Display */}
        <View style={styles.ratingValueContainer}>
          <Text style={styles.ratingValue}>{rating}</Text>
          <Text style={styles.ratingMax}>/10</Text>
        </View>

        {/* Custom Slider */}
        <View 
          style={styles.sliderContainer}
          onLayout={(e) => {
            sliderWidth.value = e.nativeEvent.layout.width;
          }}
        >
          <View style={styles.sliderTrack}>
            <View 
              style={[styles.sliderFill, { width: `${ratingPercentage}%` }]} 
            />
          </View>
          
          {/* Slider Thumb Buttons */}
          <View style={styles.sliderButtons}>
            {Array.from({ length: MAX_RATING }, (_, i) => i + MIN_RATING).map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.sliderButton,
                  rating >= value && styles.sliderButtonActive,
                ]}
                onPress={() => handleRatingChange(value)}
              >
                <Text style={[
                  styles.sliderButtonText,
                  rating >= value && styles.sliderButtonTextActive,
                ]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating Labels */}
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabelText}>Meh</Text>
          <Text style={styles.ratingLabelText}>Amazing!</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleRetake}
        >
          <Text style={styles.secondaryButtonText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingContainer: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  ratingLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ratingValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  ratingMax: {
    fontSize: 24,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonActive: {
    backgroundColor: '#FF6B35',
  },
  sliderButtonText: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '600',
  },
  sliderButtonTextActive: {
    color: '#FFFFFF',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ratingLabelText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#1A1A1A',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});