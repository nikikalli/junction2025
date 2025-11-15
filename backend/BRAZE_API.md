# Braze Service API Documentation

A thin wrapper around Braze's REST API for managing campaigns and user data.

## Base URL

```
http://localhost:3000/api/braze
```

## Configuration

Set the following environment variables:

```env
BRAZE_API_KEY=your_real_braze_key_here
BRAZE_REST_ENDPOINT=https://rest.fra-01.braze.eu
```

## Endpoints

### 1. List All Canvases

Get a list of all Canvas campaigns.

```
GET /api/braze/canvas/list
```

**Response:**
```json
{
  "canvases": [
    {
      "id": "canvas_id_123",
      "name": "Welcome Campaign",
      "description": "Onboarding flow for new users",
      "archived": false,
      "draft": false,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    }
  ],
  "message": "success"
}
```

### 2. Get Canvas Details

Fetch detailed information about a specific Canvas including all steps, messages by channel, and progression paths.

```
GET /api/braze/canvas/:canvasId
```

**Parameters:**
- `canvasId` (path parameter, required): The Canvas ID
- `post_launch_draft_version` (query parameter, optional): Set to `true` to include draft changes if available

**Example:**
```bash
curl http://localhost:3000/api/braze/canvas/canvas_id_123

curl "http://localhost:3000/api/braze/canvas/canvas_id_123?post_launch_draft_version=true"
```

**Response:**
```json
{
  "message": "success",
  "name": "Welcome Campaign",
  "description": "Onboarding flow for new users",
  "archived": false,
  "draft": false,
  "schedule_type": "triggered",
  "channels": ["email", "push"],
  "variants": [
    {
      "name": "Variant 1",
      "id": "variant_id_1",
      "first_step_ids": ["step_id_1"]
    }
  ],
  "tags": ["onboarding"],
  "steps": [
    {
      "id": "step_id_1",
      "name": "Welcome Email",
      "next_paths": [
        {
          "name": "Next Step",
          "next_step_id": "step_id_2"
        }
      ]
    }
  ],
  "messages": {
    "variant_id_1": [
      {
        "variation_id": "message_variation_1",
        "channel": "email"
      }
    ]
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

### 3. Send User Attributes

Update user attributes in Braze.

```
POST /api/braze/users/attributes
```

**Request Body:**
```json
{
  "attributes": [
    {
      "external_id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "country": "US",
      "language": "en",
      "custom_attribute": "custom_value"
    }
  ]
}
```

**Field Options:**
- `external_id` (optional): User's external ID
- `user_alias` (optional): User alias object with `alias_name` and `alias_label`
- `braze_id` (optional): Braze internal user ID
- `email` (optional): Email address
- `phone` (optional): Phone number
- `first_name` (optional): First name
- `last_name` (optional): Last name
- `gender` (optional): Gender
- `dob` (optional): Date of birth
- `country` (optional): Country code
- `home_city` (optional): City
- `language` (optional): Language code
- `email_subscribe` (optional): Email subscription status
- `push_subscribe` (optional): Push notification subscription status
- `image_url` (optional): Profile image URL
- Custom attributes: Any additional fields

**Example:**
```bash
curl -X POST http://localhost:3000/api/braze/users/attributes \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": [
      {
        "external_id": "user_123",
        "email": "user@example.com",
        "first_name": "John"
      }
    ]
  }'
```

**Response:**
```json
{
  "message": "success",
  "attributes_processed": 1
}
```

### 4. Send User Events

Track custom events for users.

```
POST /api/braze/users/events
```

**Request Body:**
```json
{
  "events": [
    {
      "external_id": "user_123",
      "name": "completed_purchase",
      "time": "2025-01-15T12:00:00Z",
      "properties": {
        "product_id": "prod_456",
        "amount": 99.99,
        "currency": "USD"
      }
    }
  ]
}
```

**Field Options:**
- `external_id` (optional): User's external ID
- `user_alias` (optional): User alias object
- `braze_id` (optional): Braze internal user ID
- `app_id` (optional): App identifier
- `name` (required): Event name
- `time` (required): ISO 8601 timestamp
- `properties` (optional): Custom event properties
- `_update_existing_only` (optional): Only update existing users

**Example:**
```bash
curl -X POST http://localhost:3000/api/braze/users/events \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "external_id": "user_123",
        "name": "completed_purchase",
        "time": "2025-01-15T12:00:00Z",
        "properties": {
          "product_id": "prod_456",
          "amount": 99.99
        }
      }
    ]
  }'
