import { Campaign } from '@/types';
import { apiClient } from './api';
import { Action, CampaignWithImplementations, UpdateActionRequest, UpdateCampaignNameRequest } from '@/types/campaigns';

/**
 * CampaignsApiClient - Single source of truth for campaign API interactions
 * Provides type-safe methods for all campaign-related API endpoints
 */
export class CampaignsApiClient {
  private readonly basePath = '/campaigns';
  private campaignsCache: Campaign[] | null = null;
  private campaignByIdCache: Map<number, CampaignWithImplementations> = new Map();
  private actionsCache: Map<string, Action[]> = new Map();

  /**
   * GET /campaigns
   * Fetches all campaigns (basic info only) - cached in memory
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    if (this.campaignsCache) {
      return this.campaignsCache;
    }
    this.campaignsCache = await apiClient.get<Campaign[]>(this.basePath);
    return this.campaignsCache;
  }

  /**
   * GET /campaigns/:id
   * Fetches a single campaign with all its implementations and actions - cached in memory
   * @param campaignId - The ID of the campaign to fetch
   */
  async getCampaignById(campaignId: number): Promise<CampaignWithImplementations> {
    if (this.campaignByIdCache.has(campaignId)) {
      return this.campaignByIdCache.get(campaignId)!;
    }
    const campaign = await apiClient.get<CampaignWithImplementations>(`${this.basePath}/${campaignId}`);
    this.campaignByIdCache.set(campaignId, campaign);
    return campaign;
  }

  /**
   * GET /campaigns/:id/implementations/:implementationId/actions
   * Fetches all actions for a specific implementation - cached in memory
   * @param campaignId - The ID of the campaign
   * @param implementationId - The ID of the implementation (segment)
   */
  async getImplementationActions(
    campaignId: number,
    implementationId: number
  ): Promise<Action[]> {
    const cacheKey = `${campaignId}-${implementationId}`;
    if (this.actionsCache.has(cacheKey)) {
      return this.actionsCache.get(cacheKey)!;
    }
    const actions = await apiClient.get<Action[]>(
      `${this.basePath}/${campaignId}/implementations/${implementationId}/actions`
    );
    this.actionsCache.set(cacheKey, actions);
    return actions;
  }

  /**
   * POST /campaigns/:id
   * Renames a campaign (invalidates cache)
   * @param campaignId - The ID of the campaign to rename
   * @param name - The new name for the campaign
   */
  async renameCampaign(campaignId: number, name: string): Promise<Campaign> {
    const body: UpdateCampaignNameRequest = { name };
    const result = await apiClient.post<Campaign>(`${this.basePath}/${campaignId}`, body);
    this.campaignsCache = null;
    this.campaignByIdCache.delete(campaignId);
    return result;
  }

  /**
   * POST /campaigns/actions/:id
   * Updates an action's properties (subject, body, date, channel) (invalidates cache)
   * @param actionId - The ID of the action to update
   * @param updates - Partial updates to apply to the action
   */
  async updateAction(actionId: number, updates: UpdateActionRequest): Promise<Action> {
    const result = await apiClient.post<Action>(`${this.basePath}/actions/${actionId}`, updates);
    this.actionsCache.clear();
    this.campaignByIdCache.clear();
    return result;
  }

  /**
   * Helper method to update only the action's subject
   */
  async updateActionSubject(actionId: number, subject: string): Promise<Action> {
    return this.updateAction(actionId, { message_subject: subject });
  }

  /**
   * Helper method to update only the action's body
   */
  async updateActionBody(actionId: number, body: string): Promise<Action> {
    return this.updateAction(actionId, { message_body: body });
  }

  /**
   * Helper method to update only the action's channel
   */
  async updateActionChannel(actionId: number, channel: string): Promise<Action> {
    return this.updateAction(actionId, { channel });
  }

  /**
   * Helper method to update only the action's date
   */
  async updateActionDate(actionId: number, date: Date | string): Promise<Action> {
    const dateString = typeof date === 'string' ? date : date.toISOString();
    return this.updateAction(actionId, { day_of_campaign: dateString });
  }
}

// Export singleton instance
export const campaignsApi = new CampaignsApiClient();
