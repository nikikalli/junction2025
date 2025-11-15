import { z } from 'zod';

export const userAliasSchema = z.object({
  alias_name: z.string(),
  alias_label: z.string(),
});

export const userAttributeSchema = z.object({
  external_id: z.string().optional(),
  user_alias: userAliasSchema.optional(),
  braze_id: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  country: z.string().optional(),
  home_city: z.string().optional(),
  language: z.string().optional(),
  email_subscribe: z.string().optional(),
  push_subscribe: z.string().optional(),
  image_url: z.string().url().optional(),
}).passthrough();

export const userEventSchema = z.object({
  external_id: z.string().optional(),
  user_alias: userAliasSchema.optional(),
  braze_id: z.string().optional(),
  app_id: z.string().optional(),
  name: z.string().min(1),
  time: z.string().datetime(),
  properties: z.record(z.unknown()).optional(),
  _update_existing_only: z.boolean().optional(),
});

export const sendAttributesSchema = z.object({
  attributes: z.array(userAttributeSchema).min(1),
});

export const sendEventsSchema = z.object({
  events: z.array(userEventSchema).min(1),
});

export const trackUserDataSchema = z.object({
  attributes: z.array(userAttributeSchema).optional(),
  events: z.array(userEventSchema).optional(),
  purchases: z.array(z.unknown()).optional(),
}).refine(
  (data) => data.attributes || data.events || data.purchases,
  {
    message: 'At least one of attributes, events, or purchases is required',
  }
);

export const canvasIdParamSchema = z.object({
  canvasId: z.string().min(1),
});

export const canvasDetailsQuerySchema = z.object({
  post_launch_draft_version: z.string().transform((val) => val === 'true').optional(),
});

export const canvasScheduleSchema = z.object({
  time: z.string().datetime(),
  in_local_time: z.boolean().optional(),
  at_optimal_time: z.boolean().optional(),
});

export const canvasRecipientSchema = z.object({
  external_id: z.string().optional(),
  user_alias: userAliasSchema.optional(),
  canvas_entry_properties: z.record(z.unknown()).optional(),
  send_to_existing_only: z.boolean().optional(),
  attributes: z.record(z.unknown()).optional(),
});

export const audienceFilterSchema = z.object({
  AND: z.array(z.unknown()).optional(),
  OR: z.array(z.unknown()).optional(),
}).passthrough();

export const scheduleCanvasSchema = z.object({
  canvas_id: z.string().min(1),
  schedule: canvasScheduleSchema,
  recipients: z.array(canvasRecipientSchema).max(50).optional(),
  audience: audienceFilterSchema.optional(),
  broadcast: z.boolean().optional(),
  canvas_entry_properties: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    if (data.broadcast && data.recipients && data.recipients.length > 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot use both broadcast and recipients list',
  }
);

export const contentBlockIdParamSchema = z.object({
  contentBlockId: z.string().min(1),
});

export const createContentBlockSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  description: z.string().optional(),
  content_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateContentBlockSchema = z.object({
  content_block_id: z.string().min(1),
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  content_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const emailTemplateIdParamSchema = z.object({
  templateId: z.string().min(1),
});

export const createEmailTemplateSchema = z.object({
  template_name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  plaintext_body: z.string().optional(),
  preheader: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateEmailTemplateSchema = z.object({
  email_template_id: z.string().min(1),
  template_name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  plaintext_body: z.string().optional(),
  preheader: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
