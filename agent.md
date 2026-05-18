# Agent Context - HireFy

This document defines the operational context, capabilities, and guidelines for AI agents working with the HireFy codebase.

---

## Agent Identity

**Role:** Full-stack software engineering assistant  
**Specialization:** Django/DRF backend + React/TypeScript frontend development  
**Primary Mode:** Interactive CLI tool for real-time code generation and debugging  

---

## System Architecture

### Backend Stack
- **Framework:** Django 5.x + Django REST Framework
- **Routing:** DefaultRouter with ViewSets for CRUD operations
- **Authentication:** JWT via SimpleJWT (`Authorization: Bearer <token>`)
- **Database:** SQLite (dev) → MySQL/PostgreSQL (production)
- **Structure:** `apps/users/` for auth and profiles

### Frontend Stack
- **Framework:** React 18 + TypeScript + Vite
- **Routing:** wouter (lightweight)
- **State:** Tanstack Query (async state + API cache)
- **UI:** Shadcn/UI (Radix + Tailwind CSS)
- **Structure:**
  - `src/components/ui/` - atomic components
  - `src/pages/` - route components
  - `src/hooks/` - custom hooks
  - `src/lib/utils.ts` - CSS utilities (cn, clsx)

---

## Code Conventions

### Python/Django
| Pattern | Rule |
|---------|------|
| Serializers | Use `ModelSerializer` for JSON mapping |
| Views | Prefer `ViewSets` over `APIView` |
| Naming | snake_case for fields/functions |
| Permissions | Always add (`IsAuthenticated`, `IsAdminUser`, etc.) |

### TypeScript/React
| Pattern | Rule |
|---------|------|
| Components | Functional + Arrow Functions |
| Styling | Tailwind CSS only (no inline CSS) |
| Typing | Strict mode - avoid `any` |
| Data Fetching | `useQuery` / `useMutation` from `@tanstack/react-query` |
| Routing | wouter hooks (`useRoute`, `useLocation`) |

---

## Available Tools

### File Operations
- **read** - Read file contents (with line numbers)
- **write** - Create/overwrite files
- **edit** - Exact string replacement in files

### Code Analysis
- **grep** - Content search with regex
- **glob** - File pattern matching
- **task** - Launch sub-agents for research

### Execution
- **bash** - Run shell commands
- **webfetch** - Fetch external URLs
- **websearch** - Web search queries

### Project Management
- **todowrite** - Task tracking
- **question** - Interactive prompts

---

## Operational Guidelines

### Before Writing Code
1. Analyze existing patterns in the codebase
2. Check `src/components/ui/` for reusable components
3. Verify existing types/interfaces before creating new ones
4. Look at similar files for naming conventions

### After Writing Code
1. Run lint/typecheck if available
2. Verify imports are correct
3. Ensure no secrets are exposed

### Tool Usage Order
1. **Read/Glob/Grep** - Understand the problem
2. **Write/Edit** - Implement the solution
3. **Bash** - Verify (tests, lint, typecheck)

---

## Restrictions

### Security
- Never commit secrets, keys, or credentials
- Use environment variables (`.env`) for sensitive data
- Never log passwords or tokens

### Dependencies
- Avoid adding heavy libraries if lightweight alternatives exist
- Check `package.json` / `requirements.txt` before assuming availability

### UI Components
- Do NOT modify `src/components/ui/` files directly unless for global theming
- Create new components in appropriate directories

---

## Command Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start frontend dev server |
| `python manage.py runserver` | Start backend server |
| `npm run lint` | Run frontend linting |
| `python manage.py test` | Run backend tests |

---

## Context Format

When prompting this agent, use:

```
[action] [target] [details]

Example:
- "_create_ _frontend/src/pages/login.tsx_ _with email/password fields_"
- "_find_ _all usages of useAuth hook_"
- "_explain_ _how JWT authentication works in this project_"
```

---

_Last updated: May 2026_