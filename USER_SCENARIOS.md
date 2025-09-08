# CBS Apex User Scenarios

## Overview

This document outlines comprehensive user scenarios for the CBS Apex application, detailing the step-by-step user interactions required to complete each workflow. Each scenario includes UI elements, user selections, and navigation paths through the application.

---

## Scenario 1: Agent Creation and Configuration

**Objective**: Create a new AI agent with HBDI-based personality traits and configure its preferences.

### User Actions:

1. **Navigate to Agent Library**
   - UI Visible: Sidebar with navigation menu
   - Action: Click "Agent Library" in sidebar navigation
   - Next: Agent Library page loads

2. **Initiate Agent Creation**
   - UI Visible: Agent Library page with agent cards grid and "Create New Agent" button
   - Action: Click "Create New Agent" button (`data-testid="button-create-agent"`)
   - Next: Agent creation form modal opens

3. **Fill Basic Information**
   - UI Visible: Modal dialog with form fields
   - Actions:
     - Enter agent name in "Agent Name" input field
     - Enter description in "Description" textarea
   - Next: Personality selection becomes available

4. **Select HBDI Personality Traits**
   - UI Visible: Two dropdown selectors for personality traits
   - Actions:
     - Click "Primary Personality" dropdown
     - Select from HBDI options: Analytical, Practical, Relational, Experimental, Strategic, Expressive, Safekeeping, or Organizing
     - Click "Secondary Personality" dropdown (optional)
     - Select complementary personality trait
   - Next: Advanced configuration options appear

5. **Configure Advanced Settings**
   - UI Visible: Additional form sections with checkboxes and text areas
   - Actions:
     - Toggle "Devil's Advocate" checkbox if desired
     - Enter supplemental prompt in textarea (optional)
     - Select preferred LLM provider from dropdown
   - Next: Save button becomes enabled

6. **Save Agent**
   - UI Visible: "Create Agent" button at bottom of form
   - Action: Click "Create Agent" button
   - Next: Modal closes, agent appears in library grid with success toast

---

## Scenario 2: Agent Training Session Setup

**Objective**: Configure and start a training session for an existing agent in a specific competency.

### User Actions:

1. **Navigate to Agent Training**
   - UI Visible: Sidebar navigation
   - Action: Click "Agent Training" in sidebar (`data-testid="link-agent-training"`)
   - Next: Agent Training hub page loads

2. **Access New Training Setup**
   - UI Visible: Agent Training page with tabs (Overview, Start Training, In Progress, Competencies)
   - Action: Click "Start Training" tab
   - Next: Training setup interface loads

3. **Select Agent for Training**
   - UI Visible: Agent selection dropdown with available agents
   - Action: Click agent dropdown and select agent from list
   - Next: Agent's current competencies and training history display

4. **Choose Training Competency**
   - UI Visible: Competency selection grid showing available specialties
   - Action: Click on desired competency card (e.g., "Analytical Thinking", "Creative Problem Solving")
   - Next: Competency details and difficulty options appear

5. **Set Training Parameters**
   - UI Visible: Training configuration form
   - Actions:
     - Select target competency level: Beginner, Intermediate, Advanced, or Expert
     - Choose preferred LLM provider for training
     - Set maximum iterations (default: 5)
     - Select document folders for context (optional)
   - Next: Cost estimation and preview display

6. **Review and Start Training**
   - UI Visible: Training summary with cost breakdown and estimated duration
   - Action: Click "Start Training Session" button
   - Next: Training session begins, redirects to "In Progress" tab

7. **Monitor Training Progress**
   - UI Visible: "In Progress" tab with active training sessions
   - UI Elements:
     - Progress bars showing completion percentage
     - Current iteration counter
     - Real-time status updates (studying, testing, reviewing)
     - Training cycle details
   - Actions: Can pause, resume, or stop training sessions
   - Next: Training continues automatically with periodic updates

---

## Scenario 3: Agent Training Progress Review and Updates

**Objective**: Review an agent's training progress, adjust parameters, and manage ongoing sessions.

### User Actions:

1. **Access Training Progress**
   - UI Visible: Agent Training page
   - Action: Click "In Progress" tab
   - Next: List of active training sessions displays

2. **Select Training Session**
   - UI Visible: Cards showing active training sessions with agent names, competencies, and progress
   - Action: Click on specific training session card
   - Next: Detailed training session view opens

