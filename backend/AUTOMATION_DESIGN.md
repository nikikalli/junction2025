# Canvas Campaign Automation Design

## Overview

This document outlines the design for automating the personalization and deployment of Braze canvas campaigns across multiple customer segments.

## Architecture

### Current State

The backend currently supports:
- Fetching canvas templates from Braze
- Generating segment actions from canvas steps
- AI-powered message personalization via Gemini
- Scheduling campaigns

### Missing Components

Two critical components need implementation:

1. **Content Deployment Service** - Deploy personalized content to Braze
2. **Campaign Orchestration** - Schedule campaigns with proper targeting

---

## Component 1: Content Deployment Service

### Purpose

Bridge the gap between AI-personalized messages and Braze deployment by creating content blocks from personalized content.

### Location

`backend/src/services/content-deployment.service.ts`

### Core Functionality

#### 1.1 Deploy Single Content Block

```typescript
async deployPersonalizedContentBlock(
  canvasId: string,
  stepId: string,
  segment: string,
  personalizedMessage: string,
  channel: string,
  field: string
): Promise<ContentBlockDeployment>
```

**Input:**
- `canvasId` - Source canvas identifier
- `stepId` - Canvas step identifier
- `segment` - Target segment (e.g., "Women 25-35")
- `personalizedMessage` - AI-personalized content
- `channel` - Message channel (email, push, in-app)
- `field` - Message field (subject, body, title, alert)

**Process:**
1. Generate unique content block name
2. Create content block via Braze API
3. Store content block ID mapping
4. Return deployment result

**Naming Convention:**
```
{canvasId}_{stepId}_{channel}_{field}_{segment}
```

Example: `canvas_abc_step_001_email_subject_women_25_35`

**Output:**
```typescript
{
  contentBlockId: string;
  contentBlockName: string;
  liquidTag: string;
  segment: string;
  canvasId: string;
  stepId: string;
  channel: string;
  field: string;
  status: 'success' | 'failed';
  error?: string;
}
```

#### 1.2 Batch Deploy Content Blocks

```typescript
async batchDeployContentBlocks(
  deployments: PersonalizedMessageDeployment[]
): Promise<BatchDeploymentResult>
```

**Input:**
- Array of personalized messages to deploy

**Process:**
1. Process each deployment sequentially (avoid rate limits)
2. Track success/failure for each
3. Continue on individual failures
4. Return comprehensive report

**Output:**
```typescript
{
  total: number;
  successful: number;
  failed: number;
  deployments: ContentBlockDeployment[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}
```

#### 1.3 Get Deployment Status

```typescript
async getDeploymentById(deploymentId: string): Promise<DeploymentRecord>
```

**Purpose:** Retrieve information about a previous deployment

**Storage:** In-memory Map (for MVP), later migrate to database

#### 1.4 Content Block Name Sanitization

```typescript
private sanitizeContentBlockName(name: string): string
```

**Rules:**
- Replace spaces with underscores
- Remove special characters
- Lowercase
- Max 100 characters
- Ensure uniqueness with timestamp if needed

### Integration with Braze API

#### Create Content Block Request

```typescript
POST /content_blocks/create
{
  "name": "canvas_abc_step_001_email_subject_women_25_35",
  "content": "Personalized message content here",
  "description": "Auto-generated: Canvas abc, Step 001, Segment: Women 25-35",
  "content_type": "html",
  "tags": ["automated", "team7", segment],
  "teams": ["team7"]
}
```

#### Response Handling

```typescript
{
  "content_block_id": "xyz-123",
  "liquid_tag": "{% content_blocks('canvas_abc_step_001_email_subject_women_25_35') %}",
  "created_at": "2025-01-15T10:00:00Z",
  "message": "success"
}
```

### Data Structures

#### PersonalizedMessageDeployment

```typescript
interface PersonalizedMessageDeployment {
  canvasId: string;
  stepId: string;
  segment: string;
  channel: string;
  field: string;
  originalMessage: string;
  personalizedMessage: string;
}
```

#### ContentBlockDeployment

```typescript
interface ContentBlockDeployment {
  contentBlockId: string;
  contentBlockName: string;
  liquidTag: string;
  segment: string;
  canvasId: string;
  stepId: string;
  channel: string;
  field: string;
  status: 'success' | 'failed';
  createdAt: string;
  error?: string;
}
```

