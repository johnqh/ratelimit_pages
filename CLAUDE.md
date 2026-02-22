# RateLimit Pages

Self-contained rate limit pages for React applications with usage dashboards and tier comparison.

**npm**: `@sudobility/ratelimit_pages` (public)

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Package Manager**: Bun (do not use npm/yarn/pnpm for installing dependencies)
- **Build**: Vite (library mode, ESM + UMD)
- **Test**: Vitest
- **UI**: Requires @sudobility/ratelimit-components

## Project Structure

```
src/
├── index.ts          # Public exports
├── types.ts          # Page-specific types
├── lib/              # Utility functions
│   └── utils.ts      # Helper utilities
├── pages/            # Page components
│   ├── index.ts      # Page exports
│   └── RateLimitsPage.tsx  # Main rate limits page
└── __tests__/        # Test files
    └── RateLimitsPage.test.tsx
```

## Commands

```bash
bun run build        # Build with Vite (tsc + vite build)
bun run dev          # Watch mode build
bun run type-check   # TypeScript check
bun run lint         # Run ESLint
bun run lint:fix     # Fix lint issues
bun run format       # Format with Prettier
bun run test         # Run tests once
bun run test:watch   # Watch mode tests
```

## Pages

| Page | Purpose |
|------|---------|
| `RateLimitsPage` | Usage dashboard with tier comparison |

## Usage

```tsx
import { RateLimitsPage } from '@sudobility/ratelimit_pages';

<RateLimitsPage
  networkClient={networkClient}
  baseUrl="https://api.example.com"
  token={authToken}
  entitySlug="my-org"
  autoFetch={true}
/>
```

## Props

```typescript
interface RateLimitsPageProps {
  networkClient: NetworkClient;
  baseUrl: string;
  token: string;
  entitySlug?: string;
  autoFetch?: boolean;     // Default: true
  className?: string;
  labels?: {
    loadingText?: string;
    errorText?: string;
    retryText?: string;
  };
}
```

## Features

- Usage bars (hourly, daily, monthly)
- Tier comparison table
- Auto-refresh on mount
- Error handling with retry
- Loading states
- Customizable labels

## Peer Dependencies

Required in consuming app:
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@sudobility/types` - Common types
- `@sudobility/design` - Design tokens
- `@sudobility/components` - Base components
- `@sudobility/ratelimit_client` - Data hooks
- `@sudobility/ratelimit-components` - UI components

## Publishing

```bash
bun run build        # Build first
npm publish          # Publish to npm
```

## Architecture

```
ratelimit_pages (this package)
    ├── ratelimit_client (data layer)
    └── ratelimit-components (UI layer)
        ↑
shapeshyft_app (consumes pages)
sudojo_app (consumes pages)
```

## Testing

Uses Vitest with React Testing Library:

```bash
bun run test         # Single run
bun run test:watch   # Watch mode
```

Test patterns:
- Mock useRateLimits hook
- Mock child components
- Test rendering states (loading, error, success)
- Test auto-fetch behavior
- Test retry functionality

## Workspace Context

This project is part of the **ShapeShyft** multi-project workspace at the parent directory. See `../CLAUDE.md` for the full architecture, dependency graph, and build order.

## Downstream Impact

| Downstream Consumer | Relationship |
|---------------------|-------------|
| `shapeshyft_app` | Direct dependency - renders rate limit dashboard pages |

After making changes:
1. Run checks (no `verify` script - see below)
2. `npm publish`
3. In `shapeshyft_app`: `bun update @sudobility/ratelimit_pages` -> rebuild

## Local Dev Workflow

```bash
# In this project:
bun link

# In shapeshyft_app:
bun link @sudobility/ratelimit_pages

# If also changing ratelimit_client, link it first:
cd ../ratelimit_client && bun link
cd ../ratelimit_pages && bun link @sudobility/ratelimit_client

# Rebuild after changes:
bun run build

# When done, unlink:
bun unlink @sudobility/ratelimit_pages && bun install
```

## Pre-Commit Checklist

No `verify` script. Run checks manually:

```bash
bun run type-check && bun run lint && bun run test && bun run build
```

## Gotchas

- **Typecheck command is `type-check` (hyphenated)** -- differs from most other workspace projects which use `typecheck`. Running `bun run typecheck` will silently do nothing.
- **Vite library mode build** -- produces ESM + UMD. Build is `tsc && vite build`.
- **`ratelimit_client` is in `peerDependenciesMeta`** -- it's required but listed in the meta section, not main `peerDependencies`. Check both when debugging dependency issues.
- **UI components come from `@sudobility/ratelimit-components`** (note the hyphen) -- separate package from this one.
