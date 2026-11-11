import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Landing.css';

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false,
  });
}

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Reusable Global Navbar Component
 * Fixed at the top across all scenes with identical approved Phase 1 floating design.
 */
export function Navbar({
  links = [
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Games', href: '#games' },
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Contact', href: '#contact' },
  ],
  actionLabel = 'Login',
  actionHref = '/login',
  activeScene = 0,
  onNavigate = null,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const surfaceRef = useRef(null);
  const contentRef = useRef(null);
  const logoRef = useRef(null);
  const navCenterRef = useRef(null);
  const rightRef = useRef(null);
  const mobileToggleRef = useRef(null);

  // Prevent background scrolling while mobile navigation drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key or viewport resize above mobile breakpoint
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const surface = surfaceRef.current;
      const content = contentRef.current;
      const logo = logoRef.current;
      const navLinks = navCenterRef.current
        ? navCenterRef.current.querySelectorAll('.evoq-nav-item')
        : [];
      const right = rightRef.current;
      const mobileToggle = mobileToggleRef.current;

      gsap.set(surface, {
        scaleX: 0,
        opacity: 0,
        transformOrigin: '50% 50%',
      });

      gsap.set(content, { opacity: 1 });
      gsap.set(logo, { opacity: 0, x: -16 });

      if (navLinks.length > 0) {
        gsap.set(navLinks, { opacity: 0, y: -10 });
      }

      gsap.set(right, { opacity: 0, x: 16 });

      if (mobileToggle) {
        gsap.set(mobileToggle, { opacity: 0 });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
      });

      // Slow, cinematic navbar expansion from center
      tl.to(surface, { scaleX: 1, opacity: 1, duration: 1.25, ease: 'power2.out' }, 0.05);
      tl.to(logo, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.55);

      if (navLinks.length > 0) {
        tl.to(
          navLinks,
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' },
          0.65
        );
      }

      tl.to(right, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, 0.75);

      if (mobileToggle) {
        tl.to(mobileToggle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.8);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [links.length]);

  const handleLinkClick = (e, href, idx) => {
    if (href.startsWith('/')) {
      setMobileMenuOpen(false);
      return;
    }
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href, idx);
    } else {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="evoq-nav-outer" ref={containerRef} role="banner">
      <div className="evoq-nav-wrapper">
        <div className="evoq-nav-surface" ref={surfaceRef} aria-hidden="true" />

        <div className="evoq-nav-content" ref={contentRef}>
          {/* LEFT: EVOQ Wordmark */}
          <div className="evoq-nav-left" ref={logoRef}>
            <Link to="/" className="evoq-logo-link" aria-label="EVOQ Esports">
              <span className="evoq-logo-text">EVOQ</span>
              <span className="evoq-logo-dot" />
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="evoq-nav-center" ref={navCenterRef} aria-label="Main Navigation">
            {links.map((link, idx) => {
              const isCurrent =
                (link.href === '#about' && activeScene === 1) ||
                (link.href === '#features' && activeScene === 2) ||
                (link.href === '#games' && activeScene === 3) ||
                (link.href === '#contact' && activeScene === 5);

              return (
                <span key={link.label} className="evoq-nav-item">
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="evoq-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={`evoq-nav-link ${isCurrent ? 'active' : ''}`}
                      onClick={(e) => handleLinkClick(e, link.href, idx)}
                    >
                      {link.label}
                    </a>
                  )}
                </span>
              );
            })}
          </nav>

          {/* RIGHT: Login Action */}
          <div className="evoq-nav-right" ref={rightRef}>
            <Link to={actionHref} className="evoq-btn-login">
              <span>{actionLabel}</span>
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

            <button
              className="evoq-mobile-toggle"
              ref={mobileToggleRef}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              <div className={`evoq-burger-icon ${mobileMenuOpen ? 'is-open' : ''}`}>
                <span className="evoq-burger-line" />
                <span className="evoq-burger-line" />
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="evoq-mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="evoq-mobile-menu" role="dialog" aria-label="Mobile Navigation">
              {links.map((link, idx) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="evoq-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    <span style={{ color: '#C9FF52', fontSize: '11px', fontFamily: 'Space Mono, monospace' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="evoq-mobile-link"
                    onClick={(e) => handleLinkClick(e, link.href, idx)}
                  >
                    <span>{link.label}</span>
                    <span style={{ color: '#C9FF52', fontSize: '11px', fontFamily: 'Space Mono, monospace' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </a>
                )
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

// ─── DATA DEFINITIONS ───
const FEATURES_LIST = [
  {
    num: '01',
    title: 'TOURNAMENT MANAGEMENT',
    desc: 'Create, schedule and operate competitive tournaments from registration brackets to the championship final.',
    path: '/ EVOQ PLATFORM / FEATURE',
    tag: 'BRACKETS & REGISTRATIONS',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'GAMER PROFILES',
    desc: 'Build a verified professional gamer identity with linked game handles, match statistics and career achievements.',
    path: '/ IDENTITY & TELEMETRY',
    tag: 'VERIFIED CREDENTIALS',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'TEAM & SQUAD OPS',
    desc: 'Form competitive rosters, coordinate substitutes, manage contract status and enter team tournaments together.',
    path: '/ ROSTER MANAGEMENT',
    tag: 'SQUAD SYNCHRONIZATION',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'ORGANIZER PORTAL',
    desc: 'Empower esports organizations with participant check-in, rulebook enforcement and prize pool disbursement.',
    path: '/ ENTERPRISE OPERATIONS',
    tag: 'TOURNAMENT AUTOMATION',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'MATCH & RESULT OPS',
    desc: 'Seamlessly distribute private room credentials, collect screenshot proof and arbitrate dispute resolutions.',
    path: '/ LOBBY MANAGEMENT',
    tag: 'TELEMETRY VALIDATION',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m9 12 2 2 4-4" />
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
      </svg>
    ),
  },
  {
    num: '06',
    title: 'VERIFIED ACHIEVEMENTS',
    desc: 'Transform sanctioned podium placements into cryptographically verifiable digital trophies and badges.',
    path: '/ ON-CHAIN IDENTITY',
    tag: 'TAMPER-PROOF RECORDS',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    num: '07',
    title: 'GLOBAL LEADERBOARDS',
    desc: 'Track competitive rankings across regional power ratings, tournament points and historical win rates.',
    path: '/ POWER RANKINGS',
    tag: 'DYNAMIC ELO MATRIX',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    num: '08',
    title: 'GAME STATS SYNC',
    desc: 'Direct integration with supported game publishers to reflect accurate K/D, damage and headshot accuracy.',
    path: '/ API CONNECTIVITY',
    tag: 'PUBLISHER INTEGRATION',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20" />
        <path d="m17 5-5-3-5 3" />
        <path d="m17 19-5 3-5-3" />
      </svg>
    ),
  },
];

const GAMES_LIST = [
  {
    pwr: 'PWR - 01',
    name: 'FREE FIRE',
    activeStatus: 'ACTIVE',
    tagline: 'Fast-paced survival meets squad strategy. Drop in, gather your gear, and fight to be the last team standing.',
    // metrics: { AIM: '092', STR: '078', TEA: '096', PAC: '088', TAC: '064' },
    polygonPoints: '110,35 178,78 162,168 58,168 42,78',
  },
  {
    pwr: 'PWR - 02',
    name: 'BGMI',
    activeStatus: 'ACTIVE',
    tagline: 'Tactical battle royale on massive 8x8 terrain. High-stakes zone rotations, vehicular assaults and clutch squad wipes.',
    // metrics: { AIM: '088', STR: '094', TEA: '091', PAC: '074', TAC: '089' },
    polygonPoints: '110,42 165,82 155,160 65,160 55,82',
  },
  {
    pwr: 'PWR - 03',
    name: 'VALORANT',
    activeStatus: 'ACTIVE',
    tagline: 'Character-based 5v5 tactical shooter. Precise gunplay paired with unique agent utility across attack and retake executes.',
    // metrics: { AIM: '098', STR: '089', TEA: '095', PAC: '082', TAC: '097' },
    polygonPoints: '110,28 172,74 158,164 62,164 48,74',
  },
  {
    pwr: 'PWR - 04',
    name: 'CALL OF DUTY',
    activeStatus: 'COMPATIBLE',
    tagline: 'Frantic gunfights, scorestreaks, and high-tempo search & destroy rounds in premier mobile and desktop circuits.',
    // metrics: { AIM: '091', STR: '076', TEA: '084', PAC: '096', TAC: '078' },
    polygonPoints: '110,38 180,85 148,155 72,155 40,85',
  },
  {
    pwr: 'PWR - 05',
    name: 'CS2',
    activeStatus: 'COMPATIBLE',
    tagline: 'The gold standard of tactical counter-terrorist operations, sub-tick server precision and legendary esports legacy.',
    // metrics: { AIM: '099', STR: '096', TEA: '092', PAC: '070', TAC: '098' },
    polygonPoints: '110,25 182,72 152,162 68,162 38,72',
  },
];

const SPONSORS_LIST = [
  { code: 'SYS-01', brand: 'ESPORTS ENGINE', role: 'Global Tournament Broadcast & Tier-1 Operations' },
  { code: 'SYS-02', brand: 'VANGUARD SEC', role: 'Real-Time Anti-Cheat & Packet Telemetry Integrity' },
  { code: 'SYS-03', brand: 'VERTEX STREAM', role: 'Sub-Second Latency Observer Feeds' },
  { code: 'SYS-04', brand: 'HYPERION NET', role: 'High-Tick Dedicated Competition Game Servers' },
  { code: 'SYS-05', brand: 'DISCORD PROTOCOL', role: 'Team Communications & Verified Community Bridge' },
  { code: 'SYS-06', brand: 'PRISMA TELEMETRY', role: 'Real-Time Esports Database & Match Ledger' },
];

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * ─── HERO PARAGRAPH SEMANTIC TRANSFORMATION STATES ───
 * Four predefined content states representing the progressive evolution of EVOQ's vision.
 */
export const HERO_PARAGRAPH_STATES = [
  // STATE 0 — ORIGINAL
  'EVOQ connects gamers, teams, and tournament organizers on one professional esports platform. Discover tournaments, compete with players, and showcase your gaming skills.',
  // STATE 1 — UNIFIED ECOSYSTEM
  'One ecosystem connects players, teams, and organizers through a unified esports network. Explore competitions, challenge rivals, and build your competitive profile.',
  // STATE 2 — COMPETITIVE JOURNEY
  'Players, teams, and organizers come together to discover tournaments, compete, track results, and build their gaming identity.',
  // STATE 3 — PROFESSIONAL RECOGNITION
  'Find tournaments. Join teams. Compete. Track your achievements. Turn every victory into a verified part of your esports career.',
];

const HERO_STATE_WORDS = HERO_PARAGRAPH_STATES.map((text) => text.split(' '));

/**
 * Checks whether a word should receive subtle lime accent coloring
 * Highlighted words: COMPETE, ACHIEVEMENTS, VERIFIED, CAREER (case-insensitive & punctuation-agnostic)
 */
export function isLimeHighlight(word) {
  if (!word) return false;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return clean === 'compete' || clean === 'achievements' || clean === 'verified' || clean === 'career';
}

/**
 * Maps normalized hero progress [0, 1] to source state, target state, and transition progress u [0, 1]
 */
function getParagraphTransition(progress) {
  if (progress <= 0.16) {
    return { fromState: 0, toState: 0, u: 0 };
  } else if (progress < 0.42) {
    const u = (progress - 0.16) / (0.42 - 0.16);
    return { fromState: 0, toState: 1, u };
  } else if (progress <= 0.48) {
    return { fromState: 1, toState: 1, u: 0 };
  } else if (progress < 0.72) {
    const u = (progress - 0.48) / (0.72 - 0.48);
    return { fromState: 1, toState: 2, u };
  } else if (progress <= 0.78) {
    return { fromState: 2, toState: 2, u: 0 };
  } else if (progress < 0.98) {
    const u = (progress - 0.78) / (0.98 - 0.78);
    return { fromState: 2, toState: 3, u };
  } else {
    return { fromState: 3, toState: 3, u: 0 };
  }
}

/**
 * Renders the semantic paragraph HTML with character-level reveal and word-morphing in reading order
 */
export function renderSemanticParagraph(progress) {
  const { fromState, toState, u } = getParagraphTransition(progress);

  // Pure stable state without active morphing
  if (fromState === toState) {
    const words = HERO_STATE_WORDS[fromState];
    return words
      .map((w) => {
        const lime = isLimeHighlight(w) ? ' lime-highlight' : '';
        return `<span class="hero-desc-word${lime}">${w}</span>`;
      })
      .join(' ');
  }

  // Active word-by-word morphing in reading order
  const wordsA = HERO_STATE_WORDS[fromState];
  const wordsB = HERO_STATE_WORDS[toState];
  const totalSlots = Math.max(wordsA.length, wordsB.length);
  const parts = [];

  for (let i = 0; i < totalSlots; i++) {
    const slotStart = (i / totalSlots) * 0.78;
    const slotEnd = slotStart + 0.22;
    const wA = wordsA[i];
    const wB = wordsB[i];

    if (u <= slotStart) {
      if (wA) {
        const lime = isLimeHighlight(wA) ? ' lime-highlight' : '';
        parts.push(`<span class="hero-desc-word${lime}">${wA}</span>`);
      }
    } else if (u >= slotEnd) {
      if (wB) {
        const lime = isLimeHighlight(wB) ? ' lime-highlight' : '';
        parts.push(`<span class="hero-desc-word${lime}">${wB}</span>`);
      }
    } else {
      const wP = (u - slotStart) / (slotEnd - slotStart);
      if (wA && wB) {
        if (wP < 0.4) {
          // Outgoing old word lifts and fades
          const op = (1 - wP / 0.4).toFixed(2);
          const ty = (-(wP / 0.4) * 4).toFixed(1);
          const lime = isLimeHighlight(wA) ? ' lime-highlight' : '';
          parts.push(
            `<span class="hero-desc-word morphing${lime}" style="opacity:${op};transform:translateY(${ty}px);display:inline-block;">${wA}</span>`
          );
        } else {
          // Incoming new word rises gently and types character-by-character
          const inP = (wP - 0.4) / 0.6;
          const op = Math.min(1, inP * 1.5).toFixed(2);
          const ty = ((1 - inP) * 4).toFixed(1);
          const charCount = Math.max(1, Math.ceil(wB.length * inP));
          const visible = wB.slice(0, charCount);
          const ghost = wB.slice(charCount);
          const lime = isLimeHighlight(wB) ? ' lime-highlight' : '';
          parts.push(
            `<span class="hero-desc-word morphing${lime}" style="opacity:${op};transform:translateY(${ty}px);display:inline-block;">${visible}${ghost ? `<span style="opacity:0">${ghost}</span>` : ''}</span>`
          );
        }
      } else if (wA) {
        const op = Math.max(0, 1 - wP).toFixed(2);
        const ty = (-wP * 4).toFixed(1);
        const lime = isLimeHighlight(wA) ? ' lime-highlight' : '';
        parts.push(
          `<span class="hero-desc-word${lime}" style="opacity:${op};transform:translateY(${ty}px);display:inline-block;">${wA}</span>`
        );
      } else if (wB) {
        const op = Math.min(1, wP * 1.5).toFixed(2);
        const ty = ((1 - wP) * 4).toFixed(1);
        const charCount = Math.max(1, Math.ceil(wB.length * wP));
        const visible = wB.slice(0, charCount);
        const ghost = wB.slice(charCount);
        const lime = isLimeHighlight(wB) ? ' lime-highlight' : '';
        parts.push(
          `<span class="hero-desc-word${lime}" style="opacity:${op};transform:translateY(${ty}px);display:inline-block;">${visible}${ghost ? `<span style="opacity:0">${ghost}</span>` : ''}</span>`
        );
      }
    }
  }

  return parts.join(' ');
}

/**
 * Deterministic Letter Scrambling Engine
 * Transitions deterministically from initial text to final text based on normalized progress t [0, 1].
 * Reversible on scroll up and down with consistent intermediate digital states.
 */
function scrambleWord(initial, final, t) {
  if (t <= 0.02) return initial;
  if (t >= 0.96) return final;

  const targetLen = t < 0.25 ? initial.length : final.length;
  let result = '';

  for (let i = 0; i < targetLen; i++) {
    const start = 0.06 + (i / targetLen) * 0.46;
    const end = Math.min(0.95, start + 0.36);

    if (t < start) {
      result += (i < initial.length) ? initial[i] : '';
    } else if (t >= end) {
      result += (i < final.length) ? final[i] : '';
    } else {
      const cycle = Math.floor(t * 140);
      const glyphIdx = Math.abs((cycle * 7 + i * 13 + ((t * 1000) | 0)) % GLYPHS.length);
      result += GLYPHS[glyphIdx];
    }
  }
  return result;
}

/**
 * Renders bespoke high-fidelity esports visuals for each of the 8 features
 */
function renderFeatureVisual(idx) {
  switch (idx) {
    case 0:
      // 01 / TOURNAMENT MANAGEMENT: Double Elimination Live Bracket Engine
      return (
        <div className="visual-panel visual-bracket">
          <div className="visual-panel-header">
            <span className="visual-badge-live">LIVE BRACKET</span>
            <span className="visual-header-tag">// DOUBLE ELIMINATION · RO8 (DEMO)</span>
          </div>
          <div className="bracket-tree-layout">
            <div className="bracket-col bracket-col-r1">
              <div className="bracket-match match-winner">
                <div className="bracket-team win">
                  <span className="team-seed">01</span>
                  <span className="team-name">SKR GAMING</span>
                  <span className="team-score">2</span>
                </div>
                <div className="bracket-team">
                  <span className="team-seed">08</span>
                  <span className="team-name">NOVA ESPORTS</span>
                  <span className="team-score">1</span>
                </div>
              </div>
              <div className="bracket-match match-winner">
                <div className="bracket-team win">
                  <span className="team-seed">03</span>
                  <span className="team-name">SENTINELS</span>
                  <span className="team-score">2</span>
                </div>
                <div className="bracket-team">
                  <span className="team-seed">06</span>
                  <span className="team-name">FNATIC</span>
                  <span className="team-score">0</span>
                </div>
              </div>
            </div>
            <div className="bracket-connectors" aria-hidden="true">
              <svg width="40" height="150" viewBox="0 0 40 150">
                <path d="M0,35 H20 V75 H40" fill="none" stroke="rgba(201, 255, 82, 0.45)" strokeWidth="1.5" />
                <path d="M0,115 H20 V75" fill="none" stroke="rgba(201, 255, 82, 0.45)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="bracket-col bracket-col-finals">
              <div className="bracket-final-card">
                <div className="final-card-tag">CHAMPIONSHIP STAGE (DEMO)</div>
                <div className="final-teams">
                  <span className="lime">SKR</span> <span className="final-vs">VS</span> <span className="lime">SEN</span>
                </div>
                <div className="final-prize-meter">
                  <span>ESCROW PRIZE</span>
                  <span className="lime">$25,000 USD</span>
                </div>
                <div className="final-status-pill">MAP 3 · DEMO</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 1:
      // 02 / GAMER PROFILES: Verified Esports Passport & Identity Card
      return (
        <div className="visual-panel visual-passport">
          <div className="visual-panel-header">
            <span className="visual-badge-live">VERIFIED PASSPORT</span>
            <span className="visual-header-tag">// GLOBAL ESPORTS ID · 884-02X</span>
          </div>
          <div className="passport-body">
            <div className="passport-top-row">
              <div className="passport-avatar-wrap">
                <div className="passport-avatar-ring">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9FF52" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                </div>
              </div>
              <div className="passport-meta">
                <div className="passport-handle">@VORTEX_PRIME</div>
                <div className="passport-tier-pill">TIER-1 PRO COMPETITOR</div>
              </div>
            </div>
            <div className="passport-game-handles">
              <div className="handle-chip"><span>VAL</span> Vortex#EU1</div>
              <div className="handle-chip"><span>BGMI</span> 512994021</div>
              <div className="handle-chip"><span>CS2</span> FACEIT-LVL10</div>
            </div>
            <div className="passport-stats-row">
              <div className="passport-stat-box">
                <span className="stat-label">WIN RATE</span>
                <span className="stat-num lime">71.4%</span>
              </div>
              <div className="passport-stat-box">
                <span className="stat-label">K/D RATIO</span>
                <span className="stat-num lime">4.62</span>
              </div>
              <div className="passport-stat-box">
                <span className="stat-label">TOURNAMENTS</span>
                <span className="stat-num">42 PLACED</span>
              </div>
            </div>
            <div className="passport-ledger-hash">
              <span>LEDGER // 0x8F92...B3A4</span>
              <span className="lime">VERIFIED ✓</span>
            </div>
          </div>
        </div>
      );

    case 2:
      // 03 / TEAM & SQUAD OPS: Roster Management Matrix
      return (
        <div className="visual-panel visual-roster">
          <div className="visual-panel-header">
            <span className="visual-badge-live">ROSTER MESH</span>
            <span className="visual-header-tag">// VALKYRIE PRIME [VK]</span>
          </div>
          <div className="roster-grid">
            {[
              { role: 'IGL', name: 'VORTEX_PRIME', status: 'READY' },
              { role: 'ENTRY', name: 'CYPHER_99', status: 'READY' },
              { role: 'SNIPER', name: 'SHADOW_X', status: 'READY' },
              { role: 'SUPPORT', name: 'BLAZE_IQ', status: 'READY' },
              { role: 'FLEX', name: 'NEXUS_CORE', status: 'IN-LOBBY' },
            ].map((slot) => (
              <div key={slot.name} className="roster-slot-row">
                <span className="slot-role">{slot.role}</span>
                <span className="slot-name">{slot.name}</span>
                <span className="slot-status">
                  <span className="status-dot-lime" /> {slot.status}
                </span>
              </div>
            ))}
          </div>
          <div className="roster-footer-row">
            <span>VOICE PROTOCOL // 5 OF 5 ACTIVE</span>
            <span className="lime">SUBS [2] ELIGIBLE</span>
          </div>
        </div>
      );

    case 3:
      // 04 / ORGANIZER PORTAL: Enterprise Operations Controller
      return (
        <div className="visual-panel visual-organizer">
          <div className="visual-panel-header">
            <span className="visual-badge-live">COMMAND HUB</span>
            <span className="visual-header-tag">// OPERATIONS DASHBOARD</span>
          </div>
          <div className="organizer-metrics-grid">
            <div className="org-metric-card">
              <span className="org-metric-num lime">64 / 64</span>
              <span className="org-metric-title">SQUADS CHECKED-IN</span>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '100%' }} /></div>
            </div>
            <div className="org-metric-card">
              <span className="org-metric-num lime">$10,000</span>
              <span className="org-metric-title">PRIZE ESCROW LOCKED</span>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '85%' }} /></div>
            </div>
            <div className="org-metric-card">
              <span className="org-metric-num">8 / 8</span>
              <span className="org-metric-title">DEDICATED SERVERS</span>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '100%' }} /></div>
            </div>
          </div>
          <div className="org-actions-strip">
            <div className="org-action-pill">
              <span className="action-icon">⚡</span>
              <span>AUTO-BRACKET SEEDING: COMPLETE</span>
            </div>
            <div className="org-action-pill">
              <span className="action-icon">✓</span>
              <span>0 OPEN DISPUTES</span>
            </div>
          </div>
        </div>
      );

    case 4:
      // 05 / MATCH & RESULT OPS: Match Telemetry & Result Proof Engine
      return (
        <div className="visual-panel visual-matchops">
          <div className="visual-panel-header">
            <span className="visual-badge-live">TELEMETRY LOBBY</span>
            <span className="visual-header-tag">// MATCH VALIDATION</span>
          </div>
          <div className="matchops-card">
            <div className="custom-room-row">
              <div className="room-item">
                <span className="room-label">PRIVATE ROOM ID</span>
                <span className="room-val lime">#8849-EVQ</span>
              </div>
              <div className="room-item">
                <span className="room-label">PASSCODE</span>
                <span className="room-val">•••••••• [ENCRYPTED]</span>
              </div>
              <div className="room-item">
                <span className="room-label">SERVER TICK</span>
                <span className="room-val">128 TICK DEDICATED</span>
              </div>
            </div>
            <div className="ocr-verification-box">
              <div className="ocr-header">
                <span>SCREENSHOT OCR PROOF ANALYZER</span>
                <span className="lime">CONFIDENCE 99.8%</span>
              </div>
              <div className="ocr-result-row">
                <div className="ocr-team">SKR GAMING // 13</div>
                <div className="ocr-vs">DEF</div>
                <div className="ocr-team muted">SENTINELS // 09</div>
              </div>
              <div className="ocr-audit-stamp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9FF52" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>ARBITER STAMP: RESULTS VERIFIED & SIGNED</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 5:
      // 06 / VERIFIED ACHIEVEMENTS: Digital Trophy Vault & Badges
      return (
        <div className="visual-panel visual-trophy">
          <div className="visual-panel-header">
            <span className="visual-badge-live">PERMANENT LEDGER</span>
            <span className="visual-header-tag">// SOULBOUND TROPHY VAULT</span>
          </div>
          <div className="trophy-display-area">
            <div className="trophy-emblem-box">
              <div className="trophy-svg-wrap">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C9FF52" strokeWidth="1.8">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div className="trophy-title-tag">2026 NATIONAL CHAMPION</div>
              <div className="trophy-tier-tag">TIER-1 PLATINUM CUP</div>
            </div>
            <div className="badges-constellation">
              <div className="badge-pill"><span>★</span> SEASON MVP</div>
              <div className="badge-pill"><span>⚔</span> FLAWLESS GROUP</div>
              <div className="badge-pill"><span>🛡</span> BEST DEFENDER</div>
              <div className="badge-pill"><span>50+</span> PODIUMS</div>
            </div>
          </div>
          <div className="trophy-footer">
            <span>CRYPTO PROOF // ED25519 IMMUTABLE</span>
            <span className="lime">VERIFIED ON-CHAIN</span>
          </div>
        </div>
      );

    case 6:
      // 07 / GLOBAL LEADERBOARDS: Dynamic ELO Power Rankings
      return (
        <div className="visual-panel visual-leaderboard">
          <div className="visual-panel-header">
            <span className="visual-badge-live">POWER MATRIX</span>
            <span className="visual-header-tag">// GLOBAL REGIONAL ELO</span>
          </div>
          <div className="leaderboard-table">
            {[
              { rank: '01', team: 'TEAM APEX', pts: '2,840 PTS', trend: '▲ +120', active: true },
              { rank: '02', team: 'ECLIPSE PRIME', pts: '2,710 PTS', trend: '▲ +45', active: false },
              { rank: '03', team: 'CYBERPUNK SQUAD', pts: '2,650 PTS', trend: '—', active: false },
              { rank: '04', team: 'PHANTOM REIGN', pts: '2,590 PTS', trend: '▼ -30', active: false },
              { rank: '05', team: 'VALKYRIE PRIME', pts: '2,540 PTS', trend: '▲ +80', active: false },
            ].map((row) => (
              <div key={row.rank} className={`leaderboard-row ${row.active ? 'top-rank' : ''}`}>
                <span className="lb-rank">{row.rank}</span>
                <span className="lb-team">{row.team}</span>
                <span className="lb-pts lime">{row.pts}</span>
                <span className="lb-trend">{row.trend}</span>
              </div>
            ))}
          </div>
          <div className="leaderboard-cutoff">
            <span>PRO CIRCUIT CUTOFF // TOP 16 QUALIFY</span>
            <span className="lime">SEASON 02</span>
          </div>
        </div>
      );

    case 7:
    default:
      // 08 / GAME STATS SYNC: Live Publisher API Pipeline
      return (
        <div className="visual-panel visual-statssync">
          <div className="visual-panel-header">
            <span className="visual-badge-live">PUBLISHER BRIDGE</span>
            <span className="visual-header-tag">// REAL-TIME TELEMETRY</span>
          </div>
          <div className="api-nodes-row">
            <div className="api-node active">
              <span className="node-indicator" />
              <span className="node-title">RIOT DIRECT</span>
              <span className="node-ping lime">12ms</span>
            </div>
            <div className="api-node active">
              <span className="node-indicator" />
              <span className="node-title">KRAFTON LIGHT</span>
              <span className="node-ping lime">18ms</span>
            </div>
            <div className="api-node active">
              <span className="node-indicator" />
              <span className="node-title">VALVE GC</span>
              <span className="node-ping lime">9ms</span>
            </div>
          </div>
          <div className="stats-stream-bars">
            <div className="stream-stat-item">
              <div className="stream-stat-header">
                <span>HEADSHOT ACCURACY</span>
                <span className="lime">42.8%</span>
              </div>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '72%' }} /></div>
            </div>
            <div className="stream-stat-item">
              <div className="stream-stat-header">
                <span>AVG DAMAGE / ROUND</span>
                <span className="lime">184.2</span>
              </div>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '82%' }} /></div>
            </div>
            <div className="stream-stat-item">
              <div className="stream-stat-header">
                <span>K/D RATIO (RANKED)</span>
                <span className="lime">3.84</span>
              </div>
              <div className="org-bar-track"><div className="org-bar-fill" style={{ width: '78%' }} /></div>
            </div>
          </div>
          <div className="stream-footer">
            <span className="lime">● STREAMING 100% IN SYNC</span>
            <span>ZERO LATENCY OVERHEAD</span>
          </div>
        </div>
      );
  }
}

