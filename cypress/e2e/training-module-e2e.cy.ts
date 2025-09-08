/**
 * Comprehensive Training Module End-to-End Tests
 * 
 * Tests complete user workflows for the training module,
 * covering all UI scenarios and user interactions.
 */

describe('Training Module E2E Tests', () => {
  beforeEach(() => {
    // Visit the agent training page
    cy.visit('/agent-training');
    
    // Wait for the page to load
    cy.get('[data-testid="training-page-title"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Page Navigation and Layout', () => {
    it('TM001 - Should load training page with all components', () => {
      // Verify page title
      cy.get('[data-testid="training-page-title"]').should('contain', 'Agent Training Hub');
      
      // Verify all tabs are present
      cy.get('[data-testid="tab-agents-in-training"]').should('be.visible');
      cy.get('[data-testid="tab-start-new-training"]').should('be.visible');
      cy.get('[data-testid="tab-training-competencies"]').should('be.visible');
      
      // Default tab should be "Agents In Training"
      cy.get('[data-testid="tab-agents-in-training"]').should('have.attr', 'data-state', 'active');
    });

    it('TM002 - Should navigate between tabs correctly', () => {
      // Switch to Start New Training tab
      cy.get('[data-testid="tab-start-new-training"]').click();
      cy.get('[data-testid="tab-start-new-training"]').should('have.attr', 'data-state', 'active');
      cy.get('[data-testid="training-form-container"]').should('be.visible');
      
      // Switch to Training Competencies tab
      cy.get('[data-testid="tab-training-competencies"]').click();
      cy.get('[data-testid="tab-training-competencies"]').should('have.attr', 'data-state', 'active');
      cy.get('[data-testid="specialties-container"]').should('be.visible');
      
      // Switch back to Agents In Training tab
      cy.get('[data-testid="tab-agents-in-training"]').click();
      cy.get('[data-testid="tab-agents-in-training"]').should('have.attr', 'data-state', 'active');
      cy.get('[data-testid="training-sessions-container"]').should('be.visible');
    });
  });

  describe('Agents In Training Tab', () => {
    beforeEach(() => {
      // Ensure we're on the Agents In Training tab
      cy.get('[data-testid="tab-agents-in-training"]').click();
    });

    it('TM003 - Should display training sessions correctly', () => {
      // Check for training sessions container
      cy.get('[data-testid="training-sessions-container"]').should('be.visible');
      
      // If there are active sessions, verify their display
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="training-session-"]').length > 0) {
          // Verify session cards have required elements
          cy.get('[data-testid^="training-session-"]').first().within(() => {
            cy.get('[data-testid="agent-name"]').should('be.visible');
            cy.get('[data-testid="specialty-name"]').should('be.visible');
            cy.get('[data-testid="target-level"]').should('be.visible');
            cy.get('[data-testid="progress-bar"]').should('be.visible');
            cy.get('[data-testid="progress-percentage"]').should('be.visible');
          });
        } else {
          // Verify empty state message
          cy.contains('No agents currently in training').should('be.visible');
        }
      });
    });

    it('TM004 - Should allow selecting and viewing session details', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="training-session-"]').length > 0) {
          // Click on first training session
          cy.get('[data-testid^="training-session-"]').first().click();
          
          // Verify session details panel appears
          cy.get('[data-testid="session-details-panel"]').should('be.visible');
          cy.get('[data-testid="progress-overview"]').should('be.visible');
          cy.get('[data-testid="competency-details"]').should('be.visible');
        }
      });
    });

    it('TM005 - Should display progress information accurately', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="training-session-"]').length > 0) {
          cy.get('[data-testid^="training-session-"]').first().within(() => {
            // Verify progress percentage is a valid number
            cy.get('[data-testid="progress-percentage"]').invoke('text').then((text) => {
              const percentage = parseInt(text.replace('%', ''));
              expect(percentage).to.be.at.least(0).and.at.most(100);
            });
            
            // Verify iteration information
            cy.get('[data-testid="iteration-info"]').should('be.visible');
          });
        }
      });
    });
  });

  describe('Start New Training Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-start-new-training"]').click();
      cy.get('[data-testid="training-form-container"]').should('be.visible');
    });

    it('TM006 - Should display training form with all required fields', () => {
      // Verify form fields are present
      cy.get('[data-testid="select-agent"]').should('be.visible');
      cy.get('[data-testid="select-specialty"]').should('be.visible');
      cy.get('[data-testid="select-competency-level"]').should('be.visible');
      cy.get('[data-testid="button-start-training"]').should('be.visible');
      
      // Initially, start button should be disabled
      cy.get('[data-testid="button-start-training"]').should('be.disabled');
    });

    it('TM007 - Should populate agent selection dropdown', () => {
      // Click agent selection dropdown
      cy.get('[data-testid="select-agent"]').click();
      
      // Verify dropdown opens and contains agents
      cy.get('[data-testid="agent-option"]').should('have.length.greaterThan', 0);
      
      // Verify agent options have required information
      cy.get('[data-testid="agent-option"]').first().within(() => {
        cy.get('[data-testid="agent-name"]').should('be.visible');
        cy.get('[data-testid="agent-personality"]').should('be.visible');
      });
      
      // Close dropdown by clicking elsewhere
      cy.get('[data-testid="training-form-container"]').click();
    });

    it('TM008 - Should populate specialty selection dropdown', () => {
      // Click specialty selection dropdown
      cy.get('[data-testid="select-specialty"]').click();
      
      // Verify dropdown opens and contains specialties
      cy.get('[data-testid="specialty-option"]').should('have.length.greaterThan', 0);
      
      // Verify specialty options have required information
      cy.get('[data-testid="specialty-option"]').first().within(() => {
        cy.get('[data-testid="specialty-name"]').should('be.visible');
        cy.get('[data-testid="specialty-domain"]').should('be.visible');
      });
      
      // Close dropdown
      cy.get('[data-testid="training-form-container"]').click();
    });

    it('TM009 - Should enable start button when form is complete', () => {
      // Select an agent
      cy.get('[data-testid="select-agent"]').click();
      cy.get('[data-testid="agent-option"]').first().click();
      
      // Select a specialty
      cy.get('[data-testid="select-specialty"]').click();
      cy.get('[data-testid="specialty-option"]').first().click();
      
      // Select competency level
      cy.get('[data-testid="select-competency-level"]').click();
      cy.get('[data-testid="level-option-Advanced"]').click();
      
      // Start button should now be enabled
      cy.get('[data-testid="button-start-training"]').should('be.enabled');
    });

    it('TM010 - Should start training session successfully', () => {
      // Fill out the complete form
      cy.get('[data-testid="select-agent"]').click();
      cy.get('[data-testid="agent-option"]').first().click();
      
      cy.get('[data-testid="select-specialty"]').click();
      cy.get('[data-testid="specialty-option"]').first().click();
      
      cy.get('[data-testid="select-competency-level"]').click();
      cy.get('[data-testid="level-option-Advanced"]').click();
      
      // Start training
      cy.get('[data-testid="button-start-training"]').click();
      
      // Verify success feedback
      cy.get('[data-testid="training-started-toast"]', { timeout: 10000 }).should('be.visible');
      
      // Should automatically switch to Agents In Training tab
      cy.get('[data-testid="tab-agents-in-training"]').should('have.attr', 'data-state', 'active');
      
      // New session should appear in the list
      cy.get('[data-testid^="training-session-"]').should('have.length.greaterThan', 0);
    });

    it('TM011 - Should handle validation errors gracefully', () => {
      // Try to start training without selecting everything
      cy.get('[data-testid="select-agent"]').click();
      cy.get('[data-testid="agent-option"]').first().click();
      
      // Don't select specialty or level
      cy.get('[data-testid="button-start-training"]').should('be.disabled');
      
      // Select specialty but not level
      cy.get('[data-testid="select-specialty"]').click();
      cy.get('[data-testid="specialty-option"]').first().click();
      
      cy.get('[data-testid="button-start-training"]').should('be.disabled');
    });
  });

  describe('Training Competencies Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-training-competencies"]').click();
      cy.get('[data-testid="specialties-container"]').should('be.visible');
    });

    it('TM012 - Should display existing specialties', () => {
      // Verify specialties list
      cy.get('[data-testid="specialties-list"]').should('be.visible');
      
      // If specialties exist, verify their display
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="specialty-card-"]').length > 0) {
          cy.get('[data-testid^="specialty-card-"]').first().within(() => {
            cy.get('[data-testid="specialty-name"]').should('be.visible');
            cy.get('[data-testid="specialty-description"]').should('be.visible');
            cy.get('[data-testid="specialty-domain"]').should('be.visible');
            cy.get('[data-testid="competency-levels"]').should('be.visible');
          });
        }
      });
    });

    it('TM013 - Should open create specialty dialog', () => {
      // Click create specialty button
      cy.get('[data-testid="button-create-specialty"]').click();
      
      // Verify dialog opens
      cy.get('[data-testid="create-specialty-dialog"]').should('be.visible');
      cy.get('[data-testid="input-specialty-name"]').should('be.visible');
      cy.get('[data-testid="input-specialty-description"]').should('be.visible');
      cy.get('[data-testid="select-specialty-domain"]').should('be.visible');
      cy.get('[data-testid="input-required-knowledge"]').should('be.visible');
    });

    it('TM014 - Should create new specialty successfully', () => {
      // Open create dialog
      cy.get('[data-testid="button-create-specialty"]').click();
      
      // Fill in specialty details
      cy.get('[data-testid="input-specialty-name"]').type('E2E Test Specialty');
      cy.get('[data-testid="input-specialty-description"]').type('A specialty created during E2E testing');
      
      // Select domain
      cy.get('[data-testid="select-specialty-domain"]').click();
      cy.get('[data-testid="domain-option-technical"]').click();
      
      // Add required knowledge
      cy.get('[data-testid="input-required-knowledge"]').type('Basic concepts{enter}');
      cy.get('[data-testid="input-required-knowledge"]').type('Testing fundamentals{enter}');
      
      // Create specialty
      cy.get('[data-testid="button-create-specialty-confirm"]').click();
      
      // Verify success
      cy.get('[data-testid="specialty-created-toast"]', { timeout: 10000 }).should('be.visible');
      
      // New specialty should appear in list
      cy.get('[data-testid="specialties-list"]').should('contain', 'E2E Test Specialty');
    });

    it('TM015 - Should edit existing specialty', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="specialty-card-"]').length > 0) {
          // Click edit button on first specialty
          cy.get('[data-testid^="specialty-card-"]').first().within(() => {
            cy.get('[data-testid="button-edit-specialty"]').click();
          });
          
          // Verify edit dialog opens
          cy.get('[data-testid="edit-specialty-dialog"]').should('be.visible');
          
          // Make a change
          cy.get('[data-testid="input-specialty-description"]').clear().type('Updated description during E2E test');
          
          // Save changes
          cy.get('[data-testid="button-save-specialty"]').click();
          
          // Verify success
          cy.get('[data-testid="specialty-updated-toast"]', { timeout: 10000 }).should('be.visible');
        }
      });
    });

    it('TM016 - Should delete specialty with confirmation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="specialty-card-"]').length > 0) {
          const initialCount = $body.find('[data-testid^="specialty-card-"]').length;
          
          // Click delete button on last specialty
          cy.get('[data-testid^="specialty-card-"]').last().within(() => {
            cy.get('[data-testid="button-delete-specialty"]').click();
          });
          
          // Verify confirmation dialog
          cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
          cy.get('[data-testid="button-confirm-delete"]').click();
          
          // Verify success
          cy.get('[data-testid="specialty-deleted-toast"]', { timeout: 10000 }).should('be.visible');
          
          // Verify specialty count decreased
          cy.get('[data-testid^="specialty-card-"]').should('have.length', initialCount - 1);
        }
      });
    });
  });

  describe('Training Progress Monitoring', () => {
    it('TM017 - Should monitor training progress in real-time', () => {
      // Start on Agents In Training tab
      cy.get('[data-testid="tab-agents-in-training"]').click();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="training-session-"]').length > 0) {
          // Select a training session
          cy.get('[data-testid^="training-session-"]').first().click();
          
          // Verify progress details are shown
          cy.get('[data-testid="session-details-panel"]').should('be.visible');
          cy.get('[data-testid="progress-overview"]').should('be.visible');
          
          // Check for live updates (if any sessions are active)
          cy.get('[data-testid="last-updated"]').should('be.visible');
          
          // Verify competency progression is shown
          cy.get('[data-testid="competency-progression"]').should('be.visible');
          cy.get('[data-testid="current-level"]').should('be.visible');
          cy.get('[data-testid="target-level"]').should('be.visible');
        }
      });
    });

    it('TM018 - Should display detailed training metrics', () => {
      cy.get('[data-testid="tab-agents-in-training"]').click();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid^="training-session-"]').length > 0) {
          cy.get('[data-testid^="training-session-"]').first().click();
          
          // Verify detailed metrics are shown
          cy.get('[data-testid="training-metrics"]').should('be.visible');
          cy.get('[data-testid="iteration-count"]').should('be.visible');
          cy.get('[data-testid="time-elapsed"]').should('be.visible');
          cy.get('[data-testid="estimated-completion"]').should('be.visible');
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('TM019 - Should handle network errors gracefully', () => {
      // Simulate network error by intercepting API calls
      cy.intercept('GET', '/api/training/sessions', { forceNetworkError: true }).as('getSessionsError');
      
      // Refresh the page to trigger the error
      cy.reload();
      
      // Should show error state without crashing
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('TM020 - Should handle empty states appropriately', () => {
      // Mock empty responses
      cy.intercept('GET', '/api/training/sessions', []).as('getEmptySessions');
      cy.intercept('GET', '/api/training/specialties', []).as('getEmptySpecialties');
      cy.intercept('GET', '/api/agent-library', []).as('getEmptyAgents');
      
      cy.reload();
      
      // Check empty states on each tab
      cy.get('[data-testid="tab-agents-in-training"]').click();
      cy.contains('No agents currently in training').should('be.visible');
      
      cy.get('[data-testid="tab-start-new-training"]').click();
      cy.get('[data-testid="select-agent"]').click();
      cy.contains('No agents available').should('be.visible');
      
      cy.get('[data-testid="tab-training-competencies"]').click();
      cy.contains('No specialties defined').should('be.visible');
    });

    it('TM021 - Should validate form inputs properly', () => {
      cy.get('[data-testid="tab-training-competencies"]').click();
      cy.get('[data-testid="button-create-specialty"]').click();
      
      // Try to create specialty without required fields
      cy.get('[data-testid="button-create-specialty-confirm"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="name-error"]').should('be.visible');
      cy.get('[data-testid="domain-error"]').should('be.visible');
    });
  });

  describe('Accessibility and Usability', () => {
    it('TM022 - Should be keyboard navigable', () => {
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'tab-agents-in-training');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'tab-start-new-training');
      
      // Test Enter key activation
      cy.focused().type('{enter}');
      cy.get('[data-testid="tab-start-new-training"]').should('have.attr', 'data-state', 'active');
    });

    it('TM023 - Should have proper ARIA labels', () => {
      // Verify important elements have accessibility attributes
      cy.get('[data-testid="training-page-title"]').should('have.attr', 'role');
      cy.get('[data-testid^="training-session-"]').first().should('have.attr', 'aria-label');
      cy.get('[data-testid="select-agent"]').should('have.attr', 'aria-label');
    });

    it('TM024 - Should work on mobile viewports', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      
      // Verify page still functions
      cy.get('[data-testid="training-page-title"]').should('be.visible');
      cy.get('[data-testid="tab-agents-in-training"]').should('be.visible');
      
      // Test tab switching on mobile
      cy.get('[data-testid="tab-start-new-training"]').click();
      cy.get('[data-testid="training-form-container"]').should('be.visible');
    });
  });
});