# Overview

This is a CBS Apex application - a multi-provider AI assistant that allows users to send prompts to multiple language model providers simultaneously and compare their responses. The application features document upload capabilities for context injection, conversation threading, token counting, cost tracking, and artifact detection for code and configuration files.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Uses tsx for development with hot reloading via Vite middleware
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **File Uploads**: Multer middleware for handling multipart form data

## Database Design
- **Provider Management**: Stores LLM provider configurations including API keys, cost tracking, and quota limits
- **Document Storage**: Handles uploaded files with metadata for context injection
- **Conversation Threading**: Maintains conversation history with prompts and responses
- **Usage Tracking**: Records token usage and costs per provider for analytics

## LLM Provider Integration
- **Multi-Provider Support**: OpenAI GPT-5, Anthropic Claude Sonnet 4, Google Gemini 2.5 Pro
- **Cost Calculation**: Real-time token counting and cost estimation per provider
- **Response Processing**: Artifact detection for code blocks, configuration files, and downloadable content
- **Error Handling**: Graceful fallback and error reporting for provider failures

## Key Features
- **Prompt Editor**: Rich text editor with token counting and cost estimation
- **Provider Selection**: Visual grid for selecting multiple LLM providers
- **Document Context**: Upload and search documents to inject as context
- **Response Comparison**: Side-by-side display of responses from different providers
- **Artifact Management**: Automatic detection and download of code artifacts
- **Conversation Threading**: Maintains conversation history with follow-up capabilities

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: TypeScript ORM for database operations with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching library
- **express**: Web application framework for the backend API

## LLM Provider SDKs
- **@anthropic-ai/sdk**: Official Anthropic Claude API client
- **@google/genai**: Google Generative AI API client for Gemini models
- **openai**: OpenAI API client (inferred from provider implementation)

## UI and Styling
- **@radix-ui/***: Headless UI component primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class name utility

## Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution engine for development
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay