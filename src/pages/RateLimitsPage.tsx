import React, { useCallback, useEffect, useMemo } from "react";
import { useRateLimits } from "@sudobility/ratelimit_client";
import {
  UsageDashboard,
  TierComparisonTable,
  type UsageBarConfig,
  type TierDisplayData,
} from "@sudobility/ratelimit-components";
import { cn } from "../lib/cn";
import type { RateLimitsPageProps, RateLimitsPageLabels } from "../types";

// =============================================================================
// Default Labels
// =============================================================================

const defaultLabels: Required<RateLimitsPageLabels> = {
  title: "Rate Limits",
  loadingText: "Loading rate limits...",
  errorText: "Failed to load rate limits",
  retryText: "Retry",
  usageTitle: "Current Usage",
  tiersTitle: "Plan Comparison",
  usedLabel: "used",
  limitLabel: "limit",
  unlimitedLabel: "Unlimited",
  remainingLabel: "remaining",
  hourlyLabel: "Hourly",
  dailyLabel: "Daily",
  monthlyLabel: "Monthly",
  currentTierBadge: "Current",
};

// =============================================================================
// RateLimitsPage Component
// =============================================================================

export const RateLimitsPage: React.FC<RateLimitsPageProps> = ({
  networkClient,
  baseUrl,
  token,
  entitySlug,
  labels: customLabels,
  onUpgradeClick,
  upgradeButtonLabel,
  autoFetch = true,
  refreshInterval = 0,
  className,
}) => {
  const labels = useMemo(
    () => ({ ...defaultLabels, ...customLabels }),
    [customLabels],
  );

  const { config, isLoadingConfig, error, refreshConfig, clearError } =
    useRateLimits(networkClient, baseUrl);

  // Fetch config on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch && token) {
      refreshConfig(token, entitySlug ?? "");
    }
  }, [autoFetch, token, entitySlug, refreshConfig]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0 && token) {
      const intervalId = setInterval(() => {
        refreshConfig(token, entitySlug ?? "");
      }, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, token, entitySlug, refreshConfig]);

  // Transform config to UsageBarConfig[]
  const usageBars: UsageBarConfig[] = useMemo(() => {
    if (!config) return [];

    return [
      {
        label: labels.hourlyLabel,
        used: config.currentUsage.hourly,
        limit: config.currentLimits.hourly,
      },
      {
        label: labels.dailyLabel,
        used: config.currentUsage.daily,
        limit: config.currentLimits.daily,
      },
      {
        label: labels.monthlyLabel,
        used: config.currentUsage.monthly,
        limit: config.currentLimits.monthly,
      },
    ];
  }, [config, labels]);

  // Transform config.tiers to TierDisplayData[]
  const tiers: TierDisplayData[] = useMemo(() => {
    if (!config) return [];

    return config.tiers.map((tier) => ({
      id: tier.entitlement,
      name: tier.displayName,
      hourlyLimit: tier.limits.hourly,
      dailyLimit: tier.limits.daily,
      monthlyLimit: tier.limits.monthly,
      isCurrent: tier.entitlement === config.currentEntitlement,
    }));
  }, [config]);

  // Get current tier display name
  const currentTierName = useMemo(() => {
    if (!config) return undefined;
    const currentTier = config.tiers.find(
      (t) => t.entitlement === config.currentEntitlement,
    );
    return currentTier?.displayName;
  }, [config]);

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    if (token) {
      refreshConfig(token, entitySlug ?? "");
    }
  }, [clearError, token, entitySlug, refreshConfig]);

  // Loading state
  if (isLoadingConfig && !config) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {labels.loadingText}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !config) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-12 dark:border-red-900/50 dark:bg-red-900/10",
          className,
        )}
      >
        <p className="text-sm text-red-600 dark:text-red-400">
          {labels.errorText}: {error}
        </p>
        <button
          onClick={handleRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {labels.retryText}
        </button>
      </div>
    );
  }

  // No config state
  if (!config) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {labels.title}
      </h2>

      {/* Error banner (if error but we have stale data) */}
      {error && (
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {labels.errorText}: {error}
          </p>
        </div>
      )}

      {/* Usage Dashboard */}
      <UsageDashboard
        usageBars={usageBars}
        currentTierName={currentTierName}
        labels={{
          title: labels.usageTitle,
          usedLabel: labels.usedLabel,
          limitLabel: labels.limitLabel,
          unlimitedLabel: labels.unlimitedLabel,
          remainingLabel: labels.remainingLabel,
        }}
        onUpgradeClick={onUpgradeClick}
        upgradeButtonLabel={upgradeButtonLabel}
      />

      {/* Tier Comparison Table */}
      <TierComparisonTable
        tiers={tiers}
        labels={{
          title: labels.tiersTitle,
          hourlyHeader: labels.hourlyLabel,
          dailyHeader: labels.dailyLabel,
          monthlyHeader: labels.monthlyLabel,
          unlimitedLabel: labels.unlimitedLabel,
          currentTierBadge: labels.currentTierBadge,
        }}
      />
    </div>
  );
};

export default RateLimitsPage;
