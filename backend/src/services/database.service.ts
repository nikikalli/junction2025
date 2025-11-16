import { Pool, QueryResult } from 'pg';
import { getPool } from '../config/database';
import {
  Campaign,
  CampaignWithImplementations,
  CreateCampaignInput,
  CampaignImplementation,
  CreateCampaignImplementationInput,
  Action,
  CreateActionInput,
  CampaignImplementationWithActions,
} from '../types/database';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  /**
   * Fetch all campaigns from the database
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    const query = `
      SELECT id, name, canvas_id, start_date, created_at, updated_at
      FROM campaigns
      ORDER BY created_at DESC
    `;

    const result: QueryResult<Campaign> = await this.pool.query(query);
    return result.rows;
  }

  /**
   * Fetch all campaigns with their implementations and actions using JOINs
   */
  async getAllCampaignsWithImplementations(): Promise<CampaignWithImplementations[]> {
    const query = `
      SELECT 
        c.id as campaign_id,
        c.name as campaign_name,
        c.canvas_id,
        c.start_date,
        c.created_at as campaign_created_at,
        c.updated_at as campaign_updated_at,
        ci.id as implementation_id,
        ci.created_at as implementation_created_at,
        ci.updated_at as implementation_updated_at,
        a.id as action_id,
        a.day_of_campaign,
        a.channel,
        a.message_subject,
        a.message_body,
        a.created_at as action_created_at,
        a.updated_at as action_updated_at
      FROM campaigns c
      LEFT JOIN campaign_implementations ci ON c.id = ci.campaign_id
      LEFT JOIN action a ON ci.id = a.campaign_implementation_id
      ORDER BY c.created_at DESC, ci.id, a.day_of_campaign ASC
    `;

    const result = await this.pool.query(query);

    // Transform flat result into nested structure
    const campaignsMap = new Map<number, CampaignWithImplementations>();
    const implementationsMap = new Map<number, CampaignImplementationWithActions>();

    for (const row of result.rows) {
      // Build campaign
      if (!campaignsMap.has(row.campaign_id)) {
        campaignsMap.set(row.campaign_id, {
          id: row.campaign_id,
          name: row.campaign_name,
          canvas_id: row.canvas_id,
          start_date: row.start_date,
          created_at: row.campaign_created_at,
          updated_at: row.campaign_updated_at,
          implementations: [],
        });
      }

      const campaign = campaignsMap.get(row.campaign_id)!;

      // Build implementation
      if (row.implementation_id && !implementationsMap.has(row.implementation_id)) {
        const implementation: CampaignImplementationWithActions = {
          id: row.implementation_id,
          campaign_id: row.campaign_id,
          created_at: row.implementation_created_at,
          updated_at: row.implementation_updated_at,
          actions: [],
        };
        implementationsMap.set(row.implementation_id, implementation);
        campaign.implementations!.push(implementation);
      }

      // Build action
      if (row.action_id) {
        const implementation = implementationsMap.get(row.implementation_id)!;
        implementation.actions!.push({
          id: row.action_id,
          campaign_implementation_id: row.implementation_id,
          day_of_campaign: row.day_of_campaign,
          channel: row.channel,
          message_subject: row.message_subject,
          message_body: row.message_body,
          created_at: row.action_created_at,
          updated_at: row.action_updated_at,
        });
      }
    }

    return Array.from(campaignsMap.values());
  }

  /**
   * Fetch a single campaign by ID
   */
  async getCampaignById(id: number): Promise<Campaign | null> {
    const query = `
      SELECT id, name, canvas_id, start_date, created_at, updated_at
      FROM campaigns
      WHERE id = $1
    `;

    const result: QueryResult<Campaign> = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Fetch a single campaign by ID with implementations and actions using JOINs
   */
  async getCampaignByIdWithImplementations(id: number): Promise<CampaignWithImplementations | null> {
    const query = `
      SELECT 
        c.id as campaign_id,
        c.name as campaign_name,
        c.canvas_id,
        c.start_date,
        c.created_at as campaign_created_at,
        c.updated_at as campaign_updated_at,
        ci.id as implementation_id,
        ci.created_at as implementation_created_at,
        ci.updated_at as implementation_updated_at,
        a.id as action_id,
        a.day_of_campaign,
        a.channel,
        a.message_subject,
        a.message_body,
        a.created_at as action_created_at,
        a.updated_at as action_updated_at
      FROM campaigns c
      LEFT JOIN campaign_implementations ci ON c.id = ci.campaign_id
      LEFT JOIN action a ON ci.id = a.campaign_implementation_id
      WHERE c.id = $1
      ORDER BY ci.id, a.day_of_campaign ASC
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    // Transform flat result into nested structure
    const firstRow = result.rows[0];
    const campaign: CampaignWithImplementations = {
      id: firstRow.campaign_id,
      name: firstRow.campaign_name,
      canvas_id: firstRow.canvas_id,
      start_date: firstRow.start_date,
      created_at: firstRow.campaign_created_at,
      updated_at: firstRow.campaign_updated_at,
      implementations: [],
    };

    const implementationsMap = new Map<number, CampaignImplementationWithActions>();

    for (const row of result.rows) {
      // Build implementation
      if (row.implementation_id && !implementationsMap.has(row.implementation_id)) {
        const implementation: CampaignImplementationWithActions = {
          id: row.implementation_id,
          campaign_id: row.campaign_id,
          created_at: row.implementation_created_at,
          updated_at: row.implementation_updated_at,
          actions: [],
        };
        implementationsMap.set(row.implementation_id, implementation);
        campaign.implementations!.push(implementation);
      }

      // Build action
      if (row.action_id) {
        const implementation = implementationsMap.get(row.implementation_id)!;
        implementation.actions!.push({
          id: row.action_id,
          campaign_implementation_id: row.implementation_id,
          day_of_campaign: row.day_of_campaign,
          channel: row.channel,
          message_subject: row.message_subject,
          message_body: row.message_body,
          created_at: row.action_created_at,
          updated_at: row.action_updated_at,
        });
      }
    }

    return campaign;
  }

  /**
   * Save a new campaign to the database
   */
  async saveCampaign(campaign: CreateCampaignInput): Promise<Campaign> {
    const query = `
      INSERT INTO campaigns (name, canvas_id, start_date)
      VALUES ($1, $2, $3)
      RETURNING id, name, canvas_id, start_date, created_at, updated_at
    `;

    const result: QueryResult<Campaign> = await this.pool.query(query, [
      campaign.name,
      campaign.canvas_id,
      campaign.start_date,
    ]);

    return result.rows[0];
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(id: number, campaign: Partial<CreateCampaignInput>): Promise<Campaign | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (campaign.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(campaign.name);
    }
    if (campaign.canvas_id !== undefined) {
      updates.push(`canvas_id = $${paramCount++}`);
      values.push(campaign.canvas_id);
    }
    if (campaign.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(campaign.start_date);
    }

    if (updates.length === 0) {
      return this.getCampaignById(id);
    }

    values.push(id);
    const query = `
      UPDATE campaigns
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, canvas_id, start_date, created_at, updated_at
    `;

    const result: QueryResult<Campaign> = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a campaign by ID
   */
  async deleteCampaign(id: number): Promise<boolean> {
    const query = 'DELETE FROM campaigns WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get all implementations for a campaign with their actions using JOIN
   */
  async getCampaignImplementations(campaignId: number): Promise<CampaignImplementationWithActions[]> {
    const query = `
      SELECT 
        ci.id as implementation_id,
        ci.campaign_id,
        ci.created_at as implementation_created_at,
        ci.updated_at as implementation_updated_at,
        a.id as action_id,
        a.day_of_campaign,
        a.channel,
        a.message_subject,
        a.message_body,
        a.created_at as action_created_at,
        a.updated_at as action_updated_at
      FROM campaign_implementations ci
      LEFT JOIN action a ON ci.id = a.campaign_implementation_id
      WHERE ci.campaign_id = $1
      ORDER BY ci.created_at DESC, a.day_of_campaign ASC
    `;

    const result = await this.pool.query(query, [campaignId]);

    // Transform flat result into nested structure
    const implementationsMap = new Map<number, CampaignImplementationWithActions>();

    for (const row of result.rows) {
      // Build implementation
      if (!implementationsMap.has(row.implementation_id)) {
        implementationsMap.set(row.implementation_id, {
          id: row.implementation_id,
          campaign_id: row.campaign_id,
          created_at: row.implementation_created_at,
          updated_at: row.implementation_updated_at,
          actions: [],
        });
      }

      const implementation = implementationsMap.get(row.implementation_id)!;

      // Build action
      if (row.action_id) {
        implementation.actions!.push({
          id: row.action_id,
          campaign_implementation_id: row.implementation_id,
          day_of_campaign: row.day_of_campaign,
          channel: row.channel,
          message_subject: row.message_subject,
          message_body: row.message_body,
          created_at: row.action_created_at,
          updated_at: row.action_updated_at,
        });
      }
    }

    return Array.from(implementationsMap.values());
  }
  async saveCampaignImplementation(
    implementation: CreateCampaignImplementationInput
  ): Promise<CampaignImplementation> {
    const query = `
      INSERT INTO campaign_implementations (campaign_id)
      VALUES ($1)
      RETURNING id, campaign_id, created_at, updated_at
    `;

    const result: QueryResult<CampaignImplementation> = await this.pool.query(query, [
      implementation.campaign_id,
    ]);

    return result.rows[0];
  }

  /**
   * Get all actions for a campaign implementation
   */
  async getImplementationActions(implementationId: number): Promise<Action[]> {
    const query = `
      SELECT id, campaign_implementation_id, day_of_campaign, channel, 
             message_subject, message_body, created_at, updated_at
      FROM action
      WHERE campaign_implementation_id = $1
      ORDER BY day_of_campaign ASC
    `;

    const result: QueryResult<Action> = await this.pool.query(query, [implementationId]);
    return result.rows;
  }

  /**
   * Save a new action
   */
  async saveAction(action: CreateActionInput): Promise<Action> {
    const query = `
      INSERT INTO action (campaign_implementation_id, day_of_campaign, channel, 
                         message_subject, message_body)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, campaign_implementation_id, day_of_campaign, channel, 
                message_subject, message_body, created_at, updated_at
    `;

    const result: QueryResult<Action> = await this.pool.query(query, [
      action.campaign_implementation_id,
      action.day_of_campaign,
      action.channel,
      action.message_subject,
      action.message_body,
    ]);

    return result.rows[0];
  }

  /**
   * Update an existing action
   */
  async updateAction(id: number, updates: Partial<Omit<CreateActionInput, 'campaign_implementation_id'>>): Promise<Action | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.day_of_campaign !== undefined) {
      updateFields.push(`day_of_campaign = $${paramCount++}`);
      values.push(updates.day_of_campaign);
    }
    if (updates.channel !== undefined) {
      updateFields.push(`channel = $${paramCount++}`);
      values.push(updates.channel);
    }
    if (updates.message_subject !== undefined) {
      updateFields.push(`message_subject = $${paramCount++}`);
      values.push(updates.message_subject);
    }
    if (updates.message_body !== undefined) {
      updateFields.push(`message_body = $${paramCount++}`);
      values.push(updates.message_body);
    }

    if (updateFields.length === 0) {
      // No updates provided, just fetch and return existing action
      const query = `
        SELECT id, campaign_implementation_id, day_of_campaign, channel, 
               message_subject, message_body, created_at, updated_at
        FROM action
        WHERE id = $1
      `;
      const result: QueryResult<Action> = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    }

    values.push(id);
    const query = `
      UPDATE action
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, campaign_implementation_id, day_of_campaign, channel, 
                message_subject, message_body, created_at, updated_at
    `;

    const result: QueryResult<Action> = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Save a complete campaign with implementations and actions in a transaction
   */
  async saveCompleteCampaign(
    campaignData: CreateCampaignInput,
    implementations: Array<{
      actions: CreateActionInput[];
    }>
  ): Promise<CampaignWithImplementations> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert campaign
      const campaignQuery = `
        INSERT INTO campaigns (name, canvas_id, start_date)
        VALUES ($1, $2, $3)
        RETURNING id, name, canvas_id, start_date, created_at, updated_at
      `;

      const campaignResult: QueryResult<Campaign> = await client.query(campaignQuery, [
        campaignData.name,
        campaignData.canvas_id,
        campaignData.start_date,
      ]);

      const campaign = campaignResult.rows[0];

      // Insert implementations and actions
      const implementationsWithActions: CampaignImplementationWithActions[] = [];

      for (const implData of implementations) {
        const implQuery = `
          INSERT INTO campaign_implementations (campaign_id)
          VALUES ($1)
          RETURNING id, campaign_id, created_at, updated_at
        `;

        const implResult: QueryResult<CampaignImplementation> = await client.query(implQuery, [
          campaign.id,
        ]);

        const implementation = implResult.rows[0];

        // Insert actions for this implementation
        const actions: Action[] = [];
        for (const actionData of implData.actions) {
          const actionQuery = `
            INSERT INTO action (campaign_implementation_id, day_of_campaign, channel, 
                               message_subject, message_body)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, campaign_implementation_id, day_of_campaign, channel, 
                      message_subject, message_body, created_at, updated_at
          `;

          const actionResult: QueryResult<Action> = await client.query(actionQuery, [
            implementation.id,
            actionData.day_of_campaign,
            actionData.channel,
            actionData.message_subject,
            actionData.message_body,
          ]);

          actions.push(actionResult.rows[0]);
        }

        implementationsWithActions.push({
          ...implementation,
          actions,
        });
      }

      await client.query('COMMIT');

      return {
        ...campaign,
        implementations: implementationsWithActions,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    const schemaSQL = `
      -- Create user_segments_enriched table
      CREATE TABLE IF NOT EXISTS user_segments_enriched (
          id SERIAL PRIMARY KEY,
          segment_id DECIMAL NOT NULL UNIQUE,
          language VARCHAR(10) NOT NULL,
          parent_age DECIMAL NOT NULL,
          parent_gender VARCHAR(10) NOT NULL,
          baby_count DECIMAL NOT NULL,
          engagement_propensity DECIMAL NOT NULL,
          price_sensitivity DECIMAL NOT NULL,
          brand_loyalty DECIMAL NOT NULL,
          channel_perf_email DECIMAL NOT NULL,
          channel_perf_push DECIMAL NOT NULL,
          channel_perf_inapp DECIMAL NOT NULL,
          values_family DECIMAL NOT NULL,
          values_eco_conscious DECIMAL NOT NULL,
          values_convenience DECIMAL NOT NULL,
          values_quality DECIMAL NOT NULL,
          contact_frequency_tolerance DECIMAL NOT NULL,
          content_engagement_rate DECIMAL NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create campaigns table
      CREATE TABLE IF NOT EXISTS campaigns (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          canvas_id VARCHAR(255) NOT NULL,
          start_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create campaign_implementations table
      CREATE TABLE IF NOT EXISTS campaign_implementations (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create action table
      CREATE TABLE IF NOT EXISTS action (
          id SERIAL PRIMARY KEY,
          campaign_implementation_id INTEGER NOT NULL REFERENCES campaign_implementations(id) ON DELETE CASCADE,
          day_of_campaign TIMESTAMP NOT NULL,
          channel VARCHAR(100) NOT NULL,
          message_subject TEXT NOT NULL,
          message_body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_segments_segment_id
          ON user_segments_enriched(segment_id);

      CREATE INDEX IF NOT EXISTS idx_user_segments_language
          ON user_segments_enriched(language);

      CREATE INDEX IF NOT EXISTS idx_campaign_implementations_campaign_id
          ON campaign_implementations(campaign_id);

      CREATE INDEX IF NOT EXISTS idx_action_campaign_implementation_id
          ON action(campaign_implementation_id);

      -- Create function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers
      DROP TRIGGER IF EXISTS update_user_segments_updated_at ON user_segments_enriched;
      CREATE TRIGGER update_user_segments_updated_at BEFORE UPDATE ON user_segments_enriched
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
      CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_campaign_implementations_updated_at ON campaign_implementations;
      CREATE TRIGGER update_campaign_implementations_updated_at BEFORE UPDATE ON campaign_implementations
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_action_updated_at ON action;
      CREATE TRIGGER update_action_updated_at BEFORE UPDATE ON action
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await this.pool.query(schemaSQL);
  }

  /**
   * Execute a raw SQL query (for advanced use cases)
   */
  async query(queryText: string, values?: any[]): Promise<QueryResult> {
    return this.pool.query(queryText, values);
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Create a campaign from canvas with activities
   */
  async createCampaignFromCanvas(
    canvasId: string,
    canvasName: string,
    segments: Array<{
      segment_name: string;
      activities: Array<{
        type: string;
        message: string;
        subject: string | null;
      }>;
    }>
  ): Promise<CampaignWithImplementations> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create campaign
      const campaignResult = await client.query<Campaign>(
        `INSERT INTO campaigns (name, canvas_id, start_date)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [canvasName, canvasId]
      );
      const campaign = campaignResult.rows[0];

      // Create implementations for each segment
      const implementations: CampaignImplementationWithActions[] = [];
      
      for (const segment of segments) {
        const implResult = await client.query<CampaignImplementation>(
          `INSERT INTO campaign_implementations (campaign_id, segment_name)
           VALUES ($1, $2)
           RETURNING *`,
          [campaign.id, segment.segment_name]
        );
        const implementation = implResult.rows[0];

        // Create actions for this implementation
        const actions: Action[] = [];
        let dayOffset = 0;

        for (const activity of segment.activities) {
          const actionResult = await client.query<Action>(
            `INSERT INTO action (campaign_implementation_id, day_of_campaign, channel, message_subject, message_body)
             VALUES ($1, NOW() + INTERVAL '${dayOffset} days', $2, $3, $4)
             RETURNING *`,
            [
              implementation.id,
              activity.type,
              activity.subject || '',
              activity.message
            ]
          );
          actions.push(actionResult.rows[0]);
          dayOffset++;
        }

        implementations.push({
          ...implementation,
          actions
        });
      }

      await client.query('COMMIT');

      return {
        ...campaign,
        implementations
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
