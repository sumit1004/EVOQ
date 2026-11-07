import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { evoqService } from '../services/evoq.service.js';
import gsap from 'gsap';
import '../styles/landing.css';

export default function Home() {
  const { user, logout } = useAuth();

  // Navigation scroll state & mobile drawer
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Tournaments & Games state
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  // FAQ Accordion State (open question index)
  const [openFaq, setOpenFaq] = useState(0);

  // GSAP animation references
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const previewRef = useRef(null);

  // Scroll listener for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live tournaments
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await evoqService.getTournaments({ pageSize: 3 });
        setTournaments(res?.tournaments || res?.data || []);
      } catch (err) {
        console.warn('Live tournament query notice:', err.message);
      } finally {
        setTournamentsLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  // GSAP Hero Entrance Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
      );
      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { opacity: 0, y: 50, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.3 }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqData = [
    {
      q: 'What is EVOQ?',
      a: 'EVOQ is a professional esports ecosystem that combines competition management, gamer career profiles, verified tournament achievements, and organizer portfolios into one unified trust infrastructure.',
    },
    {
      q: 'Who is EVOQ designed for?',
      a: 'EVOQ is built for two distinct audiences: competitive gamers looking to participate in verified tournaments and build an authentic career portfolio, and tournament organizers/clubs running structured brackets and managing events.',
    },
    {
      q: 'Are Gamer and Organizer accounts separate?',
      a: 'Yes, strictly separate. A user creates either a Gamer account or an Organizer account. Gamers enter the Gamer Portal to manage teams and compete, while Organizers enter the Operations Portal to manage tournaments and approved results. There is no dual-role account switching.',
    },
    {
      q: 'How do verified achievements work?',
      a: 'When an official tournament completes, the organizer approves the results. EVOQ cryptographically links the approved outcome to the rosters, generating permanent verified achievements and updating gamer career records automatically.',
    },
    {
      q: 'Which games are currently supported?',
      a: 'EVOQ natively supports tier-1 competitive titles including Valorant, Counter-Strike 2, Apex Legends, League of Legends, and Rocket League with customized match scoring and identifier verification.',
    },
    {
      q: 'Are the product previews showing live data?',
      a: 'The landing page preview workspaces are interactive illustrative product demonstrations designed to show the actual EVOQ bracket and roster architecture. All live competitions can be browsed in the public tournament directory.',
    },
  ];

  const supportedGames = [
    { name: 'Valorant', genre: 'Tactical Shooter', emblem: '🎯' },
    { name: 'Counter-Strike 2', genre: 'Tactical Shooter', emblem: '💣' },
    { name: 'Apex Legends', genre: 'Battle Royale', emblem: '⚡' },
    { name: 'League of Legends', genre: 'MOBA', emblem: '⚔️' },
    { name: 'Rocket League', genre: 'Vehicular Sports', emblem: '🏎️' },
  ];

  return (
    <div className="evoq-landing-root">
      {/* ====================================================================
          SECTION 01: NAVBAR
          ==================================================================== */}
      <header className={`evoq-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="evoq-container">
          <div className="evoq-nav-inner">
            <Link to="/" className="evoq-nav-logo">
              EVOQ <span style={{ color: 'var(--evoq-lime-primary)' }}>.</span>
            </Link>

            <nav className="evoq-nav-links">
              <button onClick={() => scrollToSection('about')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                About
              </button>
              <button onClick={() => scrollToSection('features')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                Features
              </button>
              <button onClick={() => scrollToSection('games')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                Games
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                How It Works
              </button>
              <button onClick={() => scrollToSection('faq')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                FAQ
              </button>
              <Link to="/tournaments" className="evoq-nav-link">
                Tournaments
              </Link>
            </nav>

            <div className="evoq-nav-actions">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {user.accountType === 'ORGANIZER' ? (
                    <Link to="/organizer/dashboard" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                      ⚡ Operations Command ({user.username})
                    </Link>
                  ) : (
                    <Link to="/gamer/dashboard" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                      🎮 Gamer Arena ({user.username})
                    </Link>
                  )}
                  <button onClick={logout} className="evoq-btn evoq-btn-outline evoq-btn-sm" title="Sign Out">
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/gamer/login" className="evoq-btn evoq-btn-dark evoq-btn-sm">
                    Gamer Sign In
                  </Link>
                  <Link to="/organizer/login" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                    Organizer Portal ↗
                  </Link>
                </>
              )}

              <button
                className="evoq-nav-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`evoq-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollToSection('about')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            About
          </button>
          <button onClick={() => scrollToSection('features')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            Features
          </button>
          <button onClick={() => scrollToSection('games')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            Supported Games
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            How It Works
          </button>
          <button onClick={() => scrollToSection('faq')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            FAQ
          </button>
          <Link to="/tournaments" className="evoq-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Browse Tournaments
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--evoq-border-card)' }}>
            <Link to="/gamer/login" className="evoq-btn evoq-btn-dark" onClick={() => setMobileMenuOpen(false)}>
              Gamer Sign In
            </Link>
            <Link to="/organizer/login" className="evoq-btn evoq-btn-lime" onClick={() => setMobileMenuOpen(false)}>
              Organizer Portal ↗
            </Link>
          </div>
        </div>
      </header>

      {/* ====================================================================
          SECTION 02: HERO SECTION
          ==================================================================== */}
      <section className="evoq-section" ref={heroRef} style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            <span className="evoq-eyebrow-dot" />
            The Professional Network &amp; Operating System for Esports
          </div>

          <div className="evoq-hero-grid" ref={headlineRef}>
            <div>
              <h1 className="evoq-heading-hero">
                YOUR GAME. <br />
                <span style={{ color: 'var(--evoq-lime-primary)' }}>YOUR LEGACY.</span>
              </h1>
            </div>

            <div>
              <p className="evoq-heading-sub" style={{ marginBottom: '1.75rem' }}>
                The infrastructure behind your ambition. Run competitions, build your verified identity, and bring your esports world together.
              </p>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <Link to="/gamer/register" className="evoq-btn evoq-btn-lime">
                  Discover EVOQ ↗
                </Link>
                <Link to="/organizer/register" className="evoq-btn evoq-btn-dark">
                  For Organizers ⚡
                </Link>
              </div>
            </div>
          </div>

          {/* Authentic EVOQ Product UI Preview Frame */}
          <div className="evoq-hero-preview-frame" ref={previewRef}>
            <div className="evoq-preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#fff', fontWeight: 800 }}>EVOQ</span>
                <span style={{ color: 'var(--evoq-text-muted)' }}>/</span>
                <span style={{ color: 'var(--evoq-lime-secondary)' }}>ORGANIZER WORKSPACE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="evoq-preview-tag">ILLUSTRATIVE PRODUCT UI</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--evoq-lime-primary)' }}></span>
              </div>
            </div>

            <div className="evoq-bracket-container">
              {/* Workspace Sidebar */}
              <div className="evoq-bracket-sidebar">
                <span style={{ fontSize: '0.6875rem', color: 'var(--evoq-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  MANAGE
                </span>
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontSize: '0.8125rem' }}>
                  Overview
                </div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(201, 255, 82, 0.1)',
                    borderLeft: '2px solid var(--evoq-lime-primary)',
                    color: 'var(--evoq-lime-primary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                  }}
                >
                  🏆 Tournaments
                </div>
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontSize: '0.8125rem' }}>
                  👥 Participants
                </div>
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontSize: '0.8125rem' }}>
                  🛡️ Teams
                </div>
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '4px', color: 'var(--evoq-text-secondary)', fontSize: '0.8125rem' }}>
                  ⚙️ Settings
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--evoq-border-subtle)', fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>
                  Your competition. One control room.
                </div>
              </div>

              {/* Bracket Arena */}
              <div className="evoq-bracket-arena">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>Tournaments / Sample Competition</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>Championship Bracket</h3>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', backgroundColor: 'rgba(163, 230, 53, 0.15)', color: 'var(--evoq-lime-primary)', borderRadius: '999px', fontWeight: 700 }}>
                    • LIVE BRACKET
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  {/* Semi Finals */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="evoq-match-node active-lime">
                      <div className="evoq-match-row">
                        <span style={{ fontWeight: 600 }}>NORTH / Sample</span>
                        <span className="evoq-score-pill">2</span>
                      </div>
                      <div className="evoq-match-row">
                        <span style={{ color: 'var(--evoq-text-muted)' }}>VECTOR / Sample</span>
                        <span style={{ color: 'var(--evoq-text-muted)' }}>0</span>
                      </div>
                    </div>

                    <div className="evoq-match-node">
                      <div className="evoq-match-row">
                        <span style={{ fontWeight: 600 }}>ORBIT / Sample</span>
                        <span className="evoq-score-pill">2</span>
                      </div>
                      <div className="evoq-match-row">
                        <span style={{ color: 'var(--evoq-text-muted)' }}>APEX / Sample</span>
                        <span style={{ color: 'var(--evoq-text-muted)' }}>1</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ color: 'var(--evoq-lime-primary)', fontSize: '1.25rem' }}>→</span>

                  {/* Grand Final */}
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--evoq-lime-primary)', letterSpacing: '0.08em', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                      GRAND FINAL
                    </span>
                    <div className="evoq-match-node active-lime" style={{ borderLeft: '3px solid var(--evoq-lime-primary)' }}>
                      <div className="evoq-match-row" style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>NORTH / Sample</span>
                        <span className="evoq-score-pill">—</span>
                      </div>
                      <div className="evoq-match-row">
                        <span style={{ fontWeight: 700, color: '#fff' }}>ORBIT / Sample</span>
                        <span className="evoq-score-pill">—</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Details Panel */}
              <div className="evoq-bracket-details">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--evoq-text-primary)' }}>Match Details</span>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--evoq-surface-card)', borderRadius: '4px', border: '1px solid var(--evoq-border-card)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--evoq-lime-primary)', fontWeight: 700 }}>SAMPLE MATCH</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem' }}>Grand Final</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--evoq-text-secondary)' }}>
                    <span>Best of 3</span> • <span>5v5 Squads</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>
                  Schedule: Today • 19:00 UTC<br />
                  Result: Awaiting official score submission
                </div>
              </div>
            </div>
          </div>

          {/* Bottom baseline strip */}
          <div className="evoq-baseline-strip">
            <span>Play. Compete. Achieve. Get Recognized.</span>
            <span>PRODUCT CONCEPT / ALL WORKSPACE DATA IS ILLUSTRATIVE ↓</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 03 & 04: ABOUT EVOQ & PLATFORM METRICS
          ==================================================================== */}
      <section className="evoq-section" id="about">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            01 / ONE CONNECTED ECOSYSTEM
          </div>

          <div className="evoq-split-editorial">
            <div>
              <h2 className="evoq-heading-section">
                The whole game. <br />
                <span style={{ color: 'var(--evoq-text-muted)' }}>Not just the bracket.</span>
              </h2>
            </div>
            <div>
              <p className="evoq-heading-sub">
                Competition creates connections. EVOQ brings tournament management, verified gamer profiles, team identities, and organizer portfolios into one unified trust layer.
              </p>
            </div>
          </div>

          {/* Real Verified Platform Capabilities (No Fake Numbers) */}
          <div className="evoq-metrics-grid">
            <div className="evoq-metric-card">
              <div className="evoq-metric-val">100%</div>
              <div className="evoq-metric-title">Verified Results</div>
              <div className="evoq-metric-desc">Every tournament result approved by organizers contributes permanently to competitive profiles.</div>
            </div>
            <div className="evoq-metric-card">
              <div className="evoq-metric-val">5v5 &amp; Solo</div>
              <div className="evoq-metric-title">Tournament Formats</div>
              <div className="evoq-metric-desc">Native single-elimination, double-elimination, and Swiss bracket structures.</div>
            </div>
            <div className="evoq-metric-card">
              <div className="evoq-metric-val">CHAR(36)</div>
              <div className="evoq-metric-title">Enterprise UUIDs</div>
              <div className="evoq-metric-desc">UUID v4 primary identifiers ensuring reliable distributed data integrity across all nodes.</div>
            </div>
            <div className="evoq-metric-card">
              <div className="evoq-metric-val">Argon2id</div>
              <div className="evoq-metric-title">Security Architecture</div>
              <div className="evoq-metric-desc">Hardened password cryptography, HttpOnly server sessions, and CSRF token protections.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 05: PLATFORM FEATURES (4-CARD MATRIX)
          ==================================================================== */}
      <section className="evoq-section" id="features">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            02 / PLATFORM CAPABILITIES
          </div>

          <h2 className="evoq-heading-section" style={{ maxWidth: '780px' }}>
            Built for competitive rigor. Powered by shared data.
          </h2>

          <div className="evoq-cards-matrix">
            {/* Card 1: Competition OS */}
            <div className="evoq-ecosystem-card">
              <div>
                <div className="evoq-card-top">
                  <span className="evoq-card-icon">🏆</span>
                  <span className="evoq-card-index">01</span>
                </div>
                <h3 className="evoq-card-title">Competition OS</h3>
                <p className="evoq-card-text">
                  From registration to the final result. Bring every stage of your tournament into focus with automated brackets and match workflows.
                </p>
              </div>
              <Link to="/tournaments" className="evoq-card-link">
                Browse tournaments ↗
              </Link>
            </div>

            {/* Card 2: Player Profiles */}
            <div className="evoq-ecosystem-card">
              <div>
                <div className="evoq-card-top">
                  <span className="evoq-card-icon">🎯</span>
                  <span className="evoq-card-index">02</span>
                </div>
                <h3 className="evoq-card-title">Player Profiles</h3>
                <p className="evoq-card-text">
                  A professional identity built around your in-game roles, team history, and permanent achievements that move with you across seasons.
                </p>
              </div>
              <Link to="/gamer/register" className="evoq-card-link">
                Build your profile ↗
              </Link>
            </div>

            {/* Card 3: Team Identities */}
            <div className="evoq-ecosystem-card">
              <div>
                <div className="evoq-card-top">
                  <span className="evoq-card-icon">🛡️</span>
                  <span className="evoq-card-index">03</span>
                </div>
                <h3 className="evoq-card-title">Team Identities</h3>
                <p className="evoq-card-text">
                  Give your squad a shared home. Connect active rosters, substitute benches, match histories, and team achievements under one banner.
                </p>
              </div>
              <Link to="/teams" className="evoq-card-link">
                Represent your team ↗
              </Link>
            </div>

            {/* Card 4: Organizer Portfolios */}
            <div className="evoq-ecosystem-card">
              <div>
                <div className="evoq-card-top">
                  <span className="evoq-card-icon">⚡</span>
                  <span className="evoq-card-index">04</span>
                </div>
                <h3 className="evoq-card-title">Organizer Portfolios</h3>
                <p className="evoq-card-text">
                  Put a professional face to the team behind the event. Showcase past competitions, verified prize distribution, and institutional credibility.
                </p>
              </div>
              <Link to="/organizer/register" className="evoq-card-link">
                Showcase your work ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 06: SUPPORTED GAMES
          ==================================================================== */}
      <section className="evoq-section" id="games">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            03 / CONFIGURED TITLES
          </div>

          <div className="evoq-split-editorial" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="evoq-heading-section">
                Supported Games.
              </h2>
            </div>
            <div>
              <p className="evoq-heading-sub">
                EVOQ integrates title-specific identity formats, roster sizing, and scoring engines for the world's leading competitive esports.
              </p>
            </div>
          </div>

          <div className="evoq-games-collection">
            {supportedGames.map((game) => (
              <div key={game.name} className="evoq-game-tile">
                <div className="evoq-game-emblem">{game.emblem}</div>
                <div>
                  <h3 className="evoq-game-name">{game.name}</h3>
                  <span className="evoq-game-genre">{game.genre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 07: FEATURED TOURNAMENTS
          ==================================================================== */}
      <section className="evoq-section" id="tournaments">
        <div className="evoq-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div className="evoq-eyebrow">
                04 / LIVE COMPETITIONS
              </div>
              <h2 className="evoq-heading-section">Featured Tournaments</h2>
            </div>
            <Link to="/tournaments" className="evoq-btn evoq-btn-outline evoq-btn-sm">
              View All Tournaments →
            </Link>
          </div>

          {tournamentsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--evoq-text-muted)' }}>
              Loading competitive tournaments...
            </div>
          ) : tournaments.length > 0 ? (
            <div className="evoq-tournaments-showcase">
              {tournaments.slice(0, 3).map((t) => (
                <div key={t.id} className="evoq-ecosystem-card" style={{ minHeight: 'auto' }}>
                  <div className="evoq-card-top">
                    <span style={{ fontSize: '0.8rem', color: 'var(--evoq-lime-primary)', fontWeight: 700 }}>
                      {t.game?.name || 'Esports'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--evoq-text-muted)' }}>
                      {t.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0 0.5rem 0' }}>{t.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--evoq-text-secondary)', margin: '0 0 1.25rem 0' }}>
                    Format: {t.format?.replace(/_/g, ' ')} • Max: {t.maxParticipants} participants
                  </p>
                  <Link to={`/tournaments/${t.slug}`} className="evoq-btn evoq-btn-lime evoq-btn-sm" style={{ width: 'fit-content' }}>
                    View Bracket ↗
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="evoq-empty-tournaments">
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>🎮</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Ready to Host Your Tournament?</h3>
              <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                No public tournaments are scheduled at this exact moment. Onboard your organization to launch the next major competitive event on EVOQ.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/organizer/register" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                  Launch a Tournament ⚡
                </Link>
                <Link to="/gamer/register" className="evoq-btn evoq-btn-dark evoq-btn-sm">
                  Create Gamer Squad
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          SECTION 08: HOW EVOQ WORKS (THE COMPETITIVE JOURNEY)
          ==================================================================== */}
      <section className="evoq-section" id="how-it-works">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            05 / YOUR NEXT MOVE
          </div>

          <div className="evoq-split-editorial">
            <div>
              <h2 className="evoq-heading-section">
                Ambition needs a path.
              </h2>
            </div>
            <div>
              <p className="evoq-heading-sub">
                Not disconnected moments. A competitive journey with somewhere to go next.
              </p>
            </div>
          </div>

          <div className="evoq-journey-timeline">
            {/* Step 01 */}
            <div className="evoq-journey-step">
              <div className="evoq-journey-tracker">
                <span className="evoq-step-number">01</span>
                <div className="evoq-tracker-line" />
              </div>
              <div className="evoq-journey-icon">🎯</div>
              <h3 className="evoq-journey-title">Play.</h3>
              <span className="evoq-journey-sub">Define your identity</span>
              <p className="evoq-journey-text">
                Start with a professional profile that reflects your game handles, competitive role, experience, and ambition.
              </p>
            </div>

            {/* Step 02 */}
            <div className="evoq-journey-step">
              <div className="evoq-journey-tracker">
                <span className="evoq-step-number">02</span>
                <div className="evoq-tracker-line" />
              </div>
              <div className="evoq-journey-icon">⚔️</div>
              <h3 className="evoq-journey-title">Compete.</h3>
              <span className="evoq-journey-sub">Find your place</span>
              <p className="evoq-journey-text">
                Form team rosters with your squad and participate in organized, structured tournaments with live brackets.
              </p>
            </div>

            {/* Step 03 */}
            <div className="evoq-journey-step">
              <div className="evoq-journey-tracker">
                <span className="evoq-step-number">03</span>
                <div className="evoq-tracker-line" />
              </div>
              <div className="evoq-journey-icon">🏆</div>
              <h3 className="evoq-journey-title">Achieve.</h3>
              <span className="evoq-journey-sub">Build your record</span>
              <p className="evoq-journey-text">
                When matches conclude, organizers verify the results, turning match outcomes into permanent records.
              </p>
            </div>

            {/* Step 04 */}
            <div className="evoq-journey-step">
              <div className="evoq-journey-tracker">
                <span className="evoq-step-number">04</span>
                <div className="evoq-tracker-line" />
              </div>
              <div className="evoq-journey-icon">🎖️</div>
              <h3 className="evoq-journey-title">Get Recognized.</h3>
              <span className="evoq-journey-sub">Let your work speak</span>
              <p className="evoq-journey-text">
                Make your esports story easier to understand, share with scouts, and build upon for seasons to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 09 & 10: PROFESSIONAL FOUNDATIONS & TRUST LAYER
          ==================================================================== */}
      <section className="evoq-section" id="foundations">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            06 / THE EVOQ APPROACH
          </div>

          <div className="evoq-split-editorial" style={{ marginBottom: '3.5rem' }}>
            <div>
              <h2 className="evoq-heading-section">
                Serious play. <br />
                <span style={{ color: 'var(--evoq-lime-primary)' }}>Professional foundations.</span>
              </h2>
            </div>
            <div>
              <p className="evoq-heading-sub">
                An ecosystem should make the work clearer. Every part of EVOQ has a job to do.
              </p>
              <div style={{ marginTop: '1.25rem', fontFamily: 'var(--evoq-font-heading)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--evoq-lime-primary)', letterSpacing: '0.08em' }}>
                [ · ] LESS NOISE. MORE INTENT.
              </div>
            </div>
          </div>

          {/* 3 Pillars List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--evoq-border-card)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.75rem', color: 'var(--evoq-lime-primary)' }}>💠</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Purpose-built identities</h3>
                <p style={{ color: 'var(--evoq-text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
                  Players, teams, and organizers have different needs. Each gets a dedicated presence, with the relationships between them kept in view.
                </p>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--evoq-font-heading)', color: 'var(--evoq-text-muted)', letterSpacing: '0.08em' }}>
                  PLAYER / TEAM / ORGANIZER
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--evoq-border-card)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.75rem', color: 'var(--evoq-lime-primary)' }}>📊</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Structure over scattered information</h3>
                <p style={{ color: 'var(--evoq-text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
                  Competition formats, participants, brackets, and results belong in a coherent workflow—not across disconnected messages and spreadsheets.
                </p>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--evoq-font-heading)', color: 'var(--evoq-text-muted)', letterSpacing: '0.08em' }}>
                  CONFIGURE / COORDINATE / RECORD
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.75rem', color: 'var(--evoq-lime-primary)' }}>🔗</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>Context that stays connected</h3>
                <p style={{ color: 'var(--evoq-text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
                  A team is more than a name on a bracket. Connect the competition to the people and organizations behind it.
                </p>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--evoq-font-heading)', color: 'var(--evoq-text-muted)', letterSpacing: '0.08em' }}>
                  COMPETITION ↔ IDENTITY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 11: CONTACT & INQUIRIES
          ==================================================================== */}
      <section className="evoq-section" id="contact">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            PARTNERSHIPS &amp; INQUIRIES
          </div>

          <div className="evoq-contact-grid">
            <div>
              <h2 className="evoq-heading-section" style={{ marginBottom: '1rem' }}>
                Connect with the EVOQ ecosystem.
              </h2>
              <p className="evoq-heading-sub">
                Are you an esports federation, tournament operator, university league, or collegiate club? Talk with our operations team.
              </p>
            </div>

            <div className="evoq-contact-card">
              <div className="evoq-contact-option">
                <span style={{ fontSize: '1.5rem', color: 'var(--evoq-lime-primary)' }}>⚡</span>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700 }}>Tournament Operators</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--evoq-text-secondary)' }}>
                    Host sanctioned tournaments with automated bracket generation and result approvals.
                  </p>
                  <Link to="/organizer/register" style={{ fontSize: '0.8125rem', color: 'var(--evoq-lime-primary)', fontWeight: 700, textDecoration: 'none' }}>
                    Register as Organizer →
                  </Link>
                </div>
              </div>

              <div className="evoq-contact-option">
                <span style={{ fontSize: '1.5rem', color: 'var(--evoq-lime-primary)' }}>🎮</span>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700 }}>Competitors &amp; Teams</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--evoq-text-secondary)' }}>
                    Need help setting up your squad roster or linking game IDs? Join the gamer community.
                  </p>
                  <Link to="/gamer/register" style={{ fontSize: '0.8125rem', color: 'var(--evoq-lime-primary)', fontWeight: 700, textDecoration: 'none' }}>
                    Join Gamer Arena →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 12: FAQ ACCORDION
          ==================================================================== */}
      <section className="evoq-section" id="faq">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            07 / A LITTLE CLARITY
          </div>

          <div className="evoq-split-editorial" style={{ marginBottom: '2.5rem' }}>
            <div>
              <h2 className="evoq-heading-section">
                Before you <br />
                step in.
              </h2>
              <p className="evoq-heading-sub" style={{ marginTop: '1rem' }}>
                The essentials behind the ecosystem. Built for competition, with a broader view of what comes next.
              </p>
            </div>

            <div className="evoq-faq-accordion">
              {faqData.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="evoq-faq-item">
                    <button
                      className="evoq-faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span className="evoq-faq-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="evoq-faq-body">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 13: FINAL CTA (ACID-LIME HERO BANNER)
          ==================================================================== */}
      <section className="evoq-section" style={{ borderBottom: 'none' }}>
        <div className="evoq-container">
          <div className="evoq-closing-banner">
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              08 / BUILT FOR WHAT COMES NEXT
            </div>

            <div className="evoq-closing-grid">
              <div>
                <h2 className="evoq-closing-title">
                  Your next level <br />
                  starts here.
                </h2>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#384B22', marginTop: '1.5rem' }}>
                  PLAY. COMPETE. ACHIEVE. GET RECOGNIZED.
                </div>
              </div>

              <div>
                <p className="evoq-closing-sub">
                  For the players pushing forward. The teams building together. The organizers making it happen.
                </p>
                <div className="evoq-closing-actions">
                  <Link to="/gamer/register" className="evoq-closing-btn-dark">
                    Join as Gamer ↗
                  </Link>
                  <Link to="/organizer/register" className="evoq-closing-btn-outline">
                    Enter as Organizer ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 14: FOOTER
          ==================================================================== */}
      <footer className="evoq-footer">
        <div className="evoq-container">
          <div className="evoq-footer-watermark">
            EVOQ
          </div>

          <div className="evoq-footer-grid">
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--evoq-font-heading)', color: '#fff', marginBottom: '0.75rem' }}>
                EVOQ<span style={{ color: 'var(--evoq-lime-primary)' }}>.</span>
              </div>
              <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '280px' }}>
                The Professional Network &amp; Operating System for Esports.
              </p>
            </div>

            <div>
              <div className="evoq-footer-col-title">Platform</div>
              <ul className="evoq-footer-links">
                <li><Link to="/tournaments" className="evoq-footer-link">Competition OS</Link></li>
                <li><Link to="/gamer/register" className="evoq-footer-link">Player Profiles</Link></li>
                <li><Link to="/teams" className="evoq-footer-link">Team Identities</Link></li>
                <li><Link to="/organizer/register" className="evoq-footer-link">Organizer Portfolios</Link></li>
              </ul>
            </div>

            <div>
              <div className="evoq-footer-col-title">Explore</div>
              <ul className="evoq-footer-links">
                <li><button onClick={() => scrollToSection('about')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>The Ecosystem</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>How It Works</button></li>
                <li><button onClick={() => scrollToSection('foundations')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>The EVOQ Approach</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>FAQs</button></li>
              </ul>
            </div>

            <div>
              <div className="evoq-footer-col-title">Get Started</div>
              <ul className="evoq-footer-links">
                <li><Link to="/gamer/login" className="evoq-footer-link" style={{ color: 'var(--evoq-lime-primary)', fontWeight: 600 }}>Gamer Portal ↗</Link></li>
                <li><Link to="/organizer/login" className="evoq-footer-link" style={{ color: 'var(--evoq-lime-secondary)', fontWeight: 600 }}>Organizer Portal ⚡</Link></li>
                <li>
                  <button
                    onClick={scrollToTop}
                    className="evoq-footer-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}
                  >
                    Back to top ↑
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="evoq-footer-bottom">
            <span>© 2026 EVOQ. ALL RIGHTS RESERVED.</span>
            <span>PRODUCT PREVIEWS ARE ILLUSTRATIVE.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span style={{ color: 'var(--evoq-text-muted)', cursor: 'default' }}>Privacy Policy</span>
              <span style={{ color: 'var(--evoq-text-muted)', cursor: 'default' }}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
