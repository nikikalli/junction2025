import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../../services/database.service';
import {
  Campaign,
  CampaignWithImplementations,
  Action,
  CampaignImplementationWithActions,
} from '../../types/database';

// Mock the database service
jest.mock('../../services/database.service');

// Import the router after mocking
import { router as campaignsRouter } from '../../api/campaigns.routes';

describe('Campaigns Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    statusSpy = jest.fn().mockReturnThis();
    jsonSpy = jest.fn().mockReturnThis();

    mockRequest = {
      params: {},
      body: {},
      query: {},
    };

    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  // Helper to get route handler
  const getRouteHandler = (method: string, path: string) => {
    const routes = (campaignsRouter as any).stack;
    const route = routes.find((layer: any) => {
      if (!layer.route) return false;
      const routePath = layer.route.path;
      const routeMethod = Object.keys(layer.route.methods)[0];
      return routePath === path && routeMethod === method.toLowerCase();
    });
    return route?.route?.stack[0]?.handle;
  };

  describe('GET /campaigns', () => {
    it('should return all campaigns', async () => {
      const mockCampaigns: Campaign[] = [
        {
          id: 1,
          name: 'Summer Sale',
          canvas_id: 'canvas-123',
          start_date: new Date('2025-06-01'),
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
        {
          id: 2,
          name: 'Winter Promo',
          canvas_id: 'canvas-456',
          start_date: new Date('2025-12-01'),
          created_at: new Date('2025-01-02'),
          updated_at: new Date('2025-01-02'),
        },
      ];

      (databaseService.getAllCampaigns as jest.Mock).mockResolvedValue(mockCampaigns);

      const handler = getRouteHandler('get', '/');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(mockCampaigns);
      expect(databaseService.getAllCampaigns).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from database service', async () => {
      const error = new Error('Database error');
      (databaseService.getAllCampaigns as jest.Mock).mockRejectedValue(error);

      const handler = getRouteHandler('get', '/');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /campaigns/:id', () => {
    it('should return campaign with implementations and actions', async () => {
      const mockCampaign: CampaignWithImplementations = {
        id: 1,
        name: 'Summer Sale',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
        implementations: [
          {
            id: 1,
            campaign_id: 1,
            created_at: new Date('2025-01-01'),
            updated_at: new Date('2025-01-01'),
            actions: [
              {
                id: 1,
                campaign_implementation_id: 1,
                day_of_campaign: new Date('2025-06-01'),
                channel: 'email',
                message_subject: 'Welcome!',
                message_body: 'Welcome to our summer sale',
                created_at: new Date('2025-01-01'),
                updated_at: new Date('2025-01-01'),
              },
            ],
          },
        ],
      };

      (databaseService.getCampaignByIdWithImplementations as jest.Mock).mockResolvedValue(
        mockCampaign
      );

      mockRequest.params = { id: '1' };

      const handler = getRouteHandler('get', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(mockCampaign);
      expect(databaseService.getCampaignByIdWithImplementations).toHaveBeenCalledWith(1);
    });

    it('should return 404 when campaign not found', async () => {
      (databaseService.getCampaignByIdWithImplementations as jest.Mock).mockResolvedValue(
        null
      );

      mockRequest.params = { id: '999' };

      const handler = getRouteHandler('get', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Campaign not found' });
    });

    it('should return 400 for invalid campaign ID', async () => {
      mockRequest.params = { id: 'invalid' };

      const handler = getRouteHandler('get', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Invalid campaign ID' });
    });
  });

  describe('GET /campaigns/:id/implementations/:implementationId/actions', () => {
    it('should return actions for a specific implementation', async () => {
      const mockCampaign: Campaign = {
        id: 1,
        name: 'Summer Sale',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
      };

      const mockActions: Action[] = [
        {
          id: 1,
          campaign_implementation_id: 1,
          day_of_campaign: new Date('2025-06-01'),
          channel: 'email',
          message_subject: 'Day 1 Email',
          message_body: 'Welcome message',
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
        {
          id: 2,
          campaign_implementation_id: 1,
          day_of_campaign: new Date('2025-06-02'),
          channel: 'push',
          message_subject: 'Day 2 Push',
          message_body: 'Reminder message',
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
      ];

      const mockImplementations: CampaignImplementationWithActions[] = [
        {
          id: 1,
          campaign_id: 1,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
          actions: mockActions,
        },
      ];

      (databaseService.getCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      (databaseService.getImplementationActions as jest.Mock).mockResolvedValue(mockActions);
      (databaseService.getCampaignImplementations as jest.Mock).mockResolvedValue(
        mockImplementations
      );

      mockRequest.params = { id: '1', implementationId: '1' };

      const handler = getRouteHandler('get', '/:id/implementations/:implementationId/actions');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(mockActions);
      expect(databaseService.getCampaignById).toHaveBeenCalledWith(1);
      expect(databaseService.getImplementationActions).toHaveBeenCalledWith(1);
      expect(databaseService.getCampaignImplementations).toHaveBeenCalledWith(1);
    });

    it('should return 404 when campaign not found', async () => {
      (databaseService.getCampaignById as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '999', implementationId: '1' };

      const handler = getRouteHandler('get', '/:id/implementations/:implementationId/actions');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Campaign not found' });
    });

    it('should return 404 when implementation not found for campaign', async () => {
      const mockCampaign: Campaign = {
        id: 1,
        name: 'Summer Sale',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
      };

      const mockActions: Action[] = [
        {
          id: 1,
          campaign_implementation_id: 999,
          day_of_campaign: new Date('2025-06-01'),
          channel: 'email',
          message_subject: 'Test',
          message_body: 'Test message',
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
      ];

      const mockImplementations: CampaignImplementationWithActions[] = [
        {
          id: 1,
          campaign_id: 1,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
          actions: [],
        },
      ];

      (databaseService.getCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      (databaseService.getImplementationActions as jest.Mock).mockResolvedValue(mockActions);
      (databaseService.getCampaignImplementations as jest.Mock).mockResolvedValue(
        mockImplementations
      );

      mockRequest.params = { id: '1', implementationId: '999' };

      const handler = getRouteHandler('get', '/:id/implementations/:implementationId/actions');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Implementation not found for this campaign' });
    });

    it('should return 400 for invalid IDs', async () => {
      mockRequest.params = { id: 'invalid', implementationId: '1' };

      const handler = getRouteHandler('get', '/:id/implementations/:implementationId/actions');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Invalid campaign ID or implementation ID' });
    });

    it('should return empty array when implementation has no actions', async () => {
      const mockCampaign: Campaign = {
        id: 1,
        name: 'Summer Sale',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
      };

      (databaseService.getCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      (databaseService.getImplementationActions as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '1', implementationId: '1' };

      const handler = getRouteHandler('get', '/:id/implementations/:implementationId/actions');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('PATCH /campaigns/:id', () => {
    it('should rename a campaign', async () => {
      const updatedCampaign: Campaign = {
        id: 1,
        name: 'New Campaign Name',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateCampaign as jest.Mock).mockResolvedValue(updatedCampaign);

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'New Campaign Name' };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(updatedCampaign);
      expect(databaseService.updateCampaign).toHaveBeenCalledWith(1, {
        name: 'New Campaign Name',
      });
    });

    it('should trim whitespace from campaign name', async () => {
      const updatedCampaign: Campaign = {
        id: 1,
        name: 'Trimmed Name',
        canvas_id: 'canvas-123',
        start_date: new Date('2025-06-01'),
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateCampaign as jest.Mock).mockResolvedValue(updatedCampaign);

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: '  Trimmed Name  ' };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(databaseService.updateCampaign).toHaveBeenCalledWith(1, {
        name: 'Trimmed Name',
      });
    });

    it('should return 404 when campaign not found', async () => {
      (databaseService.updateCampaign as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'New Name' };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Campaign not found' });
    });

    it('should return 400 for invalid campaign ID', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { name: 'New Name' };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Invalid campaign ID' });
    });

    it('should return 400 when name is missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Valid name is required' });
    });

    it('should return 400 when name is not a string', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 123 };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Valid name is required' });
    });

    it('should return 400 when name is empty after trim', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: '   ' };

      const handler = getRouteHandler('patch', '/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Valid name is required' });
    });
  });

  describe('PATCH /campaigns/actions/:id', () => {
    it('should update action subject', async () => {
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: new Date('2025-06-01'),
        channel: 'email',
        message_subject: 'New Subject',
        message_body: 'Original body',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = { message_subject: 'New Subject' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(updatedAction);
      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        message_subject: 'New Subject',
      });
    });

    it('should update action body', async () => {
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: new Date('2025-06-01'),
        channel: 'email',
        message_subject: 'Subject',
        message_body: 'New body content',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = { message_body: 'New body content' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(updatedAction);
      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        message_body: 'New body content',
      });
    });

    it('should update day_of_campaign', async () => {
      const newDate = new Date('2025-06-15');
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: newDate,
        channel: 'email',
        message_subject: 'Subject',
        message_body: 'Body',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = { day_of_campaign: '2025-06-15' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        day_of_campaign: newDate,
      });
    });

    it('should update channel', async () => {
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: new Date('2025-06-01'),
        channel: 'push',
        message_subject: 'Subject',
        message_body: 'Body',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = { channel: 'push' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(updatedAction);
      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        channel: 'push',
      });
    });

    it('should update multiple fields at once', async () => {
      const newDate = new Date('2025-06-15');
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: newDate,
        channel: 'sms',
        message_subject: 'New Subject',
        message_body: 'New Body',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        message_subject: 'New Subject',
        message_body: 'New Body',
        day_of_campaign: '2025-06-15',
        channel: 'sms',
      };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(updatedAction);
      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        message_subject: 'New Subject',
        message_body: 'New Body',
        day_of_campaign: newDate,
        channel: 'sms',
      });
    });

    it('should return 404 when action not found', async () => {
      (databaseService.updateAction as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '999' };
      mockRequest.body = { message_subject: 'New Subject' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Action not found' });
    });

    it('should return 400 for invalid action ID', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { message_subject: 'New Subject' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'Invalid action ID' });
    });

    it('should return 400 when no fields provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        error:
          'At least one field must be provided: message_subject, message_body, day_of_campaign, or channel',
      });
    });

    it('should return 400 when message_subject is not a string', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { message_subject: 123 };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'message_subject must be a string' });
    });

    it('should return 400 when message_body is not a string', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { message_body: true };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'message_body must be a string' });
    });

    it('should return 400 when day_of_campaign is invalid date', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { day_of_campaign: 'invalid-date' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'day_of_campaign must be a valid date' });
    });

    it('should return 400 when channel is not a string', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { channel: 123 };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'channel must be a non-empty string' });
    });

    it('should return 400 when channel is empty after trim', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { channel: '   ' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({ error: 'channel must be a non-empty string' });
    });

    it('should trim whitespace from channel', async () => {
      const updatedAction: Action = {
        id: 1,
        campaign_implementation_id: 1,
        day_of_campaign: new Date('2025-06-01'),
        channel: 'email',
        message_subject: 'Subject',
        message_body: 'Body',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-15'),
      };

      (databaseService.updateAction as jest.Mock).mockResolvedValue(updatedAction);

      mockRequest.params = { id: '1' };
      mockRequest.body = { channel: '  email  ' };

      const handler = getRouteHandler('patch', '/actions/:id');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(databaseService.updateAction).toHaveBeenCalledWith(1, {
        channel: 'email',
      });
    });
  });

  describe('GET /campaigns/templates/email/update (Legacy endpoint)', () => {
    it('should return all campaigns', async () => {
      const mockCampaigns: Campaign[] = [
        {
          id: 1,
          name: 'Campaign 1',
          canvas_id: 'canvas-123',
          start_date: new Date('2025-06-01'),
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
      ];

      (databaseService.getAllCampaigns as jest.Mock).mockResolvedValue(mockCampaigns);

      const handler = getRouteHandler('get', '/templates/email/update');
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(mockCampaigns);
      expect(databaseService.getAllCampaigns).toHaveBeenCalledTimes(1);
    });
  });
});
