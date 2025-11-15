import { v4 as uuidv4 } from 'uuid';
import { brazeService } from './braze.service';
import {
  SegmentAction,
  GenerateActionsRequest,
  GenerateActionsResponse,
  ActionListStorageItem
} from '../types/segment-action';
import { createError } from '../middleware/errorHandler';

class SegmentActionService {
  private actionStorage: Map<string, ActionListStorageItem> = new Map();

  async generateActions(request: GenerateActionsRequest): Promise<GenerateActionsResponse> {
    const { segment, canvasId, includeMetadata = false } = request;

    if (!segment || segment.trim() === '') {
      throw createError('Segment is required', 400);
    }

    if (!canvasId || canvasId.trim() === '') {
      throw createError('Canvas ID is required', 400);
    }

    try {
      const canvasDetails = await brazeService.getCanvasDetails(canvasId);

      if (!canvasDetails.steps || canvasDetails.steps.length === 0) {
        throw createError('Canvas has no steps defined', 400);
      }

      const actions: SegmentAction[] = [];
      const timestamp = new Date().toISOString();

      for (const step of canvasDetails.steps) {
        const actionId = uuidv4();

        const metadata: Record<string, unknown> = {};
        if (includeMetadata) {
          Object.keys(step).forEach(key => {
            if (!['id', 'name', 'next_paths'].includes(key)) {
              metadata[key] = step[key];
            }
          });
        }

        const action: SegmentAction = {
          id: actionId,
          segment,
          canvasId,
          canvasName: canvasDetails.name,
          stepId: step.id,
          stepName: step.name,
          stepType: step.type || 'unknown',
          nextPaths: step.next_paths,
          metadata: includeMetadata ? metadata : undefined,
          createdAt: timestamp,
        };

        actions.push(action);

        const storageItem: ActionListStorageItem = {
          id: actionId,
          segment,
          canvasId,
          canvasName: canvasDetails.name,
          stepId: step.id,
          stepName: step.name,
          stepType: step.type || 'unknown',
          nextPaths: step.next_paths || [],
          metadata,
          createdAt: timestamp,
        };
        this.actionStorage.set(actionId, storageItem);
      }

      return {
        actions//,
        /*summary: {
          canvasId,
          canvasName: canvasDetails.name,
          segment,
          totalSteps: canvasDetails.steps.length,
          totalActions: actions.length,
          generatedAt: timestamp,
        },*/
        //message: `Generated ${actions.length} actions for segment '${segment}'`,
      };
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError(`Failed to generate actions: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async getActionById(actionId: string): Promise<ActionListStorageItem | null> {
    const action = this.actionStorage.get(actionId);
    return action || null;
  }

  async getActionsBySegment(segment: string): Promise<ActionListStorageItem[]> {
    const actions: ActionListStorageItem[] = [];
    this.actionStorage.forEach((action) => {
      if (action.segment === segment) {
        actions.push(action);
      }
    });
    return actions;
  }

  async getActionsByCanvas(canvasId: string): Promise<ActionListStorageItem[]> {
    const actions: ActionListStorageItem[] = [];
    this.actionStorage.forEach((action) => {
      if (action.canvasId === canvasId) {
        actions.push(action);
      }
    });
    return actions;
  }

  async getAllActions(): Promise<ActionListStorageItem[]> {
    return Array.from(this.actionStorage.values());
  }

  async deleteAction(actionId: string): Promise<boolean> {
    return this.actionStorage.delete(actionId);
  }

  async clearAllActions(): Promise<void> {
    this.actionStorage.clear();
  }
}

export const segmentActionService = new SegmentActionService();