/**
 * Main Cinematic Landing Page Component
 */
export default function Landing() {
  const [activeScene, setActiveScene] = useState(0);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [activeGameIdx, setActiveGameIdx] = useState(0);

  const containerRef = useRef(null);
  const pinnedStageRef = useRef(null);
  const heroSceneRef = useRef(null);
  const aboutSceneRef = useRef(null);
  const featuresSceneRef = useRef(null);
  const gamesSceneRef = useRef(null);
  const sponsorsSceneRef = useRef(null);
  const contactSceneRef = useRef(null);
  const charStageRef = useRef(null);
  const charRafRef = useRef(null);
  const heroRafRef = useRef(null);

  // Hero Transformation Refs for zero-rerender 60fps DOM updates
  const bgWordmarkRef = useRef(null);
  const fgWordmarkRef = useRef(null);
  const levelProgressRef = useRef(null);
  const statusLabelRef = useRef(null);
  const scrollCueRef = useRef(null);
  const heroDescRef = useRef(null);
  const lastParagraphProgressRef = useRef(-1);

  // Features and Games Transition Refs
  const activeFeatureIdxRef = useRef(0);
  const activeGameIdxRef = useRef(0);
  const tunnelStageRef = useRef(null);
  const featureContentRef = useRef(null);
  const gameRadarRef = useRef(null);

  // Features Cursor Parallax Tracking Refs (Zero React re-renders)
  const featTiltRafRef = useRef(null);
  const featTiltTargetRef = useRef({ x: 0, y: 0, glow: 0, cx: 0, cy: 0 });
  const featTiltCurrentRef = useRef({ x: 0, y: 0, glow: 0, cx: 0, cy: 0 });

  // Features Mouse Cursor Parallax Tracking (Zero React re-renders)
  const handleFeaturesPointerMove = useCallback((e) => {
    if (!featuresSceneRef.current) return;
    const rect = featuresSceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = ((x / rect.width) - 0.5) * 2; // -1 to 1
    const ny = ((y / rect.height) - 0.5) * 2; // -1 to 1

    featTiltTargetRef.current = {
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
      glow: 1,
      cx: x,
      cy: y,
    };

    if (!featTiltRafRef.current) {
      const animateTilt = () => {
        const cur = featTiltCurrentRef.current;
        const target = featTiltTargetRef.current;
        cur.x += (target.x - cur.x) * 0.08;
        cur.y += (target.y - cur.y) * 0.08;
        cur.glow += (target.glow - cur.glow) * 0.08;
        cur.cx += (target.cx - cur.cx) * 0.15;
        cur.cy += (target.cy - cur.cy) * 0.15;

        if (featuresSceneRef.current) {
          featuresSceneRef.current.style.setProperty('--feat-tilt-x', cur.x.toFixed(4));
          featuresSceneRef.current.style.setProperty('--feat-tilt-y', cur.y.toFixed(4));
          featuresSceneRef.current.style.setProperty('--feat-cursor-glow', cur.glow.toFixed(3));
          featuresSceneRef.current.style.setProperty('--feat-cursor-x', `${cur.cx.toFixed(1)}px`);
          featuresSceneRef.current.style.setProperty('--feat-cursor-y', `${cur.cy.toFixed(1)}px`);
        }

        const isSettled =
          Math.abs(cur.x - target.x) < 0.001 &&
          Math.abs(cur.y - target.y) < 0.001 &&
          Math.abs(cur.glow - target.glow) < 0.005;

        if (!isSettled) {
          featTiltRafRef.current = requestAnimationFrame(animateTilt);
        } else {
          featTiltRafRef.current = null;
        }
      };
      featTiltRafRef.current = requestAnimationFrame(animateTilt);
    }
  }, []);

  const handleFeaturesPointerLeave = useCallback(() => {
    featTiltTargetRef.current = { x: 0, y: 0, glow: 0, cx: 0, cy: 0 };
    if (!featTiltRafRef.current) {
      const animateReset = () => {
        const cur = featTiltCurrentRef.current;
        const target = featTiltTargetRef.current;
        cur.x += (target.x - cur.x) * 0.08;
        cur.y += (target.y - cur.y) * 0.08;
        cur.glow += (target.glow - cur.glow) * 0.08;

        if (featuresSceneRef.current) {
          featuresSceneRef.current.style.setProperty('--feat-tilt-x', cur.x.toFixed(4));
          featuresSceneRef.current.style.setProperty('--feat-tilt-y', cur.y.toFixed(4));
          featuresSceneRef.current.style.setProperty('--feat-cursor-glow', cur.glow.toFixed(3));
        }

        if (Math.abs(cur.x) > 0.001 || Math.abs(cur.y) > 0.001 || cur.glow > 0.005) {
          featTiltRafRef.current = requestAnimationFrame(animateReset);
        } else {
          featTiltRafRef.current = null;
        }
      };
      featTiltRafRef.current = requestAnimationFrame(animateReset);
    }
  }, []);

  // Hero Interactive Dot Grid Pointer Tracking (Zero React re-renders)
  const updateHeroPointer = useCallback((clientX, clientY) => {
    if (!heroSceneRef.current) return;
    const rect = heroSceneRef.current.getBoundingClientRect();
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);

    if (heroRafRef.current) cancelAnimationFrame(heroRafRef.current);
    heroRafRef.current = requestAnimationFrame(() => {
      if (heroSceneRef.current) {
        heroSceneRef.current.style.setProperty('--mouse-x', `${x}px`);
        heroSceneRef.current.style.setProperty('--mouse-y', `${y}px`);
        heroSceneRef.current.style.setProperty('--mouse-active', '1');
      }
    });
  }, []);

  const handleHeroPointerMove = (e) => {
    updateHeroPointer(e.clientX, e.clientY);
  };

  const handleHeroPointerEnter = (e) => {
    updateHeroPointer(e.clientX, e.clientY);
  };

  const handleHeroPointerLeave = () => {
    if (heroRafRef.current) cancelAnimationFrame(heroRafRef.current);
    if (heroSceneRef.current) {
      heroSceneRef.current.style.setProperty('--mouse-active', '0');
    }
  };

  const handleHeroTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updateHeroPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Character Dual-Layer Pointer Tracking
  const updateCharacterPointer = useCallback((clientX, clientY) => {
    if (!charStageRef.current) return;
    const rect = charStageRef.current.getBoundingClientRect();
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);

    if (charRafRef.current) cancelAnimationFrame(charRafRef.current);
    charRafRef.current = requestAnimationFrame(() => {
      if (charStageRef.current) {
        charStageRef.current.style.setProperty('--char-x', `${x}px`);
        charStageRef.current.style.setProperty('--char-y', `${y}px`);
        charStageRef.current.style.setProperty('--char-active', '1');
      }
    });
  }, []);

  const handleCharacterPointerMove = (e) => {
    updateCharacterPointer(e.clientX, e.clientY);
  };

  const handleCharacterPointerLeave = () => {
    if (charRafRef.current) cancelAnimationFrame(charRafRef.current);
    if (charStageRef.current) {
      charStageRef.current.style.setProperty('--char-active', '0');
    }
  };

  const handleCharacterTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updateCharacterPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    return () => {
      if (heroRafRef.current) cancelAnimationFrame(heroRafRef.current);
      if (charRafRef.current) cancelAnimationFrame(charRafRef.current);
      if (featTiltRafRef.current) cancelAnimationFrame(featTiltRafRef.current);
    };
  }, []);

  // Master Scroll Architecture using GSAP ScrollTrigger
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scenes = [
        heroSceneRef.current,
        aboutSceneRef.current,
        featuresSceneRef.current,
        gamesSceneRef.current,
        sponsorsSceneRef.current,
        contactSceneRef.current,
      ];

      // Master Pinned Scroll Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () =>
            typeof window !== 'undefined' && window.innerWidth < 768
              ? '+=16000'
              : '+=26000',
          pin: pinnedStageRef.current,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;

            // 1. Hero Laser Scan & Typography Scramble (normalized over p: 0.00 to 0.065)
            const heroProgress = Math.min(1, Math.max(0, p / 0.065));

            if (charStageRef.current) {
              const laserYPercent = (heroProgress * 100).toFixed(2);
              charStageRef.current.style.setProperty('--laser-y', `${laserYPercent}%`);

              let laserOpacity = 0;
              if (heroProgress > 0.005 && heroProgress < 0.98) {
                laserOpacity = Math.min(1, heroProgress * 10);
              } else if (heroProgress >= 0.98) {
                laserOpacity = Math.max(0, 1 - (heroProgress - 0.98) * 50);
              }
              charStageRef.current.style.setProperty('--laser-opacity', laserOpacity.toFixed(2));
            }

            // Scramble Outlined Wordmark: EVOQ -> BEYOND
            if (bgWordmarkRef.current) {
              bgWordmarkRef.current.textContent = scrambleWord('EVOQ', 'BEYOND', heroProgress);
            }

            // Scramble Foreground Headline: ESPORTS -> GAMING
            if (fgWordmarkRef.current) {
              fgWordmarkRef.current.textContent = scrambleWord('ESPORTS', 'GAMING', heroProgress);
            }

            // Scroll-Driven Semantic Hero Paragraph Transformation
            if (heroDescRef.current) {
              const isReducedMotion =
                typeof window !== 'undefined' &&
                window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

              if (!isReducedMotion) {
                const roundedP = Math.round(heroProgress * 300) / 300;
                if (roundedP !== lastParagraphProgressRef.current) {
                  lastParagraphProgressRef.current = roundedP;
                  heroDescRef.current.innerHTML = renderSemanticParagraph(roundedP);
                }
              }
            }

            // Update HUD labels dynamically with scan telemetry
            if (levelProgressRef.current) {
              levelProgressRef.current.textContent = `LEVEL PROGRESS ${String(Math.round(heroProgress * 100)).padStart(3, '0')}%`;
            }
            if (statusLabelRef.current) {
              statusLabelRef.current.textContent = heroProgress >= 0.95 ? 'STATUS: ASCENDED' : 'STATUS: PLAYER';
            }
            if (scrollCueRef.current) {
              scrollCueRef.current.textContent = heroProgress >= 0.95 ? 'IDENTITY SYNCHRONIZED' : 'SCROLL TO LEVEL UP';
            }

            // 2. Active Scene Selection with calibrated thresholds (About reduced by ~18%)
            let currentIdx = 0;
            if (p < 0.08) currentIdx = 0;
            else if (p < 0.17) currentIdx = 1;
            else if (p < 0.58) currentIdx = 2;
            else if (p < 0.80) currentIdx = 3;
            else if (p < 0.90) currentIdx = 4;
            else currentIdx = 5;

            setActiveScene(currentIdx);

            // Sub-progress for Features (Scene 03: p = 0.17 to 0.58 => 10,660px / 8 = 1,332.5px/feature)
            if (p >= 0.17 && p < 0.58) {
              const featP = (p - 0.17) / 0.41;
              const rawFeat = featP * 8;
              const fIdx = Math.min(7, Math.max(0, Math.floor(rawFeat)));
              const subP = rawFeat - fIdx;

              if (fIdx !== activeFeatureIdxRef.current) {
                activeFeatureIdxRef.current = fIdx;
                setActiveFeatureIdx(fIdx);
              }

              // Continuous 3D perspective tunnel depth translation
              if (tunnelStageRef.current) {
                tunnelStageRef.current.style.setProperty(
                  '--tunnel-scroll-z',
                  `${(featP * 880).toFixed(1)}px`
                );
                tunnelStageRef.current.style.setProperty(
                  '--tunnel-scroll-y',
                  `${(-featP * 40).toFixed(1)}px`
                );
              }

              // Controlled one-at-a-time transition with generous reading plateau:
              // 0.00 to 0.75: stable reading plateau (100% opacity, crisp focus)
              // 0.75 to 1.00: gentle dissolve/entry transition
              if (featureContentRef.current) {
                let featOpacity = 1;
                let featScale = 1;

                if (subP < 0.12 && fIdx > 0) {
                  const entryP = subP / 0.12;
                  featOpacity = 0.45 + entryP * 0.55;
                  featScale = 0.98 + entryP * 0.02;
                } else if (subP > 0.75) {
                  const exitP = (subP - 0.75) / 0.25;
                  featOpacity = 1 - exitP * 0.55;
                  featScale = 1 - exitP * 0.02;
                }

                featureContentRef.current.style.opacity = featOpacity.toFixed(3);
                if (window.innerWidth >= 768) {
                  featureContentRef.current.style.transform = `scale(${featScale.toFixed(3)})`;
                } else {
                  featureContentRef.current.style.transform = 'none';
                }
              }
            } else if (featureContentRef.current) {
              featureContentRef.current.style.opacity = '1';
              featureContentRef.current.style.transform = window.innerWidth >= 768 ? 'scale(1)' : 'none';
            }

            // Sub-progress for Games (Scene 04: p = 0.58 to 0.80 => 5,720px / 5 = 1,144px/game)
            if (p >= 0.58 && p < 0.80) {
              const gameP = (p - 0.58) / 0.22;
              const rawGame = gameP * 5;
              const gIdx = Math.min(4, Math.max(0, Math.floor(rawGame)));

              if (gIdx !== activeGameIdxRef.current) {
                activeGameIdxRef.current = gIdx;
                setActiveGameIdx(gIdx);
              }

              // Smooth radar telemetry transition
              if (gameRadarRef.current) {
                const subG = rawGame - gIdx;
                let gameOpacity = 1;

                if (subG < 0.15 && gIdx > 0) {
                  const entryP = subG / 0.15;
                  gameOpacity = 0.45 + entryP * 0.55;
                } else if (subG > 0.80) {
                  const exitP = (subG - 0.80) / 0.20;
                  gameOpacity = 1 - exitP * 0.55;
                }

                gameRadarRef.current.style.opacity = gameOpacity.toFixed(3);
              }
            } else if (gameRadarRef.current) {
              gameRadarRef.current.style.opacity = '1';
            }
          },
        },
      });

      // Initial state: Hero scene visible
      gsap.set(scenes[0], { opacity: 1, autoAlpha: 1, scale: 1 });
      for (let i = 1; i < scenes.length; i++) {
        gsap.set(scenes[i], { opacity: 0, autoAlpha: 0, scale: 0.98 });
      }

      // ─── HERO CONTENT INITIAL LOAD FADE-IN ENTRANCE ───
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const heroDotGrid = heroSceneRef.current?.querySelector('.hero-dot-grid-base');
      const heroBg = bgWordmarkRef.current;
      const heroChar = charStageRef.current;
      const heroFg = fgWordmarkRef.current;
      const heroHud = heroSceneRef.current?.querySelector('.hud-layer');

      if (prefersReducedMotion) {
        gsap.set([heroDotGrid, heroBg, heroChar, heroFg, heroHud], { opacity: 1 });
      } else {
        const heroEntranceTl = gsap.timeline({
          defaults: { ease: 'power2.out' },
        });

        // Coordinated cinematic entrance: Dot grid -> EVOQ -> Athlete -> ESPORTS -> HUD
        if (heroDotGrid) {
          heroEntranceTl.fromTo(heroDotGrid, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.15);
        }
        if (heroBg) {
          heroEntranceTl.fromTo(heroBg, { opacity: 0 }, { opacity: 1, duration: 1.3 }, 0.45);
        }
        if (heroChar) {
          heroEntranceTl.fromTo(heroChar, { opacity: 0 }, { opacity: 1, duration: 1.35 }, 0.7);
        }
        if (heroFg) {
          heroEntranceTl.fromTo(heroFg, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.95);
        }
        if (heroHud) {
          heroEntranceTl.fromTo(heroHud, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 1.15);
        }
      }

      // ─── SCENE TRANSITION TIMELINE (Total 26.0s duration maps directly to 26,000px scroll) ───
      masterTl
        // 1. Hero -> About (p: 0.08 = 2.08s)
        .to(scenes[0], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 0.30, ease: 'power2.inOut' }, 1.85)
        .to(scenes[1], { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.30, ease: 'power2.inOut' }, 2.05)

        // 2. About -> Features (3D Tunnel) (p: 0.17 = 4.42s)
        .to(scenes[1], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 0.30, ease: 'power2.inOut' }, 4.18)
        .to(scenes[2], { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.30, ease: 'power2.inOut' }, 4.38)

        // 3. Features -> Games (p: 0.58 = 15.08s)
        .to(scenes[2], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 0.30, ease: 'power2.inOut' }, 14.85)
        .to(scenes[3], { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.30, ease: 'power2.inOut' }, 15.05)

        // 4. Games -> Sponsors (p: 0.80 = 20.80s)
        .to(scenes[3], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 0.35, ease: 'power2.inOut' }, 20.55)
        .to(scenes[4], { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.inOut' }, 20.75)

        // 5. Sponsors -> Contact (p: 0.90 = 23.40s)
        .to(scenes[4], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 0.35, ease: 'power2.inOut' }, 23.15)
        .to(scenes[5], { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.inOut' }, 23.35)

        // Pinned timeline tail anchor to guarantee exactly 26.0s total duration
        .set({}, {}, 26.0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Navbar link click navigation to scenes
  const handleNavToScene = (href) => {
    let scrollFraction = 0;
    if (href === '#about') scrollFraction = 0.11;
    else if (href === '#features' || href === '#tournaments') scrollFraction = 0.20;
    else if (href === '#games') scrollFraction = 0.60;
    else if (href === '#sponsors') scrollFraction = 0.83;
    else if (href === '#contact') scrollFraction = 0.93;

    const totalScroll =
      typeof window !== 'undefined' && window.innerWidth < 768 ? 16000 : 26000;
    window.scrollTo({
      top: scrollFraction * totalScroll,
      behavior: 'smooth',
    });
  };

  // Navigate smoothly between features
  const goToFeature = useCallback((idx) => {
    const boundedIdx = Math.max(0, Math.min(FEATURES_LIST.length - 1, idx));
    setActiveFeatureIdx(boundedIdx);
    activeFeatureIdxRef.current = boundedIdx;
    const targetP = 0.17 + (boundedIdx + 0.35) * (0.41 / 8);
    const total =
      typeof window !== 'undefined' && window.innerWidth < 768 ? 16000 : 26000;
    window.scrollTo({
      top: targetP * total,
      behavior: 'smooth',
    });
  }, []);

  // Navigate smoothly between games
  const goToGame = useCallback((idx) => {
    const boundedIdx = Math.max(0, Math.min(GAMES_LIST.length - 1, idx));
    setActiveGameIdx(boundedIdx);
    activeGameIdxRef.current = boundedIdx;
    const targetP = 0.58 + (boundedIdx + 0.35) * (0.22 / 5);
    const total =
      typeof window !== 'undefined' && window.innerWidth < 768 ? 16000 : 26000;
    window.scrollTo({
      top: targetP * total,
      behavior: 'smooth',
    });
  }, []);

  const currentFeature = FEATURES_LIST[activeFeatureIdx];
  const currentGame = GAMES_LIST[activeGameIdx];

  return (
    <div className="evoq-master-root" ref={containerRef}>
      {/* 1. Global Fixed Reusable Navbar */}
      <Navbar
        links={[
          { label: 'About', href: '#about' },
          { label: 'Features', href: '#features' },
          { label: 'Games', href: '#games' },
          { label: 'Tournaments', href: '/tournaments' },
          { label: 'Contact', href: '#contact' },
        ]}
        actionLabel="Login"
        actionHref="/login"
        activeScene={activeScene}
        onNavigate={handleNavToScene}
      />

      {/* 2. Master Scroll Track & Pinned Cinematic Stage */}
      <div className="evoq-scroll-track">
        <div className="evoq-pinned-stage" ref={pinnedStageRef}>
          <div className="evoq-scenes-stack">

            {/* ═══════════════════════════════════════════════════════
                SCENE 01: HERO / PLAYER IDENTITY (SCREENSHOT 1)
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-hero ${activeScene === 0 ? 'scene-active' : ''}`}
              ref={heroSceneRef}
              id="hero"
              onPointerMove={handleHeroPointerMove}
              onPointerEnter={handleHeroPointerEnter}
              onPointerLeave={handleHeroPointerLeave}
              onTouchMove={handleHeroTouchMove}
              onTouchStart={handleHeroTouchMove}
              onTouchEnd={handleHeroPointerLeave}
              onTouchCancel={handleHeroPointerLeave}
            >
              {/* Interactive Dot Grid Background (Primary Requirement) */}
              <div className="hero-dot-grid-base" aria-hidden="true" />
              <div className="hero-ambient-glow" aria-hidden="true" />
              <div className="hero-dot-grid-glow" aria-hidden="true" />

              {/* Massive Outlined Background Typography: EVOQ -> BEYOND */}
              <div className="hero-bg-wordmark" ref={bgWordmarkRef} aria-hidden="true">
                EVOQ
              </div>

              {/* Central Character Stage: Base + Scroll Laser Scan + Hover Reveal */}
              <div
                className="hero-character-stage"
                ref={charStageRef}
                onPointerMove={handleCharacterPointerMove}
                onPointerLeave={handleCharacterPointerLeave}
                onTouchMove={handleCharacterTouchMove}
                onTouchStart={handleCharacterTouchMove}
                onTouchEnd={handleCharacterPointerLeave}
                onTouchCancel={handleCharacterPointerLeave}
              >
                {/* Layer 1: Base Player Image */}
                <img
                  src="/images/one.png"
                  alt="EVOQ Esports Competitor"
                  className="hero-char-img hero-char-base"
                />

                {/* Layer 2: Progressive Scroll Laser Reveal Layer */}
                <div
                  className="hero-char-scroll-reveal"
                  aria-hidden="true"
                >
                  <img
                    src="/images/two2.png"
                    alt="EVOQ Transformed Competitor"
                    className="hero-char-img hero-char-transformed"
                  />
                </div>

                {/* Layer 3: Thin Glowing Horizontal Laser Bar (Travels Vertically) */}
                <div
                  className="hero-char-laser-bar"
                  aria-hidden="true"
                >
                  <div className="hero-laser-line-core" />
                  <div className="hero-laser-line-glow" />
                  <div className="hero-laser-spill" />
                  <div className="hero-laser-endcap left" />
                  <div className="hero-laser-endcap right" />
                </div>

                {/* Layer 4: Interactive Circular Hover Reveal Layer */}
                <div className="hero-char-reveal-layer" aria-hidden="true">
                  <img
                    src="/images/two2.png"
                    alt="EVOQ Esports Competitor Visor Scan"
                    className="hero-char-img hero-char-enhanced"
                  />
                  <div className="hero-char-radar-ring" />
                </div>
              </div>

              {/* Foreground Massive Headline: ESPORTS -> GAMING */}
              <div className="hero-fg-wordmark" ref={fgWordmarkRef} aria-hidden="true">
                ESPORTS
              </div>

              {/* Technical HUD Overlay (Screenshot 1 Placement) */}
              <div className="hud-layer">
                <div className="hud-top-row">
                  {/* <div className="hud-tag">
                    <span className="hud-pip" />
                    <span>EVOQ / PLAYER ONE</span>
                  </div> */}
                  {/* <div className="hud-top-right">
                    GAMERS / TEAMS / ORGANIZERS
                  </div> */}
                </div>

                <div className="hud-bottom-row">
                  <div className="hud-desc-box">
                    <p className="hud-desc-text" ref={heroDescRef}>
                      EVOQ connects gamers, teams, and tournament organizers on one professional esports platform. Discover tournaments, compete with players, and showcase your gaming skills.
                    </p>
                  </div>

                  <div className="hud-scroll-cue">
                    <svg className="hud-scroll-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                    <span ref={scrollCueRef}>SCROLL TO LEVEL UP</span>
                  </div>

                  {/* <div className="hud-status-box">
                    <div className="hud-level-label" ref={levelProgressRef}>LEVEL PROGRESS 000%</div>
                    <div className="hud-status-val" ref={statusLabelRef}>STATUS: PLAYER</div>
                  </div> */}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SCENE 02: ABOUT EVOQ (EDITORIAL MINIMAL)
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-about ${activeScene === 1 ? 'scene-active' : ''}`}
              ref={aboutSceneRef}
              id="about"
            >
              <div className="about-content-wrap">
                <div className="about-tag-header">
                  <span>// ABOUT EVOQ · EST. 2026</span>
                </div>

                <div className="about-hero-block">
                  <h2 className="about-main-headline">
                    ONE PLATFORM TO PLAY, <span className="lime">COMPETE</span> & BUILD YOUR ESPORTS <span className="lime">IDENTITY.</span>
                  </h2>
                  <p className="about-main-desc">
                    EVOQ connects gamers, teams and tournament organizers in one place. Discover competitions, manage tournaments, track results and turn your achievements into a professional gaming profile.
                  </p>
                </div>

                <div className="about-pillars-grid">
                  <div className="about-pillar-card">
                    <div className="about-pillar-num">01 / FOR GAMERS</div>
                    <div className="about-pillar-title">FIND & <span className="lime">COMPETE</span></div>
                    <p className="about-pillar-text">
                      Discover tournaments, join teams and compete in events that match your game.
                    </p>
                  </div>

                  <div className="about-pillar-card">
                    <div className="about-pillar-num">02 / FOR ORGANIZERS</div>
                    <div className="about-pillar-title">RUN <span className="lime">TOURNAMENTS</span></div>
                    <p className="about-pillar-text">
                      Create events, manage registrations, organize matches and publish results from one dashboard.
                    </p>
                  </div>

                  <div className="about-pillar-card">
                    <div className="about-pillar-num">03 / FOR PLAYERS</div>
                    <div className="about-pillar-title">BUILD YOUR <span className="lime">LEGACY</span></div>
                    <p className="about-pillar-text">
                      Showcase your tournament results and approved achievements on your gaming profile.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SCENE 03: FEATURES / 3D PERSPECTIVE TUNNEL (SCREENSHOT 2)
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-features ${activeScene === 2 ? 'scene-active' : ''}`}
              ref={featuresSceneRef}
              id="features"
              onPointerMove={handleFeaturesPointerMove}
              onPointerLeave={handleFeaturesPointerLeave}
            >
              {/* Subtle Cursor Follow Lime Glow in background */}
              <div className="features-cursor-glow" aria-hidden="true" />

              {/* 16-Frame Nested Rectangular Wireframe Depth Tunnel */}
              <div className="tunnel-stage" ref={tunnelStageRef} aria-hidden="true">
                {/* Subtle perspective grid lines converging toward center */}
                <svg className="tunnel-perspective-rays" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  {/* Outer corner perspective rays */}
                  <line x1="0" y1="0" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.55)" strokeWidth="1" />
                  <line x1="1000" y1="0" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.55)" strokeWidth="1" />
                  <line x1="1000" y1="600" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.55)" strokeWidth="1" />
                  <line x1="0" y1="600" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.55)" strokeWidth="1" />
                  {/* Subtle technical crosshair and tertiary perspective lines */}
                  <line x1="250" y1="0" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
                  <line x1="750" y1="0" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
                  <line x1="250" y1="600" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
                  <line x1="750" y1="600" x2="500" y2="300" stroke="rgba(37, 45, 34, 0.25)" strokeWidth="0.8" strokeDasharray="6 6" />
                  <line x1="0" y1="300" x2="1000" y2="300" stroke="rgba(201, 255, 82, 0.08)" strokeWidth="0.5" strokeDasharray="4 8" />
                  <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(201, 255, 82, 0.08)" strokeWidth="0.5" strokeDasharray="4 8" />
                </svg>

                {/* 16 Progressively Smaller Nested Wireframe Frames */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const zPos = 120 - i * 110;
                  const isAccent = i === 2 || i === 6 || i === 11;
                  const parallaxMult = (0.35 + (i / 15) * 0.95).toFixed(3);
                  return (
                    <div
                      key={i}
                      className={`tunnel-frame ${isAccent ? 'frame-accent' : ''}`}
                      style={{
                        '--frame-z': `${zPos}px`,
                        '--parallax-mult': parallaxMult,
                        width: `calc(106vw - ${i * 4.6}vw)`,
                        height: `calc(106vh - ${i * 4.6}vh)`,
                      }}
                    >
                      {isAccent && (
                        <span className="tunnel-depth-tag">
                          // Z-{Math.abs(zPos)}M
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Subtle ambient lime glow behind feature card */}
              <div className="features-ambient-glow" aria-hidden="true" />

              {/* Active Features HUD & Clean Foreground Content (No Background Clutter) */}
              <div className="features-container">
                <div className="features-top-hud">
                  <span>// EXPLORE EVOQ FEATURES</span>
                  <span className="active-counter">{currentFeature.num} / 08 FEATURES</span>
                </div>

                {/* Clean Foreground Feature Stage: Active Feature Only */}
                <div className="features-main-stage" ref={featureContentRef}>
                  {/* Left Column: Number, Title, Description, Path */}
                  <div className="feature-left-pane">
                    <div className="feature-number-outlined">{currentFeature.num}</div>
                    <h3 className="feature-title-huge">{currentFeature.title}</h3>
                    <p className="feature-desc-text">{currentFeature.desc}</p>
                    <div className="feature-path-tag">
                      {currentFeature.path} <span>// {currentFeature.tag}</span>
                    </div>
                  </div>

                  {/* Right Column: Approved Feature Demonstration Panel */}
                  <div className="feature-right-pane">
                    <div className="feature-card-glow-edge" />
                    <div className="feature-corner-tick tl" />
                    <div className="feature-corner-tick tr" />
                    <div className="feature-corner-tick bl" />
                    <div className="feature-corner-tick br" />

                    <div className="feature-visual-content">
                      {renderFeatureVisual(activeFeatureIdx)}
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Controls: Previous Arrow + Pips + Next Arrow */}
                <div className="features-nav-controls">
                  <button
                    type="button"
                    className="section-nav-arrow arrow-prev"
                    onClick={() => goToFeature(activeFeatureIdx - 1)}
                    disabled={activeFeatureIdx === 0}
                    aria-label="Previous Feature"
                    title="Previous Feature"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="features-nav-strip">
                    {FEATURES_LIST.map((feat, idx) => (
                      <div
                        key={feat.num}
                        className={`feature-pip ${idx === activeFeatureIdx ? 'active' : ''}`}
                        onClick={() => goToFeature(idx)}
                        role="button"
                        aria-label={`Feature ${feat.num}`}
                        tabIndex={0}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="section-nav-arrow arrow-next"
                    onClick={() => goToFeature(activeFeatureIdx + 1)}
                    disabled={activeFeatureIdx === FEATURES_LIST.length - 1}
                    aria-label="Next Feature"
                    title="Next Feature"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SCENE 04: SUPPORTED GAMES (SCREENSHOT 3)
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-games ${activeScene === 3 ? 'scene-active' : ''}`}
              ref={gamesSceneRef}
              id="games"
            >
              <div className="games-layout-stage">
                {/* Left Side: Game List Stack */}
                <div className="games-list-stack">
                  {GAMES_LIST.map((game, idx) => {
                    const isSelected = idx === activeGameIdx;
                    return (
                      <div
                        key={game.name}
                        className={`game-list-row ${isSelected ? 'active' : ''}`}
                        onClick={() => goToGame(idx)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${game.name}`}
                      >
                        <div className="game-row-left">
                          <span className="game-tag-pwr">{game.pwr}</span>
                          <span className="game-name-title">{game.name}</span>
                        </div>
                        <span className="game-status-badge">
                          {game.activeStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Side: Pentagon Radar Scan & Metrics */}
                <div className="games-radar-card" ref={gameRadarRef}>
                  <div className="radar-header-row">
                    <span className="scan-id">SCAN / {currentGame.pwr}</span>
                    <span className="live-status">
                      <span className="live-dot" /> LIVE TELEMETRY
                    </span>
                  </div>

                  {/* SVG Pentagon Attribute Chart */}
                  <div className="radar-svg-container">
                    <div className="radar-sweep-beam" />
                    <svg width="220" height="200" viewBox="0 0 220 200">
                      {/* Concentric Pentagon Guides */}
                      {[0.3, 0.6, 1].map((scale, sIdx) => (
                        <polygon
                          key={sIdx}
                          points={`${110},${100 - 75 * scale} ${110 + 72 * scale},${100 - 23 * scale} ${110 + 44 * scale},${100 + 60 * scale} ${110 - 44 * scale},${100 + 60 * scale} ${110 - 72 * scale},${100 - 23 * scale}`}
                          fill="none"
                          stroke="rgba(37, 45, 34, 0.8)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Axes */}
                      <line x1="110" y1="100" x2="110" y2="25" stroke="rgba(37, 45, 34, 0.9)" />
                      <line x1="110" y1="100" x2="182" y2="77" stroke="rgba(37, 45, 34, 0.9)" />
                      <line x1="110" y1="100" x2="154" y2="160" stroke="rgba(37, 45, 34, 0.9)" />
                      <line x1="110" y1="100" x2="66" y2="160" stroke="rgba(37, 45, 34, 0.9)" />
                      <line x1="110" y1="100" x2="38" y2="77" stroke="rgba(37, 45, 34, 0.9)" />

                      {/* Dynamic Game Polygon */}
                      <polygon
                        points={currentGame.polygonPoints}
                        fill="rgba(201, 255, 82, 0.18)"
                        stroke="#C9FF52"
                        strokeWidth="2"
                      />

                      {/* Attribute Labels */}
                      {/* <text x="110" y="16" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono" textAnchor="middle">AIM</text> */}
                      {/* <text x="194" y="80" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">STRATEGY</text> */}
                      {/* <text x="162" y="180" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">TEAMWORK</text> */}
                      {/* <text x="46" y="180" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">PACE</text> */}
                      {/* <text x="26" y="80" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono" textAnchor="end">TACTICS</text> */}
                    </svg>
                  </div>

                  <div className="game-detail-footer">
                    <div className="game-detail-header-flex">
                      <h4 className="game-detail-title">{currentGame.name}</h4>
                      {/* Games Navigation Arrows */}
                      <div className="games-nav-controls">
                        <button
                          type="button"
                          className="section-nav-arrow arrow-prev"
                          onClick={() => goToGame(activeGameIdx - 1)}
                          disabled={activeGameIdx === 0}
                          aria-label="Previous Game"
                          title="Previous Game"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="games-nav-counter">
                          0{activeGameIdx + 1} / 0{GAMES_LIST.length}
                        </span>
                        <button
                          type="button"
                          className="section-nav-arrow arrow-next"
                          onClick={() => goToGame(activeGameIdx + 1)}
                          disabled={activeGameIdx === GAMES_LIST.length - 1}
                          aria-label="Next Game"
                          title="Next Game"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="game-detail-desc">{currentGame.tagline}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SCENE 05: SPONSORS & COLLABORATIONS
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-sponsors ${activeScene === 4 ? 'scene-active' : ''}`}
              ref={sponsorsSceneRef}
              id="sponsors"
            >
              <div className="sponsors-stage-inner">
                <div className="sponsors-heading-block">
                  <span className="sponsors-super-tag">// PARTNERS & ECOSYSTEM</span>
                  <h3 className="sponsors-title">COLLABORATION NETWORK</h3>
                </div>

                <div className="sponsors-grid">
                  {SPONSORS_LIST.map((sp) => (
                    <div key={sp.brand} className="sponsor-card">
                      <div className="sponsor-card-top">
                        <span className="code">{sp.code}</span>
                        <span>OFFICIAL TECH</span>
                      </div>
                      <div className="sponsor-brand-name">{sp.brand}</div>
                      <div className="sponsor-card-role">{sp.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                SCENE 06: CONTACT (EDITORIAL CLOSING SCENE)
                ═══════════════════════════════════════════════════════ */}
            <section
              className={`evoq-scene scene-contact ${activeScene === 5 ? 'scene-active' : ''}`}
              ref={contactSceneRef}
              id="contact"
            >
              <div className="contact-stage-inner">
                <span className="contact-eyebrow">// DIRECT CHANNEL COMMUNICATIONS</span>
                <h2 className="contact-massive-heading">
                  LET'S BUILD THE <span className="lime">FUTURE OF ESPORTS.</span>
                </h2>

                <div className="contact-channels-grid">
                  <a href="mailto:contact@evoq.gg" className="contact-channel-item">
                    <span className="contact-channel-label">01 / DIRECT INQUIRIES</span>
                    <span className="contact-channel-val">contact@evoq.gg</span>
                  </a>

                  <a href="mailto:organizers@evoq.gg" className="contact-channel-item">
                    <span className="contact-channel-label">02 / ORGANIZER NETWORK</span>
                    <span className="contact-channel-val">organizers@evoq.gg</span>
                  </a>

                  <a href="https://discord.gg" target="_blank" rel="noreferrer" className="contact-channel-item">
                    <span className="contact-channel-label">03 / DISCORD COMMUNITY</span>
                    <span className="contact-channel-val">discord.gg/evoq</span>
                  </a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 07: FOOTER FLOW (NATURAL DOCUMENT FINISH)
          ═══════════════════════════════════════════════════════════ */}
      <footer className="evoq-footer-flow" id="footer">
        <div className="footer-inner-wrap">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <Link to="/" className="evoq-logo-link">
                <span className="evoq-logo-text">EVOQ</span>
                <span className="evoq-logo-dot" />
              </Link>
              <p className="footer-tagline">
                The unified esports operating system and verified competitive network for players, teams and tournament organizers.
              </p>
            </div>

            <div className="footer-links-grid">
              <div className="footer-link-group">
                <span className="footer-group-title">DISCOVERY</span>
                <Link to="/tournaments" className="footer-link-item">Tournaments</Link>
                <Link to="/teams" className="footer-link-item">Teams</Link>
                <Link to="/organizations" className="footer-link-item">Organizations</Link>
              </div>

              <div className="footer-link-group">
                <span className="footer-group-title">PORTALS</span>
                <Link to="/login" className="footer-link-item">Gamer Sign In</Link>
                <Link to="/organizer/login" className="footer-link-item">Organizer Hub</Link>
                <Link to="/register" className="footer-link-item">Register Account</Link>
              </div>

              <div className="footer-link-group">
                <span className="footer-group-title">NETWORK</span>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleNavToScene('#about'); }} className="footer-link-item">About EVOQ</a>
                <a href="#features" onClick={(e) => { e.preventDefault(); handleNavToScene('#features'); }} className="footer-link-item">Features Tunnel</a>
                <a href="#games" onClick={(e) => { e.preventDefault(); handleNavToScene('#games'); }} className="footer-link-item">Game Radar</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© 2026 EVOQ ESPORTS NETWORK. ALL RIGHTS RESERVED.</span>
            <div className="footer-status-pill">
              <span className="pulse-dot" />
              <span>SYSTEM ONLINE // VER 2.4.0-CINEMATIC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
