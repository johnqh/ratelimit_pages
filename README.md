# @sudobility/ratelimit_pages

Self-contained rate limit page components for React applications with usage dashboards and tier comparison.

## Installation

```bash
bun add @sudobility/ratelimit_pages
```

### Peer Dependencies

- `react` >= 18.0.0, `react-dom` >= 18.0.0
- `@sudobility/types`, `@sudobility/design`, `@sudobility/components`
- `@sudobility/ratelimit_client`, `@sudobility/ratelimit-components`

## Usage

```tsx
import { RateLimitsPage, RateLimitHistoryPage, RateLimitsDashboard } from '@sudobility/ratelimit_pages';

<RateLimitsPage
  networkClient={networkClient}
  baseUrl="https://api.example.com"
  token={authToken}
  entitySlug="my-org"
  autoFetch={true}
/>
```

## API

### Page Components

| Component | Description |
|-----------|-------------|
| `RateLimitsPage` | Usage dashboard with tier comparison (usage bars, auto-refresh, error handling) |
| `RateLimitHistoryPage` | Historical usage data view |
| `RateLimitsDashboard` | Tabbed dashboard combining pages |

### RateLimitsPageProps

```typescript
interface RateLimitsPageProps {
  networkClient: NetworkClient;
  baseUrl: string;
  token: string;
  entitySlug?: string;
  autoFetch?: boolean;     // Default: true
  className?: string;
  labels?: RateLimitsPageLabels;
}
```

### Type Exports

`FirebaseIdToken`, `RateLimitsPageLabels`, `RateLimitsPageProps`, `HistoryPeriodType`,
`RateLimitHistoryPageLabels`, `RateLimitHistoryPageProps`, `RateLimitsDashboardTab`,
`RateLimitsDashboardLabels`, `RateLimitsDashboardProps`

### Utilities

`cn` -- class name merge utility

## Development

```bash
bun run build        # Build with Vite (tsc + vite build)
bun run dev          # Watch mode build
bun run type-check   # TypeScript check (note: hyphenated)
bun run lint         # Run ESLint
bun run test         # Run tests once
bun run test:watch   # Watch mode tests
```

Pre-commit:

```bash
bun run type-check && bun run lint && bun run test && bun run build
```

## License

BUSL-1.1
