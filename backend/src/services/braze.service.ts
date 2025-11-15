import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import {
  BrazeCanvasListResponse,
  BrazeCanvasDetailsResponse,
  BrazeUserAttribute,
  BrazeEvent,
  BrazeTrackRequest,
  BrazeTrackResponse,
  BrazeErrorResponse,
  ScheduleCanvasRequest,
  ScheduleCanvasResponse,
  ContentBlockListResponse,
  ContentBlockResponse,
  CreateContentBlockRequest,
  UpdateContentBlockRequest,
  EmailTemplateListResponse,
  EmailTemplateResponse,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  ScheduledBroadcastsResponse,
} from '../types/braze';
import { createError } from '../middleware/errorHandler';

class BrazeService {
  private client: AxiosInstance;

  constructor() {
    if (!config.braze.apiKey) {
      throw new Error('BRAZE_API_KEY is not configured');
    }

    this.client = axios.create({
      baseURL: config.braze.restEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (requestConfig) => {
        requestConfig.params = {
          ...requestConfig.params,
          api_key: config.braze.apiKey,
          'attributes[teams_array]': 'team7'
        };
        return requestConfig;
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<BrazeErrorResponse>) => {
        const message = error.response?.data?.message || error.message || 'Braze API request failed';
        const statusCode = error.response?.status || 500;

        console.error('Braze API Error:', {
          status: statusCode,
          message,
          url: error.config?.url,
          data: error.response?.data,
        });

        throw createError(message, statusCode);
      }
    );
  }

  async getCanvasDetails(canvasId: string, postLaunchDraft?: boolean): Promise<BrazeCanvasDetailsResponse> {
    const params: Record<string, string | boolean> = { canvas_id: canvasId };
    if (postLaunchDraft !== undefined) {
      params.post_launch_draft_version = postLaunchDraft;
    }

    const response = await this.client.get<BrazeCanvasDetailsResponse>('/canvas/details', {
      params,
    });
    return response.data;
  }

  async listCanvases(): Promise<BrazeCanvasListResponse> {
    const response = await this.client.get<BrazeCanvasListResponse>('/canvas/list');
    return response.data;
  }

  async sendUserAttributes(attributes: BrazeUserAttribute[]): Promise<BrazeTrackResponse> {
    if (!attributes || attributes.length === 0) {
      throw createError('At least one user attribute is required', 400);
    }

    const payload: BrazeTrackRequest = {
      attributes,
    };

    const response = await this.client.post<BrazeTrackResponse>('/users/track', payload);
    return response.data;
  }

  async sendUserEvents(events: BrazeEvent[]): Promise<BrazeTrackResponse> {
    if (!events || events.length === 0) {
      throw createError('At least one event is required', 400);
    }

    const payload: BrazeTrackRequest = {
      events,
    };

    const response = await this.client.post<BrazeTrackResponse>('/users/track', payload);
    return response.data;
  }

  async trackUserData(data: BrazeTrackRequest): Promise<BrazeTrackResponse> {
    if (!data.attributes && !data.events && !data.purchases) {
      throw createError('At least one of attributes, events, or purchases is required', 400);
    }

    const response = await this.client.post<BrazeTrackResponse>('/users/track', data);
    return response.data;
  }

  async listContentBlocks(): Promise<ContentBlockListResponse> {
    const response = await this.client.get<ContentBlockListResponse>('/content_blocks/list');
    return response.data;
  }

  async getContentBlock(contentBlockId: string): Promise<ContentBlockResponse> {
    const response = await this.client.get<ContentBlockResponse>('/content_blocks/info', {
      params: { content_block_id: contentBlockId },
    });
    return response.data;
  }

  async createContentBlock(request: CreateContentBlockRequest): Promise<ContentBlockResponse> {
    const requestWithTeam = {
      ...request,
      teams: request.teams || ['team7'],
    };
    const response = await this.client.post<ContentBlockResponse>('/content_blocks/create', requestWithTeam);
    return response.data;
  }

  async updateContentBlock(request: UpdateContentBlockRequest): Promise<ContentBlockResponse> {
    const response = await this.client.post<ContentBlockResponse>('/content_blocks/update', request);
    return response.data;
  }

  async listEmailTemplates(): Promise<EmailTemplateListResponse> {
    const response = await this.client.get<EmailTemplateListResponse>('/templates/email/list');
    return response.data;
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplateResponse> {
    const response = await this.client.get<EmailTemplateResponse>('/templates/email/info', {
      params: { email_template_id: templateId },
    });
    return response.data;
  }

  async createEmailTemplate(request: CreateEmailTemplateRequest): Promise<EmailTemplateResponse> {
    const response = await this.client.post<EmailTemplateResponse>('/templates/email/create', request);
    return response.data;
  }

  async updateEmailTemplate(request: UpdateEmailTemplateRequest): Promise<EmailTemplateResponse> {
    const response = await this.client.post<EmailTemplateResponse>('/templates/email/update', request);
    return response.data;
  }

  async getScheduledBroadcasts(endTime: string): Promise<ScheduledBroadcastsResponse> {
    const response = await this.client.get<ScheduledBroadcastsResponse>('/messages/scheduled_broadcasts', {
      params: { end_time: endTime },
    });
    return response.data;
  }
}

export const brazeService = new BrazeService();
