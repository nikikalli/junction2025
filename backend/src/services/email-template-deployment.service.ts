import { v4 as uuidv4 } from 'uuid';
import { brazeService } from './braze.service';
import { ContentBlockDeployment } from '../types/automation';

class EmailTemplateDeploymentService {
  /**
   * Creates an email template that references a content block
   */
  async createEmailTemplateFromContentBlock(
    contentBlock: ContentBlockDeployment,
    subject?: string
  ): Promise<{ templateId: string; templateName: string }> {
    const templateName = `template_${contentBlock.contentBlockName}`;

    // Create email template that references the content block
    const emailBody = `{{content_blocks.\${${contentBlock.contentBlockName}}}}`;

    const response = await brazeService.createEmailTemplate({
      template_name: templateName,
      subject: subject || `Personalized Message for ${contentBlock.segment}`,
      body: emailBody,
      description: `Auto-generated template for ${contentBlock.segment}`,
    });

    return {
      templateId: response.email_template_id,
      templateName: response.template_name,
    };
  }

  /**
   * Creates multiple email templates from content blocks
   */
  async createEmailTemplatesFromContentBlocks(
    contentBlocks: ContentBlockDeployment[]
  ): Promise<Array<{ templateId: string; templateName: string; segment: string }>> {
    const templates = [];

    for (const block of contentBlocks) {
      try {
        const template = await this.createEmailTemplateFromContentBlock(block);
        templates.push({
          ...template,
          segment: block.segment,
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to create template for ${block.segment}:`, error);
      }
    }

    return templates;
  }
}

export const emailTemplateDeploymentService = new EmailTemplateDeploymentService();
