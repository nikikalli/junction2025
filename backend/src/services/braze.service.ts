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
const junctionSandboxKey = '6d7b0fc4-6869-4779-b492-a3b74061eb25'

class BrazeService {
  private client: AxiosInstance;

  constructor() {
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
          api_key: config.braze.apiKey || junctionSandboxKey,
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

  async sendCampaign(request: any): Promise<any> {
    const response = await this.client.post('/messages/send', request);
    return response.data;
  }

  async scheduleCampaign(request: any): Promise<any> {
    const response = await this.client.post('/messages/schedule/create', request);
    return response.data;
  }

  async uploadHtmlAsTemplate(
    templateName: string,
    htmlBody: string,
    subject: string,
    tags?: string[]
  ): Promise<EmailTemplateResponse> {
    const requestData: CreateEmailTemplateRequest = {
      template_name: templateName,
      subject: subject,
      body: htmlBody,
    };

    if (tags && tags.length > 0) {
      requestData.tags = tags;
    }

    const template = await this.createEmailTemplate(requestData);

    return template;
  }

  async sendDirectMessage(params: {
    external_user_ids: string[];
    email?: { subject: string; body: string };
    web_push?: { title: string; alert: string };
    in_app_message?: { message: string };
  }): Promise<any> {
    const messages: any = {};

    if (params.email) {
      messages.apple_push = {
        alert: params.email.subject,
        extra: {
          email_subject: params.email.subject,
          email_body: params.email.body,
        },
      };
    }

    if (params.web_push) {
      messages.web_push = {
        alert: params.web_push.alert,
        title: params.web_push.title,
      };
    }

    if (params.in_app_message) {
      messages.in_app_message = {
        message: params.in_app_message.message,
      };
    }

    const payload = {
      external_user_ids: params.external_user_ids,
      messages,
    };

    const response = await this.client.post('/messages/send', payload);
    return response.data;
  }

  async extractCanvasMessages(canvasId: string): Promise<Array<{
    channel: string;
    content: any;
  }>> {
    const canvasDetails = await this.getCanvasDetails(canvasId);
    const extractedMessages: Array<{
      channel: string;
      content: any;
    }> = [];

    if (!canvasDetails.steps) {
      return extractedMessages;
    }

    for (const step of canvasDetails.steps) {
      if (!step.messages) {
        continue;
      }

      for (const [_messageId, message] of Object.entries(step.messages as Record<string, any>)) {
        const channel = message.channel;

        if (channel === 'web_push') {
          extractedMessages.push({
            channel: 'web_push',
            content: {
              title: message.title,
              alert: message.alert,
            },
          });
        } else if (channel === 'trigger_in_app_message' || channel === 'in_app_message') {
          extractedMessages.push({
            channel: 'in_app_message',
            content: {
              message: message.message,
            },
          });
        } else if (channel === 'email') {
          extractedMessages.push({
            channel: 'email',
            content: {
              subject: message.subject,
              body: message.body,
            },
          });
        }
      }
    }

    return extractedMessages;
  }

  transformMessagesToActivities(messages: Array<{
    channel: string;
    content: any;
  }>): Array<{
    type: string;
    message: string;
    subject: string | null;
  }> {
    return messages.map(msg => {
      let message = '';
      let subject: string | null = null;

      if (msg.channel === 'web_push') {
        subject = msg.content.title || null;
        message = msg.content.alert || '';
      } else if (msg.channel === 'in_app_message') {
        message = msg.content.message || '';
        subject = null;
      } else if (msg.channel === 'email') {
        subject = msg.content.subject || null;
        message = msg.content.body || '';
      }

      return {
        type: msg.channel,
        message,
        subject,
      };
    });
  }
}

export const brazeService = new BrazeService();
