# Helsinki Hackathon – Braze Campaign Orchestrator Backend  
**Solution 1 – Full Technical Specification**

---

## 1. Purpose Of This Document

This markdown file defines every detail needed to build a backend system that:

1. Connects to the **Braze** EU-01 instance.
2. Syncs **users and events** into Braze using the Braze REST API.
3. Models and stores **campaigns** with all relevant metadata.
4. Calculates **campaign complexity** and **risk**.
5. Runs a defined **QA process** over campaigns before launch.
6. **Triggers Braze Campaigns or Canvases** when campaigns are approved.
7. Records launches and prepares the ground for **basic reporting**.

A developer who reads only this file should be able to:

- Set up the backend codebase.
- Configure environment variables.
- Create the database schema.
- Implement all API endpoints.
- Integrate with Braze.
- Understand and implement the business logic for complexity and QA.

The implementation example uses:

- **Language:** TypeScript  
- **Runtime:** Node.js  
- **Web framework:** Express  
- **Database:** PostgreSQL (SQL schema is provided; SQLite can be used with minor changes)  
- **HTTP client:** Axios (or similar)  

All language-specific parts are suggestions; a different stack can be used as long as the behavior and interfaces remain the same.

---

## 2. System Overview

### 2.1 Main Components

1. **Backend API service**
   - Receives HTTP requests from a frontend or scripts.
   - Validates input.
   - Stores campaign data in the database.
   - Calls Braze REST API for user sync, event sending, and campaign or canvas triggering.

2. **Database**
   - Stores `Campaign` records.
   - Stores `CampaignLaunch` records.
   - Optionally stores `UserSyncLog` and `EventSyncLog` for troubleshooting.

3. **External System: Braze**
   - Manages actual messaging (email, push, in-app).
   - Stores user profiles and events.
   - Hosts Canvas flows and Campaign definitions.

4. **External System: Figma**
   - Holds visual and content design of campaigns.
   - Backend stores only a URL (no direct integration required for this spec).

### 2.2 Campaign Lifecycle Phases

The backend supports six phases:

1. **Phase 1: Briefing**
   - Create or update campaign metadata via backend API.

2. **Phase 2: Journey / Flow Creation**
   - Canvas and Campaign objects are created in Braze by a marketer.
   - Backend stores Braze identifiers and links.

3. **Phase 3: Creative Development**
   - Creative is produced in Figma and Braze.
   - Backend stores Figma link and optionally a checklist reference.

4. **Phase 4: Campaign Setup & QA**
   - Backend calculates complexity and risk.
   - Backend runs QA rules and returns structured QA feedback.

5. **Phase 5: Launch & Hypercare**
   - Backend calls Braze to trigger the Campaign or Canvas.
   - Backend stores launch information.

6. **Phase 6: Reporting & Optimization**
   - Backend can surface basic statistics using events and stored information (extension step).

---

## 3. External Integration: Braze

### 3.1 Braze Environment

- **Dashboard URL:** `https://dashboard-01.braze.eu`
- **REST Endpoint:** `https://rest.fra-01.braze.eu`
- **Auth Method:** HTTP header `Authorization: Bearer <BRAZE_API_KEY>`

The backend must read these configuration values from environment variables:

- `BRAZE_API_KEY`
- `BRAZE_REST_ENDPOINT` (default value should be `https://rest.fra-01.braze.eu` if not provided)

### 3.2 Braze Endpoints Used

The backend must support at least these Braze API endpoints:

1. `POST /users/track`
   - Used for:
     - Updating user attributes.
     - Sending custom events.

2. `POST /braze/trigger/send`
   - Used to trigger an existing **Braze Campaign** for:
     - Specific recipients.
     - Or as a broadcast to the campaign’s segment.

3. `POST /canvas/trigger/send`
   - Used to trigger an existing **Braze Canvas** for:
     - Specific recipients.
     - Or as a broadcast to the canvas audience.

The backend can optionally be extended later to use endpoints for content blocks and templates, but this specification focuses on the three endpoints above.

### 3.3 HTTP Client Requirements

Any HTTP client library can be used. The minimal requirements are:

