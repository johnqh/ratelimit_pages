# RateLimit Pages

Self-contained rate limit pages for React applications with usage dashboards and tier comparison.

**npm**: `@sudobility/ratelimit_pages` (public)

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun
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
