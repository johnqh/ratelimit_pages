import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RateLimitsPage } from "../pages/RateLimitsPage";

// Mock the useRateLimits hook
const mockRefreshConfig = vi.fn();
const mockClearError = vi.fn();

vi.mock("@sudobility/ratelimit_client", () => ({
  useRateLimits: vi.fn(() => ({
    config: null,
    isLoadingConfig: false,
    error: null,
    refreshConfig: mockRefreshConfig,
    clearError: mockClearError,
  })),
}));

// Mock @sudobility/components to avoid CJS interop issues with react-helmet-async
vi.mock("@sudobility/components", () => ({
  Section: vi.fn(({ children, className }) => (
    <section className={className}>{children}</section>
  )),
}));

// Mock the child components with enhanced data exposure for testing
vi.mock("@sudobility/ratelimit-components", () => ({
  UsageDashboard: vi.fn(({ usageBars, currentTierName, labels, onUpgradeClick, upgradeButtonLabel }) => (
    <div data-testid="usage-dashboard">
      <span data-testid="tier-name">{currentTierName}</span>
      <span data-testid="usage-count">{usageBars.length}</span>
      {usageBars.map((bar: { label: string; used: number; limit: number }, i: number) => (
        <div key={i} data-testid={`usage-bar-${i}`}>
          <span data-testid={`usage-bar-${i}-label`}>{bar.label}</span>
          <span data-testid={`usage-bar-${i}-used`}>{bar.used}</span>
          <span data-testid={`usage-bar-${i}-limit`}>{bar.limit}</span>
        </div>
      ))}
      {labels?.title && <span data-testid="usage-title">{labels.title}</span>}
      {onUpgradeClick && upgradeButtonLabel && (
        <button data-testid="upgrade-button" onClick={onUpgradeClick}>
          {upgradeButtonLabel}
        </button>
      )}
    </div>
  )),
  TierComparisonTable: vi.fn(({ tiers }) => (
    <div data-testid="tier-table">
      <span data-testid="tiers-count">{tiers.length}</span>
      {tiers.map((tier: { id: string; name: string; isCurrent: boolean; hourlyLimit: number; dailyLimit: number; monthlyLimit: number }, i: number) => (
        <div key={i} data-testid={`tier-${i}`}>
          <span data-testid={`tier-${i}-name`}>{tier.name}</span>
          <span data-testid={`tier-${i}-current`}>{tier.isCurrent ? "yes" : "no"}</span>
          <span data-testid={`tier-${i}-hourly`}>{tier.hourlyLimit}</span>
          <span data-testid={`tier-${i}-daily`}>{tier.dailyLimit}</span>
          <span data-testid={`tier-${i}-monthly`}>{tier.monthlyLimit}</span>
        </div>
      ))}
    </div>
  )),
}));

import { useRateLimits } from "@sudobility/ratelimit_client";

const mockNetworkClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

const mockConfig = {
  currentUsage: {
    hourly: 50,
    daily: 500,
    monthly: 5000,
  },
  currentLimits: {
    hourly: 100,
    daily: 1000,
    monthly: 10000,
  },
  currentEntitlement: "pro",
  tiers: [
    {
      entitlement: "free",
      displayName: "Free",
      limits: { hourly: 10, daily: 100, monthly: 1000 },
    },
    {
      entitlement: "pro",
      displayName: "Pro",
      limits: { hourly: 100, daily: 1000, monthly: 10000 },
    },
  ],
};

