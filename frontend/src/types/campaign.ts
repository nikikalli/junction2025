export type CampaignStep = 
  | 'canvas-id-input'
  | 'campaign-type-selection'
  | 'segment-selection'
  | 'campaign-creation'
  | 'campaign-list';

export type CampaignType = 'standard' | 'promotional';
export type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed';
export type SegmentSelectionMode = 'criteria' | 'list';

// Canvas/Braze related
export interface Canvas {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Segment related
export interface Segment {
  id: string;
  name: string;
  description?: string;
  eventHistory?: string;
  userCount?: number;
}

export interface SegmentCriteria {
  eventHistory: string;
  targetAudience: string;
}

// Campaign related
export interface Campaign {
  id: string;
  name: string;
  brazeCanvasId: string;
  status: CampaignStatus;
  type: CampaignType;
  segments: Segment[];
  createdAt: string;
  updatedAt: string;
  toneOfVoice?: string;
  sequence?: string;
  touchPoints?: string[];
  deliverySettings?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
}

// Campaign creation payload
export interface CampaignPayload {
  name: string;
  brazeCanvasId: string;
  type: CampaignType;
  segments: string[]; // segment IDs
  selectionMode: SegmentSelectionMode;
  toneOfVoice?: string;
}