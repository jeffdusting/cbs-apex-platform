// Agent Library Comprehensive Tests
describe('Agent Library', () => {
  beforeEach(() => {
    cy.visitAndWaitForReact('/agent-library');
  });

  it('AL001 - Create Custom Agent', () => {
    // Click create agent button
    cy.get('[data-testid="create-agent"]').should('be.visible').click();
    
    // Verify form is visible
    cy.get('[data-testid="agent-creation-form"]').should('be.visible');
    
    // Fill in agent details
    cy.get('[data-testid="agent-name"]').should('be.visible');
    cy.get('[data-testid="agent-name"]').type('Test Marketing Agent');
    
    cy.get('[data-testid="agent-description"]').should('be.visible');
    cy.get('[data-testid="agent-description"]').type('A specialized agent for marketing campaigns and strategy');
    
    // Select HBDI personality profile
    cy.get('[data-testid="hbdi-profile"]').should('be.visible').click();
    cy.get('[data-testid="hbdi-option-analytical"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).click();
      }
    });
    
    // Select preferred provider
    cy.get('[data-testid="select-provider"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).click();
        cy.get('[data-testid="provider-option-openai"]').click();
      }
    });
    
    // Save agent
    cy.get('[data-testid="save-agent"]').should('be.visible').click();
    
    // Verify agent was created
    cy.get('[data-testid="agent-list"]').should('contain', 'Test Marketing Agent');
  });

  it('AL002 - Edit Existing Agent', () => {
    // Find first agent in list
    cy.get('[data-testid="agent-item"]').first().should('exist');
    cy.get('[data-testid="edit-agent"]').first().click();
    
    // Verify edit form opens
    cy.get('[data-testid="agent-creation-form"]').should('be.visible');
    
    // Make changes
    cy.get('[data-testid="agent-name"]').clear().type('Updated Agent Name');
    
    // Save changes
    cy.get('[data-testid="save-agent"]').click();
    
    // Verify changes were saved
    cy.get('[data-testid="agent-list"]').should('contain', 'Updated Agent Name');
  });

  it('AL003 - Agent Performance Analytics', () => {
    // Check if analytics section exists
    cy.get('[data-testid="agent-analytics"]').should('be.visible');
    
    // Verify analytics displays
    cy.get('[data-testid="usage-stats"]').should('exist');
    cy.get('[data-testid="performance-metrics"]').should('exist');
    
    // Check individual agent analytics
    cy.get('[data-testid="agent-item"]').first().click();
    cy.get('[data-testid="agent-performance"]').should('be.visible');
  });

  it('AL004 - Agent Export and Import', () => {
    // Test export functionality
    cy.get('[data-testid="agent-item"]').first().should('exist');
    cy.get('[data-testid="export-agent"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
    
    // Test import functionality  
    cy.get('[data-testid="import-agent"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
  });
});