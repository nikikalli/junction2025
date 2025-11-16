import { v4 as uuidv4 } from 'uuid';
import { brazeService } from './braze.service';
import {
  PersonalizedMessageDeployment,
  ContentBlockDeployment,
  BatchDeploymentResult,
  DeploymentRecord,
} from '../types/automation';

class ContentDeploymentService {
  private deploymentStorage: Map<string, DeploymentRecord> = new Map();
  private contentBlockMapping: Map<string, ContentBlockDeployment> = new Map();
  private useMockData = false; // Toggle for mock vs real API calls

  private sanitizeContentBlockName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 100);
  }

  private generateContentBlockName(
    canvasId: string,
    stepId: string,
    channel: string,
    field: string,
    segment: string
  ): string {
    const sanitizedSegment = this.sanitizeContentBlockName(segment);
    const name = `${canvasId}_${stepId}_${channel}_${field}_${sanitizedSegment}`;
    return this.sanitizeContentBlockName(name);
  }

  async deployPersonalizedContentBlock(
    canvasId: string,
    stepId: string,
    segment: string,
    personalizedMessage: string,
    channel: string,
    field: string
  ): Promise<ContentBlockDeployment> {
    const contentBlockName = this.generateContentBlockName(
      canvasId,
      stepId,
      channel,
      field,
      segment
    );

    const createdAt = new Date().toISOString();

    try {
      if (this.useMockData) {
        // Mock deployment - simulate API call
        const mockContentBlockId = `cb_${uuidv4().substring(0, 8)}`;
        const liquidTag = `{% content_blocks('${contentBlockName}') %}`;

        const deployment: ContentBlockDeployment = {
          contentBlockId: mockContentBlockId,
          contentBlockName,
          liquidTag,
          segment,
          canvasId,
          stepId,
          channel,
          field,
          status: 'success',
          createdAt,
        };

        // Store in memory
        this.contentBlockMapping.set(
          `${canvasId}_${stepId}_${segment}`,
          deployment
        );

        console.log(`[MOCK] Created content block: ${contentBlockName}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return deployment;
      } else {
        // Real Braze API call
        // Truncate message if too large (Braze limit is 50KB)
        const maxSize = 40000; // 40KB to be safe
        const truncatedMessage = personalizedMessage.length > maxSize
          ? personalizedMessage.substring(0, maxSize) + '<!-- truncated -->'
          : personalizedMessage;

        const response = await brazeService.createContentBlock({
          name: contentBlockName,
          content: truncatedMessage,
          description: `Auto-generated: Canvas ${canvasId}, Step ${stepId}, Segment: ${segment}`,
          content_type: 'html',
        });

        const deployment: ContentBlockDeployment = {
          contentBlockId: response.content_block_id,
          contentBlockName,
          liquidTag: `{% content_blocks('${contentBlockName}') %}`,
          segment,
          canvasId,
          stepId,
          channel,
          field,
          status: 'success',
          createdAt,
        };

        this.contentBlockMapping.set(
          `${canvasId}_${stepId}_${segment}`,
          deployment
        );

        return deployment;
      }
    } catch (error) {
      console.error(`Failed to deploy content block: ${contentBlockName}`, error);

      const deployment: ContentBlockDeployment = {
        contentBlockId: '',
        contentBlockName,
        liquidTag: '',
        segment,
        canvasId,
        stepId,
        channel,
        field,
        status: 'failed',
        createdAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return deployment;
    }
  }

  async batchDeployContentBlocks(
    deployments: PersonalizedMessageDeployment[]
  ): Promise<BatchDeploymentResult> {
    const results: ContentBlockDeployment[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < deployments.length; i++) {
      const deployment = deployments[i];

      try {
        const result = await this.deployPersonalizedContentBlock(
          deployment.canvasId,
          deployment.stepId,
          deployment.segment,
          deployment.personalizedMessage,
          deployment.channel,
          deployment.field
        );

        results.push(result);

        // Rate limiting protection - delay between requests
        if (i < deployments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ index: i, error: errorMessage });

        // Push failed deployment
        results.push({
          contentBlockId: '',
          contentBlockName: '',
          liquidTag: '',
          segment: deployment.segment,
          canvasId: deployment.canvasId,
          stepId: deployment.stepId,
          channel: deployment.channel,
          field: deployment.field,
          status: 'failed',
          createdAt: new Date().toISOString(),
          error: errorMessage,
        });
      }
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      total: deployments.length,
      successful,
      failed,
      deployments: results,
      errors,
    };
  }

  async getDeploymentById(deploymentId: string): Promise<DeploymentRecord | null> {
    return this.deploymentStorage.get(deploymentId) || null;
  }

  async getAllDeployments(): Promise<DeploymentRecord[]> {
    return Array.from(this.deploymentStorage.values());
  }

  async getDeploymentsByCanvasId(canvasId: string): Promise<DeploymentRecord[]> {
    return Array.from(this.deploymentStorage.values()).filter(
      d => d.canvasId === canvasId
    );
  }

  storeDeployment(deployment: DeploymentRecord): void {
    this.deploymentStorage.set(deployment.id, deployment);
  }

  async getContentBlockByKey(canvasId: string, stepId: string, segment: string): Promise<ContentBlockDeployment | null> {
    return this.contentBlockMapping.get(`${canvasId}_${stepId}_${segment}`) || null;
  }

  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
  }
}

export const contentDeploymentService = new ContentDeploymentService();
