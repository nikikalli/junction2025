// Database entity types

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
