# Braze Service – Complete Workflow Guide

## Architecture Overview

This service acts as a **thin gateway** to Braze. It provides three main capabilities:

1. **READ**: Pull Canvas metadata, Content Blocks, and Email Templates from Braze
2. **WRITE**: Create/update Content Blocks and Email Templates with segment-tailored content
3. **TRIGGER**: Launch Braze Campaigns/Canvases with personalized data

## Complete Campaign Workflow

### Step 1: Fetch Available Canvas Templates

List all available Canvases to see what campaign structures exist:

```bash
curl http://localhost:3000/api/braze/canvas/list
```

Response shows all available Canvas templates with their IDs.

### Step 2: Get Canvas Details

Fetch the complete structure of a specific Canvas including steps, messages, and variants:

```bash
curl http://localhost:3000/api/braze/canvas/6917013865513f0082708319
```

This returns:
- Canvas structure (steps and progression paths)
- Message channels (email, push, SMS, in-app)
- Variants and their configurations

### Step 3: Create/Update Content Blocks (Segment Engine Output)

Your Segment Engine produces personalized content for different segments. Store this content in Braze Content Blocks:

**Create a new Content Block:**
```bash
curl -X POST http://localhost:3000/api/braze/content-blocks/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "segment_premium_users_welcome",
    "content": "<h1>Welcome Premium User!</h1><p>Exclusive benefits await...</p>",
    "description": "Welcome message for premium segment",
    "content_type": "html",
    "tags": ["segment:premium", "campaign:welcome"]
  }'
```

**Update existing Content Block:**
```bash
curl -X POST http://localhost:3000/api/braze/content-blocks/update \
  -H "Content-Type: application/json" \
  -d '{
    "content_block_id": "block_id_here",
    "content": "<h1>Updated Premium Welcome!</h1>"
  }'
```

### Step 4: Create/Update Email Templates

Create email templates with your personalized content:

**Create Email Template:**
```bash
curl -X POST http://localhost:3000/api/braze/templates/email/create \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Premium User Onboarding",
    "subject": "Welcome to Premium - {{first_name}}!",
    "body": "{% content_block :segment_premium_users_welcome %}",
    "plaintext_body": "Welcome to Premium!",
    "preheader": "Your premium journey starts here",
    "tags": ["segment:premium"]
  }'
```

**Update Email Template:**
```bash
curl -X POST http://localhost:3000/api/braze/templates/email/update \
  -H "Content-Type: application/json" \
  -d '{
    "email_template_id": "template_id_here",
    "subject": "Updated subject line",
    "body": "Updated email body with {% content_block :new_block %}"
  }'
```

### Step 5: Trigger Canvas Campaign

Now trigger the Canvas campaign with your segmented users:

**Schedule for specific users:**
```bash
curl -X POST http://localhost:3000/api/braze/canvas/trigger/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "canvas_id": "6917013865513f0082708319",
    "schedule": {
      "time": "2025-11-16T10:00:00Z",
      "in_local_time": true
    },
    "recipients": [
      {
        "external_id": "Tampere_001",
        "canvas_entry_properties": {
          "segment": "premium",
          "campaign_type": "onboarding"
        }
      }
    ]
  }'
```

**Broadcast to entire segment:**
```bash
curl -X POST http://localhost:3000/api/braze/canvas/trigger/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "canvas_id": "6917013865513f0082708319",
    "schedule": {
      "time": "2025-11-16T14:00:00Z"
    },
    "broadcast": true,
    "canvas_entry_properties": {
      "campaign_name": "Junction 2025 Launch",
      "segment": "all_users"
    }
  }'
```

## API Endpoints Summary

### Canvas Management (Read)
- `GET /api/braze/canvas/list` - List all Canvases
- `GET /api/braze/canvas/:canvasId` - Get Canvas details with steps and messages

### Content Blocks (Read & Write)
- `GET /api/braze/content-blocks/list` - List all Content Blocks
- `GET /api/braze/content-blocks/:contentBlockId` - Get specific Content Block
- `POST /api/braze/content-blocks/create` - Create new Content Block
- `POST /api/braze/content-blocks/update` - Update existing Content Block

### Email Templates (Read & Write)
- `GET /api/braze/templates/email/list` - List all Email Templates
- `GET /api/braze/templates/email/:templateId` - Get specific Email Template
- `POST /api/braze/templates/email/create` - Create new Email Template
- `POST /api/braze/templates/email/update` - Update existing Email Template

### Campaign Triggering (Write)
- `POST /api/braze/canvas/trigger/schedule` - Schedule triggered Canvas campaign

### User Data Tracking (Write)
- `POST /api/braze/users/attributes` - Update user attributes
- `POST /api/braze/users/events` - Track user events
- `POST /api/braze/users/track` - Combined attributes and events

## Integration with Other Services

### Segment Engine → Braze Service
Your Segment Engine should:
1. Analyze user segments
2. Generate personalized content for each segment
3. Call `/content-blocks/create` or `/content-blocks/update` to store content
4. Call `/templates/email/create` or `/templates/email/update` to create templates
5. Call `/canvas/trigger/schedule` to launch campaigns

### QA Service → Braze Service
Your QA Service should:
1. Call `/canvas/:canvasId` to fetch Canvas details
2. Call `/content-blocks/:contentBlockId` to fetch content for review
3. Call `/templates/email/:templateId` to fetch templates for QA

## Environment Configuration

```env
PORT=3000
BRAZE_API_KEY=6d7b0fc4-6869-4779-b492-a3b74061eb25
BRAZE_REST_ENDPOINT=https://rest.fra-01.braze.eu
```

## Key Features

- Stateless service - no database required
- Full TypeScript with strict type checking
- Request validation with Zod schemas
- Comprehensive error handling
- API key authentication via query parameters
- Ready for Vercel deployment

## Example: Complete Multi-Segment Campaign

```bash
# 1. Create Content Block for Segment A (Premium Users)
curl -X POST http://localhost:3000/api/braze/content-blocks/create \
  -H "Content-Type: application/json" \
  -d '{"name": "premium_offer", "content": "Get 50% off Premium!", "tags": ["segment:premium"]}'

# 2. Create Content Block for Segment B (Free Users)
curl -X POST http://localhost:3000/api/braze/content-blocks/create \
  -H "Content-Type: application/json" \
  -d '{"name": "free_offer", "content": "Try Premium for 30 days!", "tags": ["segment:free"]}'

# 3. Create Email Template using Content Blocks
curl -X POST http://localhost:3000/api/braze/templates/email/create \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Segmented Offer Email",
    "subject": "Special Offer Just for You!",
    "body": "{% if custom_attribute.${segment} == \"premium\" %}{% content_block :premium_offer %}{% else %}{% content_block :free_offer %}{% endif %}"
  }'

# 4. Trigger Canvas Campaign
curl -X POST http://localhost:3000/api/braze/canvas/trigger/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "canvas_id": "6917013865513f0082708319",
    "schedule": {"time": "2025-11-16T10:00:00Z"},
    "broadcast": true
  }'
```

## Error Handling

All endpoints return errors in consistent format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Common status codes:
- `400` - Validation error
- `401` - Invalid API key
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Internal server error
