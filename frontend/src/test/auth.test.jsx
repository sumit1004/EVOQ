import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { AuthProvider } from '../features/auth/AuthContext.jsx';

describe('Frontend Form Validation & Auth Components', () => {
  it('validates empty login inputs and displays errors', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.submit(submitBtn.closest('form'));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('validates password policy on registration', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/gamer username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'gamer@evoq.gg' } });
    fireEvent.change(usernameInput, { target: { value: 'valid_user' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.submit(submitBtn.closest('form'));

    expect(
      screen.getByText(/password must be at least 12 characters/i)
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated users in ProtectedRoute', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ProtectedRoute>
            <div>Confidential Dashboard Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    // Initial loading or redirected away from protected content
    expect(
      screen.queryByText(/Confidential Dashboard Content/i)
    ).not.toBeInTheDocument();
  });
});

describe('Authentication-Aware Navbar & Dashboard Routing', () => {
  it('correctly resolves dashboard destinations via getDashboardPath', async () => {
    const { getDashboardPath } = await import('../features/auth/AuthContext.jsx');

    expect(getDashboardPath(null)).toBe('/gamer/login');
    expect(getDashboardPath({ accountType: 'GAMER' })).toBe('/gamer/dashboard');
    expect(getDashboardPath({ accountType: 'ORGANIZER' })).toBe('/organizer/dashboard');
    expect(getDashboardPath({ role: 'ORGANIZER' })).toBe('/organizer/dashboard');
    expect(getDashboardPath({ role: 'GAMER' })).toBe('/gamer/dashboard');
  });

  it('renders Login button for unauthenticated users in PublicNavbar', async () => {
    const { default: PublicNavbar } = await import('../components/PublicNavbar.jsx');

    render(
      <MemoryRouter>
        <AuthProvider>
          <PublicNavbar />
        </AuthProvider>
      </MemoryRouter>
    );

    const loginBtns = screen.getAllByRole('link', { name: /login/i });
    expect(loginBtns.length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it('renders Dashboard button linking to /gamer/dashboard for authenticated GAMER', async () => {
    const { default: PublicNavbar } = await import('../components/PublicNavbar.jsx');
    const { authService } = await import('../services/auth.service.js');

    localStorage.setItem('evoq_has_session', 'true');
    vi.spyOn(authService, 'me').mockResolvedValueOnce({
      userId: 1,
      username: 'GamerOne',
      accountType: 'GAMER',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PublicNavbar />
        </AuthProvider>
      </MemoryRouter>
    );

    const dashboardLink = await screen.findByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/gamer/dashboard');
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();

    localStorage.removeItem('evoq_has_session');
    vi.restoreAllMocks();
  });

  it('renders Dashboard button linking to /organizer/dashboard for authenticated ORGANIZER', async () => {
    const { default: PublicNavbar } = await import('../components/PublicNavbar.jsx');
    const { authService } = await import('../services/auth.service.js');

    localStorage.setItem('evoq_has_session', 'true');
    vi.spyOn(authService, 'me').mockResolvedValueOnce({
      userId: 2,
      username: 'OrganizerOrg',
      accountType: 'ORGANIZER',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PublicNavbar />
        </AuthProvider>
      </MemoryRouter>
    );

    const dashboardLink = await screen.findByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/organizer/dashboard');
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();

    localStorage.removeItem('evoq_has_session');
    vi.restoreAllMocks();
  });

  it('renders Dashboard button on Landing page navbar when user is authenticated', async () => {
    const { default: Landing } = await import('../pages/Landing.jsx');
    const { authService } = await import('../services/auth.service.js');

    localStorage.setItem('evoq_has_session', 'true');
    vi.spyOn(authService, 'me').mockResolvedValueOnce({
      userId: 1,
      username: 'ProGamer',
      accountType: 'GAMER',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </MemoryRouter>
    );

    const dashboardLink = await screen.findByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/gamer/dashboard');
    expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();

    localStorage.removeItem('evoq_has_session');
    vi.restoreAllMocks();
  });
});