3. **Review Training Details**
   - UI Visible: Expanded training session panel
   - Information Displayed:
     - Current iteration and phase (study/practice/test/review)
     - Test scores and feedback
     - Knowledge acquisition metrics
     - Competency progression chart
     - Cost tracking
   - Next: Management options become available

4. **Adjust Training Parameters**
   - UI Visible: Training controls panel
   - Actions:
     - Click "Settings" button to modify parameters
     - Adjust difficulty level if needed
     - Change LLM provider
     - Modify iteration limits
   - Next: Changes take effect in next training cycle

5. **Manage Training Session**
   - UI Visible: Control buttons for session management
   - Available Actions:
     - Pause training (maintains current state)
     - Resume paused training
     - Stop training (ends session)
     - Export training report
   - Next: Selected action is executed with confirmation

6. **Review Training Insights**
   - UI Visible: Training analytics dashboard
   - Information Available:
     - Learning curve visualization
     - Strengths and weaknesses identified
     - Recommended next competencies
     - Knowledge retention metrics
   - Next: Can use insights to plan future training

---

## Scenario 4: Multi-Agent Meeting Setup (AI Meetings)

**Objective**: Schedule and configure a collaborative AI meeting with multiple agents using different thinking styles.

### User Actions:

1. **Navigate to AI Meetings**
   - UI Visible: Sidebar navigation
   - Action: Click "AI Meetings" (Prompt Sequencing) in sidebar
   - Next: AI Meetings page loads

2. **Create New Meeting**
   - UI Visible: AI Meetings page with existing meetings list and "New Meeting" button
   - Action: Click "New Meeting" button
   - Next: Meeting configuration wizard opens

3. **Define Meeting Objective**
   - UI Visible: Meeting setup form
   - Actions:
     - Enter meeting name/title
     - Enter task objective description
     - Set initial prompt for discussion
     - Configure iteration limit (1-10)
   - Next: Agent selection interface appears

4. **Select Meeting Participants**
   - UI Visible: Agent selection grid showing available agents with their personalities
   - Actions:
     - Click on desired agents to add to meeting (up to 5 agents)
     - Agents display with personality badges (Analytical, Creative, etc.)
     - Ensure diverse HBDI representation for balanced perspectives
   - Next: Meeting flow configuration opens

5. **Configure Meeting Flow**
   - UI Visible: Agent chain builder interface
   - Actions:
     - Drag and drop agents to arrange speaking order
     - Set whether agents can respond to each other
     - Configure synthesis provider for final summary
     - Select document folders for context
   - Next: Advanced settings become available

6. **Set Advanced Options**
   - UI Visible: Advanced configuration panel
   - Actions:
     - Choose collaboration mood tracking (enabled/disabled)
     - Set response length preferences
     - Configure real-time collaboration indicators
     - Enable/disable devil's advocate mode for selected agents
   - Next: Meeting preview and cost estimation

7. **Review and Launch Meeting**
   - UI Visible: Meeting summary with participant list, flow diagram, and cost estimate
   - Action: Click "Start AI Meeting" button
   - Next: Meeting begins, real-time collaboration view opens

---

## Scenario 5: Real-Time Meeting Monitoring and Management

**Objective**: Monitor an active AI meeting, track agent interactions, and manage the collaboration process.

### User Actions:

1. **Access Active Meeting**
   - UI Visible: AI Meetings page with active meeting indicators
   - Action: Click on active meeting card with "In Progress" status
   - Next: Real-time meeting dashboard opens

2. **Monitor Agent Collaboration**
   - UI Visible: Live meeting interface with agent panels
   - Information Displayed:
     - Agent status indicators (thinking, typing, responding)
     - Mood indicators for each agent (focused, creative, analytical, etc.)
     - Collaboration mood bar showing overall meeting dynamics
     - Response progress for current speaking agent
   - Next: Can observe real-time agent interactions

3. **Track Meeting Progress**
   - UI Visible: Meeting progress sidebar
   - Information Available:
     - Current iteration number
     - Speaking order and next agent
     - Response completion status
     - Time elapsed and estimated remaining
     - Token usage and cost tracking
   - Next: Progress updates automatically

4. **Manage Meeting Flow**
   - UI Visible: Meeting control panel
   - Available Actions:
     - Pause meeting (stops current response generation)
     - Skip current agent (moves to next in sequence)
     - Add additional context mid-meeting
     - Adjust iteration count
   - Next: Selected actions modify meeting behavior

