/**
 * Campaign API Types - Single Source of Truth
 * These types match the backend database schema exactly
 */

// Database entity types
export interface Campaign {
  id: number;
  name: string;
  canvas_id: string;
  start_date: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

export interface CampaignImplementation {
  id: number;
  campaign_id: number;
  segment_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Action {
  id: number;
  campaign_implementation_id: number;
  day_of_campaign: string; // ISO date string
  channel: string;
  message_subject: string;
  message_body: string;
  created_at?: string;
  updated_at?: string;
}

// Nested types for full campaign data
export interface CampaignImplementationWithActions extends CampaignImplementation {
  actions?: Action[];
}

export interface CampaignWithImplementations extends Campaign {
  implementations?: CampaignImplementationWithActions[];
}

// Request types for API calls
export interface CreateCampaignRequest {
  name: string;
  canvas_id: string;
  start_date: string; // ISO date string
}

export interface UpdateCampaignNameRequest {
  name: string;
}

export interface UpdateActionRequest {
  message_subject?: string;
  message_body?: string;
  day_of_campaign?: string; // ISO date string
  channel?: string;
}

// API Error Response
export interface ApiError {
  error: string;
}
