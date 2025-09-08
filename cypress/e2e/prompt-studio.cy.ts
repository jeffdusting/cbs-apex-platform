// Prompt Studio Comprehensive Tests
describe('Prompt Studio', () => {
  beforeEach(() => {
    cy.visitAndWaitForReact('/prompt-studio');
  });

  it('PS001 - Basic Prompt Submission', () => {
    // Verify prompt editor is visible
    cy.get('[data-testid="input-prompt"]').should('be.visible');
    
    // Fill in prompt
    cy.fillPrompt('What is artificial intelligence?');
    
    // Select multiple providers
    cy.get('[data-testid="provider-selector"]').should('be.visible');
    cy.selectProvider('openai-gpt5');
    cy.selectProvider('anthropic-claude');
    
    // Submit prompt
    cy.get('[data-testid="button-send-prompt"]').should('be.visible').click();
    
    // Verify responses appear
    cy.waitForResponse('openai-gpt5');
    cy.waitForResponse('anthropic-claude');
    
    // Verify cost tracking
    cy.get('[data-testid="cost-display"]').should('be.visible');
  });

  it('PS002 - Document Context Injection', () => {
    // Open context panel
    cy.get('[data-testid="button-add-context"]').should('be.visible').click();
    
    // Verify document library opens
    cy.get('[data-testid="document-library"]').should('be.visible');
    
    // Select document (if any exist)
    cy.get('[data-testid="document-item"]').first().then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).click();
        cy.get('[data-testid="button-add-to-context"]').click();
      }
    });
    
    // Verify context is added
    cy.get('[data-testid="context-panel"]').should('contain', 'Context added');
  });

  it('PS003 - Multi-Provider Cost Comparison', () => {
    // Fill prompt
    cy.fillPrompt('Compare the performance of different AI models');
    
    // Select all 5 providers
    const providers = ['openai-gpt5', 'anthropic-claude', 'gemini-pro', 'grok-beta', 'claude-sonnet'];
    providers.forEach(provider => {
      cy.get(`[data-testid="provider-${provider}"]`).then(($el) => {
        if ($el.length > 0) {
          cy.selectProvider(provider);
        }
      });
    });
    
    // Submit and verify cost comparison
    cy.get('[data-testid="button-send-prompt"]').click();
    
    // Check cost comparison display
    cy.get('[data-testid="cost-comparison"]').should('be.visible');
    cy.get('[data-testid="provider-costs"]').should('exist');
  });

  it('PS004 - Conversation Threading', () => {
    // Start initial conversation
    cy.fillPrompt('Tell me about machine learning');
    cy.selectProvider('openai-gpt5');
    cy.get('[data-testid="button-send-prompt"]').click();
    cy.waitForResponse('openai-gpt5');
    
    // Check conversation history
    cy.get('[data-testid="conversation-history"]').should('be.visible');
    
    // Add follow-up question
    cy.get('[data-testid="input-followup"]').should('be.visible');
    cy.get('[data-testid="input-followup"]').type('Can you explain deep learning?');
    cy.get('[data-testid="button-send-followup"]').click();
    
    // Verify conversation continues
    cy.get('[data-testid="conversation-history"]').should('contain', 'machine learning');
  });

  it('PS005 - Response Export and Download', () => {
    // Generate response first
    cy.fillPrompt('Create a simple Python function');
    cy.selectProvider('openai-gpt5');
    cy.get('[data-testid="button-send-prompt"]').click();
    cy.waitForResponse('openai-gpt5');
    
    // Check for artifact detection
    cy.get('[data-testid="response-openai-gpt5"]').should('be.visible');
    
    // Look for download/export options
    cy.get('[data-testid="export-response"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
    
    // Check for code artifacts
    cy.get('[data-testid="code-artifact"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
  });
});