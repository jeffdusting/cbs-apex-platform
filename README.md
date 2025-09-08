# CBS-Apex Platform

> Multi-Provider AI Assistant Platform with Agent Management and Training

CBS-Apex is a sophisticated platform that enables organizations to interact with multiple Large Language Models (LLMs) simultaneously, manage AI agents with distinct personalities, conduct collaborative AI meetings, and train specialized agents through competency-based programs.

## 🚀 Features

- **Multi-Provider AI Interaction**: Simultaneous queries to OpenAI, Anthropic, Google AI, and more
- **AI Agent Management**: HBDI personality-based agents with specialized capabilities
- **Agent Training System**: Competency-based training with automated assessments
- **AI Meetings/Collaboration**: Multi-agent collaborative sessions with synthesis
- **Document Management**: Context injection from organized document libraries
- **Analytics & Monitoring**: Comprehensive cost tracking and performance metrics
- **Real-time Updates**: WebSocket-based real-time communication

## 🏗️ Architecture

This is a monorepo built with:

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes with Supabase
- **Database**: Supabase (PostgreSQL)
- **Caching**: Vercel KV (Redis)
- **Deployment**: Vercel
- **Monorepo**: Turborepo

### Project Structure

```
cbs-apex-platform/
├── apps/
│   ├── web/                    # Main Next.js application
│   ├── admin/                  # Admin dashboard
│   └── docs/                   # Documentation site
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── database/               # Supabase client and types
│   ├── providers/              # LLM provider integrations
│   └── shared/                 # Shared utilities and types
└── services/
    ├── api/                    # API route handlers
    ├── agents/                 # Agent management logic
    ├── training/               # Training system logic
    ├── meetings/               # Meeting orchestration
    └── analytics/              # Analytics and reporting
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for deployment)
- AI Provider API keys (OpenAI, Anthropic, Google)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeffdusting/cbs-apex-platform.git
   cd cbs-apex-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database setup**
   ```bash
   # Generate Supabase types
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed development data
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Main application: http://localhost:3000
- Admin dashboard: http://localhost:3001
- Documentation: http://localhost:3002
- Storybook: http://localhost:6006

## 🧪 Testing

### Test Strategy

We follow a comprehensive testing pyramid:

```
                    E2E Tests (10%)
                  ├─ User workflows
                  ├─ Integration scenarios
                  └─ Performance benchmarks

              Integration Tests (20%)
            ├─ API endpoint testing
            ├─ Database operations
            ├─ Provider integrations
            └─ WebSocket communication

          Unit Tests (70%)
        ├─ Business logic
        ├─ Utility functions
        ├─ Component behavior
        └─ Data transformations
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage
```

### Test Commands by Phase

**Phase 1: Foundation**
```bash
npm run test:unit -- --testPathPattern="auth|database"
npm run test:integration -- --testPathPattern="supabase"
npm run test:e2e -- --spec="cypress/e2e/auth.cy.ts"
```

**Phase 2: Provider Management**
```bash
npm run test:integration -- --testPathPattern="providers"
npm run test:unit -- --testPathPattern="prompts"
npm run test:e2e -- --spec="cypress/e2e/prompt-studio.cy.ts"
```

**Phase 3: Agent Management**
```bash
npm run test:unit -- --testPathPattern="agents"
npm run test:integration -- --testPathPattern="training"
npm run test:e2e -- --spec="cypress/e2e/agent-library.cy.ts"
```

**Phase 4: AI Meetings**
```bash
npm run test:unit -- --testPathPattern="meetings"
npm run test:integration -- --testPathPattern="websocket"
npm run test:e2e -- --spec="cypress/e2e/ai-meetings.cy.ts"
```

## 📦 Deployment

### Staging Deployment

Automatic deployment to staging occurs on pushes to `develop` branch:

```bash
git checkout develop
git pull origin develop
git push origin develop
```

### Production Deployment

Automatic deployment to production occurs on pushes to `main` branch:

```bash
git checkout main
git merge develop
git push origin main
```

### Manual Deployment

```bash
# Deploy to staging
vercel --target staging

# Deploy to production
vercel --prod
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `GOOGLE_AI_API_KEY`: Google AI API key

### Database Schema

The application uses Supabase with the following main tables:

- `users`: User accounts and profiles
- `agents`: AI agent configurations
- `providers`: LLM provider settings
- `training_sessions`: Agent training data
- `meetings`: AI meeting records
- `documents`: Document storage metadata

## 🚦 Development Workflow

### Feature Development

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test**
   ```bash
   npm run dev
   npm run test:unit
   npm run lint
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

4. **Create pull request**
   ```bash
   gh pr create --title "Add Your Feature" --body "Description of changes"
   ```

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library + Cypress
- **Coverage**: Minimum 80% coverage required

### Git Hooks

Pre-commit hooks automatically run:
- Linting
- Type checking
- Unit tests
- Code formatting

## 📊 Monitoring and Analytics

### Application Monitoring

- **Vercel Analytics**: Performance and usage metrics
- **Sentry**: Error tracking and performance monitoring
- **Custom Analytics**: Business metrics and user behavior

### Performance Targets

- **API Response Time**: < 200ms (95th percentile)
- **Page Load Time**: < 2 seconds
- **Prompt Processing**: < 30 seconds
- **System Availability**: > 99.9%

## 🔒 Security

### Security Measures

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row-level security (RLS) policies
- **API Security**: Rate limiting and input validation
- **Data Encryption**: Encryption at rest and in transit
- **Secrets Management**: Environment variables and Vercel secrets

### Security Auditing

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm run security:check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Follow conventional commit messages
- Maintain backwards compatibility

## 📚 Documentation

- **API Documentation**: Available at `/docs/api`
- **Component Library**: Storybook at http://localhost:6006
- **User Guide**: Available at `/docs/user-guide`
- **Architecture Decisions**: See `/docs/architecture`

## 🆘 Support

For support and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI, Anthropic, and Google for AI provider APIs
- Supabase for backend infrastructure
- Vercel for hosting and deployment
- The open-source community for tools and libraries

---

**CBS-Apex Platform** - Empowering organizations with intelligent AI collaboration.

