# Training Module Architecture

## Overview

The Training Module has been designed as an isolated, self-contained system with well-defined interfaces to external dependencies. This architecture ensures loose coupling, testability, and maintainability.

## Core Architecture

### 1. Interface Layer (`server/interfaces/ITrainingModule.ts`)

Defines clear contracts for:
- **Core Training Entities**: `ITrainingSpecialty`, `ITrainingSession`, `ITrainingTest`, `ITestAttempt`
- **External Dependencies**: `IAgentProvider`, `ILLMProvider`, `IKnowledgeStore`
- **Module Interface**: `ITrainingModule` - main contract for training functionality
- **Event System**: `ITrainingEvent`, `ITrainingEventHandler`
- **Configuration**: `ITrainingModuleConfig`

### 2. Implementation Layer (`server/services/TrainingModule.ts`)

The isolated training module implementation:
- **No Direct Dependencies**: Uses injected providers through interfaces
- **Event-Driven**: Emits events for external systems to react to
- **Stateful**: Maintains training state independently
- **Configurable**: Behavior controlled via configuration object

### 3. Adapter Layer (`server/adapters/`)

Bridges the training module with existing systems:

#### AgentProviderAdapter
- Connects training module to agent library system
- Provides agent information without direct database coupling

#### LLMProviderAdapter  
- Integrates with OpenAI API for question generation and answer evaluation
- Handles fallback scenarios for robustness

#### KnowledgeStoreAdapter
- Bridges with agent memory/knowledge system
- Manages knowledge storage and retrieval with relevance scoring

### 4. Event Handler Layer (`server/handlers/TrainingEventHandlers.ts`)

Handles training events:

#### KnowledgeTrackingHandler
- Records competency achievements in agent memory
- Stores training experiences for future reference

#### ProgressNotificationHandler
- Manages real-time notifications and logging
- Can integrate with external monitoring systems

### 5. Factory Layer (`server/factories/TrainingModuleFactory.ts`)

Responsible for:
- **Dependency Injection**: Wiring up all components
- **Configuration Management**: Setting training parameters
- **Singleton Pattern**: Ensuring single training module instance

### 6. API Layer (`server/routes/trainingRoutes.ts`)

Clean REST API that:
- Uses the isolated training module exclusively
- Handles HTTP concerns (validation, error handling)
- Maintains clear separation from business logic

## Data Flow

```
Client Request → API Routes → Training Module → Adapters → External Systems
                                     ↓
                            Event Handlers ← Events ← Training Module
```

## Key Isolation Benefits

### 1. **Clear Boundaries**
- Training logic is completely contained within the module
- External dependencies are injected via interfaces
- No direct imports of external services

### 2. **Testability**
- Mock implementations can be injected for testing
- Module can be tested in isolation
- Event-driven design allows testing of side effects

### 3. **Flexibility**
- Adapter pattern allows switching implementations
- Configuration-driven behavior
- Event handlers can be added/removed without core changes

### 4. **Maintainability**
- Single responsibility: module only handles training logic
- Interface contracts prevent breaking changes
- Clear separation of concerns

## Interface Contracts

### ITrainingModule
```typescript
interface ITrainingModule {
  // Specialty Management
  createSpecialty(data: Omit<ITrainingSpecialty, 'id'>): Promise<ITrainingSpecialty>;
  getSpecialties(): Promise<ITrainingSpecialty[]>;
  updateSpecialty(id: string, updates: Partial<ITrainingSpecialty>): Promise<ITrainingSpecialty>;
  deleteSpecialty(id: string): Promise<void>;

  // Session Management  
  startTrainingSession(data: {...}): Promise<ITrainingSession>;
  getTrainingSession(id: string): Promise<ITrainingSession | null>;
  // ... other session methods

  // Test Management
  generateTest(sessionId: string, testType: string): Promise<ITrainingTest>;
  submitTestAttempt(testId: string, sessionId: string, answers: any[]): Promise<ITestAttempt>;
  // ... other test methods
}
```

### External Dependencies

#### IAgentProvider
- `getAgent(id: string): Promise<IAgent | null>`
- `getAllAgents(): Promise<IAgent[]>`

#### ILLMProvider  
- `generateText(prompt: string, options?: any): Promise<string>`
- `generateQuestions(specialty: string, level: string, count: number): Promise<ITestQuestion[]>`
- `evaluateAnswer(question: string, answer: string, correctAnswer: string): Promise<EvaluationResult>`

#### IKnowledgeStore
- `storeKnowledge(agentId: string, knowledge: KnowledgeData): Promise<void>`
- `retrieveKnowledge(agentId: string, query: string): Promise<KnowledgeResult[]>`

## Configuration

The module is configured via `ITrainingModuleConfig`:

```typescript
interface ITrainingModuleConfig {
  llmProvider: ILLMProvider;
  agentProvider: IAgentProvider; 
  knowledgeStore: IKnowledgeStore;
  eventHandlers?: ITrainingEventHandler[];
  
  // Training Parameters
  defaultMaxIterations: number;
  testGenerationTimeout: number;
  competencyThresholds: { [level: string]: number };
}
```

## Event System

The module emits events for external integration:

- **session_started**: New training session initiated
- **session_completed**: Training session finished
- **test_generated**: New test created for session
- **test_completed**: Test attempt submitted and graded  
- **competency_achieved**: Agent reached target competency level

Event handlers can react to these events without the training module needing to know about external systems.

## Usage Example

```typescript
// Initialize the module
const trainingModule = TrainingModuleFactory.createTrainingModule();

// Start a training session
const session = await trainingModule.startTrainingSession({
  agentId: 'agent-123',
  specialtyId: 'javascript-dev', 
  targetCompetencyLevel: 'Advanced'
});

// Generate a test
const test = await trainingModule.generateTest(session.id, 'competency');

// Submit answers
const attempt = await trainingModule.submitTestAttempt(test.id, session.id, answers);
```

This architecture ensures the training module is a well-isolated, reusable component with clear interfaces to the rest of the system.