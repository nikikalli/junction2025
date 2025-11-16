// Database entity types

export interface UserSegmentEnriched {
  id: number;
  segment_id: number;
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  channel_perf_email: number;
  channel_perf_push: number;
  channel_perf_inapp: number;
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Campaign {
  id: number;
  name: string;
  canvas_id: string;
  start_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CampaignImplementation {
  id: number;
  campaign_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Action {
  id: number;
  campaign_implementation_id: number;
  day_of_campaign: Date;
  channel: string;
  message_subject: string;
  message_body: string;
  created_at?: Date;
  updated_at?: Date;
}

// Input types for creating records (without auto-generated fields)
export interface CreateUserSegmentEnrichedInput {
  segment_id: number;
  language: string;
  parent_age: number;
  parent_gender: string;
  baby_count: number;
  engagement_propensity: number;
  price_sensitivity: number;
  brand_loyalty: number;
  channel_perf_email: number;
  channel_perf_push: number;
  channel_perf_inapp: number;
  values_family: number;
  values_eco_conscious: number;
  values_convenience: number;
  values_quality: number;
  contact_frequency_tolerance: number;
  content_engagement_rate: number;
}

export interface CreateCampaignInput {
  name: string;
  canvas_id: string;
  start_date: Date;
}

export interface CreateCampaignImplementationInput {
  campaign_id: number;
}

export interface CreateActionInput {
  campaign_implementation_id: number;
  day_of_campaign: Date;
  channel: string;
  message_subject: string;
  message_body: string;
}

// Complete campaign with implementations and actions
export interface CampaignWithImplementations extends Campaign {
  implementations?: CampaignImplementationWithActions[];
}

export interface CampaignImplementationWithActions extends CampaignImplementation {
  actions?: Action[];
}
