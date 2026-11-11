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