#### DeploymentRecord

```typescript
interface DeploymentRecord {
  id: string;
  canvasId: string;
  segments: string[];
  contentBlocks: ContentBlockDeployment[];
  campaignSchedules: CampaignSchedule[];
  status: 'in_progress' | 'completed' | 'failed' | 'partial';
  createdAt: string;
  completedAt?: string;
  summary: {
    totalContentBlocks: number;
    successfulBlocks: number;
    failedBlocks: number;
    totalCampaigns: number;
    scheduledCampaigns: number;
    failedCampaigns: number;
  };
}
```

### Error Handling

#### Scenarios

1. **Braze API Failure**
   - Retry once with exponential backoff (500ms, then 1s)
   - Log error details
   - Continue with other deployments
   - Mark as failed in result

2. **Rate Limiting**
   - Implement delays between requests (500ms minimum)
   - Respect Braze rate limits (250k/hour)
   - Queue requests if needed

3. **Duplicate Content Block Names**
   - Append timestamp or UUID to ensure uniqueness
   - Check existence before creating

4. **Invalid Content**
   - Validate Liquid syntax before deployment
   - Sanitize HTML if content_type is html
   - Reject malformed content

### Storage Strategy

#### MVP (In-Memory)

```typescript
private deploymentStorage: Map<string, DeploymentRecord> = new Map();
private contentBlockMapping: Map<string, ContentBlockDeployment> = new Map();
```

**Key format:** `{canvasId}_{stepId}_{segment}`

#### Future (Database)

```sql
CREATE TABLE content_block_deployments (
  id UUID PRIMARY KEY,
  content_block_id VARCHAR(255) NOT NULL,
  content_block_name VARCHAR(255) NOT NULL,
  canvas_id VARCHAR(255) NOT NULL,
  step_id VARCHAR(255) NOT NULL,
  segment VARCHAR(255) NOT NULL,
  channel VARCHAR(50),
  field VARCHAR(50),
  original_message TEXT,
  personalized_message TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);
```

---

## Component 2: Campaign Orchestration Service

### Purpose

End-to-end orchestration of the personalization and deployment workflow.

### Location

`backend/src/services/campaign-orchestration.service.ts`

### Core Functionality

#### 2.1 Full Automation Workflow

```typescript
async personalizeAndDeployCanvas(
  canvasId: string,
  segments: string[],
  scheduleTime?: Date
): Promise<OrchestrationResult>
```

**Workflow Steps:**

1. **Validate Input**
   - Verify canvas exists
   - Validate segments

2. **Fetch Canvas Template**
   - Get canvas details from Braze
   - Extract all steps
   - Validate has messages

3. **Generate Actions**
   - For each segment, generate segment actions
   - Store actions for reference

4. **Personalize Messages**
   - Batch personalize all actions
   - Extract personalized messages

5. **Deploy Content Blocks**
   - For each segment:
     - Create content block for each message
     - Store content block ID

6. **Schedule Campaigns**
   - For each segment:
     - Schedule canvas with targeting
     - Store schedule ID

7. **Return Deployment Report**

**Process Flow:**

```
Input: canvasId, segments[]
  ↓
Fetch Canvas Template
  ↓
For each segment:
  ├─ Generate Actions
  ├─ Personalize with AI
  ├─ Deploy Content Blocks
  └─ Schedule Campaign
  ↓
Aggregate Results
  ↓
Return Deployment Report
```

#### 2.2 Preview Personalization

```typescript
async previewPersonalization(
  canvasId: string,
  segment: string
): Promise<PersonalizationPreview>
```

**Purpose:** Show what personalized content would look like WITHOUT deploying

**Output:**
```typescript
{
  canvasId: string;
  canvasName: string;
  segment: string;
  steps: Array<{
    stepId: string;
    stepName: string;
    messages: Array<{
      channel: string;
      field: string;
      originalMessage: string;
      personalizedMessage: string;
    }>;
  }>;
}
```

#### 2.3 Get Orchestration Status

```typescript
async getOrchestrationStatus(
  orchestrationId: string
): Promise<OrchestrationStatus>
```

**Output:**
```typescript
{
  id: string;
  canvasId: string;
  status: 'pending' | 'personalizing' | 'deploying' | 'scheduling' | 'completed' | 'failed';
  progress: {
    currentStep: string;
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  results?: OrchestrationResult;
  error?: string;
}
```