5. **Intervene in Discussion**
   - UI Visible: Intervention options panel
   - Actions:
     - Add new prompt or question
     - Redirect discussion focus
     - Request specific agent perspective
     - Inject additional context from documents
   - Next: Meeting continues with new input

6. **Monitor Agent Moods and Collaboration**
   - UI Visible: Agent mood indicators and collaboration metrics
   - Information Tracked:
     - Individual agent engagement levels
     - Collaboration quality scores
     - Conflict or agreement indicators
     - Knowledge sharing metrics
   - Next: Can adjust meeting dynamics based on mood data

---

## Scenario 6: Meeting Completion and Reporting

**Objective**: Complete an AI meeting, generate synthesis reports, and analyze collaboration outcomes.

### User Actions:

1. **Meeting Conclusion**
   - UI Visible: Meeting nearing completion with final iteration indicator
   - Action: Wait for final agent response or manually end meeting
   - Next: Synthesis generation begins automatically

2. **Review Synthesis Report**
   - UI Visible: Synthesis report generation interface
   - Information Generated:
     - Executive summary of discussion
     - Key insights from each agent perspective
     - Areas of consensus and disagreement
     - Recommended action items
     - Collaboration quality assessment
   - Next: Report customization options appear

3. **Customize Report Output**
   - UI Visible: Report customization panel
   - Actions:
     - Select report sections to include
     - Choose export format (PDF, markdown, JSON)
     - Add custom notes or annotations
     - Set report visibility/sharing settings
   - Next: Final report generation

4. **Download and Share Report**
   - UI Visible: Completed report with download options
   - Actions:
     - Click "Download Report" button
     - Choose sharing options if needed
     - Save to document library
   - Next: Report saved and made available

5. **Analyze Collaboration Metrics**
   - UI Visible: Meeting analytics dashboard
   - Information Available:
     - Agent participation balance
     - Mood progression throughout meeting
     - Knowledge contribution analysis
     - Cost breakdown by agent and iteration
     - Collaboration effectiveness scores
   - Next: Can use data for future meeting planning

6. **Archive Meeting Session**
   - UI Visible: Meeting completion options
   - Actions:
     - Add meeting tags for organization
     - Set retention period
     - Archive or delete meeting data
   - Next: Meeting moved to historical records

---

## Scenario 7: Document Library Management and Integration

**Objective**: Organize documents, create folders, and integrate documents into AI workflows.

### User Actions:

1. **Navigate to Document Library**
   - UI Visible: Sidebar navigation
   - Action: Click "Document Library" in sidebar
   - Next: Document Library page loads with folder tree and document grid

2. **Create Document Folders**
   - UI Visible: Document Library with folder management panel
   - Actions:
     - Click "New Folder" button
     - Enter folder name and description
     - Select parent folder (if creating subfolder)
   - Next: New folder appears in folder tree

3. **Upload Documents**
   - UI Visible: Upload area with drag-and-drop zone
   - Actions:
     - Drag files to upload zone or click "Browse Files"
     - Select destination folder
     - Add document tags and descriptions
   - Next: Documents process and appear in selected folder

4. **Integrate Dropbox Content**
   - UI Visible: Document Library with "Dropbox" tab
   - Actions:
     - Click "Dropbox" tab
     - Authenticate with Dropbox account
     - Browse Dropbox folder structure
     - Select files or folders to import
   - Next: Selected content imports to CBS Apex document library

5. **Organize and Search Documents**
   - UI Visible: Document grid with search and filter options
   - Actions:
     - Use search bar to find documents by name or content
     - Filter by document type, date, or tags
     - Move documents between folders via drag-and-drop
     - Edit document metadata
   - Next: Documents reorganized according to selections

6. **Link Documents to Workflows**
   - UI Visible: Document selection interface in other modules
   - Actions:
     - In Prompt Studio: Select folders for context injection
     - In Agent Training: Choose documents for training context
     - In AI Meetings: Select relevant documents for discussion context
   - Next: Documents integrated into selected workflows

---

## Scenario 8: Batch Testing and Provider Comparison

**Objective**: Create and execute batch tests across multiple LLM providers to compare performance.

### User Actions:

1. **Navigate to Batch Testing**
   - UI Visible: Sidebar navigation
   - Action: Click "Batch Testing" in sidebar
   - Next: Batch Testing page loads

2. **Create New Batch Test**
   - UI Visible: Batch Testing page with test creation form
   - Actions:
     - Enter test name and description
     - Add multiple prompts (click "Add Prompt" to create additional fields)
     - Select LLM providers for comparison
     - Choose document folders for context
   - Next: Test configuration preview appears