- Ability to set a base URL (`BRAZE_REST_ENDPOINT`).
- Ability to send JSON bodies.
- Ability to set headers:
  - `Authorization: Bearer <BRAZE_API_KEY>`
  - `Content-Type: application/json`
- Ability to inspect response body and status code.
- Ability to handle network errors and timeouts.

An example axios instance configuration in TypeScript:


import axios from 'axios';

const brazeClient = axios.create({
  baseURL: process.env.BRAZE_REST_ENDPOINT || 'https://rest.fra-01.braze.eu',
  headers: {
    Authorization: `Bearer ${process.env.BRAZE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

4. Domain Model
4.1 Campaign Type Definitions

There are two campaign types:

Standard Campaign (No Promotion)

Purpose: educational, journey-based, technical, or content-only messages.

No monetary or incentive component.

Promotional Campaign

Contains incentives such as:

Discount.

Coupon.

Loyalty reward.

Cashback.

Contest.

Reward milestone.

Backend distinguishes them by a type field with values:

"standard"

"promotional"

4.2 Campaign Complexity Factors

Complexity score must consider:

Promotion Presence

If campaign is promotional, complexity increased.

Segmentation Depth

Segmentation complexity based on the segmentation description length or structured criteria:

Very simple (few rules).

Moderate.

Very complex (many conditions, behavioral criteria).

Campaign Duration

"one_time" versus "always_on".

Always-on flows are more complex.

Markets

Single market is simpler.

Multiple markets increase complexity.

Channels

More channels (email, push, in-app) may increase complexity if you decide to include that dimension.

This specification gives a scoring algorithm that can be extended.

4.3 Database Schema

The database should have at least these tables:

campaigns

campaign_launches

user_sync_logs (optional but recommended)

event_sync_logs (optional but recommended)

4.3.1 Table: campaigns
CREATE TABLE campaigns (
  id                  UUID PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  type                VARCHAR(20) NOT NULL CHECK (type IN ('standard', 'promotional')),
  markets             TEXT[] NOT NULL,                  -- array of ISO country or internal market codes
  mpns                TEXT[] NOT NULL,                  -- array of MPN strings
  start_date          TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date            TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_type       VARCHAR(20) NOT NULL CHECK (duration_type IN ('one_time', 'always_on')),
  segmentation_desc   TEXT NOT NULL,                    -- human readable or JSON string
  channels            TEXT[] NOT NULL,                  -- list of channels, for example ['email', 'in_app']
  figma_url           TEXT,                             -- optional URL
  braze_campaign_id   TEXT,                             -- Braze campaign identifier
  braze_canvas_id     TEXT,                             -- Braze canvas identifier
  complexity_score    INTEGER,                          -- computed value
  risk_level          VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
  status              VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'qa_pending', 'approved', 'launched')),
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


Constraints:

At least one of braze_campaign_id or braze_canvas_id must be present before launch.

end_date must be greater than or equal to start_date.

markets must contain at least one element.

mpns must contain at least one element.

channels must contain at least one element.

These additional constraints can be enforced at application level if not expressed in SQL.

4.3.2 Table: campaign_launches
CREATE TABLE campaign_launches (
  id                UUID PRIMARY KEY,
  campaign_id       UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  braze_id_type     VARCHAR(20) NOT NULL CHECK (braze_id_type IN ('campaign', 'canvas')),
  braze_id_value    TEXT NOT NULL,
  braze_dispatch_id TEXT NOT NULL,
  launched_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  braze_response    JSONB NOT NULL
);


Each record represents one call to Braze to trigger a campaign or canvas.

4.3.3 Table: user_sync_logs (optional)
CREATE TABLE user_sync_logs (
  id            UUID PRIMARY KEY,
  external_id   TEXT NOT NULL,
  payload       JSONB NOT NULL,
  braze_status  INTEGER NOT NULL,
  braze_body    JSONB,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


This can assist debugging user sync issues.

4.3.4 Table: event_sync_logs (optional)
CREATE TABLE event_sync_logs (
  id            UUID PRIMARY KEY,
  external_id   TEXT NOT NULL,
  event_name    TEXT NOT NULL,
  payload       JSONB NOT NULL,
  braze_status  INTEGER NOT NULL,
  braze_body    JSONB,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


This can assist debugging event sending issues.

5. API Design

The backend exposes several HTTP endpoints. All responses must be in JSON. All request bodies for POST and PUT must be JSON.

5.1 Common Response Format

For successful responses:

{
  "success": true,
  "data": { /* endpoint-specific data */ }
}


For error responses:

{
  "success": false,
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable explanation",
    "details": { /* optional object with additional fields */ }
  }
}


Standard error codes:

VALIDATION_ERROR

NOT_FOUND

CONFLICT

BRAZE_ERROR

INTERNAL_ERROR

Each endpoint below lists possible HTTP status codes.

6. Campaign Endpoints
6.1 Create Campaign

Method: POST
Path: /api/braze

6.1.1 Request Body
{
  "name": "RAF Helsinki Launch",
  "type": "promotional",
  "markets": ["FI"],
  "mpns": ["FI001", "FI002"],
  "startDate": "2025-11-20T09:00:00.000Z",
  "endDate": "2025-12-31T21:00:00.000Z",
  "durationType": "always_on",
  "segmentationDescription": "Users in FI with event_count >= 5 and at least one scan_response success.",
  "channels": ["email", "in_app"],
  "figmaUrl": "https://www.figma.com/...",
  "brazeCampaignId": "your-braze-campaign-id",   // optional here
  "brazeCanvasId": null                          // or canvas id
}

6.1.2 Validation Rules

name: non-empty string, maximum length 255.

type: "standard" or "promotional".

markets: non-empty array of strings.

mpns: non-empty array of strings.

startDate: valid ISO 8601 datetime.

endDate: valid ISO 8601 datetime and not earlier than startDate.

durationType: "one_time" or "always_on".

segmentationDescription: non-empty string.

channels: non-empty array of strings; allowed values: "email", "in_app", "push", "sms", "webhook" (this set can be extended but code must list allowed ones explicitly).

figmaUrl: optional valid URL or null.

brazeCampaignId: optional string or null.

brazeCanvasId: optional string or null.

6.1.3 Processing Steps

Validate request body according to all rules above.

Compute complexity and risk (see section 7).

Generate a new UUID for campaign.

Insert into campaigns table with:

status = 'draft'.

complexity_score and risk_level set to computed values.

Return created campaign in response.

6.1.4 Response

Status: 201 Created

{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "name": "RAF Helsinki Launch",
    "type": "promotional",
    "markets": ["FI"],
    "mpns": ["FI001", "FI002"],
    "startDate": "2025-11-20T09:00:00.000Z",
    "endDate": "2025-12-31T21:00:00.000Z",
    "durationType": "always_on",
    "segmentationDescription": "Users in FI with event_count >= 5 and at least one scan_response success.",
    "channels": ["email", "in_app"],
    "figmaUrl": "https://www.figma.com/...",
    "brazeCampaignId": "your-braze-campaign-id",
    "brazeCanvasId": null,
    "complexityScore": 7,
    "riskLevel": "medium",
    "status": "draft",
    "createdAt": "2025-11-14T10:00:00.000Z",
    "updatedAt": "2025-11-14T10:00:00.000Z"
  }
}


On validation error:

Status: 400 Bad Request
Body: standard error format with code = "VALIDATION_ERROR".

6.2 Update Campaign

Method: PUT
Path: /api/braze/:id

6.2.1 Request Body

Same fields as create, but all fields except id may be optional. The backend should:

Read existing campaign from database.

Merge provided fields.

Re-validate combined object.

Recompute complexity and risk.

Example partial update:

{
  "figmaUrl": "https://www.figma.com/new-link",
  "brazeCanvasId": "canvas-123"
}

6.2.2 Response

If successful:

Status: 200 OK
Body: same format as create response but with updated fields.

Possible errors:

404 Not Found: campaign does not exist.

400 Bad Request: validation error.

6.3 Get Campaign

Method: GET
Path: /api/braze/:id

6.3.1 Response

Status: 200 OK

{
  "success": true,
  "data": {
    "id": "campaign-uuid",
    "name": "RAF Helsinki Launch",
    "type": "promotional",
    "markets": ["FI"],
    "mpns": ["FI001", "FI002"],
    "startDate": "2025-11-20T09:00:00.000Z",
    "endDate": "2025-12-31T21:00:00.000Z",
    "durationType": "always_on",
    "segmentationDescription": "Users in FI with event_count >= 5 and at least one scan_response success.",
    "channels": ["email", "in_app"],
    "figmaUrl": "https://www.figma.com/...",
    "brazeCampaignId": "your-braze-campaign-id",
    "brazeCanvasId": null,
    "complexityScore": 7,
    "riskLevel": "medium",
    "status": "approved",
    "createdAt": "2025-11-14T10:00:00.000Z",
    "updatedAt": "2025-11-14T11:00:00.000Z"
  }
}


If not found:

Status: 404 Not Found with NOT_FOUND error code.

6.4 List Campaigns

Method: GET
Path: /api/braze

6.4.1 Query Parameters

All query parameters are optional:

status (string) – filter by status.

type (string) – filter by campaign type.

market (string) – filter campaigns that include this market.

search (string) – substring search on name.

Example: /api/braze?status=approved&type=promotional&market=FI

6.4.2 Response

Status: 200 OK

{
  "success": true,
  "data": [
    {
      "id": "campaign-uuid-1",
      "name": "RAF Helsinki Launch",
      "type": "promotional",
      "markets": ["FI"],
      "mpns": ["FI001"],
      "startDate": "2025-11-20T09:00:00.000Z",
      "endDate": "2025-12-31T21:00:00.000Z",
      "durationType": "always_on",
      "segmentationDescription": "Users in FI with event_count >= 5",
      "channels": ["email"],
      "figmaUrl": "https://www.figma.com/...",
      "brazeCampaignId": "braze-campaign-id",
      "brazeCanvasId": null,
      "complexityScore": 6,
      "riskLevel": "medium",
      "status": "approved",
      "createdAt": "2025-11-14T10:00:00.000Z",
      "updatedAt": "2025-11-14T10:30:00.000Z"
    }
  ]
}
6.5 Run QA For Campaign

Method: POST
Path: /api/braze/:id/qa

6.5.1 QA Rules

For all campaigns:

name must be non-empty.

start_date and end_date must be valid and end_date >= start_date.

channels must contain at least one channel.

At least one of braze_campaign_id or braze_canvas_id must be present.

For promotional campaigns (where type === "promotional"):

markets must contain at least one element.

segmentation_desc must not be empty.

If duration_type is "always_on" then segmentation must not be an unrestricted statement such as "all users" or "everyone".

Check overlap with other promotional campaigns that have:

Intersecting markets.

Overlapping date ranges.

If figma_url is not set, add a warning (but not necessarily a blocking error).

The QA process must:

Recalculate complexity_score and risk_level.

Run the rules above and collect:

warnings: non-blocking issues.

errors: blocking issues.

6.5.2 Processing Steps

Load campaign by id.

If campaign is not found, return 404.

Compute complexity and risk (see section 7).

Run QA rules.

If there are any errors:

Do not change status to approved.

Optionally set status to qa_pending.

If there are no errors:

Set status to approved.

Update campaign record with complexity_score, risk_level, and new status.

Return QA result.

6.5.3 Response

Status: 200 OK

{
  "success": true,
  "data": {
    "campaignId": "campaign-uuid",
    "complexityScore": 7,
    "riskLevel": "medium",
    "warnings": [
      "Promotional campaign in FI is always-on with broad segmentation."
    ],
    "errors": [],
    "newStatus": "approved"
  }
}


If validation inside QA fails (for example dates invalid because of data corruption), respond with 400 Bad Request.

6.6 Launch Campaign

Method: POST
Path: /api/braze/:id/launch

6.6.1 Preconditions

Campaign must exist.

Campaign must have at least one of:

braze_campaign_id

braze_canvas_id

Campaign status must be either:

"approved"

or another defined launch-ready status, based on your decision. For this specification, only "approved" is allowed.

If these preconditions are not met, the endpoint must return a 400 Bad Request with a clear error message (for example "Campaign is not approved for launch").

6.6.2 Launch Behavior

The backend must:

Load campaign.

Determine whether to launch:

A Braze campaign if braze_campaign_id is set and braze_canvas_id is not set.

A Braze canvas if braze_canvas_id is set and braze_campaign_id is not set.

If both are set, either:

Return an error and require the user to choose, or

Define a clear priority rule and document it.
For this spec, the system must return an error if both are set and ask for configuration to be fixed.

Construct Braze request payload.

There are two basic patterns:

Broadcast
Launch campaign or canvas to its configured segment in Braze.

Recipients
Launch for a list of specific users by external_user_id.

For simplicity, this specification defines the following:

Launch as broadcast when triggered via this endpoint.

You may extend later to support custom audiences.

6.6.2.1 Launching Braze Campaign

Braze endpoint: POST /braze/trigger/send

Payload:

{
  "campaign_id": "<braze_campaign_id_from_db>",
  "broadcast": true
}

6.6.2.2 Launching Braze Canvas

Braze endpoint: POST /canvas/trigger/send

Payload:

{
  "canvas_id": "<braze_canvas_id_from_db>",
  "broadcast": true
}


Send request to Braze.

If Braze responds with success:

Extract dispatch_id from response.

Insert a record into campaign_launches.

Update campaign status to "launched".

If Braze responds with an error:

Do not change campaign status.

Return error details with BRAZE_ERROR.

6.6.3 Response

On success:

Status: 200 OK

{
  "success": true,
  "data": {
    "campaignId": "campaign-uuid",
    "launchId": "launch-uuid",
    "brazeIdType": "campaign",
    "brazeIdValue": "braze-campaign-id",
    "brazeDispatchId": "64787ba09d48bc442c87e5f21fc5c91e",
    "launchedAt": "2025-11-14T12:00:00.000Z"
  }
}


On Braze error, for example 400 or 401:

Status: 502 Bad Gateway (or 500 Internal Server Error if you prefer)

{
  "success": false,
  "error": {
    "code": "BRAZE_ERROR",
    "message": "Braze returned an error",
    "details": {
      "status": 400,
      "brazeBody": {
        "message": "Bad Request",
        "errors": ["details from Braze"]
      }
    }
  }
}

7. Complexity and Risk Calculation

The backend must implement a pure function for complexity and risk. The function must be deterministic and based solely on campaign fields.

7.1 Input

Campaign object with fields:

type

segmentation_desc

duration_type

markets

channels

7.2 Scoring Rules

Start score = 1.

Promotion:

If type === "promotional" → score += 3.

If type === "standard" → score += 0.

Segmentation Depth:

Let L = length of segmentation_desc (character count).

If L > 0 and L <= 50 → score += 1.

If L > 50 and L <= 150 → score += 2.

If L > 150 → score += 3.

Duration:

If duration_type === "one_time" → score += 1.

If duration_type === "always_on" → score += 2.

Markets:

Let M = number of markets.

If M === 1 → score += 0.

If M > 1 → score += 1.

Channels (optional but recommended):

Let C = number of channels.

If C === 1 → score += 0.

If C === 2 → score += 1.

If C >= 3 → score += 2.

7.3 Mapping Score To Risk Level

Define risk as:

If score <= 4 → risk = "low".

If 5 <= score <= 7 → risk = "medium".

If score >= 8 → risk = "high".

7.4 Example Implementation (TypeScript)
type CampaignType = 'standard' | 'promotional';
type DurationType = 'one_time' | 'always_on';
type RiskLevel = 'low' | 'medium' | 'high';

interface CampaignForScoring {
  type: CampaignType;
  segmentationDescription: string;
  durationType: DurationType;
  markets: string[];
  channels: string[];
}

function computeComplexityAndRisk(c: CampaignForScoring): { score: number; risk: RiskLevel } {
  let score = 1;

  // Promotion
  if (c.type === 'promotional') {
    score += 3;
  }

  // Segmentation depth
  const L = c.segmentationDescription.length;
  if (L > 0 && L <= 50) {
    score += 1;
  } else if (L > 50 && L <= 150) {
    score += 2;
  } else if (L > 150) {
    score += 3;
  }

  // Duration
  if (c.durationType === 'one_time') {
    score += 1;
  } else if (c.durationType === 'always_on') {
    score += 2;
  }

  // Markets
  const M = c.markets.length;
  if (M > 1) {
    score += 1;
  }

  // Channels
  const C = c.channels.length;
  if (C === 2) {
    score += 1;
  } else if (C >= 3) {
    score += 2;
  }

  let risk: RiskLevel;
  if (score <= 4) {
    risk = 'low';
  } else if (score <= 7) {
    risk = 'medium';
  } else {
    risk = 'high';
  }

  return { score, risk };
}

8. User and Event Sync Endpoints
8.1 Sync User Attributes To Braze

Method: POST
Path: /api/users/attributes

8.1.1 Purpose

Accept a single user attribute object, wrap it into Braze /users/track payload, send it, and return the Braze response.

8.1.2 Request Body
{
  "external_id": "user_001",
  "attributes": {
    "email": "user001@example.com",
    "language": "en",
    "teams_array": "Tampere",
    "MPN": "FI001",
    "event_count": 12,
    "_update_existing_only": false
  }
}
8.1.3 Validation Rules

external_id: non-empty string.

attributes: object.

May contain any fields allowed by Braze, including:

email as string.

language as string.

teams_array as string.

MPN as string.

event_count as integer.

_update_existing_only as boolean.

Backend must not enforce a limit on attribute names, apart from JSON requirements.

8.1.4 Processing Steps

Validate request body.

Construct Braze payload:

{
  "attributes": [
    {
      "external_id": "<external_id from request>",
      "<other attributes spread from request.attributes>"
    }
  ]
}


Send POST to BRAZE_REST_ENDPOINT + "/users/track".

Log the request and response in user_sync_logs (optional).

Return the result.

8.1.5 Response

On success:

Status: 200 OK or 201 Created (Braze returning 201 usually means created or accepted)

Body:

{
  "success": true,
  "data": {
    "brazeResponse": {
      "message": "success",
      "attributes_processed": 1
    }
  }
}


On Braze error:

Status: 502 Bad Gateway

{
  "success": false,
  "error": {
    "code": "BRAZE_ERROR",
    "message": "Failed to sync user attributes to Braze",
    "details": {
      "status": 400,
      "brazeBody": {
        "message": "Bad Request",
        "errors": ["invalid field X"]
      }
    }
  }
}

8.2 Send Event To Braze

Method: POST
Path: /api/users/events

8.2.1 Purpose

Accept a single custom event definition, wrap it into Braze /users/track payload as events, send it, and return Braze response.

8.2.2 Request Body
{
  "external_id": "user_001",
  "app_id": "your_braze_app_id",
  "name": "cta_clicked",
  "time": "2025-11-14T10:00:00.000Z",
  "properties": {
    "campaign_key": "RAF_HELSINKI_2025",
    "market": "FI"
  },
  "_update_existing_only": false
}

8.2.3 Validation Rules

external_id: non-empty string.

app_id: non-empty string.

name: non-empty string name of the event, for example "application_opened".

time: valid ISO 8601 datetime.

properties: optional object; keys and values must be JSON serializable.

_update_existing_only: optional boolean, default to false when missing.

8.2.4 Processing Steps

Validate request body.

Construct Braze payload:

{
  "events": [
    {
      "external_id": "<external_id>",
      "app_id": "<app_id>",
      "name": "<name>",
      "time": "<time>",
      "properties": { /* properties from request or {} */ },
      "_update_existing_only": <boolean>
    }
  ]
}


Send POST to BRAZE_REST_ENDPOINT + "/users/track".

Log request and response in event_sync_logs (optional).

Return result.

8.2.5 Response

On success:

{
  "success": true,
  "data": {
    "brazeResponse": {
      "message": "success",
      "events_processed": 1
    }
  }
}


On error, same format as the user attribute endpoint, with BRAZE_ERROR.

9. Implementation Structure (Suggested)

This section describes a possible folder and module structure for a Node.js + TypeScript implementation. Any equivalent structure is acceptable as long as behavior follows the specification.

9.1 Project Structure
project-root/
  src/
    config/
      env.ts
      brazeClient.ts
    db/
      pool.ts
      migrations/
        001_create_campaigns.sql
        002_create_campaign_launches.sql
        003_create_user_and_event_logs.sql
    domain/
      campaign.ts
      qa.ts
      scoring.ts
    routes/
      campaigns.ts
      users.ts
    server.ts
    app.ts
  package.json
  tsconfig.json
  .env
  README.md

9.2 Key Modules
9.2.1 config/env.ts

Reads environment variables:

PORT

BRAZE_API_KEY

BRAZE_REST_ENDPOINT

Database connection parameters

Validates that BRAZE_API_KEY is set at application startup.

9.2.2 config/brazeClient.ts

Exports a configured HTTP client as shown earlier.

9.2.3 db/pool.ts

Creates a PostgreSQL connection pool using pg or similar.

9.2.4 domain/campaign.ts

Contains TypeScript interfaces and functions to:

Map database rows to domain objects.

Build SQL queries to insert and update campaigns.

Retrieve campaigns from database.

9.2.5 domain/scoring.ts

Implements the computeComplexityAndRisk function exactly as described in section 7.

9.2.6 domain/qa.ts

Implements QA rules. Exposes a function:

interface QaResult {
  warnings: string[];
  errors: string[];
  newStatus: 'draft' | 'qa_pending' | 'approved' | 'launched';
  complexityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

function runQaForCampaign(campaign: Campaign, allOtherCampaigns: Campaign[]): QaResult;


This function must:

Use computeComplexityAndRisk.

Apply all rules from section 6.5.1.

Inspect other campaigns only for promotional overlap checks.

9.2.7 routes/braze.ts

Defines Express routes for /api/braze with handlers:

createCampaign

updateCampaign

getCampaign

listCampaigns

runQa

launchCampaign

Each handler:

Validates inputs.

Calls domain functions.

Uses brazeClient when needed.

9.2.8 routes/users.ts

Defines Express routes for /api/users/attributes and /api/users/events.

10. Non-Functional Requirements
10.1 Security

API key must never be returned in API responses.

API key must never be logged in plain text.

Use HTTPS in production.

Consider adding authentication for backend endpoints if running outside hackathon environment, for example:

API keys for frontend.

OAuth for internal tools.

10.2 Logging

At minimum, log:

Each Braze request with:

Endpoint path.

HTTP method.

HTTP status.

Execution time.

Errors with stack traces.

10.3 Testing

Unit tests must cover:

computeComplexityAndRisk:

Standard campaign with simple segmentation.

Promotional campaign with complex segmentation and multiple markets.

runQaForCampaign:

Campaign with missing fields causing errors.

Promotional campaigns overlapping in market and time causing warnings or errors.

Routes:

Creation and retrieval of campaigns.

QA and launch flows with mocked Braze responses.

User and event sync endpoints.

11. Example End-To-End Flow

This section walks through a typical usage scenario.

11.1 Setup

Developer creates .env file with:

PORT=4000

BRAZE_API_KEY=<actual key>

BRAZE_REST_ENDPOINT=https://rest.fra-01.braze.eu

Database host, database name, user, and password.

Run database migrations to create tables.

Start backend server.

11.2 Sync Users

A script or frontend sends POST /api/users/attributes with user attributes, including:

external_id

email

language

teams_array

MPN

event_count

Backend forwards request to Braze /users/track and returns the result.

11.3 Sync Events

Application backend sends POST /api/users/events when:

User opens application.

User clicks CTA.

User completes scan.

Backend forwards events to Braze.

11.4 Create Campaign

Marketer or team uses frontend to call POST /api/braze with campaign data.

Backend validates, computes complexity and risk, and stores the campaign.

11.5 QA

Frontend triggers POST /api/braze/:id/qa.

Backend loads campaign and other campaigns.

Backend computes complexity and risk.

Backend finds promotional overlap or segmentation issues and returns warnings and errors.

If no errors, backend marks campaign as approved.

11.6 Launch

Frontend calls POST /api/braze/:id/launch.

Backend checks that campaign is approved and that a Braze identifier is set.

Backend calls Braze POST /braze/trigger/send or POST /canvas/trigger/send.

Backend stores dispatch_id.

Backend returns launch details.

12. Summary

This document defines a complete, implementable design for a backend service that:

Uses Braze as the messaging engine.

Synchronizes users and events to Braze.

Models campaigns and computes complexity and risk.

Provides a QA process tailored for standard and promotional campaigns.

Triggers Braze campaigns and canvases in a controlled and auditable way.

A developer following this specification can implement the entire system, including:

Database schema.

TypeScript domain models and logic.

Express routes.

Braze integration and error handling.

QA and complexity logic.