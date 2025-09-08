# CBS-Apex Platform Migration Guide

## Overview

This guide outlines the migration from the legacy monolithic CBS-Apex application to the new microservice-based architecture using Next.js, Supabase, and Vercel.

## Migration Strategy

### Phase-by-Phase Approach

The migration follows a **Strangler Fig Pattern**, gradually replacing legacy components while maintaining system functionality.

## Phase 1: Foundation (Weeks 1-4)

### Objectives
- Set up new architecture foundation
- Migrate user authentication
- Establish database schema
- Create development environment

### Migration Steps

#### 1.1 Environment Setup

```bash
# Install new dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Configure with your Supabase and provider credentials

# Initialize Supabase
npm run db:generate
npm run db:migrate
```

#### 1.2 Data Migration

**Legacy Database → Supabase Migration**

```sql
-- Export legacy data
-- From legacy PostgreSQL database

-- Users migration
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  email,
  created_at,
  updated_at
FROM legacy.users;

-- Agents migration
INSERT INTO public.agents (id, user_id, name, description, personality_primary, personality_secondary, devils_advocate, supplemental_prompt, preferred_provider_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.users WHERE email = legacy.agent_library.user_email),
  name,
  description,
  personality_primary,
  personality_secondary,
  devils_advocate,
  supplemental_prompt,
  (SELECT id FROM public.providers WHERE name = legacy.agent_library.preferred_provider),
  created_at,
  updated_at
FROM legacy.agent_library;
```

#### 1.3 Authentication Migration

**Legacy Express Session → Supabase Auth**

```typescript
// Legacy authentication check
app.use((req, res, next) => {
  if (req.session?.user) {
    // User is authenticated in legacy system
    // Create corresponding Supabase user
    migrateUserToSupabase(req.session.user)
  }
  next()
})

async function migrateUserToSupabase(legacyUser: any) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: legacyUser.email,
    password: generateTemporaryPassword(),
    email_confirm: true,
    user_metadata: {
      migrated_from_legacy: true,
      legacy_user_id: legacyUser.id
    }
  })
  
  if (error) {
    console.error('User migration failed:', error)
  }
}
```

### Testing Phase 1

```bash
# Test authentication
npm run test:unit -- --testPathPattern="auth"

# Test database operations
npm run test:integration -- --testPathPattern="database"

# Test user migration
npm run test:e2e -- --spec="cypress/e2e/migration/auth.cy.ts"
```

### Success Criteria
- ✅ All legacy users migrated to Supabase
- ✅ Authentication working with new system
- ✅ Database schema established and tested
- ✅ Development environment fully functional

## Phase 2: Provider Management (Weeks 5-8)

### Objectives
- Migrate provider configurations
- Implement new provider management system
- Migrate prompt processing logic
- Establish cost tracking

### Migration Steps

#### 2.1 Provider Configuration Migration

```typescript
// Legacy provider config migration
const legacyProviders = [
  { name: 'OpenAI', type: 'openai', config: { apiKey: process.env.OPENAI_API_KEY, model: 'gpt-4' }},
  { name: 'Anthropic', type: 'anthropic', config: { apiKey: process.env.ANTHROPIC_API_KEY, model: 'claude-3-sonnet' }},
  { name: 'Google', type: 'google', config: { apiKey: process.env.GOOGLE_AI_API_KEY, model: 'gemini-pro' }}
]

// Migrate to new system
for (const provider of legacyProviders) {
  await supabase.from('providers').insert({
    name: provider.name,
    type: provider.type,
    config: provider.config,
    is_active: true,
    created_at: new Date().toISOString()
  })
}
```

#### 2.2 Prompt Processing Migration

**Legacy Express Route → Next.js API Route**

```typescript
// Legacy: server/routes/prompts.ts
app.post('/api/prompts/process', async (req, res) => {
  // Legacy implementation
})

// New: apps/web/src/app/api/prompts/process/route.ts
export async function POST(request: Request) {
  const { prompt, providers, context } = await request.json()
  
  // New implementation using provider manager
  const result = await processPrompt(prompt, providers, context)
  
  return Response.json(result)
}
```

### Testing Phase 2

```bash
# Test provider integrations
npm run test:integration -- --testPathPattern="providers"

# Test prompt processing
npm run test:unit -- --testPathPattern="prompts"

# E2E testing
npm run test:e2e -- --spec="cypress/e2e/prompt-studio.cy.ts"
```

