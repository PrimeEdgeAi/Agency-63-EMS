# Agency-63-EMS

Agency-63-EMS is a React + TypeScript portal for managing event submissions, approvals, recce checks, finance requests, and role-based dashboards.

## Tech stack

- React 19
- TypeScript
- Vite
- Supabase for authentication and storage-backed workflows
- GH Pages for deployment

## Project skeleton

- src/App.tsx: application shell, auth gate, routing, and role-based dashboard switching
- src/components/: UI sections split by feature
  - auth/: login experience
  - dashboard/: overview screen
  - events/: event listing and creation flow
  - finance/: pay request screens
  - recce/: site inspection flow
  - settings/: user settings
  - help/: support/help area
  - layout/: shared sidebar and navigation
  - modules/: reusable module-driven experience for Alcoholic and Non-Alcoholic flows
  - ui/: shared input, button, card, modal, and layout building blocks
- src/data/: data access and workflow helpers for events, recce, pay requests, and approvals
- src/lib/: shared utilities such as Supabase access and audit logging
- src/types/: shared application types
- src/admin/, src/manager/, src/finance/: feature-specific dashboard areas for different roles
- public/: static assets such as logos and images

## Folder conventions

- Keep feature screens under src/components/<feature>/
- Keep reusable forms under src/components/modules/forms/
- Keep module-specific mock content and metadata under src/components/modules/<Module>/types/
- Keep shared UI primitives in src/components/ui/
- Keep app-wide types in src/types/

## Local development

```bash
npm install
npm run dev
```

## Build and deploy

```bash
npm run build
npm run deploy
```

## Notes

- The app uses a role-based entry model. Admin, manager, and finance users are routed to dedicated dashboards.
- Module-based screens are organized around reusable forms and shared components so new workflows can be added without scattering logic.
