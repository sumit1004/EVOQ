import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/index.js';

export default function NotFound() {
  return (
    <PublicLayout>
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <span
          className="evoq-mono-label"
          style={{
            color: 'var(--evoq-accent)',
            background: 'rgba(201, 255, 82, 0.1)',
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          ERROR 404 // ROUTE NOT FOUND
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 10vw, 7rem)',
            margin: '0.25rem 0',
            letterSpacing: '0.04em',
            color: 'var(--evoq-text-primary)',
          }}
        >
          404
        </h1>

        <p
          style={{
            color: 'var(--evoq-text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '460px',
            lineHeight: '1.6',
            margin: '0 0 2rem 0',
          }}
        >
          The competition bracket, portal view, or tournament registry you requested could not be located in the EVOQ network.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <PrimaryButton as={Link} to="/" icon="grid">
            Back to Home
          </PrimaryButton>
          <SecondaryButton as={Link} to="/tournaments" icon="tournament">
            Explore Tournaments
          </SecondaryButton>
        </div>
      </div>
    </PublicLayout>
  );
}
