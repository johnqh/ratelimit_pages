/**
 * Types for ratelimit-pages
 */

import type { NetworkClient } from "@sudobility/types";

// =============================================================================
// Common Types
// =============================================================================

/**
 * Firebase ID token for authentication
 */
export type FirebaseIdToken = string | null;

// =============================================================================
// RateLimitsPage Types
// =============================================================================

/**
 * Labels for RateLimitsPage localization
 */
export interface RateLimitsPageLabels {
  /** Page title */
  title?: string;
  /** Loading state text */
  loadingText?: string;
  /** Error state text */
  errorText?: string;
  /** Retry button text */
  retryText?: string;
  /** Usage section title */
  usageTitle?: string;
  /** Tiers section title */
  tiersTitle?: string;
  /** Label for "used" count */
  usedLabel?: string;
  /** Label for "limit" */
  limitLabel?: string;
  /** Text for unlimited */
  unlimitedLabel?: string;
  /** Label for remaining count */
  remainingLabel?: string;
  /** Hourly period label */
  hourlyLabel?: string;
  /** Daily period label */
  dailyLabel?: string;
  /** Monthly period label */
  monthlyLabel?: string;
  /** Current tier badge */
  currentTierBadge?: string;
}

/**
 * Props for RateLimitsPage component
 */
export interface RateLimitsPageProps {
  /** Network client for API calls */
  networkClient: NetworkClient;
  /** Base URL for rate limit API */
  baseUrl: string;
  /** Firebase ID token for authentication */
  token: FirebaseIdToken;
  /** Labels for localization */
  labels?: RateLimitsPageLabels;
  /** Callback when upgrade is clicked (shows upgrade button if provided) */
  onUpgradeClick?: () => void;
  /** Upgrade button label */
  upgradeButtonLabel?: string;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Auto-refresh interval in milliseconds (0 = disabled) */
  refreshInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// RateLimitHistoryPage Types
// =============================================================================

/**
 * Period type for history display
 */
export type HistoryPeriodType = "hour" | "day" | "month";

/**
 * Labels for RateLimitHistoryPage localization
 */
export interface RateLimitHistoryPageLabels {
  /** Page title */
  title?: string;
  /** Loading state text */
  loadingText?: string;
  /** Error state text */
  errorText?: string;
  /** Retry button text */
  retryText?: string;
  /** Chart title */
  chartTitle?: string;
  /** Requests label */
  requestsLabel?: string;
  /** Limit label */
  limitLabel?: string;
  /** No data label */
  noDataLabel?: string;
  /** Hourly tab label */
  hourlyTab?: string;
  /** Daily tab label */
  dailyTab?: string;
  /** Monthly tab label */
  monthlyTab?: string;
}

/**
 * Props for RateLimitHistoryPage component
 */
export interface RateLimitHistoryPageProps {
  /** Network client for API calls */
  networkClient: NetworkClient;
  /** Base URL for rate limit API */
  baseUrl: string;
  /** Firebase ID token for authentication */
  token: FirebaseIdToken;
  /** Labels for localization */
  labels?: RateLimitHistoryPageLabels;
  /** Initial period type selection */
  initialPeriodType?: HistoryPeriodType;
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Chart height in pixels */
  chartHeight?: number;
  /** Additional CSS classes */
  className?: string;
  /** Bar color for the chart */
  barColor?: string;
  /** Limit line color for the chart */
  limitLineColor?: string;
  /** Whether to show limit line */
  showLimitLine?: boolean;
}
