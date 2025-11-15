import { Router, Request, Response, NextFunction } from 'express';
import { campaignOrchestrationService } from '../services/campaign-orchestration.service';
import { ApiResponse } from '../types';

const router = Router();

router.post('/deploy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId, segments, scheduleTime } = req.body;

    if (!canvasId) {
      res.status(400).json({
        error: 'canvasId is required',
      });
      return;
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      res.status(400).json({
        error: 'segments array is required and must not be empty',
      });
      return;
    }

    const parsedScheduleTime = scheduleTime ? new Date(scheduleTime) : undefined;

    const result = await campaignOrchestrationService.personalizeAndDeployCanvas(
      canvasId,
      segments,
      parsedScheduleTime
    );

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId, segment } = req.body;

    if (!canvasId) {
      res.status(400).json({
        error: 'canvasId is required',
      });
      return;
    }

    if (!segment) {
      res.status(400).json({
        error: 'segment is required',
      });
      return;
    }

    const result = await campaignOrchestrationService.previewPersonalization(
      canvasId,
      segment
    );

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/status/:orchestrationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orchestrationId } = req.params;

    const result = await campaignOrchestrationService.getOrchestrationStatus(
      orchestrationId
    );

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/rollback/:orchestrationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orchestrationId } = req.params;

    const result = await campaignOrchestrationService.rollbackDeployment(
      orchestrationId
    );

    const response: ApiResponse<typeof result> = {
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/deployments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId, limit } = req.query;

    let deployments;

    if (canvasId) {
      deployments = await campaignOrchestrationService.getOrchestrationsByCanvasId(
        canvasId as string
      );
    } else {
      deployments = await campaignOrchestrationService.getAllOrchestrations();
    }

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum)) {
        deployments = deployments.slice(0, limitNum);
      }
    }

    const response: ApiResponse<typeof deployments> = {
      data: deployments,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
