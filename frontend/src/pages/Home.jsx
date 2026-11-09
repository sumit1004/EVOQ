import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { evoqService } from '../services/evoq.service.js';
import ProductSimulation from '../components/hero-simulation/ProductSimulation.jsx';
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
    { name: 'Valorant', genre: 'Tactical Shooter', emblem: 'VAL' },
    { name: 'Counter-Strike 2', genre: 'Tactical Shooter', emblem: 'CS2' },
    { name: 'Apex Legends', genre: 'Battle Royale', emblem: 'APEX' },
    { name: 'League of Legends', genre: 'MOBA', emblem: 'LOL' },
    { name: 'Rocket League', genre: 'Vehicular Sports', emblem: 'RL' },
  ];

  const sponsors = [
    {
      name: 'VORTEX OPERATIONS',
      role: 'Global Tournament Operator',
      badge: 'OFFICIAL OPERATOR',
      desc: 'Tier-1 tournament sanctioning, automated match bracket distribution, and broadcast control rooms.',
      code: 'VTX',
      color: '#C9FF52',
    },
    {
      name: 'AURA ESPORTS',
      role: 'Premier Competitive Club',
      badge: 'ALLIANCE PARTNER',
      desc: 'Multi-title competitive organisation fielding top-tier tactical FPS and MOBA squads.',
      code: 'AURA',
      color: '#60A5FA',
    },
    {
      name: 'HYPERION HARDWARE',
      role: 'Hardware & Infrastructure',
      badge: 'TITLE SPONSOR',
      desc: 'Official hardware and peripherals partner powering EVOQ championship tournament arenas.',
      code: 'HPRN',
      color: '#F472B6',
    },
    {
      name: 'PULSE BROADCAST',
      role: 'Esports Media Syndicate',
      badge: 'MEDIA ALLIANCE',
      desc: 'Global streaming syndicate delivering multi-language live coverage for sanctioned cups.',
      code: 'PLSE',
      color: '#34D399',
    },
    {
      name: 'VALIANT ARENA',
      role: 'Collegiate & Amateur Circuit',
      badge: 'CIRCUIT PARTNER',
      desc: 'Sanctioning 140+ university esports leagues and verified collegiate player passports.',
      code: 'VLNT',
      color: '#FBBF24',
    },
    {
      name: 'NEXUS PROTOCOL',
      role: 'Integrity & Verification',
      badge: 'SECURITY PARTNER',
      desc: 'Cryptographic result validation, roster identity proofing, and anti-fraud protocols.',
      code: 'NXUS',
      color: '#A78BFA',
    },
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
              <button onClick={() => scrollToSection('games')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                Games
              </button>
              <Link to="/tournaments" className="evoq-nav-link">
                Tournaments
              </Link>
              <button onClick={() => scrollToSection('sponsors')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                Sponsors
              </button>
              <button onClick={() => scrollToSection('faq')} className="evoq-nav-link" style={{ background: 'none', border: 'none' }}>
                FAQ
              </button>
            </nav>

            <div className="evoq-nav-actions">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {user.accountType === 'ORGANIZER' ? (
                    <Link to="/organizer/dashboard" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                      Operations Command ({user.username})
                    </Link>
                  ) : (
                    <Link to="/gamer/dashboard" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                      Gamer Arena ({user.username})
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
          <button onClick={() => scrollToSection('games')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            Supported Games
          </button>
          <Link to="/tournaments" className="evoq-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Browse Tournaments
          </Link>
          <button onClick={() => scrollToSection('sponsors')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            Sponsors &amp; Organisations
          </button>
          <button onClick={() => scrollToSection('faq')} className="evoq-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem 0' }}>
            FAQ
          </button>
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
          SECTION 02: HERO SECTION (INTERACTIVE PRODUCT SIMULATION)
          ==================================================================== */}
      <section className="evoq-section" ref={heroRef} style={{ paddingTop: '5rem', paddingBottom: '3.5rem' }}>
        <div className="evoq-container">
          <div className="evoq-hero-layout">
            {/* Left Side: Brand Message & Editorial Headline */}
            <div className="evoq-hero-brand-col" ref={headlineRef}>
              <div className="evoq-eyebrow" style={{ marginBottom: '1.25rem' }}>
                <span className="evoq-eyebrow-dot" />
                THE PROFESSIONAL NETWORK &amp; OPERATING SYSTEM FOR ESPORTS
              </div>

              <h1 className="evoq-heading-hero">
                YOUR GAME. <br />
                <span style={{ color: 'var(--evoq-lime-primary)' }}>YOUR LEGACY.</span>
              </h1>
            </div>

            {/* Right Side: Interactive Product Simulation */}
            <div className="evoq-hero-simulation-col" ref={previewRef}>
              <ProductSimulation />
            </div>
          </div>

          {/* Bottom baseline strip */}
          <div className="evoq-baseline-strip">
            <span>Play. Compete. Achieve. Get Recognized.</span>
            <span>LIVE INTERACTIVE PRODUCT SIMULATION / ORGANIZER &amp; GAMER WORKSPACES ↓</span>
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
          SECTION 05: SUPPORTED GAMES
          ==================================================================== */}
      <section className="evoq-section" id="games">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            02 / SUPPORTED TITLES
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
                03 / LIVE COMPETITIONS
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
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Ready to Host Your Tournament?</h3>
              <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                No public tournaments are scheduled at this exact moment. Onboard your organization to launch the next major competitive event on EVOQ.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/organizer/register" className="evoq-btn evoq-btn-lime evoq-btn-sm">
                  Launch a Tournament ↗
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
          SECTION 08: SPONSORS & PARTNER ORGANISATIONS
          ==================================================================== */}
      <section className="evoq-section" id="sponsors">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            04 / SPONSORS &amp; ORGANISATIONS
          </div>

          <div className="evoq-split-editorial" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="evoq-heading-section">
                Backed by industry leaders. <br />
                <span style={{ color: 'var(--evoq-lime-primary)' }}>Powered by premier organisations.</span>
              </h2>
            </div>
            <div>
              <p className="evoq-heading-sub">
                EVOQ collaborates with tier-1 tournament operators, hardware innovators, and esports clubs to establish verifiable competitive standards.
              </p>
            </div>
          </div>

          <div className="evoq-sponsors-grid">
            {sponsors.map((sp) => (
              <div key={sp.name} className="evoq-sponsor-card">
                <div>
                  <div className="evoq-sponsor-card-top">
                    <div className="evoq-sponsor-emblem" style={{ borderColor: `${sp.color}40` }}>
                      {sp.code === 'VTX' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      )}
                      {sp.code === 'AURA' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 2L2 12l10 10 10-10L12 2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                      {sp.code === 'HPRN' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2" />
                          <line x1="12" y1="22" x2="12" y2="12" />
                          <line x1="12" y1="12" x2="22" y2="7" />
                          <line x1="12" y1="12" x2="2" y2="7" />
                        </svg>
                      )}
                      {sp.code === 'PLSE' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 12h4l3-9 4 18 3-9h6" />
                        </svg>
                      )}
                      {sp.code === 'VLNT' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                      {sp.code === 'NXUS' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </div>
                    <span className="evoq-sponsor-badge" style={{ color: sp.color, borderColor: `${sp.color}40`, backgroundColor: `${sp.color}14` }}>
                      {sp.badge}
                    </span>
                  </div>

                  <h3 className="evoq-sponsor-title">{sp.name}</h3>
                  <span className="evoq-sponsor-category">{sp.role}</span>
                  <p className="evoq-sponsor-desc">{sp.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Important Organisation Information & Alliance Tiers */}
          <div className="evoq-sponsors-banner">
            <div>
              <h4 className="evoq-sponsors-banner-title">
                Sponsor &amp; Alliance Integration Protocol
              </h4>
              <p className="evoq-sponsors-banner-desc">
                Organisations and brand partners integrate directly with EVOQ’s tournament verification layer—powering branded tournament titles, certified arena hardware, talent scouting, and official prize pool escrows.
              </p>
              <div className="evoq-sponsor-pill-group">
                <span className="evoq-sponsor-pill">Title Sponsorship</span>
                <span className="evoq-sponsor-pill">Broadcast Overlays</span>
                <span className="evoq-sponsor-pill">Club Talent Portfolios</span>
                <span className="evoq-sponsor-pill">Hardware Certification</span>
              </div>
            </div>

            <div>
              <Link to="/organizer/register" className="evoq-btn evoq-btn-lime">
                Partner with EVOQ ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 09: FAQ ACCORDION
          ==================================================================== */}
      <section className="evoq-section" id="faq">
        <div className="evoq-container">
          <div className="evoq-eyebrow">
            05 / FREQUENTLY ASKED QUESTIONS
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
          SECTION 10: FINAL CTA (ACID-LIME HERO BANNER)
          ==================================================================== */}
      <section className="evoq-section" style={{ borderBottom: 'none' }}>
        <div className="evoq-container">
          <div className="evoq-closing-banner">
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              06 / BUILT FOR WHAT COMES NEXT
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
          SECTION 11: FOOTER
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
                <li><button onClick={() => scrollToSection('games')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Supported Games</button></li>
                <li><button onClick={() => scrollToSection('sponsors')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Sponsors &amp; Partners</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="evoq-footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>FAQs</button></li>
              </ul>
            </div>

            <div>
              <div className="evoq-footer-col-title">Get Started</div>
              <ul className="evoq-footer-links">
                <li><Link to="/gamer/login" className="evoq-footer-link" style={{ color: 'var(--evoq-lime-primary)', fontWeight: 600 }}>Gamer Portal ↗</Link></li>
                <li><Link to="/organizer/login" className="evoq-footer-link" style={{ color: 'var(--evoq-lime-secondary)', fontWeight: 600 }}>Organizer Portal ↗</Link></li>
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