### Campaign Scheduling Strategy

#### Canvas Entry Properties (Recommended)

**How it works:**
- Use original canvas
- Set canvas_entry_properties to control targeting
- Content blocks referenced via Liquid

**Implementation:**

```typescript
await brazeService.scheduleTriggeredCanvas({
  canvas_id: canvasId,
  broadcast: true,
  schedule: {
    time: scheduleTime.toISOString(),
    in_local_time: false,
    at_optimal_time: false,
  },
  canvas_entry_properties: {
    segment: segment,
    deployment_id: deploymentId,
    generated_at: new Date().toISOString(),
  }
});
```

**Canvas Message Template:**

```liquid
{% content_blocks('canvas_{{canvas_id}}_step_{{step_id}}_email_subject_{{segment}}') %}
```

**Pros:**
- No canvas modification needed
- Single source of truth
- Easy to manage

**Cons:**
- Requires Liquid logic in original canvas
- Canvas must be designed for this pattern

### Data Structures

#### OrchestrationResult

```typescript
interface OrchestrationResult {
  orchestrationId: string;
  canvasId: string;
  canvasName: string;
  segments: string[];
  status: 'success' | 'partial' | 'failed';
  deployment: {
    totalContentBlocks: number;
    successfulBlocks: number;
    failedBlocks: number;
    contentBlocks: ContentBlockDeployment[];
  };
  campaigns: {
    totalScheduled: number;
    successful: number;
    failed: number;
    schedules: CampaignSchedule[];
  };
  errors: Array<{
    type: 'personalization' | 'deployment' | 'scheduling';
    message: string;
    segment?: string;
  }>;
  createdAt: string;
  completedAt: string;
  duration: number; // milliseconds
}
```

#### CampaignSchedule

```typescript
interface CampaignSchedule {
  scheduleId: string;
  dispatchId?: string;
  canvasId: string;
  segment: string;
  scheduleTime: string;
  status: 'scheduled' | 'failed';
  error?: string;
  createdAt: string;
}
```

### Execution Flow

#### Sequential Processing

```typescript
async personalizeAndDeployCanvas(canvasId, segments) {
  const orchestrationId = generateId();
  const results = initializeResults();

  try {
    // Step 1: Fetch template
    const canvas = await brazeService.getCanvasDetails(canvasId);

    // Step 2-6: Process each segment
    for (const segment of segments) {
      // Generate actions
      const actions = await segmentActionService.generateActions({
        segment,
        canvasId,
        includeMetadata: true
      });

      // Personalize
      const personalized = await geminiService.personalizeMultipleActions(
        actions.actions
      );

      // Deploy content blocks
      const deployments = buildDeployments(personalized);
      const blockResults = await contentDeploymentService.batchDeployContentBlocks(
        deployments
      );

      results.deployment.contentBlocks.push(...blockResults.deployments);

      // Schedule campaign
      const schedule = await this.scheduleCampaign(
        canvasId,
        segment,
        orchestrationId
      );

      results.campaigns.schedules.push(schedule);
    }

    results.status = 'success';
  } catch (error) {
    results.status = 'failed';
    results.errors.push({
      type: 'scheduling',
      message: error.message
    });
  }

  // Store and return
  this.storeOrchestration(orchestrationId, results);
  return results;
}
```

#### Parallel Processing (Advanced)

```typescript
// Personalize all segments in parallel
const personalizations = await Promise.all(
  segments.map(segment =>
    this.personalizeSegment(canvasId, segment)
  )
);

// Deploy all content blocks in parallel
const deployments = await Promise.all(
  personalizations.map(p =>
    contentDeploymentService.deployForSegment(p)
  )
);
```

**Considerations:**
- Risk of hitting rate limits
- Harder to track progress
- Better performance
- Implement with caution

### Error Recovery

#### Partial Success Handling

```typescript
if (results.deployment.failedBlocks > 0) {
  results.status = 'partial';

  // Log failed blocks
  const failedBlocks = results.deployment.contentBlocks
    .filter(b => b.status === 'failed');

  console.warn('Failed to deploy content blocks:', failedBlocks);

  // Continue with successful blocks
  // Schedule only campaigns with successful content blocks
}
```

#### Rollback Strategy

