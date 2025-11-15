import { NextPath } from './braze';

export interface SegmentAction {
  id: string;
  segment: string;
  canvasId: string;
  canvasName: string;
  stepId: string;
  stepName: string;
  stepType: string;
  nextPaths?: NextPath[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GenerateActionsRequest {
  segment: string;
  canvasId: string;
  includeMetadata?: boolean;
}

export interface GenerateActionsResponse {
  actions: SegmentAction[];
  /*summary: {
    canvasId: string;
    canvasName: string;
    segment: string;
    totalSteps: number;
    totalActions: number;
    generatedAt: string;
  };*/
  //message: string;
}

export interface ActionListStorageItem {
  id: string;
  segment: string;
  canvasId: string;
  canvasName: string;
  stepId: string;
  stepName: string;
  stepType: string;
  nextPaths: NextPath[];
  metadata: Record<string, unknown>;
  createdAt: string;
}
