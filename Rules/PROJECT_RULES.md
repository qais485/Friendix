# PROJECT RULES & ENGINEERING GUIDELINES

# 1. Project Identity

Project Type:

Modern Production-Level Social Network Platform


Project Goal:

Build a scalable, secure, maintainable, and professional full-stack social network application.

The project must follow real-world software engineering standards and must be suitable as a professional portfolio project.


---

# 2. Documentation Rules

Before writing or modifying any code, you MUST read and understand:

## Rule Design.md

This file defines the visual identity and design philosophy of the project.

You MUST follow:

- Color system
- Typography
- Spacing rules
- Layout principles
- Component design philosophy
- UX principles
- Visual consistency


## Design_sample.md

This file contains:

- Component examples
- UI patterns
- Animation references
- Interaction behaviors
- Styling inspiration


You MUST use these files as the source of truth for all UI/UX decisions.

Do not copy examples blindly.

Understand the design language and apply it consistently across the application.


---

# 3. Technology Stack


# Frontend

Required:

- React
- TypeScript
- Vite
- Tailwind CSS


Libraries:

- React Router
- TanStack Query
- Zustand
- Axios
- Framer Motion
- React Hook Form
- Zod
- Lucide React


Frontend Rules:

- Use TypeScript strictly.
- Avoid using "any".
- Create reusable components.
- Follow feature-based architecture.
- Separate UI from business logic.
- Keep components small and maintainable.


---

# Backend

Required:

- Python
- FastAPI


Libraries:

- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication
- OAuth2
- WebSocket


Backend Rules:

- Follow clean architecture.
- Use REST API principles.
- Separate routes, services, repositories, and database logic.
- Keep business logic outside API routes.
- Implement proper error handling.


---

# Database

Required:

- PostgreSQL


ORM:

- SQLAlchemy


Migration:

- Alembic


Database Rules:

Every database table must include:

- id
- created_at
- updated_at


Naming convention:

Use snake_case.


Example:

Good:
user_profiles
post_comments
chat_messages



Bad:
UserProfiles
PostComments



Never modify database structure manually.

Always use migrations.


---

# Storage

Media storage:

- Cloudinary


Used for:

- Profile images
- Post images
- Videos
- User uploads


Rules:

Never store large media files directly inside backend storage.


---

# Deployment


## Development

Frontend:
Vite Development Server



Backend:
FastAPI + Uvicorn



Database:
PostgreSQL Local Environment



---

## Production


Frontend:
Vercel



Backend:
Render



Database:
Neon PostgreSQL



Storage:
Cloudinary



Future scaling:
Docker
Nginx
Redis
VPS
CI/CD



---

# 4. Frontend Architecture Rules


Recommended structure:

frontend/

src/

├── app/
│
├── components/
│ ├── ui/
│ ├── common/
│ └── layout/
│
├── features/
│
├── hooks/
│
├── services/
│
├── store/
│
├── types/
│
└── utils/



Rules:

- Organize code by feature.
- Avoid creating huge files.
- Components must have clear responsibility.
- Shared components must be reusable.


---

# 5. Backend Architecture Rules


Recommended structure:

backend/

app/

├── main.py
│
├── api/
│
├── models/
│
├── schemas/
│
├── services/
│
├── repositories/
│
├── database/
│
├── core/
│
└── utils/



Rules:

API Layer:

Responsible for:

- Receiving requests
- Validation
- Returning responses


Service Layer:

Responsible for:

- Business logic
- Application rules


Repository Layer:

Responsible for:

- Database operations


---

# 6. UI/UX Rules


All UI must follow:

- Modern SaaS design
- Minimal style
- Clean interface
- Premium feeling
- Responsive design
- Mobile-first approach


Every page must include:

- Loading state
- Empty state
- Error state
- Responsive behavior


---

# 7. Animation Rules


Animation library:
Framer Motion



Animation must be:

- Smooth
- Meaningful
- Performance friendly
- Consistent with Design_sample.md


Avoid:

- Excessive animations
- Distracting effects
- Unnecessary motion


---

# 8. Component Rules


Every component must:

- Have one responsibility.
- Be reusable.
- Have proper TypeScript types.
- Follow naming conventions.


Good:
PostCard.tsx
UserAvatar.tsx
CommentItem.tsx



Bad:
Main.tsx
Everything.tsx
Component1.tsx



---

# 9. API Rules


All APIs must have:

- Input validation
- Error handling
- Proper HTTP status codes
- Clear naming


API format:

/api/v1/resource



Example:
GET /api/v1/users

POST /api/v1/posts



---

# 10. Security Rules


The application must implement:

- Secure password hashing
- JWT authentication
- Refresh tokens
- Environment variables
- Input validation
- CORS configuration


Never:

- Store passwords directly.
- Expose secret keys.
- Put backend secrets in frontend code.


---

# 11. Code Quality Rules


Before completing any task, verify:


Frontend:

- Clean components
- Responsive UI
- Proper TypeScript usage
- No duplicated code


Backend:

- Clean services
- Proper validation
- Efficient database queries
- Clear error handling


---

# 12. AI Coding Assistant Rules


Before generating code, AI MUST:

1. Read this file completely.
2. Read existing project structure.
3. Understand current architecture.
4. Follow existing coding patterns.
5. Avoid unnecessary changes.


AI MUST NOT:

- Create duplicate implementations.
- Rewrite working code without reason.
- Add unnecessary dependencies.
- Ignore existing design rules.
- Break existing functionality.


When completing a task, AI must provide:
Changes Made:

List modified files

Implementation Summary:

What was implemented

Notes:

Important decisions or limitations



---

# 13. Git Rules


Commit messages must be meaningful.


Examples:


Good:
feat: implement authentication system

fix: resolve upload validation issue

refactor: improve database architecture



Bad:
update

changes

test



---

# Final Principle


Build this project as a real production application.

Prioritize:

- Quality over speed
- Clean architecture over shortcuts
- Maintainability over quick solutions
- Professional UI/UX over basic interfaces