```typescript
async rollbackDeployment(orchestrationId: string): Promise<RollbackResult> {
  const deployment = await this.getOrchestration(orchestrationId);

  // Cancel scheduled campaigns
  for (const schedule of deployment.campaigns.schedules) {
    await brazeService.cancelScheduledMessage(schedule.scheduleId);
  }

  // Note: Cannot delete content blocks via API
  // Manual cleanup or mark as inactive

  return {
    cancelledCampaigns: deployment.campaigns.schedules.length,
    note: 'Content blocks cannot be automatically deleted'
  };
}
```

---

## API Endpoints

### New Routes File

`backend/src/api/automation.routes.ts`

### Endpoints

#### 1. Full Automation

```
POST /api/automation/deploy

Request Body:
{
  "canvasId": "abc-123",
  "segments": ["Women 25-35", "New Parents"],
  "scheduleTime": "2025-01-16T10:00:00Z" // optional
}

Response:
{
  "data": {
    "orchestrationId": "orch-xyz",
    "canvasId": "abc-123",
    "status": "success",
    "deployment": {
      "totalContentBlocks": 12,
      "successfulBlocks": 12,
      "failedBlocks": 0
    },
    "campaigns": {
      "totalScheduled": 2,
      "successful": 2,
      "failed": 0
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "completedAt": "2025-01-15T10:05:23Z",
    "duration": 323000
  }
}
```

#### 2. Preview Personalization

```
POST /api/automation/preview

Request Body:
{
  "canvasId": "abc-123",
  "segment": "Women 25-35"
}

Response:
{
  "data": {
    "canvasId": "abc-123",
    "canvasName": "Welcome Campaign",
    "segment": "Women 25-35",
    "steps": [
      {
        "stepId": "step-001",
        "stepName": "Welcome Email",
        "messages": [
          {
            "channel": "email",
            "field": "subject",
            "originalMessage": "Welcome to Pampers Club!",
            "personalizedMessage": "Welcome to Pampers Club - Quality care for your family"
          }
        ]
      }
    ]
  }
}
```

#### 3. Get Orchestration Status

```
GET /api/automation/status/:orchestrationId

Response:
{
  "data": {
    "id": "orch-xyz",
    "canvasId": "abc-123",
    "status": "deploying",
    "progress": {
      "currentStep": "Deploying content blocks",
      "completedSteps": 3,
      "totalSteps": 5,
      "percentage": 60
    }
  }
}
```

#### 4. Rollback Deployment

```
POST /api/automation/rollback/:orchestrationId

Response:
{
  "data": {
    "orchestrationId": "orch-xyz",
    "cancelledCampaigns": 2,
    "status": "rolled_back",
    "note": "Content blocks cannot be automatically deleted"
  }
}
```

#### 5. List Deployments

