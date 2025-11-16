// Common types used across the application

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CanvasList {
  id: string;
  name: string;
}

export interface CanvasMessage {
  channel: string;
  subject?: string;
  body?: string;
  message?: string;
}

export interface CanvasStep {
  name: string;
  type: string;
  channels?: string[];
  messages?: Record<string, CanvasMessage>;
}

export interface Canvas {
  name: string;
  created_at: string;
  updated_at: string;
  description: string;
  draft: boolean;
  enabled: boolean;
  schedule_type?: string;
  variants: Array<{ name: string }>;
  steps: CanvasStep[];
  dispatch_id?: string;
  schedule_id?: string;
  country?: string;
  campaign_index?: number;
}

export interface Segment {
  type: string;
  id: number;
  name: string;
  subject: string;
  message: string;
  segment_id: string;
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  baby_age_week_1: number;
  event_count: number;
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;
  prefers_email: boolean;
  prefers_push: boolean;
  prefers_inapp: boolean;
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
}

export interface MessageWithKey {
  key: string;
  message: CanvasMessage;
}

export interface Campaign {
  id: string;
  name: string;
  canvas_id: string;
  start_date: string;
  segment: Segment[];
}
