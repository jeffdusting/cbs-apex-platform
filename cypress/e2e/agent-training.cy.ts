// Agent Training Comprehensive Tests
describe('Agent Training', () => {
  beforeEach(() => {
    cy.visitAndWaitForReact('/agent-training');
  });

  it('AT001 - Training Module Creation', () => {
    // Verify training interface loads
    cy.get('[data-testid="training-interface"]').should('be.visible');
    
    // Create new training module
    cy.get('[data-testid="create-training"]').should('be.visible').click();
    
    // Fill training details
    cy.get('[data-testid="training-name"]').should('be.visible');
    cy.get('[data-testid="training-name"]').type('Customer Service Specialty');
    
    cy.get('[data-testid="training-description"]').should('be.visible');
    cy.get('[data-testid="training-description"]').type('Specialized training for customer service interactions');
    
    // Select specialty area
    cy.get('[data-testid="specialty-selector"]').should('be.visible').click();
    cy.get('[data-testid="specialty-customer-service"]').click();
    
    // Start training
    cy.get('[data-testid="start-training"]').should('be.visible').click();
    
    // Verify training session begins
    cy.get('[data-testid="training-session"]').should('be.visible');
  });

  it('AT002 - Competency Testing', () => {
    // Check existing training sessions
    cy.get('[data-testid="training-sessions"]').should('be.visible');
    
    // Run competency test
    cy.get('[data-testid="run-competency-test"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible').click();
        
        // Verify test interface
        cy.get('[data-testid="competency-test"]').should('be.visible');
        
        // Check test results
        cy.get('[data-testid="test-results"]').should('exist');
      }
    });
  });

  it('AT003 - Training Progress Tracking', () => {
    // Verify progress tracking
    cy.get('[data-testid="training-progress"]').should('be.visible');
    
    // Check individual agent progress
    cy.get('[data-testid="agent-progress"]').should('exist');
    
    // Verify progress metrics
    cy.get('[data-testid="progress-metrics"]').should('be.visible');
  });

  it('AT004 - Iterative Learning', () => {
    // Test iterative learning features
    cy.get('[data-testid="learning-iterations"]').should('be.visible');
    
    // Check learning feedback system
    cy.get('[data-testid="learning-feedback"]').should('exist');
    
    // Verify knowledge retention
    cy.get('[data-testid="knowledge-retention"]').should('exist');
  });
});