```
GET /api/automation/deployments?canvasId=abc-123&limit=20

Response:
{
  "data": [
    {
      "orchestrationId": "orch-xyz",
      "canvasId": "abc-123",
      "status": "success",
      "segments": ["Women 25-35"],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## Implementation Checklist

### Content Deployment Service

- [ ] Create service file
- [ ] Implement single content block deployment
- [ ] Implement batch deployment
- [ ] Add content block name sanitization
- [ ] Add deployment storage (in-memory Map)
- [ ] Implement error handling and retry logic
- [ ] Add rate limiting protection
- [ ] Create type definitions
- [ ] Write unit tests

### Campaign Orchestration Service

- [ ] Create service file
- [ ] Implement full automation workflow
- [ ] Implement preview functionality
- [ ] Add progress tracking
- [ ] Add orchestration storage
- [ ] Implement campaign scheduling
- [ ] Add error recovery logic
- [ ] Implement rollback functionality
- [ ] Create type definitions
- [ ] Write integration tests

### API Routes

- [ ] Create automation routes file
- [ ] Add deploy endpoint
- [ ] Add preview endpoint
- [ ] Add status endpoint
- [ ] Add rollback endpoint
- [ ] Add list deployments endpoint
- [ ] Add request validation
- [ ] Add error handling middleware
- [ ] Register routes in main API router
- [ ] Add API documentation

### Types

- [ ] PersonalizedMessageDeployment
- [ ] ContentBlockDeployment
- [ ] BatchDeploymentResult
- [ ] DeploymentRecord
- [ ] OrchestrationResult
- [ ] CampaignSchedule
- [ ] OrchestrationStatus
- [ ] PersonalizationPreview
- [ ] RollbackResult

### Testing

- [ ] Test content block creation
- [ ] Test batch deployment with failures
- [ ] Test full orchestration flow
- [ ] Test preview without deployment
- [ ] Test rollback functionality
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Integration test with real Braze API

---

## Performance Considerations

### Rate Limiting

Braze API limits: 250,000 requests/hour

**Strategy:**
- Add 500ms delay between content block creations
- Maximum 5 segments × 6 steps = 30 content blocks typical
- Estimated time: ~15-20 seconds for full deployment

### Optimization Opportunities

1. **Parallel Personalization**
   - Gemini API can handle multiple concurrent requests
   - Personalize all segments in parallel

2. **Batch Content Block Creation**
   - If Braze supports batch endpoint (check API)
   - Reduce API calls

3. **Caching**
   - Cache canvas details during orchestration
   - Avoid repeated fetches

4. **Async Processing**
   - Return orchestration ID immediately
   - Process in background
   - Poll status endpoint

---

## Security Considerations

### Input Validation

- Sanitize segment names (prevent injection)
- Validate canvas IDs (prevent unauthorized access)
- Limit segments per request (max 10)
- Validate schedule time (not in past, not too far future)

### API Security

- Ensure Braze API key is never exposed in responses
- Log all deployments for audit trail
- Rate limit automation endpoints
- Implement authentication/authorization

### Content Safety

- Validate Liquid syntax before deployment
- Sanitize HTML content
- Prevent script injection
- Validate message length limits

---

## Monitoring and Logging

### Key Metrics to Track

- Deployment success rate
- Average deployment time
- Content block creation success rate
- Campaign scheduling success rate
- Personalization quality (manual review)

### Logging Strategy

```typescript
logger.info('Starting orchestration', {
  orchestrationId,
  canvasId,
  segments
});

logger.info('Content block deployed', {
  contentBlockId,
  segment,
  duration
});

logger.error('Campaign scheduling failed', {
  canvasId,
  segment,
  error: error.message
});
```

---

## Future Enhancements

### Phase 2

1. **Database Integration**
   - Persistent storage for deployments
   - Historical tracking
   - Analytics

2. **Approval Workflow**
   - Preview before deployment
   - Manual approval step
   - Scheduled deployments

3. **A/B Testing**
   - Deploy multiple variants
   - Track performance
   - Auto-optimize

4. **Analytics Dashboard**
   - Campaign performance metrics
   - Segment insights
   - ROI tracking

### Phase 3

1. **Canvas Template Editor**
   - Visual editor for marketers
   - No-code personalization rules
   - Template library

2. **AI Optimization**
   - Learn from campaign performance
   - Suggest improvements
   - Auto-optimize send times

3. **Multi-channel Coordination**
   - Coordinate email + push + in-app
   - Prevent over-messaging
   - Journey optimization

---

## Example Usage

### Complete Flow

```typescript
// 1. Preview personalization
const preview = await orchestrationService.previewPersonalization(
  'canvas-abc-123',
  'Women 25-35'
);

console.log('Preview:', preview);

// 2. Deploy for real
const result = await orchestrationService.personalizeAndDeployCanvas(
  'canvas-abc-123',
  ['Women 25-35', 'New Parents'],
  new Date('2025-01-16T10:00:00Z')
);

console.log('Deployment result:', result);

// 3. Check status
const status = await orchestrationService.getOrchestrationStatus(
  result.orchestrationId
);

console.log('Status:', status);

// 4. If needed, rollback
if (status.status === 'failed') {
  const rollback = await orchestrationService.rollbackDeployment(
    result.orchestrationId
  );
  console.log('Rollback:', rollback);
}
```

---

## Conclusion

This design provides a complete automation pipeline from canvas templates to deployed, personalized campaigns across multiple segments.

**Key Benefits:**
- Reduces manual work from hours to minutes
- Enables personalization at scale
- Maintains brand consistency
- Provides audit trail and rollback capability
- Sets foundation for future AI optimization

**Next Steps:**
1. Implement Content Deployment Service
2. Implement Campaign Orchestration Service
3. Add API endpoints
4. Test with real Braze API
5. Deploy and demonstrate
