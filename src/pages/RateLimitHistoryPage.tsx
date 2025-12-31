import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRateLimits } from "@sudobility/ratelimit_client";
import {
  UsageHistoryChart,
  type HistoryEntryData,
  type PeriodType,
} from "@sudobility/ratelimit-components";
import { cn } from "../lib/cn";
import type {
  RateLimitHistoryPageProps,
  RateLimitHistoryPageLabels,
  HistoryPeriodType,
} from "../types";

// =============================================================================
// Default Labels
// =============================================================================

const defaultLabels: Required<RateLimitHistoryPageLabels> = {
  title: "Usage History",
  loadingText: "Loading history...",
  errorText: "Failed to load history",
  retryText: "Retry",
  chartTitle: "",
  requestsLabel: "Requests",
  limitLabel: "Limit",
  noDataLabel: "No usage data available for this period",
  hourlyTab: "Hourly",
  dailyTab: "Daily",
  monthlyTab: "Monthly",
};

// =============================================================================
// Period Tab Component
// =============================================================================

interface PeriodTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const PeriodTab: React.FC<PeriodTabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
    )}
  >
    {label}
  </button>
);

// =============================================================================
// RateLimitHistoryPage Component
// =============================================================================

export const RateLimitHistoryPage: React.FC<RateLimitHistoryPageProps> = ({
  networkClient,
  baseUrl,
  token,
  labels: customLabels,
  initialPeriodType = "day",
  autoFetch = true,
  chartHeight = 300,
  className,
  barColor,
  limitLineColor,
  showLimitLine = true,
}) => {
  const labels = { ...defaultLabels, ...customLabels };
  const [selectedPeriod, setSelectedPeriod] =
    useState<HistoryPeriodType>(initialPeriodType);

  const { history, isLoadingHistory, error, refreshHistory, clearError } =
    useRateLimits(networkClient, baseUrl);

  // Fetch history on mount or when period changes
  useEffect(() => {
    if (autoFetch && token) {
      refreshHistory(selectedPeriod, token);
    }
  }, [autoFetch, token, selectedPeriod, refreshHistory]);

  // Transform history.entries to HistoryEntryData[]
  const chartEntries: HistoryEntryData[] = useMemo(() => {
    if (!history?.entries) return [];

    return history.entries.map((entry) => ({
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      requestCount: entry.requestCount,
      limit: entry.limit,
    }));
  }, [history]);

  // Handle period change
  const handlePeriodChange = useCallback((period: HistoryPeriodType) => {
    setSelectedPeriod(period);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    if (token) {
      refreshHistory(selectedPeriod, token);
    }
  }, [clearError, token, selectedPeriod, refreshHistory]);

  // Get period type for chart
  const chartPeriodType: PeriodType = selectedPeriod;

  // Loading state (only show full loading on initial load)
  if (isLoadingHistory && !history) {
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

  // Error state (only show if no stale data)
  if (error && !history) {
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

      {/* Period Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <PeriodTab
            label={labels.hourlyTab}
            isActive={selectedPeriod === "hour"}
            onClick={() => handlePeriodChange("hour")}
          />
          <PeriodTab
            label={labels.dailyTab}
            isActive={selectedPeriod === "day"}
            onClick={() => handlePeriodChange("day")}
          />
          <PeriodTab
            label={labels.monthlyTab}
            isActive={selectedPeriod === "month"}
            onClick={() => handlePeriodChange("month")}
          />
        </div>
      </div>

      {/* Loading indicator for tab switch */}
      {isLoadingHistory && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          {labels.loadingText}
        </div>
      )}

      {/* Usage History Chart */}
      <UsageHistoryChart
        entries={chartEntries}
        periodType={chartPeriodType}
        labels={{
          title: labels.chartTitle,
          requestsLabel: labels.requestsLabel,
          limitLabel: labels.limitLabel,
          noDataLabel: labels.noDataLabel,
        }}
        height={chartHeight}
        barColor={barColor}
        limitLineColor={limitLineColor}
        showLimitLine={showLimitLine}
      />
    </div>
  );
};

export default RateLimitHistoryPage;
