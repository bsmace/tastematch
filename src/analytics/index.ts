/**
 * Analytics abstraction - vendor agnostic
 * All analytics events flow through this interface
 * Currently stubbed but structured for easy backend integration
 */

export type AnalyticsEvent =
  | 'onboarding_swipe_left'
  | 'onboarding_swipe_right'
  | 'feed_me_pressed'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'reject_limit_reached';

export interface AnalyticsProperties {
  user_id?: string;
  food_id?: string;
  confidence_score?: number;
  expires_at?: string;
  reject_count?: number;
}

class AnalyticsService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
    // Stub: In production, this would send to analytics provider
    console.log('[Analytics]', event, {
      ...properties,
      user_id: this.userId || properties.user_id,
      timestamp: new Date().toISOString(),
    });
  }

  // Individual event methods for type safety
  trackOnboardingSwipeLeft(foodId: string) {
    this.track('onboarding_swipe_left', { food_id: foodId });
  }

  trackOnboardingSwipeRight(foodId: string) {
    this.track('onboarding_swipe_right', { food_id: foodId });
  }

  trackFeedMePressed() {
    this.track('feed_me_pressed');
  }

  trackOfferAccepted(foodId: string, confidenceScore: number) {
    this.track('offer_accepted', { food_id: foodId, confidence_score: confidenceScore });
  }

  trackOfferRejected(foodId: string, confidenceScore: number) {
    this.track('offer_rejected', { food_id: foodId, confidence_score: confidenceScore });
  }

  trackRejectLimitReached(rejectCount: number) {
    this.track('reject_limit_reached', { reject_count: rejectCount });
  }
}

export const analytics = new AnalyticsService();