import { Router, Request, Response, NextFunction } from 'express';
import { brazeService } from '../services/braze.service';
import { campaignGeneratorService } from '../services/campaign-generator.service';
import { segmentAnalyzerService } from '../services/segment-analyzer.service';
import { geminiService } from '../services/gemini.service';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  sendAttributesSchema,
  sendEventsSchema,
  trackUserDataSchema,
  canvasIdParamSchema,
  canvasDetailsQuerySchema,
  contentBlockIdParamSchema,
  createContentBlockSchema,
  updateContentBlockSchema,
  emailTemplateIdParamSchema,
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  uploadHtmlTemplateSchema,
  sendCampaignSchema,
  scheduleCampaignSchema,
  sendDirectMessageSchema,
  personalizeActivitiesSchema,
} from '../utils/validation';

const router = Router();

router.get('/generate/:canvasId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId } = req.params;
    const count = parseInt(req.query.count as string) || 20;

    const canvases = await campaignGeneratorService.generateCanvasCopies(canvasId, count);
    res.json({ canvases, count: canvases.length });
  } catch (error) {
    next(error);
  }
});

router.get('/analyzedSegments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.query.count as string) || 20;
    const data = await segmentAnalyzerService.getAnalyzedSegments(count);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/scheduled', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    const scheduledBroadcasts = await brazeService.getScheduledBroadcasts(endTime.toISOString());
    res.json(scheduledBroadcasts);
  } catch (error) {
    next(error);
  }
});

router.get('/canvas/list', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await brazeService.listCanvases();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/canvas/:canvasId',
  validateParams(canvasIdParamSchema),
  validateQuery(canvasDetailsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { canvasId } = req.params;
      const { post_launch_draft_version, extract, segment } = req.query as {
        post_launch_draft_version?: boolean;
        extract?: string;
        segment?: string;
      };

      if (extract === 'messages') {
        const messages = await brazeService.extractCanvasMessages(canvasId);
        res.json(messages);
      } else if (extract === 'activities') {
        const messages = await brazeService.extractCanvasMessages(canvasId);
        const activities = brazeService.transformMessagesToActivities(messages);
        res.json(activities);
      } else if (extract === 'gemini') {
        if (!segment) {
          return res.status(400).json({ error: 'segment query parameter is required for gemini extraction' });
        }
        const messages = await brazeService.extractCanvasMessages(canvasId);
        const activities = brazeService.transformMessagesToActivities(messages);
        const personalizedActivities = await geminiService.personalizeActivitiesForSegment(activities, segment);
        res.json(personalizedActivities);
      } else {
        const data = await brazeService.getCanvasDetails(canvasId, post_launch_draft_version);
        res.json(data);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/users/attributes',
  validateBody(sendAttributesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attributes } = req.body;
      const data = await brazeService.sendUserAttributes(attributes);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/users/events',
  validateBody(sendEventsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { events } = req.body;
      const data = await brazeService.sendUserEvents(events);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/users/track',
  validateBody(trackUserDataSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.trackUserData(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/content-blocks/list', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await brazeService.listContentBlocks();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/content-blocks/:contentBlockId',
  validateParams(contentBlockIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentBlockId } = req.params;
      const data = await brazeService.getContentBlock(contentBlockId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/content-blocks/create',
  validateBody(createContentBlockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.createContentBlock(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/content-blocks/update',
  validateBody(updateContentBlockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.updateContentBlock(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/templates/email/list', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await brazeService.listEmailTemplates();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/templates/email/:templateId',
  validateParams(emailTemplateIdParamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const data = await brazeService.getEmailTemplate(templateId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/templates/email/create',
  validateBody(createEmailTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.createEmailTemplate(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/templates/email/update',
  validateBody(updateEmailTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.updateEmailTemplate(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/templates/email/upload-html',
  validateBody(uploadHtmlTemplateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { template_name, html_body, subject, tags } = req.body;
      const data = await brazeService.uploadHtmlAsTemplate(template_name, html_body, subject, tags);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/campaigns/send',
  validateBody(sendCampaignSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.sendCampaign(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/campaigns/schedule',
  validateBody(scheduleCampaignSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.scheduleCampaign(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/messages/send',
  validateBody(sendDirectMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await brazeService.sendDirectMessage(req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/canvas/personalize-activities',
  validateBody(personalizeActivitiesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { canvas_id, segment } = req.body;

      const messages = await brazeService.extractCanvasMessages(canvas_id);
      const activities = brazeService.transformMessagesToActivities(messages);
      const personalizedActivities = await geminiService.personalizeActivitiesForSegment(activities, segment);

      res.json(personalizedActivities);
    } catch (error) {
      next(error);
    }
  }
);

export { router };
