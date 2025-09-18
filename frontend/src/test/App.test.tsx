import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import App from '../App';
import { apiClient } from '../utils/apiClient';

// Mock the API client
vi.mock('../utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

// Mock the onboarding hook
vi.mock('../components/OnboardingTour', () => ({
  OnboardingTour: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="onboarding-tour">
      <button onClick={onComplete}>Complete Onboarding</button>
    </div>
  ),
  useOnboarding: () => ({
    showOnboarding: false,
    completeOnboarding: vi.fn()
  })
}));

// Mock child components
vi.mock('../components/Auth', () => ({
  Auth: ({ onAuthSuccess }: { onAuthSuccess: (token: string) => void }) => (
    <div data-testid="auth-component">
      <button onClick={() => onAuthSuccess('mock-token')}>Login</button>
    </div>
  )
}));

vi.mock('../components/NewDashboard', () => ({
  NewDashboard: ({ onLogout }: { onLogout: () => void }) => (
    <div data-testid="new-dashboard">
      <button onClick={onLogout}>Logout</button>
    </div>
  )
}));

vi.mock('../components/EnhancedDashboard', () => ({
  EnhancedDashboard: () => <div data-testid="enhanced-dashboard">Enhanced Dashboard</div>
}));

const renderApp = () => {
  return render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    renderApp();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Auth component when no token is present', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });
  });

  it('renders NewDashboard when token is present', async () => {
    localStorage.setItem('authToken', 'mock-token');
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('new-dashboard')).toBeInTheDocument();
    });
  });

  it('handles successful authentication', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('new-dashboard')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    localStorage.setItem('authToken', 'mock-token');
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('new-dashboard')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-component')).toBeInTheDocument();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('handles API validation failure gracefully', async () => {
    localStorage.setItem('authToken', 'invalid-token');
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('new-dashboard')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Initial token validation failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});
