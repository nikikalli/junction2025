import { Router, Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/database.service';
import { brazeService } from '../services/braze.service';
import { UpdateCampaignNameRequest, UpdateActionRequest } from '../types/database';

const router = Router();

// GET /campaigns - List all campaigns
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const campaigns = await databaseService.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  }
);

// POST /campaigns/from-canvas - Create campaign from canvas with activities
router.post(
  '/from-canvas',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { canvas_id, canvas_name, segments } = req.body;

      // Validate input
      if (!canvas_id || typeof canvas_id !== 'string') {
        res.status(400).json({ error: 'canvas_id is required and must be a string' });
        return;
      }

      if (!canvas_name || typeof canvas_name !== 'string') {
        res.status(400).json({ error: 'canvas_name is required and must be a string' });
        return;
      }

      if (!Array.isArray(segments) || segments.length === 0) {
        res.status(400).json({ error: 'segments must be a non-empty array' });
        return;
      }

      // Extract activities from canvas for each segment
      const segmentsWithActivities = await Promise.all(
        segments.map(async (segment: { segment_name: string }) => {
          if (!segment.segment_name || typeof segment.segment_name !== 'string') {
            throw new Error('Each segment must have a segment_name');
          }

          // Extract messages from the canvas
          const messages = await brazeService.extractCanvasMessages(canvas_id);
          
          // Transform messages to activities
          let activities = brazeService.transformMessagesToActivities(messages);

          // If no activities were extracted, create sample activities
          if (activities.length === 0) {
            activities = [
              {
                type: 'email',
                message: 'Welcome to our campaign! We are excited to have you join us.',
                subject: 'Welcome to our campaign'
              },
              {
                type: 'web_push',
                message: 'Check out our latest offers and discover amazing deals!',
                subject: 'New offers available'
              },
              {
                type: 'in_app_message',
                message: 'Exclusive offer just for you! Limited time only.',
                subject: 'Special offer inside'
              }
            ];
          }

          return {
            segment_name: segment.segment_name,
            activities
          };
        })
      );

      // Create campaign with activities in database
      const campaign = await databaseService.createCampaignFromCanvas(
        canvas_id,
        canvas_name,
        segmentsWithActivities
      );

      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }
);

// GET /campaigns/:id - Get campaign by ID with all implementations (segments) and actions
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaignId = parseInt(req.params.id, 10);

      if (isNaN(campaignId)) {
        res.status(400).json({ error: 'Invalid campaign ID' });
        return;
      }

      const campaign = await databaseService.getCampaignByIdWithImplementations(campaignId);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // Return campaign with hardcoded canvas data structure
      const responseData = {
        ...campaign,
        canvas: {
          id: campaign.canvas_id,
          name: campaign.name,
          created_at: campaign.created_at,
          updated_at: campaign.updated_at,
          description: `Campaign: ${campaign.name}`,
          draft: false,
          enabled: true,
          variants: [{ name: 'Variant 1' }],
          steps: [] // Will be populated per implementation
        }
      };

      res.json(responseData);
    } catch (error) {
      next(error);
    }
  }
);

// GET /campaigns/:id/implementations/:implementationId/actions - Get actions for a specific implementation
router.get(
  '/:id/implementations/:implementationId/actions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const implementationId = parseInt(req.params.implementationId, 10);

      if (isNaN(campaignId) || isNaN(implementationId)) {
        res.status(400).json({ error: 'Invalid campaign ID or implementation ID' });
        return;
      }

      // Verify campaign exists
      const campaign = await databaseService.getCampaignById(campaignId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      // Get actions for the implementation
      const actions = await databaseService.getImplementationActions(implementationId);

      // Verify the implementation belongs to the campaign
      if (actions.length > 0) {
        const implementations = await databaseService.getCampaignImplementations(campaignId);
        const implementationExists = implementations.some(impl => impl.id === implementationId);

        if (!implementationExists) {
          res.status(404).json({ error: 'Implementation not found for this campaign' });
          return;
        }
      }

      res.json(actions);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /campaigns/:id - Rename a campaign
router.patch(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaignId = parseInt(req.params.id, 10);

      if (isNaN(campaignId)) {
        res.status(400).json({ error: 'Invalid campaign ID' });
        return;
      }

      const body = req.body as UpdateCampaignNameRequest;

      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        res.status(400).json({ error: 'Valid name is required' });
        return;
      }

      const updatedCampaign = await databaseService.updateCampaign(campaignId, { name: body.name.trim() });

      if (!updatedCampaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(updatedCampaign);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /actions/:id - Update action's subject, message, day of campaign, and channel
router.patch(
  '/actions/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actionId = parseInt(req.params.id, 10);

      if (isNaN(actionId)) {
        res.status(400).json({ error: 'Invalid action ID' });
        return;
      }

      const body = req.body as UpdateActionRequest;

      // Validate at least one field is provided
      if (
        body.message_subject === undefined &&
        body.message_body === undefined &&
        body.day_of_campaign === undefined &&
        body.channel === undefined
      ) {
        res.status(400).json({
          error: 'At least one field must be provided: message_subject, message_body, day_of_campaign, or channel'
        });
        return;
      }

      // Build update object with proper types
      const updates: {
        message_subject?: string;
        message_body?: string;
        day_of_campaign?: Date;
        channel?: string;
      } = {};

      if (body.message_subject !== undefined) {
        if (typeof body.message_subject !== 'string') {
          res.status(400).json({ error: 'message_subject must be a string' });
          return;
        }
        updates.message_subject = body.message_subject;
      }

      if (body.message_body !== undefined) {
        if (typeof body.message_body !== 'string') {
          res.status(400).json({ error: 'message_body must be a string' });
          return;
        }
        updates.message_body = body.message_body;
      }

      if (body.day_of_campaign !== undefined) {
        const date = new Date(body.day_of_campaign);
        if (isNaN(date.getTime())) {
          res.status(400).json({ error: 'day_of_campaign must be a valid date' });
          return;
        }
        updates.day_of_campaign = date;
      }

      if (body.channel !== undefined) {
        if (typeof body.channel !== 'string' || body.channel.trim().length === 0) {
          res.status(400).json({ error: 'channel must be a non-empty string' });
          return;
        }
        updates.channel = body.channel.trim();
      }

      const updatedAction = await databaseService.updateAction(actionId, updates);

      if (!updatedAction) {
        res.status(404).json({ error: 'Action not found' });
        return;
      }

      res.json(updatedAction);
    } catch (error) {
      next(error);
    }
  }
);

// Legacy endpoint - kept for backward compatibility
router.get(
  '/templates/email/update',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await databaseService.getAllCampaigns();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export { router };
