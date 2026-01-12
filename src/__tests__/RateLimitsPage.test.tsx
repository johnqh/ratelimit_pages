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

// Mock the child components
vi.mock("@sudobility/ratelimit-components", () => ({
  UsageDashboard: vi.fn(({ usageBars, currentTierName }) => (
    <div data-testid="usage-dashboard">
      <span data-testid="tier-name">{currentTierName}</span>
      <span data-testid="usage-count">{usageBars.length}</span>
    </div>
  )),
  TierComparisonTable: vi.fn(({ tiers }) => (
    <div data-testid="tier-table">
      <span data-testid="tiers-count">{tiers.length}</span>
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
          labels={{ loadingText: "Custom loading..." }}
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
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
