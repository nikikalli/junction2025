import { Router, Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/database.service';
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
