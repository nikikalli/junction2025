export interface AnalyzedSegment {
  // Identifiers
  segment_id: string;

  // Demographics
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  baby_age_week_1: number;

  // Behavioral
  event_count: number;

  // Sentiment/Engagement
  engagement_propensity: number; // 0-100
  price_sensitivity: number; // 0-100
  brand_loyalty: number; // 0-100
  contact_frequency_tolerance: number; // 0-100
  content_engagement_rate: number; // 0-100

  // Channel Preferences (boolean)
  prefers_email: boolean;
  prefers_push: boolean;
  prefers_inapp: boolean;

  // Values
  values_family: number; // 0-100
  values_eco_conscious: number; // 0-100
  values_convenience: number; // 0-100
  values_quality: number; // 0-100
}

export interface AnalyzedSegmentsResponse {
  segments: AnalyzedSegment[];
  total: number;
}