3. **Configure Test Parameters**
   - UI Visible: Test configuration section
   - Actions:
     - Set test priority level
     - Configure response length limits
     - Enable/disable cost tracking
     - Set completion notification preferences
   - Next: Test ready for execution

4. **Execute Batch Test**
   - UI Visible: Test configuration summary with cost estimate
   - Action: Click "Run Batch Test" button
   - Next: Test begins execution, progress tracker appears

5. **Monitor Test Progress**
   - UI Visible: Test execution dashboard
   - Information Displayed:
     - Overall progress bar
     - Individual prompt completion status
     - Provider response times
     - Real-time cost accumulation
     - Error notifications (if any)
   - Next: Test continues until completion

6. **Analyze Test Results**
   - UI Visible: Results comparison interface
   - Information Available:
     - Side-by-side response comparison
     - Response quality metrics
     - Cost analysis per provider
     - Response time comparisons
     - Artifact generation rates
   - Actions:
     - Filter results by prompt or provider
     - Export results to various formats
     - Download generated artifacts
   - Next: Results saved for future reference

---

## Scenario 9: Agent Competency Management and Question Banking

**Objective**: Manage agent competencies, create custom questions, and maintain question banks.

### User Actions:

1. **Access Competency Management**
   - UI Visible: Agent Training page
   - Action: Click "Competencies" tab
   - Next: Competency management interface loads

2. **Create New Competency**
   - UI Visible: Competency list with "Add Competency" button
   - Actions:
     - Click "Add Competency" button
     - Enter competency name and description
     - Select competency category
     - Set difficulty progression levels
   - Next: New competency added to system

3. **Manage Question Banks**
   - UI Visible: Question bank interface with existing questions
   - Actions:
     - Click "Question Bank" section
     - Review existing questions by competency
     - Edit question content, correct answers, and difficulty
     - Delete outdated questions
   - Next: Question bank updated

4. **Create Custom Questions**
   - UI Visible: Question creation form
   - Actions:
     - Click "Add Question" button
     - Enter question text
     - Set question type (multiple choice, open-ended, practical)
     - Add correct answers and explanations
     - Assign difficulty level and competency tags
   - Next: Question added to appropriate competency bank

5. **Configure Automated Question Generation**
   - UI Visible: LLM-powered question generation interface
   - Actions:
     - Select competency for question generation
     - Choose LLM provider for generation
     - Set question quantity and difficulty distribution
     - Provide topic guidelines or constraints
   - Next: LLM generates questions automatically

6. **Review and Approve Generated Questions**
   - UI Visible: Generated questions review interface
   - Actions:
     - Review each generated question
     - Approve, edit, or reject questions
     - Adjust difficulty ratings if needed
     - Assign to appropriate competency categories
   - Next: Approved questions added to question bank

---

## Scenario 10: Agent Experience Tracking and Memory Management

**Objective**: Monitor agent learning progress, manage agent memories, and track experience accumulation.

### User Actions:

1. **Access Agent Experience Dashboard**
   - UI Visible: Agent Library page
   - Action: Click on specific agent card to view details
   - Next: Agent detail view opens with experience tabs

2. **Review Agent Memory**
   - UI Visible: Agent detail page with "Experience" tab
   - Information Displayed:
     - Meetings participated in
     - Topics explored and expertise areas
     - Key insights accumulated
     - Collaboration history
     - Knowledge retention scores
   - Next: Can drill down into specific experience areas

3. **View Learning Progression**
   - UI Visible: Agent experience analytics
   - Information Available:
     - Competency progression over time
     - Learning curve visualization
     - Performance improvement trends
     - Knowledge application success rates
   - Next: Can identify areas for focused training

4. **Manage Agent Knowledge Base**
   - UI Visible: Knowledge management interface
   - Actions:
     - Review stored knowledge entries
     - Update knowledge confidence scores
     - Remove outdated or incorrect knowledge
     - Add manual knowledge entries
   - Next: Agent knowledge base optimized

5. **Track Collaboration Impact**
   - UI Visible: Collaboration analytics dashboard
   - Information Tracked:
     - Agent's influence on meeting outcomes
     - Quality of contributions to discussions
     - Improvement in collaboration skills
     - Peer feedback and ratings
   - Next: Use data to enhance agent collaboration training

