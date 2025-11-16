export interface BrazeCanvasListResponse {
  canvases: BrazeCanvasListItem[];
  message: string;
}

export interface BrazeCanvasListItem {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  draft: boolean;
  schedule_type?: string;
  first_entry?: string;
  last_entry?: string;
  channels?: string[];
  variants?: CanvasVariant[];
  tags?: string[];
  teams?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface BrazeCanvasDetailsResponse {
  message: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description?: string;
  archived?: boolean;
  draft?: boolean;
  schedule_type?: string;
  first_entry?: string;
  last_entry?: string;
  channels?: string[];
  variants?: CanvasVariant[];
  tags?: string[];
  teams?: string[];
  steps?: CanvasStep[];
  messages?: Record<string, CanvasMessage[]>;
}

export interface CanvasVariant {
  name: string;
  id: string;
  first_step_ids?: string[];
  first_step_id?: string;
}

export interface CanvasStep {
  id: string;
  name: string;
  type?: string;
  next_paths?: NextPath[];
  [key: string]: unknown;
}

export interface NextPath {
  name: string;
  next_step_id: string;
}

export interface CanvasMessage {
  variation_id?: string;
  channel?: string;
  [key: string]: unknown;
}

export interface BrazeUserAttribute {
  external_id?: string;
  user_alias?: {
    alias_name: string;
    alias_label: string;
  };
  braze_id?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  country?: string;
  home_city?: string;
  language?: string;
  email_subscribe?: string;
  push_subscribe?: string;
  image_url?: string;
  [key: string]: unknown;
}

export interface BrazeEvent {
  external_id?: string;
  user_alias?: {
    alias_name: string;
    alias_label: string;
  };
  braze_id?: string;
  app_id?: string;
  name: string;
  time: string;
  properties?: Record<string, unknown>;
  _update_existing_only?: boolean;
}

export interface BrazeTrackRequest {
  attributes?: BrazeUserAttribute[];
  events?: BrazeEvent[];
  purchases?: unknown[];
}

export interface BrazeTrackResponse {
  message: string;
  errors?: Array<{
    type: string;
    input_array: string;
    index: number;
  }>;
  attributes_processed?: number;
  events_processed?: number;
  purchases_processed?: number;
}

export interface BrazeErrorResponse {
  message: string;
  errors?: unknown[];
}

export interface ScheduleCanvasRequest {
  canvas_id: string;
  schedule: CanvasSchedule;
  recipients?: CanvasRecipient[];
  audience?: AudienceFilter;
  broadcast?: boolean;
  canvas_entry_properties?: Record<string, unknown>;
}

export interface CanvasSchedule {
  time: string;
  in_local_time?: boolean;
  at_optimal_time?: boolean;
}

export interface CanvasRecipient {
  external_id?: string;
  user_alias?: {
    alias_name: string;
    alias_label: string;
  };
  canvas_entry_properties?: Record<string, unknown>;
  send_to_existing_only?: boolean;
  attributes?: Record<string, unknown>;
}

export interface AudienceFilter {
  AND?: unknown[];
  OR?: unknown[];
  [key: string]: unknown;
}

export interface ScheduleCanvasResponse {
  dispatch_id: string;
  schedule_id: string;
  message: string;
}

export interface ContentBlock {
  content_block_id: string;
  name: string;
  content: string;
  description?: string;
  content_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface ContentBlockListResponse {
  count: number;
  content_blocks: ContentBlock[];
  message: string;
}

export interface ContentBlockResponse {
  content_block_id: string;
  name: string;
  content: string;
  description?: string;
  content_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  message: string;
}

export interface CreateContentBlockRequest {
  name: string;
  content: string;
  description?: string;
  content_type?: string;
  tags?: string[];
  teams?: string[];
}

export interface UpdateContentBlockRequest {
  content_block_id: string;
  name?: string;
  content?: string;
  description?: string;
  content_type?: string;
  tags?: string[];
}

export interface EmailTemplate {
  email_template_id: string;
  template_name: string;
  subject?: string;
  body?: string;
  description?: string;
  plaintext_body?: string;
  preheader?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplateListResponse {
  count: number;
  templates: EmailTemplate[];
  message: string;
}

export interface EmailTemplateResponse {
  email_template_id: string;
  template_name: string;
  subject?: string;
  body?: string;
  description?: string;
  plaintext_body?: string;
  preheader?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  message: string;
}

export interface CreateEmailTemplateRequest {
  template_name: string;
  subject: string;
  body: string;
  plaintext_body?: string;
  preheader?: string;
  tags?: string[];
}

export interface UpdateEmailTemplateRequest {
  email_template_id: string;
  template_name?: string;
  subject?: string;
  body?: string;
  plaintext_body?: string;
  preheader?: string;
  tags?: string[];
}

export interface ScheduledBroadcast {
  name: string;
  id: string;
  type: 'Canvas' | 'Campaign';
  tags: string[];
  next_send_time: string;
  schedule_type?: string;
}

export interface ScheduledBroadcastsResponse {
  scheduled_broadcasts: ScheduledBroadcast[];
  message: string;
}
