import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RateLimitHistoryPage } from '../pages/RateLimitHistoryPage';

// Mock the useRateLimits hook
const mockRefreshHistory = vi.fn();
const mockClearError = vi.fn();

vi.mock('@sudobility/ratelimit_client', () => ({
  useRateLimits: vi.fn(() => ({
    config: null,
    isLoadingConfig: false,
    error: null,
    refreshConfig: vi.fn(),
    clearError: mockClearError,
    history: null,
    isLoadingHistory: false,
    refreshHistory: mockRefreshHistory,
    reset: vi.fn(),
  })),
}));

// Mock @sudobility/components to avoid CJS interop issues with react-helmet-async
vi.mock('@sudobility/components', () => ({
  Section: vi.fn(({ children, className }) => (
    <section className={className}>{children}</section>
  )),
}));

// Mock the child components
vi.mock('@sudobility/ratelimit-components', () => ({
  UsageHistoryChart: vi.fn(({ entries, periodType, labels, height }) => (
    <div data-testid='usage-history-chart'>
      <span data-testid='chart-entries-count'>{entries.length}</span>
      <span data-testid='chart-period-type'>{periodType}</span>
      <span data-testid='chart-title'>{labels?.title}</span>
      <span data-testid='chart-height'>{height}</span>
      {entries.map(
        (
          entry: { periodStart: string; requestCount: number; limit: number },
          i: number
        ) => (
          <div key={i} data-testid={`chart-entry-${i}`}>
            <span data-testid={`chart-entry-${i}-count`}>
              {entry.requestCount}
            </span>
            <span data-testid={`chart-entry-${i}-limit`}>{entry.limit}</span>
          </div>
        )
      )}
    </div>
  )),
}));

import { useRateLimits } from '@sudobility/ratelimit_client';

const mockNetworkClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

const testLabels = {
  title: 'Usage History',
  loadingText: 'Loading history...',
  errorText: 'Failed to load history',
  retryText: 'Retry',
  chartTitle: 'Usage Chart',
  requestsLabel: 'Requests',
  limitLabel: 'Limit',
  noDataLabel: 'No data available',
  hourlyTab: 'Hourly',
  dailyTab: 'Daily',
  monthlyTab: 'Monthly',
};

const mockHistory = {
  periodType: 'day' as const,
  entries: [
    {
      periodStart: '2025-01-01T00:00:00Z',
      periodEnd: '2025-01-01T23:59:59Z',
      requestCount: 450,
      limit: 1000,
    },
    {
      periodStart: '2025-01-02T00:00:00Z',
      periodEnd: '2025-01-02T23:59:59Z',
      requestCount: 780,
      limit: 1000,
    },
    {
      periodStart: '2025-01-03T00:00:00Z',
      periodEnd: '2025-01-03T23:59:59Z',
      requestCount: 320,
      limit: 1000,
    },
  ],
};

