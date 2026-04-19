import { View, Text } from 'react-native';

export default function Review() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-2xl font-bold">Review</Text>
      <Text className="text-text-muted mt-2">Camera coming soon</Text>
    </View>
  );
}