```

**Response:**
```json
{
  "message": "success",
  "events_processed": 1
}
```

### 5. Track User Data (Combined)

Send attributes and events in a single request.

```
POST /api/braze/users/track
```

**Request Body:**
```json
{
  "attributes": [
    {
      "external_id": "user_123",
      "email": "user@example.com",
      "country": "US"
    }
  ],
  "events": [
    {
      "external_id": "user_123",
      "name": "profile_updated",
      "time": "2025-01-15T12:00:00Z"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/braze/users/track \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": [
      {
        "external_id": "user_123",
        "email": "user@example.com"
      }
    ],
    "events": [
      {
        "external_id": "user_123",
        "name": "profile_updated",
        "time": "2025-01-15T12:00:00Z"
      }
    ]
  }'
```

**Response:**
```json
{
  "message": "success",
  "attributes_processed": 1,
  "events_processed": 1
}
```

### 6. Schedule Triggered Canvas

Schedule a Canvas to send to specific users or segments at a specified time.

```
POST /api/braze/canvas/trigger/schedule
```

**Request Body:**
```json
{
  "canvas_id": "canvas_id_123",
  "schedule": {
    "time": "2025-01-20T14:00:00Z",
    "in_local_time": false,
    "at_optimal_time": false
  },
  "recipients": [
    {
      "external_id": "user_123",
      "canvas_entry_properties": {
        "promo_code": "WELCOME20"
      }
    }
  ]
}
```

**Field Options:**
- `canvas_id` (required): Canvas identifier
- `schedule` (required): Scheduling configuration
  - `time` (required): ISO 8601 datetime string for delivery
  - `in_local_time` (optional): Send in user's local timezone
  - `at_optimal_time` (optional): Send at optimal time for user
- `recipients` (optional): Array of up to 50 specific users to target
  - `external_id` (optional): User's external ID
  - `user_alias` (optional): User alias object
  - `canvas_entry_properties` (optional): Personalization properties
  - `send_to_existing_only` (optional): Only send to existing users
  - `attributes` (optional): User attributes to update
- `audience` (optional): Segment targeting with AND/OR filters
- `broadcast` (optional): Set to `true` to send to entire segment
- `canvas_entry_properties` (optional): Global entry properties for all recipients

**Constraints:**
- Maximum 50 recipients per request
- Cannot use both `broadcast: true` and `recipients` list
- If neither `recipients` nor `audience` provided, targets Canvas's default segment

**Example - Schedule to specific users:**
```bash
curl -X POST http://localhost:3000/api/braze/canvas/trigger/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "canvas_id": "canvas_id_123",
    "schedule": {
      "time": "2025-01-20T14:00:00Z",
      "in_local_time": true
    },
    "recipients": [
      {
        "external_id": "user_123",
        "canvas_entry_properties": {
          "product_name": "Premium Plan"
        }
      },
      {
        "external_id": "user_456",
        "canvas_entry_properties": {
          "product_name": "Starter Plan"
        }
      }
    ]
  }'
```

**Example - Broadcast to segment:**
```bash
curl -X POST http://localhost:3000/api/braze/canvas/trigger/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "canvas_id": "canvas_id_123",
    "schedule": {
      "time": "2025-01-20T09:00:00Z",
      "at_optimal_time": true
    },
    "broadcast": true,
    "canvas_entry_properties": {
      "campaign_name": "Spring Sale 2025"
    }
  }'
```

**Response:**
```json
{
  "dispatch_id": "dispatch_id_123",
  "schedule_id": "schedule_id_456",
  "message": "success"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development

### Running Locally

```bash
cd backend
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Notes

- All timestamps must be in ISO 8601 format
- At least one identifier (external_id, user_alias, or braze_id) is required for user operations
- The API validates all requests using Zod schemas
- Requests are proxied through this service to avoid exposing Braze API keys in the frontend
- Rate limits are enforced by Braze's API