describe('RateLimitHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering states', () => {
    it('should render loading state when isLoadingHistory is true and no history', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: true,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByText('Loading history...')).toBeInTheDocument();
    });

    it('should render error state when error exists and no history', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: 'Network error',
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByText(/Failed to load history/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should render chart when history data is available', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByText('Usage History')).toBeInTheDocument();
      expect(screen.getByTestId('usage-history-chart')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should render loading state with role=status and aria-label', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: true,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-label', 'Loading history...');
    });

    it('should render error state with role=alert', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: 'Network error',
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render period tabs with role=tablist', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should render individual period tabs with role=tab and aria-selected', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      // Default is "day", so Daily tab should be selected
      const dailyTab = tabs.find(t => t.textContent === 'Daily');
      expect(dailyTab).toHaveAttribute('aria-selected', 'true');

      const hourlyTab = tabs.find(t => t.textContent === 'Hourly');
      expect(hourlyTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should render chart area with role=tabpanel', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should render stale data error banner with role=alert', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: 'Refresh failed',
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Refresh failed');
    });

    it('should mark spinner as aria-hidden in loading state', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: true,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      const { container } = render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('usage history display', () => {
    it('should display correct number of history entries', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByTestId('chart-entries-count')).toHaveTextContent('3');
    });

    it('should display correct request counts per entry', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByTestId('chart-entry-0-count')).toHaveTextContent(
        '450'
      );
      expect(screen.getByTestId('chart-entry-1-count')).toHaveTextContent(
        '780'
      );
      expect(screen.getByTestId('chart-entry-2-count')).toHaveTextContent(
        '320'
      );
    });

    it('should display correct limit per entry', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByTestId('chart-entry-0-limit')).toHaveTextContent(
        '1000'
      );
      expect(screen.getByTestId('chart-entry-1-limit')).toHaveTextContent(
        '1000'
      );
    });

    it('should pass correct period type to chart', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByTestId('chart-period-type')).toHaveTextContent('day');
    });

    it('should handle empty history entries', () => {
      const emptyHistory = {
        periodType: 'day' as const,
        entries: [],
      };

      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: emptyHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByTestId('chart-entries-count')).toHaveTextContent('0');
    });

    it('should pass custom chart height', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
          chartHeight={500}
        />
      );

      expect(screen.getByTestId('chart-height')).toHaveTextContent('500');
    });
  });

  describe('period tab switching', () => {
    it('should switch to hourly period when hourly tab is clicked', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      fireEvent.click(screen.getByText('Hourly'));

      expect(screen.getByTestId('chart-period-type')).toHaveTextContent('hour');
    });

    it('should switch to monthly period when monthly tab is clicked', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      fireEvent.click(screen.getByText('Monthly'));

      expect(screen.getByTestId('chart-period-type')).toHaveTextContent(
        'month'
      );
    });

    it('should update aria-selected when switching tabs', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      // Initially Daily is selected
      const tabs = screen.getAllByRole('tab');
      const hourlyTab = tabs.find(t => t.textContent === 'Hourly')!;
      const dailyTab = tabs.find(t => t.textContent === 'Daily')!;

      expect(dailyTab).toHaveAttribute('aria-selected', 'true');
      expect(hourlyTab).toHaveAttribute('aria-selected', 'false');

      // Click hourly tab
      fireEvent.click(hourlyTab);

      expect(hourlyTab).toHaveAttribute('aria-selected', 'true');
      expect(dailyTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should call refreshHistory with new period on tab change', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      mockRefreshHistory.mockClear();
      fireEvent.click(screen.getByText('Hourly'));

      expect(mockRefreshHistory).toHaveBeenCalledWith('hour', 'test-token', '');
    });

    it('should use initialPeriodType when provided', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
          initialPeriodType='month'
        />
      );

      const tabs = screen.getAllByRole('tab');
      const monthlyTab = tabs.find(t => t.textContent === 'Monthly')!;
      expect(monthlyTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('chart-period-type')).toHaveTextContent(
        'month'
      );
    });
  });

  describe('auto-fetch behavior', () => {
    it('should call refreshHistory on mount when autoFetch is true', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
          autoFetch={true}
        />
      );

      expect(mockRefreshHistory).toHaveBeenCalledWith('day', 'test-token', '');
    });

    it('should not call refreshHistory when autoFetch is false', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
          autoFetch={false}
        />
      );

      expect(mockRefreshHistory).not.toHaveBeenCalled();
    });

    it('should pass entitySlug to refreshHistory when provided', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: null,
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          entitySlug='my-org'
          labels={testLabels}
        />
      );

      expect(mockRefreshHistory).toHaveBeenCalledWith(
        'day',
        'test-token',
        'my-org'
      );
    });
  });

  describe('retry behavior', () => {
    it('should clear error and refresh when retry button is clicked', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: 'Network error',
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: null,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          autoFetch={false}
          labels={testLabels}
        />
      );

      fireEvent.click(screen.getByText('Retry'));

      expect(mockClearError).toHaveBeenCalled();
      expect(mockRefreshHistory).toHaveBeenCalledWith('day', 'test-token', '');
    });
  });

  describe('stale data with error', () => {
    it('should show error banner and chart when error exists but history is available', () => {
      vi.mocked(useRateLimits).mockReturnValue({
        config: null,
        isLoadingConfig: false,
        error: 'Refresh failed',
        refreshConfig: vi.fn(),
        clearError: mockClearError,
        history: mockHistory,
        isLoadingHistory: false,
        refreshHistory: mockRefreshHistory,
        reset: vi.fn(),
      });

      render(
        <RateLimitHistoryPage
          networkClient={mockNetworkClient}
          baseUrl='https://api.example.com'
          token='test-token'
          labels={testLabels}
        />
      );

      expect(screen.getByText(/Refresh failed/)).toBeInTheDocument();
      expect(screen.getByTestId('usage-history-chart')).toBeInTheDocument();
    });
  });
});
