// User Scenarios for CBS LLM Studio Testing
import { UserScenario } from './simulator';

export const userScenarios: UserScenario[] = [
  // Prompt Studio Scenarios
  {
    id: 'PS001',
    name: 'Basic Prompt Submission',
    description: 'User creates a simple prompt and sends to multiple providers',
    steps: [
      { action: 'navigate', target: '/prompt-studio' },
      { action: 'type', target: 'textarea[data-testid="input-prompt"]', value: 'What is artificial intelligence?' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="provider-anthropic-claude"]' },
      { action: 'click', target: 'button[data-testid="button-send-prompt"]' },
      { action: 'wait', target: 'div[data-testid="response-openai-gpt5"]' },
      { action: 'verify', target: 'div[data-testid="response-anthropic-claude"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'POST /api/conversations',
      'POST /api/prompts',
      'GET /api/costs'
    ]
  },

  {
    id: 'PS002',
    name: 'Document Context Injection',
    description: 'User uploads document and uses it as context for prompt',
    steps: [
      { action: 'navigate', target: '/document-library' },
      { action: 'click', target: 'button[data-testid="button-upload-document"]' },
      { action: 'upload', target: 'input[type="file"]', value: 'test-document.txt' },
      { action: 'navigate', target: '/prompt-studio' },
      { action: 'click', target: 'button[data-testid="button-add-context"]' },
      { action: 'click', target: 'div[data-testid="document-test-document.txt"]' },
      { action: 'type', target: 'textarea[data-testid="input-prompt"]', value: 'Summarize this document' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="button-send-prompt"]' },
      { action: 'wait', target: 'div[data-testid="response-openai-gpt5"]' }
    ],
    expectedBackendCalls: [
      'POST /api/documents',
      'GET /api/documents/',
      'POST /api/prompts'
    ]
  },

  {
    id: 'PS003',
    name: 'Cost Tracking and Token Estimation',
    description: 'User monitors costs while using different providers',
    steps: [
      { action: 'navigate', target: '/prompt-studio' },
      { action: 'type', target: 'textarea[data-testid="input-prompt"]', value: 'Write a detailed essay about machine learning with examples, code snippets, and explanations spanning multiple paragraphs' },
      { action: 'verify', target: 'div[data-testid="text-estimated-tokens"]', condition: 'contains', value: 'tokens' },
      { action: 'verify', target: 'div[data-testid="text-estimated-cost"]', condition: 'contains', value: '$' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="provider-anthropic-claude"]' },
      { action: 'click', target: 'button[data-testid="button-send-prompt"]' },
      { action: 'wait', target: 'div[data-testid="response-openai-gpt5"]' },
      { action: 'verify', target: 'div[data-testid="text-actual-cost"]', condition: 'contains', value: '$' }
    ],
    expectedBackendCalls: [
      'GET /api/costs',
      'POST /api/prompts',
      'GET /api/costs'
    ]
  },

  // Agent Library Scenarios
  {
    id: 'AL001',
    name: 'Create New Agent',
    description: 'User creates a new agent with HBDI personality',
    steps: [
      { action: 'navigate', target: '/agent-library' },
      { action: 'click', target: 'button[data-testid="button-create-agent"]' },
      { action: 'type', target: 'input[data-testid="input-agent-name"]', value: 'Test Analyst' },
      { action: 'type', target: 'textarea[data-testid="input-agent-description"]', value: 'A detail-oriented analyst agent' },
      { action: 'click', target: 'button[data-testid="hbdi-analytical"]' },
      { action: 'type', target: 'textarea[data-testid="input-agent-prompt"]', value: 'You are an analytical expert focused on data and facts.' },
      { action: 'click', target: 'button[data-testid="button-save-agent"]' },
      { action: 'verify', target: 'div[data-testid="agent-card-Test Analyst"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/agent-library',
      'POST /api/agent-library'
    ]
  },

  {
    id: 'AL002',
    name: 'Edit Existing Agent',
    description: 'User modifies an existing agent configuration',
    steps: [
      { action: 'navigate', target: '/agent-library' },
      { action: 'click', target: 'button[data-testid="button-edit-agent-0"]' },
      { action: 'clear', target: 'input[data-testid="input-agent-name"]' },
      { action: 'type', target: 'input[data-testid="input-agent-name"]', value: 'Updated Agent' },
      { action: 'click', target: 'button[data-testid="button-save-agent"]' },
      { action: 'verify', target: 'div[data-testid="agent-card-Updated Agent"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/agent-library',
      'PUT /api/agent-library/{id}'
    ]
  },

  // Agent Training Scenarios
  {
    id: 'AT001',
    name: 'Create Training Specialty',
    description: 'User creates a new specialty for agent training',
    steps: [
      { action: 'navigate', target: '/agent-training' },
      { action: 'click', target: 'button[data-testid="button-create-specialty"]' },
      { action: 'type', target: 'input[data-testid="input-specialty-name"]', value: 'Data Analysis' },
      { action: 'type', target: 'textarea[data-testid="input-specialty-description"]', value: 'Statistical analysis and data interpretation' },
      { action: 'type', target: 'input[data-testid="input-specialty-domain"]', value: 'Analytics' },
      { action: 'click', target: 'button[data-testid="button-save-specialty"]' },
      { action: 'verify', target: 'div[data-testid="specialty-card-Data Analysis"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/training/specialties',
      'POST /api/training/specialties'
    ]
  },

  {
    id: 'AT002',
    name: 'Start Agent Training Session',
    description: 'User initiates training for an agent in a specific specialty',
    steps: [
      { action: 'navigate', target: '/agent-training' },
      { action: 'click', target: 'button[data-testid="tab-training"]' },
      { action: 'select', target: 'select[data-testid="select-agent-training"]', value: 'agent-id-1' },
      { action: 'select', target: 'select[data-testid="select-specialty-training"]', value: 'specialty-id-1' },
      { action: 'select', target: 'select[data-testid="select-competency-training"]', value: 'Advanced' },
      { action: 'click', target: 'button[data-testid="button-start-training"]' },
      { action: 'verify', target: 'div[data-testid="text-active-sessions"]', condition: 'contains', value: '1' }
    ],
    expectedBackendCalls: [
      'GET /api/agent-library',
      'GET /api/training/specialties',
      'POST /api/training/sessions'
    ]
  },

  {
    id: 'AT003',
    name: 'View Training Progress',
    description: 'User views detailed progress of an active training session',
    steps: [
      { action: 'navigate', target: '/agent-training' },
      { action: 'click', target: 'button[data-testid="tab-active"]' },
      { action: 'click', target: 'div[data-testid="session-card-0"]' },
      { action: 'verify', target: 'div[data-testid="text-current-progress"]', condition: 'exists' },
      { action: 'verify', target: 'div[data-testid="text-knowledge-gained"]', condition: 'exists' },
      { action: 'verify', target: 'div[data-testid="text-tests-passed"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/training/sessions',
      'GET /api/training/sessions/{id}/progress'
    ]
  },

  // Document Library Scenarios
  {
    id: 'DL001',
    name: 'Upload Single Document',
    description: 'User uploads a single document to the library',
    steps: [
      { action: 'navigate', target: '/document-library' },
      { action: 'click', target: 'button[data-testid="button-upload-document"]' },
      { action: 'upload', target: 'input[type="file"]', value: 'test-document.pdf' },
      { action: 'verify', target: 'div[data-testid="document-card-test-document.pdf"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/documents/',
      'POST /api/documents'
    ]
  },

  {
    id: 'DL002',
    name: 'Create Document Folder',
    description: 'User creates a new folder for document organization',
    steps: [
      { action: 'navigate', target: '/document-library' },
      { action: 'click', target: 'button[data-testid="button-create-folder"]' },
      { action: 'type', target: 'input[data-testid="input-folder-name"]', value: 'Research Papers' },
      { action: 'type', target: 'textarea[data-testid="input-folder-description"]', value: 'Collection of academic research papers' },
      { action: 'click', target: 'button[data-testid="button-save-folder"]' },
      { action: 'verify', target: 'div[data-testid="folder-card-Research Papers"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/folders',
      'POST /api/folders'
    ]
  },

  {
    id: 'DL003',
    name: 'Dropbox Integration',
    description: 'User imports documents from Dropbox with folder structure',
    steps: [
      { action: 'navigate', target: '/document-library' },
      { action: 'click', target: 'button[data-testid="button-dropbox-import"]' },
      { action: 'type', target: 'input[data-testid="input-dropbox-access-token"]', value: 'mock-token' },
      { action: 'type', target: 'input[data-testid="input-dropbox-folder-path"]', value: '/research' },
      { action: 'click', target: 'input[data-testid="checkbox-preserve-structure"]' },
      { action: 'click', target: 'button[data-testid="button-start-import"]' },
      { action: 'wait', target: 'div[data-testid="import-progress"]' },
      { action: 'verify', target: 'div[data-testid="import-success"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'POST /api/documents/dropbox-import'
    ]
  },

  // Batch Testing Scenarios
  {
    id: 'BT001',
    name: 'Create Batch Test',
    description: 'User creates a batch test with multiple prompts',
    steps: [
      { action: 'navigate', target: '/batch-testing' },
      { action: 'click', target: 'button[data-testid="button-create-batch-test"]' },
      { action: 'type', target: 'input[data-testid="input-batch-name"]', value: 'Writing Quality Test' },
      { action: 'type', target: 'textarea[data-testid="input-batch-description"]', value: 'Testing writing capabilities' },
      { action: 'click', target: 'button[data-testid="button-add-prompt"]' },
      { action: 'type', target: 'textarea[data-testid="input-prompt-0"]', value: 'Write a short story about AI' },
      { action: 'click', target: 'button[data-testid="button-add-prompt"]' },
      { action: 'type', target: 'textarea[data-testid="input-prompt-1"]', value: 'Explain quantum computing' },
      { action: 'click', target: 'button[data-testid="button-save-batch-test"]' },
      { action: 'verify', target: 'div[data-testid="batch-test-card-Writing Quality Test"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/batch-tests',
      'POST /api/batch-tests'
    ]
  },

  {
    id: 'BT002',
    name: 'Execute Batch Test',
    description: 'User runs a batch test across multiple providers',
    steps: [
      { action: 'navigate', target: '/batch-testing' },
      { action: 'click', target: 'button[data-testid="button-run-batch-0"]' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="provider-anthropic-claude"]' },
      { action: 'click', target: 'button[data-testid="button-start-execution"]' },
      { action: 'wait', target: 'div[data-testid="batch-progress"]' },
      { action: 'verify', target: 'div[data-testid="batch-results"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'POST /api/batch-tests/{id}/execute',
      'GET /api/batch-tests/{id}/results'
    ]
  },

  // Prompt Sequencing Scenarios
  {
    id: 'PSQ001',
    name: 'Create Prompt Sequence',
    description: 'User creates a multi-step prompt sequence',
    steps: [
      { action: 'navigate', target: '/prompt-sequencing' },
      { action: 'click', target: 'button[data-testid="button-create-sequence"]' },
      { action: 'type', target: 'input[data-testid="input-sequence-name"]', value: 'Research Process' },
      { action: 'type', target: 'textarea[data-testid="input-sequence-description"]', value: 'Multi-step research methodology' },
      { action: 'click', target: 'button[data-testid="button-add-step"]' },
      { action: 'type', target: 'input[data-testid="input-step-name-0"]', value: 'Topic Analysis' },
      { action: 'type', target: 'textarea[data-testid="input-step-prompt-0"]', value: 'Analyze the following topic: {topic}' },
      { action: 'click', target: 'button[data-testid="button-add-step"]' },
      { action: 'type', target: 'input[data-testid="input-step-name-1"]', value: 'Deep Dive' },
      { action: 'type', target: 'textarea[data-testid="input-step-prompt-1"]', value: 'Based on the analysis: {previous_response}, provide detailed research' },
      { action: 'click', target: 'button[data-testid="button-save-sequence"]' },
      { action: 'verify', target: 'div[data-testid="sequence-card-Research Process"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/prompt-sequences',
      'POST /api/prompt-sequences'
    ]
  },

  {
    id: 'PSQ002',
    name: 'Execute Prompt Sequence',
    description: 'User runs a prompt sequence with variable substitution',
    steps: [
      { action: 'navigate', target: '/prompt-sequencing' },
      { action: 'click', target: 'button[data-testid="button-execute-sequence-0"]' },
      { action: 'type', target: 'input[data-testid="input-variable-topic"]', value: 'Machine Learning Ethics' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="button-start-sequence"]' },
      { action: 'wait', target: 'div[data-testid="sequence-step-result-0"]' },
      { action: 'verify', target: 'div[data-testid="sequence-step-result-1"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'POST /api/prompt-sequences/{id}/execute',
      'GET /api/prompt-sequences/{id}/results'
    ]
  },

  // AI Meetings Scenarios
  {
    id: 'AM001',
    name: 'Start AI Meeting',
    description: 'User initiates a meeting with multiple AI agents',
    steps: [
      { action: 'navigate', target: '/ai-meetings' },
      { action: 'click', target: 'button[data-testid="button-create-meeting"]' },
      { action: 'type', target: 'input[data-testid="input-meeting-topic"]', value: 'Product Strategy Discussion' },
      { action: 'click', target: 'div[data-testid="agent-selector-analytical"]' },
      { action: 'click', target: 'div[data-testid="agent-selector-creative"]' },
      { action: 'click', target: 'div[data-testid="agent-selector-practical"]' },
      { action: 'click', target: 'button[data-testid="button-start-meeting"]' },
      { action: 'verify', target: 'div[data-testid="meeting-active"]', condition: 'exists' },
      { action: 'verify', target: 'div[data-testid="agent-mood-analytical"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'POST /api/ai-meetings',
      'GET /api/agent-library'
    ]
  },

  {
    id: 'AM002',
    name: 'Meeting Synthesis',
    description: 'User requests synthesis of meeting discussion',
    steps: [
      { action: 'navigate', target: '/ai-meetings' },
      { action: 'click', target: 'div[data-testid="meeting-card-0"]' },
      { action: 'wait', target: 'div[data-testid="meeting-messages"]' },
      { action: 'click', target: 'button[data-testid="button-synthesize"]' },
      { action: 'wait', target: 'div[data-testid="synthesis-result"]' },
      { action: 'verify', target: 'div[data-testid="synthesis-result"]', condition: 'contains', value: 'Key Points' }
    ],
    expectedBackendCalls: [
      'POST /api/ai-meetings/{id}/synthesize'
    ]
  },

  {
    id: 'AM003',
    name: 'Download Meeting Report',
    description: 'User downloads a comprehensive meeting report',
    steps: [
      { action: 'navigate', target: '/ai-meetings' },
      { action: 'click', target: 'div[data-testid="meeting-card-0"]' },
      { action: 'click', target: 'button[data-testid="button-download-report"]' },
      { action: 'verify', target: 'div[data-testid="download-success"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/ai-meetings/{id}/report'
    ]
  },

  // Response Viewer Scenarios
  {
    id: 'RV001',
    name: 'Compare Responses',
    description: 'User compares responses from multiple providers side by side',
    steps: [
      { action: 'navigate', target: '/response-viewer' },
      { action: 'select', target: 'select[data-testid="select-conversation"]', value: 'conversation-1' },
      { action: 'verify', target: 'div[data-testid="response-comparison"]', condition: 'exists' },
      { action: 'verify', target: 'div[data-testid="response-openai"]', condition: 'exists' },
      { action: 'verify', target: 'div[data-testid="response-anthropic"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/conversations',
      'GET /api/conversations/{id}/responses'
    ]
  },

  {
    id: 'RV002',
    name: 'Download Artifacts',
    description: 'User downloads code artifacts from responses',
    steps: [
      { action: 'navigate', target: '/response-viewer' },
      { action: 'select', target: 'select[data-testid="select-conversation"]', value: 'conversation-with-code' },
      { action: 'verify', target: 'div[data-testid="artifact-code-block"]', condition: 'exists' },
      { action: 'click', target: 'button[data-testid="button-download-artifact-0"]' },
      { action: 'verify', target: 'div[data-testid="download-success"]', condition: 'exists' }
    ],
    expectedBackendCalls: [
      'GET /api/conversations/{id}/artifacts'
    ]
  },

  // Error Scenarios
  {
    id: 'ERR001',
    name: 'Network Error Handling',
    description: 'App handles network failures gracefully',
    steps: [
      { action: 'navigate', target: '/prompt-studio' },
      { action: 'mock_network_error', target: 'POST /api/prompts' },
      { action: 'type', target: 'textarea[data-testid="input-prompt"]', value: 'Test prompt' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="button-send-prompt"]' },
      { action: 'verify', target: 'div[data-testid="error-message"]', condition: 'exists' },
      { action: 'verify', target: 'button[data-testid="button-retry"]', condition: 'exists' }
    ],
    expectedBackendCalls: []
  },

  {
    id: 'ERR002',
    name: 'Invalid File Upload',
    description: 'App handles invalid file uploads properly',
    steps: [
      { action: 'navigate', target: '/document-library' },
      { action: 'click', target: 'button[data-testid="button-upload-document"]' },
      { action: 'upload', target: 'input[type="file"]', value: 'large-file.zip' }, // >10MB file
      { action: 'verify', target: 'div[data-testid="error-file-too-large"]', condition: 'exists' }
    ],
    expectedBackendCalls: []
  },

  {
    id: 'ERR003',
    name: 'API Key Missing',
    description: 'App handles missing API keys gracefully',
    steps: [
      { action: 'navigate', target: '/prompt-studio' },
      { action: 'mock_api_error', target: 'POST /api/prompts', statusCode: 401 },
      { action: 'type', target: 'textarea[data-testid="input-prompt"]', value: 'Test prompt' },
      { action: 'click', target: 'button[data-testid="provider-openai-gpt5"]' },
      { action: 'click', target: 'button[data-testid="button-send-prompt"]' },
      { action: 'verify', target: 'div[data-testid="error-api-key"]', condition: 'exists' }
    ],
    expectedBackendCalls: []
  }
];