import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';

describe('Home page', () => {
  it('renders EVOQ branding', () => {
    render(<Home />);
    expect(screen.getByText('EVOQ')).toBeInTheDocument();
    expect(
      screen.getByText('Play. Compete. Achieve. Get Recognized.')
    ).toBeInTheDocument();
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
