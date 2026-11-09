import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import '../styles/cinematic-navbar.css';

export default function CinematicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const surfaceRef = useRef(null);
  const contentRef = useRef(null);
  const logoRef = useRef(null);
  const navCenterRef = useRef(null);
  const rightRef = useRef(null);
  const mobileToggleRef = useRef(null);

  useEffect(() => {
    // GSAP context for proper cleanup and React StrictMode compatibility
    const ctx = gsap.context(() => {
      const surface = surfaceRef.current;
      const content = contentRef.current;
      const logo = logoRef.current;
      const navLinks = navCenterRef.current ? navCenterRef.current.querySelectorAll('.evoq-nav-item') : [];
      const right = rightRef.current;
      const mobileToggle = mobileToggleRef.current;

      // STEP A — INITIAL SETUP
      // Navbar surface collapsed horizontally at center (scaleX: 0), opacity: 0
      gsap.set(surface, {
        scaleX: 0,
        opacity: 0,
        transformOrigin: '50% 50%',
      });

      // Prepare contents
      gsap.set(content, {
        opacity: 1,
      });

      gsap.set(logo, {
        opacity: 0,
        x: -16,
      });

      if (navLinks.length > 0) {
        gsap.set(navLinks, {
          opacity: 0,
          y: -10,
        });
      }

      gsap.set(right, {
        opacity: 0,
        x: 16,
      });

      if (mobileToggle) {
        gsap.set(mobileToggle, {
          opacity: 0,
        });
      }

      // STEP B & C — COORDINATED ENTRANCE TIMELINE
      // Target total duration: ~800-880ms, using power3.out easing without bounce/overshoot
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      });

      // Step B: Surface expands outward simultaneously towards left & right from center
      tl.to(
        surface,
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.58,
          ease: 'power3.out',
        },
        0.05
      );

      // Step C: Content reveal starting when surface is ~75% expanded
      tl.to(
        logo,
        {
          opacity: 1,
          x: 0,
          duration: 0.38,
          ease: 'power3.out',
        },
        0.28
      );

      if (navLinks.length > 0) {
        tl.to(
          navLinks,
          {
            opacity: 1,
            y: 0,
            duration: 0.34,
            stagger: 0.04,
            ease: 'power3.out',
          },
          0.32
        );
      }

      tl.to(
        right,
        {
          opacity: 1,
          x: 0,
          duration: 0.38,
          ease: 'power3.out',
        },
        0.34
      );

      if (mobileToggle) {
        tl.to(
          mobileToggle,
          {
            opacity: 1,
            duration: 0.3,
            ease: 'power3.out',
          },
          0.38
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleNavClick = (e, targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="evoq-nav-outer" ref={containerRef} role="banner">
      <div className="evoq-nav-wrapper">
        {/* Animated dark charcoal surface with thin subtle border & rounded corners */}
        <div className="evoq-nav-surface" ref={surfaceRef} aria-hidden="true" />

        {/* Content layer that never stretches */}
        <div className="evoq-nav-content" ref={contentRef}>
          {/* LEFT: EVOQ typographic wordmark with lime-green accent detail */}
          <div className="evoq-nav-left" ref={logoRef}>
            <Link to="/" className="evoq-logo-link" aria-label="EVOQ Home">
              <span className="evoq-logo-text">EVOQ</span>
              <span className="evoq-logo-dot" />
            </Link>
          </div>

          {/* CENTER: Navigation links (genuinely centered in viewport) */}
          <nav className="evoq-nav-center" ref={navCenterRef} aria-label="Main Navigation">
            <span className="evoq-nav-item">
              <a
                href="#about"
                className="evoq-nav-link"
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>
            </span>
            <span className="evoq-nav-item">
              <a
                href="#games"
                className="evoq-nav-link"
                onClick={(e) => handleNavClick(e, 'games')}
              >
                Games
              </a>
            </span>
            <span className="evoq-nav-item">
              <a
                href="#tournaments"
                className="evoq-nav-link"
                onClick={(e) => handleNavClick(e, 'tournaments')}
              >
                Tournaments
              </a>
            </span>
            <span className="evoq-nav-item">
              <a
                href="#sponsors"
                className="evoq-nav-link"
                onClick={(e) => handleNavClick(e, 'sponsors')}
              >
                Sponsors
              </a>
            </span>
            <span className="evoq-nav-item">
              <a
                href="#faq"
                className="evoq-nav-link"
                onClick={(e) => handleNavClick(e, 'faq')}
              >
                FAQ
              </a>
            </span>
          </nav>

          {/* RIGHT: Login CTA with lime accent & subtle arrow icon (+ mobile menu toggle) */}
          <div className="evoq-nav-right" ref={rightRef}>
            <Link to="/login" className="evoq-btn-login">
              <span>Login</span>
              <svg
                className="evoq-btn-arrow"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              className="evoq-mobile-toggle"
              ref={mobileToggleRef}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <div className={`evoq-burger-icon ${mobileMenuOpen ? 'is-open' : ''}`}>
                <span className="evoq-burger-line" />
                <span className="evoq-burger-line" />
              </div>
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="evoq-mobile-menu" role="dialog" aria-label="Mobile Navigation">
            <a
              href="#about"
              className="evoq-mobile-link"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              <span>About</span>
              <span style={{ color: '#C9FF52', fontSize: '11px' }}>01</span>
            </a>
            <a
              href="#games"
              className="evoq-mobile-link"
              onClick={(e) => handleNavClick(e, 'games')}
            >
              <span>Games</span>
              <span style={{ color: '#C9FF52', fontSize: '11px' }}>02</span>
            </a>
            <a
              href="#tournaments"
              className="evoq-mobile-link"
              onClick={(e) => handleNavClick(e, 'tournaments')}
            >
              <span>Tournaments</span>
              <span style={{ color: '#C9FF52', fontSize: '11px' }}>03</span>
            </a>
            <a
              href="#sponsors"
              className="evoq-mobile-link"
              onClick={(e) => handleNavClick(e, 'sponsors')}
            >
              <span>Sponsors</span>
              <span style={{ color: '#C9FF52', fontSize: '11px' }}>04</span>
            </a>
            <a
              href="#faq"
              className="evoq-mobile-link"
              onClick={(e) => handleNavClick(e, 'faq')}
            >
              <span>FAQ</span>
              <span style={{ color: '#C9FF52', fontSize: '11px' }}>05</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

