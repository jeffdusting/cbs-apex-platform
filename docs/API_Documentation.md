# Training Module API Documentation

## Overview

The Training Module provides two API versions:

1. **Legacy API** (`/api/training/*`) - Original implementation maintained for backward compatibility
2. **Isolated API** (`/api/training-v2/*`) - New isolated training module with clean interfaces

## Isolated Training Module API (v2)

The new isolated training module provides a clean, well-tested API with clear separation of concerns.

### Base URL
```
/api/training-v2
```

### Specialty Management

#### Create Specialty
```http
POST /api/training-v2/specialties
Content-Type: application/json

{
  "name": "JavaScript Development",
  "description": "Modern JavaScript development practices",
  "domain": "technical",
  "llmProviderId": "openai-gpt5",
  "requiredKnowledge": ["Variables", "Functions", "Objects"],
  "competencyLevels": ["Beginner", "Intermediate", "Advanced", "Expert"]
}
```

**Required Fields:**
- `name`: Name of the specialty/competency
- `domain`: Domain category (e.g., "technical", "business", "creative")

**Optional Fields:**
- `llmProviderId`: LLM provider for question generation (defaults to first available provider)
- `description`: Detailed description of the specialty
- `requiredKnowledge`: Array of prerequisite knowledge areas
- `competencyLevels`: Array of competency levels (defaults to ["Beginner", "Intermediate", "Advanced", "Expert"])

**Legacy API Note:** The legacy endpoint `/api/training/specialties` requires `llmProviderId` but will use a default if not provided.

#### Get All Specialties
```http
GET /api/training-v2/specialties
```

#### Update Specialty
```http
PUT /api/training-v2/specialties/{id}
Content-Type: application/json

{
  "description": "Updated description",
  "requiredKnowledge": ["Variables", "Functions", "Objects", "Async/Await"]
}
```

#### Delete Specialty
```http
DELETE /api/training-v2/specialties/{id}
```

### Session Management

#### Start Training Session
```http
POST /api/training-v2/sessions
Content-Type: application/json

{
  "agentId": "agent-123",
  "specialtyId": "js-dev-specialty",
  "targetCompetencyLevel": "Advanced",
  "maxIterations": 10
}
```

#### Get All Sessions
```http
GET /api/training-v2/sessions
```

#### Get Agent Sessions
```http
GET /api/training-v2/agents/{agentId}/sessions
```

#### Get Session Details
```http
GET /api/training-v2/sessions/{sessionId}
```

#### Get Session Progress
```http
GET /api/training-v2/sessions/{sessionId}/progress
```

### Test Management

#### Generate Test
```http
POST /api/training-v2/sessions/{sessionId}/test
Content-Type: application/json

{
  "testType": "competency"
}
```

#### Submit Test Attempt
```http
POST /api/training-v2/tests/{testId}/attempt
Content-Type: application/json

{
  "sessionId": "session-123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Selected option"
    }
  ]
}
```

#### Get Session Tests
```http
GET /api/training-v2/sessions/{sessionId}/tests
```

#### Get Session Attempts
```http
GET /api/training-v2/sessions/{sessionId}/attempts
```

## Data Models

### ITrainingSpecialty
```typescript
interface ITrainingSpecialty {
  id: string;
  name: string;
  description?: string;
  domain: string;
  requiredKnowledge: string[];
  competencyLevels: string[];
}
```

### ITrainingSession
```typescript
interface ITrainingSession {
  id: string;
  agentId: string;
  specialtyId: string;
  targetCompetencyLevel: string;
  currentCompetencyLevel: string;
  status: 'in_progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentIteration: number;
  maxIterations: number;
  startedAt: Date;
  completedAt?: Date;
}
```

### ITrainingTest
```typescript
interface ITrainingTest {
  id: string;
  sessionId: string;
  testType: string;
  questions: ITestQuestion[];
  passingScore: number;
  difficulty: string;
}
```

### ITestQuestion
```typescript
interface ITestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### ITestAttempt
```typescript
interface ITestAttempt {
  id: string;
  testId: string;
  sessionId: string;
  answers: Array<{ questionId: string; answer: string }>;
  score: number;
  passed: boolean;
  feedback: string[];
  completedAt: Date;
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Migration Guide

### From Legacy API to Isolated API

The new isolated API provides the same functionality with improved architecture:

#### Endpoint Mapping

| Legacy Endpoint | Isolated Endpoint |
|----------------|-------------------|
| `GET /api/training/specialties` | `GET /api/training-v2/specialties` |
| `POST /api/training/specialties` | `POST /api/training-v2/specialties` |
| `GET /api/training/sessions` | `GET /api/training-v2/sessions` |
| `POST /api/training/sessions` | `POST /api/training-v2/sessions` |

#### Key Differences

1. **Cleaner Response Format**: Responses use consistent interface types
2. **Better Error Handling**: More detailed error messages and proper HTTP status codes
3. **Event System**: Training events are emitted for external integration
4. **Isolated Logic**: No direct database dependencies in business logic

#### Migration Steps

1. Update frontend to use `/api/training-v2/*` endpoints
2. Test functionality with new API
3. Remove legacy API usage
4. Eventually deprecate legacy endpoints

## Events

The isolated training module emits events that can be handled by external systems:

### Event Types

- `session_started` - New training session initiated
- `session_completed` - Training session finished successfully
- `test_generated` - New test created for session
- `test_completed` - Test attempt submitted and graded
- `competency_achieved` - Agent reached target competency level

### Event Structure

```typescript
interface ITrainingEvent {
  type: string;
  sessionId: string;
  agentId: string;
  data: any;
  timestamp: Date;
}
```

## Architecture Benefits

The isolated training module provides:

1. **Clean Separation of Concerns** - Training logic is isolated from external dependencies
2. **Testability** - Easy to mock dependencies and test in isolation
3. **Flexibility** - Adapter pattern allows switching implementations
4. **Event-Driven Design** - External systems can react to training events
5. **Configuration-Based** - Behavior controlled via configuration objects