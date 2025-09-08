// Navigation and Integration Tests
describe('Navigation & Integration', () => {
  it('NAV001 - Application Routes', () => {
    const routes = [
      '/prompt-studio',
      '/agent-library', 
      '/document-library',
      '/agent-training',
      '/batch-testing'
    ];

    routes.forEach(route => {
      cy.visitAndWaitForReact(route);
      cy.get('#root').should('not.be.empty');
      cy.url().should('include', route);
    });
  });

  it('NAV002 - Cross-Component Navigation', () => {
    // Test navigation between components
    cy.visitAndWaitForReact('/prompt-studio');
    
    // Navigate to agent library
    cy.get('a[href="/agent-library"], [data-testid="nav-agent-library"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el.first()).click();
        cy.url().should('include', '/agent-library');
      }
    });
  });

  it('INT001 - API Integration Health', () => {
    // Test API calls are working
    cy.visitAndWaitForReact('/prompt-studio');
    
    // Intercept API calls
    cy.intercept('GET', '/api/providers').as('getProviders');
    cy.intercept('GET', '/api/conversations').as('getConversations');
    cy.intercept('GET', '/api/costs').as('getCosts');
    
    // Reload page to trigger API calls
    cy.reload();
    
    // Wait for API calls
    cy.wait('@getProviders').its('response.statusCode').should('eq', 200);
    cy.wait('@getConversations').its('response.statusCode').should('eq', 200);
    cy.wait('@getCosts').its('response.statusCode').should('eq', 200);
  });
});