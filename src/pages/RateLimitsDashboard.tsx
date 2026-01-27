/**
 * @fileoverview Rate Limits Dashboard
 * @description Combined page with tabs for rate limits and usage history.
 *
 * This component provides the complete rate limits UI with tab navigation.
 * It combines RateLimitsPage and RateLimitHistoryPage into a single component.
 */

import React, { useState } from "react";
import { cn } from "../lib/cn";
import { RateLimitsPage } from "./RateLimitsPage";
import { RateLimitHistoryPage } from "./RateLimitHistoryPage";
import type {
  RateLimitsDashboardProps,
  RateLimitsDashboardTab,
} from "../types";

// =============================================================================
// Tab Button Component
// =============================================================================

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "py-3 text-sm font-medium transition-colors",
      isActive
        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    )}
  >
    {label}
  </button>
);

// =============================================================================
// RateLimitsDashboard Component
// =============================================================================

export const RateLimitsDashboard: React.FC<RateLimitsDashboardProps> = ({
  networkClient,
  baseUrl,
  token,
  entitySlug,
  labels,
  onUpgradeClick,
  upgradeButtonLabel,
  initialTab = "limits",
  chartHeight = 350,
  className,
  testMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<RateLimitsDashboardTab>(initialTab);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          <TabButton
            label={labels.currentLimitsTab}
            isActive={activeTab === "limits"}
            onClick={() => setActiveTab("limits")}
          />
          <TabButton
            label={labels.usageHistoryTab}
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "limits" && (
        <RateLimitsPage
          networkClient={networkClient}
          baseUrl={baseUrl}
          token={token}
          entitySlug={entitySlug}
          onUpgradeClick={onUpgradeClick}
          upgradeButtonLabel={upgradeButtonLabel}
          autoFetch={true}
          testMode={testMode}
          labels={labels.limitsPage}
        />
      )}

      {activeTab === "history" && (
        <RateLimitHistoryPage
          networkClient={networkClient}
          baseUrl={baseUrl}
          token={token}
          entitySlug={entitySlug}
          autoFetch={true}
          chartHeight={chartHeight}
          testMode={testMode}
          labels={labels.historyPage}
        />
      )}
    </div>
  );
};

export default RateLimitsDashboard;
