import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import Landing from '../pages/Landing.jsx';
import NotFound from '../pages/NotFound.jsx';

describe('Landing page', () => {
  it('renders EVOQ branding, navbar navigation links, and hero stage', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('EVOQ')[0]).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Sponsors')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
  });

  it('renders About section with high-clarity copy and 3 pillars', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('// ABOUT EVOQ · EST. 2026')).toBeInTheDocument();
    expect(screen.getByText('01 / FOR GAMERS')).toBeInTheDocument();
    expect(screen.getByText('02 / FOR ORGANIZERS')).toBeInTheDocument();
    expect(screen.getByText('03 / FOR PLAYERS')).toBeInTheDocument();
  });

  it('renders Features section with 8 features and interactive navigation pips', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('// EXPLORE EVOQ FEATURES')).toBeInTheDocument();
    expect(screen.getByText('01 / 08 FEATURES')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 01')).toBeInTheDocument();
    expect(screen.getByLabelText('Feature 08')).toBeInTheDocument();
  });

  it('renders Games section with 5 supported games and live telemetry radar', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Landing />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('FREE FIRE')[0]).toBeInTheDocument();
    expect(screen.getByText('BGMI')).toBeInTheDocument();
    expect(screen.getByText('VALORANT')).toBeInTheDocument();
    expect(screen.getByText('CALL OF DUTY')).toBeInTheDocument();
    expect(screen.getByText('CS2')).toBeInTheDocument();
    expect(screen.getByText('LIVE TELEMETRY')).toBeInTheDocument();
  });
});

describe('NotFound page', () => {
  it('renders 404 message with a link home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });
});