### Success Criteria
- ✅ All providers migrated and functional
- ✅ Prompt processing working with new architecture
- ✅ Cost tracking accurate
- ✅ Response comparison interface functional

## Phase 3: Agent Management (Weeks 9-12)

### Objectives
- Migrate agent configurations
- Implement HBDI personality system
- Migrate training system
- Establish agent experience tracking

### Migration Steps

#### 3.1 Agent Data Migration

```sql
-- Migrate agent library data
INSERT INTO public.agents (
  id, user_id, name, description, 
  personality_primary, personality_secondary, 
  devils_advocate, supplemental_prompt, 
  preferred_provider_id, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  u.id as user_id,
  al.name,
  al.description,
  al.personality_primary,
  al.personality_secondary,
  al.devils_advocate,
  al.supplemental_prompt,
  p.id as preferred_provider_id,
  al.created_at,
  al.updated_at
FROM legacy.agent_library al
JOIN public.users u ON u.email = al.user_email
LEFT JOIN public.providers p ON p.name = al.preferred_provider;
```

#### 3.2 Training System Migration

```typescript
// Migrate training sessions
const legacyTrainingSessions = await getLegacyTrainingSessions()

for (const session of legacyTrainingSessions) {
  await supabase.from('training_sessions').insert({
    agent_id: session.agent_id,
    competency_id: session.competency_id,
    target_level: session.target_level,
    current_phase: session.current_phase,
    progress_percentage: session.progress_percentage,
    iterations_completed: session.iterations_completed,
    max_iterations: session.max_iterations,
    total_cost: session.total_cost,
    started_at: session.started_at,
    completed_at: session.completed_at
  })
}
```

### Testing Phase 3

```bash
# Test agent management
npm run test:unit -- --testPathPattern="agents"

# Test training system
npm run test:integration -- --testPathPattern="training"

# E2E testing
npm run test:e2e -- --spec="cypress/e2e/agent-library.cy.ts"
```

### Success Criteria
- ✅ All agents migrated with correct configurations
- ✅ HBDI personality system working
- ✅ Training system functional
- ✅ Agent experience tracking operational

## Phase 4: AI Meetings (Weeks 13-16)

### Objectives
- Migrate meeting orchestration
- Implement real-time WebSocket communication
- Migrate synthesis and reporting
- Establish analytics tracking

### Migration Steps

#### 4.1 Meeting Data Migration

```sql
-- Migrate meeting data
INSERT INTO public.meetings (
  id, user_id, name, objective, 
  agent_chain, status, started_at, 
  completed_at, total_cost, created_at
)
SELECT 
  gen_random_uuid(),
  u.id as user_id,
  ps.name,
  ps.objective,
  ps.agent_chain,
  ps.status,
  ps.started_at,
  ps.completed_at,
  ps.total_cost,
  ps.created_at
FROM legacy.prompt_sequences ps
JOIN public.users u ON u.email = ps.user_email;
```

#### 4.2 WebSocket Implementation

```typescript
// Legacy WebSocket handling
io.on('connection', (socket) => {
  // Legacy implementation
})

// New WebSocket implementation
// apps/web/src/app/api/meetings/[id]/ws/route.ts
export async function GET(request: Request) {
  // New WebSocket implementation using Vercel's WebSocket support
}
```

### Testing Phase 4

```bash
# Test meeting orchestration
npm run test:unit -- --testPathPattern="meetings"

# Test WebSocket communication
npm run test:integration -- --testPathPattern="websocket"

# E2E testing
npm run test:e2e -- --spec="cypress/e2e/ai-meetings.cy.ts"
```

### Success Criteria
- ✅ All meetings migrated successfully
- ✅ Real-time communication working
- ✅ Meeting synthesis functional
- ✅ Analytics tracking operational

## Data Migration Scripts

### Complete Migration Script

