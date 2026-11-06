import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-logo">EVOQ</h1>
        <p className="home-tagline">Play. Compete. Achieve. Get Recognized.</p>
        <p className="home-description">
          The Professional Network &amp; Operating System for Esports.
        </p>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="not-found-link">
              Go to Dashboard ({user.username})
            </Link>
          ) : (
            <>
              <Link to="/login" className="not-found-link">
                Sign In
              </Link>
              <Link
                to="/register"
                className="not-found-link"
                style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
