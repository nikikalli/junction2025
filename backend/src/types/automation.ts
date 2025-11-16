export interface PersonalizedMessageDeployment {
  canvasId: string;
  stepId: string;
  segment: string;
  channel: string;
  field: string;
  originalMessage: string;
  personalizedMessage: string;
}

export interface ContentBlockDeployment {
  contentBlockId: string;
  contentBlockName: string;
  liquidTag: string;
  segment: string;
  canvasId: string;
  stepId: string;
  channel: string;
  field: string;
  status: 'success' | 'failed';
  createdAt: string;
  error?: string;
}

export interface BatchDeploymentResult {
  total: number;
  successful: number;
  failed: number;
  deployments: ContentBlockDeployment[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}

export interface CampaignSchedule {
  scheduleId: string;
  dispatchId?: string;
  canvasId: string;
  segment: string;
  scheduleTime: string;
  status: 'scheduled' | 'failed';
  error?: string;
  createdAt: string;
}

export interface DeploymentRecord {
  id: string;
  canvasId: string;
  segments: string[];
  contentBlocks: ContentBlockDeployment[];
  campaignSchedules: CampaignSchedule[];
  status: 'in_progress' | 'completed' | 'failed' | 'partial';
  createdAt: string;
  completedAt?: string;
  summary: {
    totalContentBlocks: number;
    successfulBlocks: number;
    failedBlocks: number;
    totalCampaigns: number;
    scheduledCampaigns: number;
    failedCampaigns: number;
  };
}

export interface OrchestrationResult {
  orchestrationId: string;
  canvasId: string;
  canvasName: string;
  segments: string[];
  status: 'success' | 'partial' | 'failed';
  deployment: {
    totalContentBlocks: number;
    successfulBlocks: number;
    failedBlocks: number;
    contentBlocks: ContentBlockDeployment[];
  };
  campaigns: {
    totalScheduled: number;
    successful: number;
    failed: number;
    schedules: CampaignSchedule[];
  };
  errors: Array<{
    type: 'personalization' | 'deployment' | 'scheduling';
    message: string;
    segment?: string;
  }>;
  createdAt: string;
  completedAt: string;
  duration: number;
}

export interface OrchestrationStatus {
  id: string;
  canvasId: string;
  status: 'pending' | 'personalizing' | 'deploying' | 'scheduling' | 'completed' | 'failed';
  progress: {
    currentStep: string;
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  results?: OrchestrationResult;
  error?: string;
}

export interface PersonalizationPreview {
  canvasId: string;
  canvasName: string;
  segment: string;
  steps: Array<{
    stepId: string;
    stepName: string;
    messages: Array<{
      channel: string;
      field: string;
      originalMessage: string;
      personalizedMessage: string;
    }>;
  }>;
}

export interface RollbackResult {
  orchestrationId: string;
  cancelledCampaigns: number;
  status: 'rolled_back';
  note: string;
}