```bash
#!/bin/bash
# migration/migrate-all.sh

echo "Starting CBS-Apex Platform Migration..."

# Phase 1: Foundation
echo "Phase 1: Migrating foundation..."
npm run migrate:users
npm run migrate:auth
npm run test:phase1

# Phase 2: Providers
echo "Phase 2: Migrating providers..."
npm run migrate:providers
npm run migrate:prompts
npm run test:phase2

# Phase 3: Agents
echo "Phase 3: Migrating agents..."
npm run migrate:agents
npm run migrate:training
npm run test:phase3

# Phase 4: Meetings
echo "Phase 4: Migrating meetings..."
npm run migrate:meetings
npm run migrate:analytics
npm run test:phase4

echo "Migration completed successfully!"
```

### Rollback Strategy

```bash
#!/bin/bash
# migration/rollback.sh

echo "Rolling back migration..."

# Backup current state
npm run backup:create

# Restore legacy system
npm run legacy:restore

# Verify rollback
npm run legacy:verify

echo "Rollback completed."
```

## Testing Strategy

### Migration Testing

```typescript
// __tests__/migration/data-integrity.test.ts
describe('Data Migration Integrity', () => {
  test('all users migrated correctly', async () => {
    const legacyUserCount = await getLegacyUserCount()
    const newUserCount = await getSupabaseUserCount()
    expect(newUserCount).toBe(legacyUserCount)
  })

  test('agent configurations preserved', async () => {
    const legacyAgents = await getLegacyAgents()
    const newAgents = await getSupabaseAgents()
    
    for (const legacyAgent of legacyAgents) {
      const newAgent = newAgents.find(a => a.name === legacyAgent.name)
      expect(newAgent).toBeDefined()
      expect(newAgent.personality_primary).toBe(legacyAgent.personality_primary)
    }
  })
})
```

### Performance Testing

```typescript
// __tests__/migration/performance.test.ts
describe('Migration Performance', () => {
  test('prompt processing performance maintained', async () => {
    const startTime = Date.now()
    await processPrompt('test prompt', ['openai', 'anthropic'])
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(5000) // 5 second threshold
  })
})
```

## Monitoring Migration

### Migration Dashboard

```typescript
// Migration monitoring dashboard
const migrationMetrics = {
  usersmigrated: 0,
  agentsMigrated: 0,
  providersMigrated: 0,
  meetingsMigrated: 0,
  errors: [],
  startTime: Date.now(),
  currentPhase: 'foundation'
}

// Track migration progress
function updateMigrationProgress(phase: string, progress: number) {
  migrationMetrics.currentPhase = phase
  // Send to monitoring system
}
```

### Error Handling

```typescript
// Migration error handling
class MigrationError extends Error {
  constructor(
    message: string,
    public phase: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'MigrationError'
  }
}

async function safeMigration<T>(
  operation: () => Promise<T>,
  phase: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw new MigrationError(
      `Migration failed in ${phase}`,
      phase,
      error as Error
    )
  }
}
```

## Post-Migration Validation

### Validation Checklist

- [ ] All users can authenticate with new system
- [ ] All agents accessible and functional
- [ ] Provider integrations working correctly
- [ ] Training system operational
- [ ] Meeting orchestration functional
- [ ] Real-time features working
- [ ] Analytics and reporting accurate
- [ ] Performance meets requirements
- [ ] Security measures in place
- [ ] Monitoring and alerting active

### Performance Validation

```bash
# Performance benchmarks
npm run benchmark:prompts
npm run benchmark:agents
npm run benchmark:meetings
npm run benchmark:overall
```

### User Acceptance Testing

```bash
# Run user acceptance tests
npm run test:uat

# Generate migration report
npm run migration:report
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   ```bash
   # Reset Supabase auth
   npm run auth:reset
   # Re-migrate users
   npm run migrate:users
   ```

2. **Provider Connection Issues**
   ```bash
   # Test provider connections
   npm run providers:test
   # Update provider configurations
   npm run providers:update
   ```

3. **Data Inconsistencies**
   ```bash
   # Validate data integrity
   npm run data:validate
   # Fix inconsistencies
   npm run data:fix
   ```

### Support

For migration support:
1. Check migration logs: `npm run logs:migration`
2. Run diagnostics: `npm run diagnostics`
3. Contact development team with error details

## Conclusion

This migration guide provides a comprehensive approach to transitioning from the legacy CBS-Apex system to the new microservice architecture. Following this guide ensures minimal disruption while delivering enhanced capabilities and improved performance.

The phased approach allows for careful validation at each step, with the ability to rollback if issues are encountered. The new architecture provides better scalability, maintainability, and development velocity for future enhancements.

