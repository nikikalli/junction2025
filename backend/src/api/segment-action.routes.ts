import { Router, Request, Response, NextFunction } from 'express';
import { segmentActionService } from '../services/segment-action.service';
import { geminiService } from '../services/gemini.service';
import { GenerateActionsRequest } from '../types/segment-action';
import { ApiResponse } from '../types';

const router = Router();

router.post('/actions/generate', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const request: GenerateActionsRequest = _req.body;

    const result = await segmentActionService.generateActions(request);

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/actions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await segmentActionService.getAllActions();

    const response: ApiResponse<typeof actions> = {
      data: actions,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/actions/segment/:segment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { segment } = req.params;
    const actions = await segmentActionService.getActionsBySegment(segment);

    const response: ApiResponse<typeof actions> = {
      data: actions,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/actions/canvas/:canvasId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId } = req.params;
    const actions = await segmentActionService.getActionsByCanvas(canvasId);

    const response: ApiResponse<typeof actions> = {
      data: actions,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/actions/:actionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId } = req.params;
    const action = await segmentActionService.getActionById(actionId);

    if (!action) {
      res.status(404).json({
        error: 'Action not found',
      });
      return;
    }

    const response: ApiResponse<typeof action> = {
      data: action,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/actions/:actionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId } = req.params;
    const deleted = await segmentActionService.deleteAction(actionId);

    if (!deleted) {
      res.status(404).json({
        error: 'Action not found',
      });
      return;
    }

    const response: ApiResponse<{ deleted: boolean }> = {
      data: { deleted: true },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/actions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await segmentActionService.clearAllActions();

    const response: ApiResponse<{ message: string }> = {
      data: { message: 'All actions cleared' },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/actions/:actionId/personalize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionId } = req.params;
    const action = await segmentActionService.getActionById(actionId);

    if (!action) {
      res.status(404).json({
        error: 'Action not found',
      });
      return;
    }

    const result = await geminiService.personalizeAction(action);

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/actions/personalize-batch', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { actionIds } = _req.body as { actionIds: string[] };

    if (!actionIds || !Array.isArray(actionIds) || actionIds.length === 0) {
      res.status(400).json({
        error: 'actionIds array is required',
      });
      return;
    }

    const actions = [];
    for (const actionId of actionIds) {
      const action = await segmentActionService.getActionById(actionId);
      if (action) {
        actions.push(action);
      }
    }

    if (actions.length === 0) {
      res.status(404).json({
        error: 'No valid actions found',
      });
      return;
    }

    const results = await geminiService.personalizeMultipleActions(actions);

    const response: ApiResponse<typeof results> = {
      data: results,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
