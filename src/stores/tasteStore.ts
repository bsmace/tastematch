import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FoodItem {
  id: string;
  restaurant_name: string;
  dish_name: string;
  image_url: string;
  tags: string[];
}

export interface TasteProfile {
  likedTags: string[];
  dislikedTags: string[];
  swipeCount: number;
}

interface TasteStore {
  tasteProfile: TasteProfile;
  currentCardIndex: number;
  hasCompletedOnboarding: boolean;
  recordSwipe(food: FoodItem, liked: boolean): void;
  nextCard: () => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
}

const initialTasteProfile: TasteProfile = {
  likedTags: [],
  dislikedTags: [],
  swipeCount: 0,
};

export const useTasteStore = create<TasteStore>()(
  persist(
    (set, get) => ({
      tasteProfile: initialTasteProfile,
      currentCardIndex: 0,
      hasCompletedOnboarding: false,

/* eslint-disable @typescript-eslint/no-unused-vars */
      recordSwipe(food: FoodItem, liked: boolean) {
        const profile = get().tasteProfile;
        set({
          tasteProfile: {
            ...profile,
            swipeCount: profile.swipeCount + 1,
            likedTags: liked 
              ? [...profile.likedTags, ...food.tags.filter(t => !profile.likedTags.includes(t))]
              : profile.likedTags,
            dislikedTags: !liked
              ? [...profile.dislikedTags, ...food.tags.filter(t => !profile.dislikedTags.includes(t))]
              : profile.dislikedTags,
          },
        });
      },

      nextCard: () => {
        set((state) => ({ currentCardIndex: state.currentCardIndex + 1 }));
      },

      resetOnboarding: () => {
        set({
          tasteProfile: initialTasteProfile,
          currentCardIndex: 0,
          hasCompletedOnboarding: false,
        });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
    }),
    {
      name: 'taste-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);