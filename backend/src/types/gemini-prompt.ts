export interface EnrichedSegment {
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;

  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;

  channel_perf_email: number;
  channel_perf_push: number;
  channel_perf_inapp: number;

  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
}

export interface MessageConstraints {
  title_max_characters: number;
  body_max_characters: number;
}

export interface DeliverySettings {
  channel: 'push_notification' | 'in_app_message';
  send_timing_days_from_today: number;
  message_constraints: MessageConstraints;
}

export interface AudienceProfile {
  behavioral_summary: string;
  primary_value_driver: string;
  secondary_value_driver: string;
  motivational_triggers: string[];
}

export interface ContentGuidance {
  recommended_tone: string;
  messaging_approach: string;
  what_resonates: string[];
  what_to_avoid: string[];
}

export interface GeminiPrompt {
  delivery_settings: DeliverySettings;
  audience_profile: AudienceProfile;
  content_guidance: ContentGuidance;
}
