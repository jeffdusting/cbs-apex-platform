// Cypress support commands and configurations

// Custom commands for CBS LLM Studio testing
Cypress.Commands.add('visitAndWaitForReact', (route: string) => {
  cy.visit(route);
  cy.get('#root').should('exist');
  cy.get('#root').should('not.be.empty');
  cy.wait(1000); // Wait for React to fully hydrate
});

Cypress.Commands.add('fillPrompt', (text: string) => {
  cy.get('[data-testid="input-prompt"]').should('be.visible');
  cy.get('[data-testid="input-prompt"]').clear();
  cy.get('[data-testid="input-prompt"]').type(text);
});

Cypress.Commands.add('selectProvider', (provider: string) => {
  cy.get(`[data-testid="provider-${provider}"]`).should('be.visible');
  cy.get(`[data-testid="provider-${provider}"]`).click();
});

Cypress.Commands.add('waitForResponse', (provider: string) => {
  cy.get(`[data-testid="response-${provider}"]`, { timeout: 15000 }).should('exist');
});

// Global type declarations for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      visitAndWaitForReact(route: string): Chainable<Element>;
      fillPrompt(text: string): Chainable<Element>;
      selectProvider(provider: string): Chainable<Element>;
      waitForResponse(provider: string): Chainable<Element>;
    }
  }
}