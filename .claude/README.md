# PlumberPro Claude Project Configuration

This `.claude` folder contains agents and skills for building PlumberPro, an AI receptionist service for plumbing businesses.

## Project Overview

PlumberPro creates 24/7 AI receptionists that:
- Answer customer inquiries via text and voice widgets
- Classify urgency (emergency vs routine)
- Capture leads with structured data
- Route to appropriate workflows
- Provide plumbers with dashboard to manage leads

## How to Use These Files

### Agents
Each agent in `/agents` is a specialized persona for different aspects of the project:
- **plumber-receptionist.md** - For conversational AI and prompt engineering
- **lead-qualifier.md** - For lead classification and routing logic
- **dashboard-builder.md** - For building the plumber-facing dashboard

When working on a specific feature, reference the appropriate agent.

### Skills
Each skill in `/skills` contains domain knowledge:
- **supabase-schema.md** - Database structure and common queries
- **openai-prompts.md** - Prompt templates and function calling
- **widget-patterns.md** - UI/UX patterns for the customer-facing widget
- **n8n-workflows.md** - Automation workflow designs

Reference these when implementing features.

## Current Status

**✅ Completed:**
- Project setup (Next.js, TypeScript, Supabase)
- Database schema
- Text widget UI
- Basic chat API with OpenAI

**🚧 In Progress:**
- Text widget testing and refinement

**📅 Upcoming:**
- Plumber dashboard
- Voice widget (OpenAI Realtime API)
- n8n integration for notifications
- Deployment

## Key Decisions

1. **Tech Stack:** Next.js 14 for full-stack simplicity
2. **Database:** Supabase for real-time and easy RLS
3. **AI:** OpenAI for both text (GPT-4) and voice (Realtime API)
4. **Orchestration:** n8n for flexible workflow automation
5. **Architecture:** Multi-tenant with client isolation via RLS

## Quick Commands
```bash
# Start dev server
npm run dev

# Run Supabase locally (if needed)
npx supabase start

# Deploy to Vercel
vercel deploy
```
