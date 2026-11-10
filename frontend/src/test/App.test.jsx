import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import Landing, {
  HERO_PARAGRAPH_STATES,
  isLimeHighlight,
  renderSemanticParagraph,
} from '../pages/Landing.jsx';
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
    expect(
      screen.getByText(/EVOQ connects gamers, teams, and tournament organizers/i)
    ).toBeInTheDocument();
  });

  it('provides 4 predefined semantic states and progressive scroll word-morphing', () => {
    expect(HERO_PARAGRAPH_STATES).toHaveLength(4);
    expect(HERO_PARAGRAPH_STATES[0]).toBe(
      'EVOQ connects gamers, teams, and tournament organizers on one professional esports platform. Discover tournaments, compete with players, and showcase your gaming skills.'
    );
    expect(HERO_PARAGRAPH_STATES[1]).toBe(
      'One ecosystem connects players, teams, and organizers through a unified esports network. Explore competitions, challenge rivals, and build your competitive profile.'
    );
    expect(HERO_PARAGRAPH_STATES[2]).toBe(
      'Players, teams, and organizers come together to discover tournaments, compete, track results, and build their gaming identity.'
    );
    expect(HERO_PARAGRAPH_STATES[3]).toBe(
      'Find tournaments. Join teams. Compete. Track your achievements. Turn every victory into a verified part of your esports career.'
    );

    // Lime highlights for specified key words
    expect(isLimeHighlight('Compete.')).toBe(true);
    expect(isLimeHighlight('achievements.')).toBe(true);
    expect(isLimeHighlight('verified')).toBe(true);
    expect(isLimeHighlight('career.')).toBe(true);
    expect(isLimeHighlight('gaming')).toBe(false);

    // Progress 0 renders State 0
    const state0Html = renderSemanticParagraph(0);
    expect(state0Html).toContain('EVOQ');
    expect(state0Html).toContain('connects');

    // Progress 0.45 renders State 1
    const state1Html = renderSemanticParagraph(0.45);
    expect(state1Html).toContain('ecosystem');

    // Progress 0.75 renders State 2
    const state2Html = renderSemanticParagraph(0.75);
    expect(state2Html).toContain('together');

    // Progress 1.0 renders State 3 with lime highlights
    const state3Html = renderSemanticParagraph(1.0);
    expect(state3Html).toContain('achievements.');
    expect(state3Html).toContain('lime-highlight');

    // Intermediate transition has morphing class and character reveals
    const transitionHtml = renderSemanticParagraph(0.28);
    expect(transitionHtml).toContain('hero-desc-word');
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
    expect(screen.getByLabelText('Previous Feature')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Feature')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous Feature')).toBeDisabled();
    expect(screen.getByLabelText('Next Feature')).not.toBeDisabled();
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
    expect(screen.getByLabelText('Previous Game')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Game')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous Game')).toBeDisabled();
    expect(screen.getByLabelText('Next Game')).not.toBeDisabled();
    expect(screen.getByText('01 / 05')).toBeInTheDocument();
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
