# Comprehensive Test Suite for CBS LLM Studio

This directory contains a complete testing framework for both frontend and backend workflows in the CBS LLM Studio application.

## Test Structure

```
tests/
├── backend/           # Backend API tests
├── frontend/          # Frontend component tests
├── integration/       # End-to-end integration tests
├── utils/            # Test utilities and factories
├── setup.ts          # Jest configuration
└── README.md         # This documentation
```

## Test Categories

### 1. Backend API Tests (`tests/backend/api.test.ts`)

Comprehensive testing of all API endpoints including:

#### Prompt Workflows
- **Provider Management**: GET `/api/providers` - List available LLM providers
- **Prompt Creation**: POST `/api/prompts` - Create and process prompts
- **Response Retrieval**: GET `/api/prompts/:id/responses` - Get AI responses
- **Error Handling**: Invalid data validation and error responses

#### AI Meeting Workflows
- **Meeting Creation**: POST `/api/prompt-sequences` - Create AI meetings
- **Meeting Management**: GET `/api/prompt-sequences` - List meetings
- **Step Execution**: GET `/api/prompt-sequences/:id/steps` - Meeting execution steps
- **Synthesis Reports**: GET `/api/prompt-sequences/:id/synthesis-report` - Export results

#### Agent Library
- **Agent CRUD**: Create, read, update, delete agent configurations
- **Experience Tracking**: PATCH `/api/agent-library/:id/experience` - Update agent learning
- **Library Management**: Save and load reusable agent configurations

#### Document Management
- **Folder Operations**: GET `/api/folders` - Document organization
- **Document Access**: GET `/api/documents/:folderId` - Context injection

#### Batch Testing
- **Batch Creation**: POST `/api/batch-tests` - Multi-prompt testing
- **Result Analysis**: GET `/api/batch-tests/:id/results` - Batch outcomes

### 2. Frontend Integration Tests

#### Prompt Studio (`tests/frontend/prompt-studio.test.ts`)
- **Complete Workflow**: Provider selection → Prompt entry → Response viewing
- **Provider Selection**: Multi-provider testing and cost calculation
- **Document Context**: Folder selection and context injection
- **Response Handling**: Copy functionality, new tab viewing, artifact downloads
- **Error States**: Network failures, invalid inputs, loading states

#### AI Meetings (`tests/frontend/ai-meetings.test.ts`)
- **Meeting Configuration**: Name, description, objectives, initial prompts
- **Agent Chain Setup**: Multi-agent personality and provider configuration
- **Library Integration**: Save/load agents from library
- **Mood Tracking**: Real-time collaboration mood indicators
- **Results Display**: Step-by-step execution results and synthesis
- **Export Functions**: CSV export and report generation

### 3. End-to-End Integration Tests (`tests/integration/end-to-end.test.ts`)

Complete workflow testing from frontend to backend:

#### Full Prompt Workflow
1. Prompt creation with multiple providers
2. AI response generation and processing
3. Provider usage tracking and cost calculation
4. Document context injection and processing
5. Response artifact handling

#### Complete AI Meeting Workflow
1. Multi-agent meeting setup and configuration
2. Iterative agent execution with personality-based responses
3. Synthesis step execution and analysis
4. Agent experience tracking and library updates
5. Export and reporting functionality

#### Agent Library Integration
1. Agent creation and configuration
2. Meeting participation and experience recording
3. Knowledge retention and reuse across meetings
4. Performance tracking and insights

## Test Utilities and Factories

### Test Factories (`tests/utils/test-factories.ts`)
- **ProviderFactory**: Create test LLM providers (OpenAI, Claude, Gemini)
- **AgentFactory**: Generate test agents with different personalities
- **MeetingFactory**: Create test AI meetings and sequences
- **StepFactory**: Generate execution steps and synthesis results
- **TestDataCollections**: Complete workflow test datasets

### Test Database (`tests/utils/test-database.ts`)
- **TestStorage**: In-memory storage implementation for testing
- **MockLLMProvider**: Simulated AI responses for deterministic testing
- **TestEnvironment**: Complete isolated test environment setup

## Running Tests

### Individual Test Suites
```bash
# Backend API tests
npm run test:backend

# Frontend component tests  
npm run test:frontend

# Integration tests
npm run test:integration

# End-to-end workflow tests
npm run test:e2e
```

### All Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### Backend Coverage
- ✅ All API endpoints (100%)
- ✅ Request validation and error handling
- ✅ Database operations and storage
- ✅ Provider integration and cost tracking
- ✅ Agent experience and library management

### Frontend Coverage
- ✅ User interface interactions
- ✅ Form validation and submission
- ✅ Data fetching and state management
- ✅ Error handling and loading states
- ✅ Export and download functionality

### Integration Coverage
- ✅ Complete prompt-to-response workflows
- ✅ Multi-agent meeting execution
- ✅ Document context injection
- ✅ Agent learning and experience tracking
- ✅ Real-time collaboration features

## Mock Data and Scenarios

### Standard Test Scenarios
1. **Single Provider Prompt**: Basic prompt processing with one LLM
2. **Multi-Provider Comparison**: Simultaneous responses from multiple providers
3. **Context-Enhanced Prompts**: Document injection and enhanced responses
4. **Simple AI Meeting**: 2-3 agents with basic interaction
5. **Complex Strategic Meeting**: 5 agents with multiple iterations and synthesis
6. **Agent Learning**: Experience tracking across multiple meetings
7. **Error Recovery**: Network failures, timeouts, and invalid responses

### Test Data Consistency
- Standardized provider configurations
- Realistic response times and costs
- Varied personality combinations
- Comprehensive error scenarios

## Performance Testing

### Response Time Benchmarks
- API endpoints: < 100ms for simple operations
- AI response simulation: 500ms - 2000ms realistic timing
- Database operations: < 50ms for in-memory storage
- Frontend rendering: < 300ms for component updates

### Load Testing Scenarios
- Concurrent prompt processing
- Multiple simultaneous meetings
- Large document context injection
- Batch testing with 50+ prompts

## Continuous Integration

### Test Automation
- Pre-commit test validation
- Pull request test coverage requirements
- Automated regression testing
- Performance benchmark tracking

### Quality Gates
- 90%+ code coverage requirement
- All tests must pass before deployment
- Performance benchmarks must be maintained
- No breaking changes in API contracts

## Debugging and Troubleshooting

### Common Issues
1. **Mock Provider Failures**: Check test environment setup
2. **Timeout Errors**: Adjust Jest timeout settings
3. **Memory Leaks**: Ensure proper test cleanup
4. **State Pollution**: Verify test isolation

### Debug Tools
- Jest debugging with `--verbose` flag
- Console output filtering for test runs
- State inspection in test environment
- Mock call verification and analysis

This comprehensive test suite ensures robust validation of all prompt and AI meeting workflows, providing confidence in the application's reliability and performance.