const testLabels = {
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

describe("RateLimitsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering states", () => {
    it("should render loading state when isLoadingConfig is true and no config", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: true,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByText("Loading rate limits...")).toBeInTheDocument();
    });

    it("should render error state when error exists and no config", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: "Network error",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByText(/Failed to load rate limits/)).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should render nothing when no config and no error and not loading", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render dashboard and tier table when config is available", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByText("Rate Limits")).toBeInTheDocument();
      expect(screen.getByTestId("usage-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("tier-table")).toBeInTheDocument();
    });
  });

  describe("auto-fetch behavior", () => {
    it("should call refreshConfig on mount when autoFetch is true", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          autoFetch={true}
        />
      );

      expect(mockRefreshConfig).toHaveBeenCalledWith("test-token", "");
    });

    it("should not call refreshConfig when autoFetch is false", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          autoFetch={false}
        />
      );

      expect(mockRefreshConfig).not.toHaveBeenCalled();
    });

    it("should pass entitySlug to refreshConfig when provided", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          entitySlug="my-org"
        />
      );

      expect(mockRefreshConfig).toHaveBeenCalledWith("test-token", "my-org");
    });
  });

  describe("retry behavior", () => {
    it("should clear error and refresh when retry button is clicked", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: "Network error",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          autoFetch={false}
          labels={testLabels}
        />
      );

      fireEvent.click(screen.getByText("Retry"));

      expect(mockClearError).toHaveBeenCalled();
      expect(mockRefreshConfig).toHaveBeenCalledWith("test-token", "");
    });
  });

  describe("custom labels", () => {
    it("should use custom labels when provided", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: true,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={{ ...testLabels, loadingText: "Custom loading..." }}
        />
      );

      expect(screen.getByText("Custom loading...")).toBeInTheDocument();
    });
  });

  describe("data transformation", () => {
    it("should transform config to usageBars correctly", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      // Check that 3 usage bars are created (hourly, daily, monthly)
      expect(screen.getByTestId("usage-count")).toHaveTextContent("3");
    });

    it("should identify current tier correctly", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tier-name")).toHaveTextContent("Pro");
    });

    it("should pass correct number of tiers to TierComparisonTable", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tiers-count")).toHaveTextContent("2");
    });
  });

  describe("error banner with stale data", () => {
    it("should show error banner when error exists but config is available", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: "Refresh failed",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      // Should show both the error banner and the dashboard
      expect(screen.getByText(/Refresh failed/)).toBeInTheDocument();
      expect(screen.getByTestId("usage-dashboard")).toBeInTheDocument();
    });
  });

  describe("className prop", () => {
    it("should apply custom className to loading state", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: true,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          className="custom-class"
          labels={testLabels}
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("should render loading state with role=status and aria-label", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: true,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const statusElement = screen.getByRole("status");
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute("aria-label", "Loading rate limits...");
    });

    it("should render error state with role=alert", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: "Network error",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render retry button with aria-label", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: "Network error",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const retryButton = screen.getByText("Retry");
      expect(retryButton).toHaveAttribute("aria-label", "Retry");
    });

    it("should render usage region with aria-label", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const regions = screen.getAllByRole("region");
      const usageRegion = regions.find(
        (r) => r.getAttribute("aria-label") === "Current Usage"
      );
      expect(usageRegion).toBeInTheDocument();
    });

    it("should render tier comparison region with aria-label", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const regions = screen.getAllByRole("region");
      const tierRegion = regions.find(
        (r) => r.getAttribute("aria-label") === "Plan Comparison"
      );
      expect(tierRegion).toBeInTheDocument();
    });

    it("should render stale data error banner with role=alert", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: "Refresh failed",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Refresh failed");
    });

    it("should mark spinner as aria-hidden in loading state", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: true,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("responsive layout behavior", () => {
    it("should render usage dashboard and tier table in separate containers", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const dashboard = screen.getByTestId("usage-dashboard");
      const tierTable = screen.getByTestId("tier-table");

      // They should be in separate parent containers (regions)
      expect(dashboard.parentElement).not.toBe(tierTable.parentElement);
    });

    it("should render usage dashboard before tier table in DOM order", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const dashboard = screen.getByTestId("usage-dashboard");
      const tierTable = screen.getByTestId("tier-table");

      // Usage dashboard should come before tier table in DOM order
      const allElements = container.querySelectorAll("[data-testid]");
      const dashboardIndex = Array.from(allElements).indexOf(dashboard);
      const tierTableIndex = Array.from(allElements).indexOf(tierTable);
      expect(dashboardIndex).toBeLessThan(tierTableIndex);
    });

    it("should apply margin bottom to usage dashboard wrapper", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      const dashboard = screen.getByTestId("usage-dashboard");
      // The parent wrapper should have the mb-6 class for spacing
      expect(dashboard.parentElement).toHaveClass("mb-6");
    });

    it("should apply className to error state container", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: "Network error",
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          className="responsive-wrapper"
          labels={testLabels}
        />
      );

      expect(container.firstChild).toHaveClass("responsive-wrapper");
    });

    it("should apply className to success state container", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          className="responsive-wrapper"
          labels={testLabels}
        />
      );

      expect(container.firstChild).toHaveClass("responsive-wrapper");
    });
  });

  describe("tier comparison with different subscription states", () => {
    it("should mark the free tier as current when entitlement is free", () => {
      const freeConfig = {
        ...mockConfig,
        currentEntitlement: "free",
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: freeConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tier-name")).toHaveTextContent("Free");
      expect(screen.getByTestId("tier-0-current")).toHaveTextContent("yes");
      expect(screen.getByTestId("tier-1-current")).toHaveTextContent("no");
    });

    it("should mark the pro tier as current when entitlement is pro", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tier-name")).toHaveTextContent("Pro");
      expect(screen.getByTestId("tier-0-current")).toHaveTextContent("no");
      expect(screen.getByTestId("tier-1-current")).toHaveTextContent("yes");
    });

    it("should handle a single tier configuration", () => {
      const singleTierConfig = {
        ...mockConfig,
        currentEntitlement: "basic",
        tiers: [
          {
            entitlement: "basic",
            displayName: "Basic",
            limits: { hourly: 50, daily: 500, monthly: 5000 },
          },
        ],
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: singleTierConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tiers-count")).toHaveTextContent("1");
      expect(screen.getByTestId("tier-0-name")).toHaveTextContent("Basic");
      expect(screen.getByTestId("tier-0-current")).toHaveTextContent("yes");
    });

    it("should handle multiple tiers with enterprise tier", () => {
      const multiTierConfig = {
        ...mockConfig,
        currentEntitlement: "enterprise",
        tiers: [
          {
            entitlement: "free",
            displayName: "Free",
            limits: { hourly: 10, daily: 100, monthly: 1000 },
          },
          {
            entitlement: "pro",
            displayName: "Pro",
            limits: { hourly: 100, daily: 1000, monthly: 10000 },
          },
          {
            entitlement: "enterprise",
            displayName: "Enterprise",
            limits: { hourly: -1, daily: -1, monthly: -1 },
          },
        ],
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: multiTierConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("tiers-count")).toHaveTextContent("3");
      expect(screen.getByTestId("tier-name")).toHaveTextContent("Enterprise");
      expect(screen.getByTestId("tier-0-current")).toHaveTextContent("no");
      expect(screen.getByTestId("tier-1-current")).toHaveTextContent("no");
      expect(screen.getByTestId("tier-2-current")).toHaveTextContent("yes");
      expect(screen.getByTestId("tier-2-hourly")).toHaveTextContent("-1");
    });

    it("should display correct tier limits for each tier", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      // Free tier limits
      expect(screen.getByTestId("tier-0-hourly")).toHaveTextContent("10");
      expect(screen.getByTestId("tier-0-daily")).toHaveTextContent("100");
      expect(screen.getByTestId("tier-0-monthly")).toHaveTextContent("1000");

      // Pro tier limits
      expect(screen.getByTestId("tier-1-hourly")).toHaveTextContent("100");
      expect(screen.getByTestId("tier-1-daily")).toHaveTextContent("1000");
      expect(screen.getByTestId("tier-1-monthly")).toHaveTextContent("10000");
    });

    it("should handle unknown entitlement with no matching tier", () => {
      const unknownEntitlementConfig = {
        ...mockConfig,
        currentEntitlement: "unknown_tier",
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: unknownEntitlementConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      // No tier should be marked as current
      expect(screen.getByTestId("tier-0-current")).toHaveTextContent("no");
      expect(screen.getByTestId("tier-1-current")).toHaveTextContent("no");
      // Current tier name should be empty since no match
      expect(screen.getByTestId("tier-name")).toHaveTextContent("");
    });
  });

  describe("usage data display", () => {
    it("should display correct usage values for each period", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      // Hourly
      expect(screen.getByTestId("usage-bar-0-label")).toHaveTextContent("Hourly");
      expect(screen.getByTestId("usage-bar-0-used")).toHaveTextContent("50");
      expect(screen.getByTestId("usage-bar-0-limit")).toHaveTextContent("100");

      // Daily
      expect(screen.getByTestId("usage-bar-1-label")).toHaveTextContent("Daily");
      expect(screen.getByTestId("usage-bar-1-used")).toHaveTextContent("500");
      expect(screen.getByTestId("usage-bar-1-limit")).toHaveTextContent("1000");

      // Monthly
      expect(screen.getByTestId("usage-bar-2-label")).toHaveTextContent("Monthly");
      expect(screen.getByTestId("usage-bar-2-used")).toHaveTextContent("5000");
      expect(screen.getByTestId("usage-bar-2-limit")).toHaveTextContent("10000");
    });

    it("should handle zero usage values", () => {
      const zeroUsageConfig = {
        ...mockConfig,
        currentUsage: { hourly: 0, daily: 0, monthly: 0 },
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: zeroUsageConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("usage-bar-0-used")).toHaveTextContent("0");
      expect(screen.getByTestId("usage-bar-1-used")).toHaveTextContent("0");
      expect(screen.getByTestId("usage-bar-2-used")).toHaveTextContent("0");
    });

    it("should handle usage at limit", () => {
      const atLimitConfig = {
        ...mockConfig,
        currentUsage: { hourly: 100, daily: 1000, monthly: 10000 },
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: atLimitConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("usage-bar-0-used")).toHaveTextContent("100");
      expect(screen.getByTestId("usage-bar-0-limit")).toHaveTextContent("100");
      expect(screen.getByTestId("usage-bar-1-used")).toHaveTextContent("1000");
      expect(screen.getByTestId("usage-bar-1-limit")).toHaveTextContent("1000");
    });

    it("should handle usage exceeding limit", () => {
      const overLimitConfig = {
        ...mockConfig,
        currentUsage: { hourly: 150, daily: 1500, monthly: 15000 },
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: overLimitConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("usage-bar-0-used")).toHaveTextContent("150");
      expect(screen.getByTestId("usage-bar-0-limit")).toHaveTextContent("100");
    });

    it("should pass usage title label to UsageDashboard", () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: mockConfig,
        isLoadingConfig: false,
        error: null,
        refreshConfig: mockRefreshConfig,
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: vi.fn(),
        reset: vi.fn(),
      });

      render(
        <RateLimitsPage
          networkClient={mockNetworkClient}
          baseUrl="https://api.example.com"
          token="test-token"
          labels={testLabels}
        />
      );

      expect(screen.getByTestId("usage-title")).toHaveTextContent("Current Usage");
    });
  });
});
