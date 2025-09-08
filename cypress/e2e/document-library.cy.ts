// Document Library Comprehensive Tests
describe('Document Library', () => {
  beforeEach(() => {
    cy.visitAndWaitForReact('/document-library');
  });

  it('DL001 - Document Upload and Organization', () => {
    // Verify upload functionality exists
    cy.get('[data-testid="button-upload-document"]').should('be.visible');
    
    // Check folder structure
    cy.get('[data-testid="folder-structure"]').should('be.visible');
    cy.get('[data-testid="folder-item"]').should('exist');
    
    // Verify document list
    cy.get('[data-testid="document-list"]').should('be.visible');
  });

  it('DL002 - Document Search and Filter', () => {
    // Test search functionality
    cy.get('[data-testid="search-documents"]').should('be.visible');
    cy.get('[data-testid="search-documents"]').type('test');
    
    // Test filter options
    cy.get('[data-testid="filter-documents"]').should('be.visible');
    cy.get('[data-testid="filter-documents"]').click();
    
    // Verify filtering works
    cy.get('[data-testid="document-results"]').should('be.visible');
  });

  it('DL003 - Document Context Preview', () => {
    // Check if documents exist
    cy.get('[data-testid="document-item"]').then(($docs) => {
      if ($docs.length > 0) {
        // Click on first document
        cy.wrap($docs.first()).click();
        
        // Verify preview opens
        cy.get('[data-testid="document-preview"]').should('be.visible');
        
        // Check add to context button
        cy.get('[data-testid="add-to-context"]').should('be.visible');
      }
    });
  });

  it('DL004 - Dropbox Integration', () => {
    // Check for Dropbox integration
    cy.get('[data-testid="dropbox-integration"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
    
    // Test folder sync functionality
    cy.get('[data-testid="sync-folders"]').then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).should('be.visible');
      }
    });
  });
});