6. **Export Agent Profile**
   - UI Visible: Agent export options
   - Actions:
     - Select profile components to export
     - Choose export format (JSON, PDF report)
     - Include or exclude sensitive training data
     - Generate shareable agent profile
   - Next: Agent profile ready for sharing or backup

---

## Scenario 11: Cost Tracking and Budget Management

**Objective**: Monitor application costs, set budgets, and optimize LLM provider usage.

### User Actions:

1. **Access Cost Dashboard**
   - UI Visible: Cost tracking section in sidebar (displays current month cost)
   - Action: Click on cost display area
   - Next: Detailed cost analytics page opens

2. **Review Cost Breakdown**
   - UI Visible: Cost analytics dashboard
   - Information Available:
     - Daily, monthly, and total cost tracking
     - Cost breakdown by LLM provider
     - Cost allocation by feature (training, meetings, prompts)
     - Token usage statistics
     - Cost per agent training session
   - Next: Can analyze spending patterns

3. **Set Budget Limits**
   - UI Visible: Budget management interface
   - Actions:
     - Set daily spending limits
     - Configure monthly budget caps
     - Set provider-specific limits
     - Enable budget alert notifications
   - Next: Budget controls activated

4. **Optimize Provider Usage**
   - UI Visible: Provider cost comparison tools
   - Information Available:
     - Cost per token by provider
     - Performance vs. cost analysis
     - Usage recommendations
     - Alternative provider suggestions
   - Actions:
     - Adjust default provider preferences
     - Set cost-based provider selection rules
   - Next: Optimized provider usage configuration

5. **Generate Cost Reports**
   - UI Visible: Report generation interface
   - Actions:
     - Select reporting period
     - Choose cost breakdown categories
     - Include usage metrics and ROI analysis
     - Export to Excel or PDF
   - Next: Comprehensive cost report generated

---

## Scenario 12: System Administration and Configuration

**Objective**: Manage system settings, configure integrations, and maintain application health.

### User Actions:

1. **Access System Settings**
   - UI Visible: Settings icon or admin panel access
   - Action: Click system settings or admin panel
   - Next: System administration interface opens

2. **Configure LLM Provider Settings**
   - UI Visible: Provider configuration panel
   - Actions:
     - Add or remove LLM providers
     - Update API keys and endpoints
     - Set provider priority and fallback rules
     - Configure rate limits and quotas
   - Next: Provider settings updated

3. **Manage User Access and Permissions**
   - UI Visible: User management interface
   - Actions:
     - Add or remove user accounts
     - Set role-based permissions
     - Configure feature access levels
     - Set data visibility rules
   - Next: User access controls updated

4. **Configure Integration Settings**
   - UI Visible: Integration management panel
   - Actions:
     - Set up Dropbox integration credentials
     - Configure webhook endpoints
     - Set data sync frequencies
     - Enable/disable integration features
   - Next: Integrations configured and tested

5. **Monitor System Health**
   - UI Visible: System monitoring dashboard
   - Information Available:
     - API response times and availability
     - Database performance metrics
     - Error rates and system logs
     - Resource usage statistics
   - Next: Can identify and address performance issues

6. **Backup and Maintenance**
   - UI Visible: Maintenance tools interface
   - Actions:
     - Schedule automated backups
     - Run database maintenance tasks
     - Clear cache and temporary files
     - Update system configurations
   - Next: System maintenance completed

---

## Navigation Patterns and Common UI Elements

### Universal Navigation Elements:
- **Sidebar**: Always visible on desktop, collapsible on mobile
- **Mobile Menu Button**: Bottom-left floating button on mobile devices
- **Cost Indicator**: Current month spending display in sidebar
- **Toast Notifications**: Success/error messages for user actions
- **Loading States**: Progress indicators during async operations

### Common UI Patterns:
- **Modal Dialogs**: Used for forms and detailed views
- **Tabbed Interfaces**: Organize related functionality
- **Card Layouts**: Display lists of items (agents, documents, tests)
- **Progress Bars**: Show completion status
- **Badge/Tag Systems**: Categorize and label items
- **Search and Filter**: Available in list views
- **Drag-and-Drop**: For organization and workflow building

### Data Test IDs:
All interactive elements include `data-testid` attributes following the pattern:
- Buttons: `data-testid="button-{action}"`
- Links: `data-testid="link-{destination}"`
- Inputs: `data-testid="input-{field}"`
- Cards: `data-testid="card-{item-type}"`

This comprehensive scenario documentation provides detailed user journeys through all major features of the CBS Apex application, enabling thorough testing, training, and user experience optimization.