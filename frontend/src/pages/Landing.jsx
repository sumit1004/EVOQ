import { useEffect, useRef, useState, useCallback } from 'react';
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
    { label: 'Games', href: '#games' },
    { label: 'Tournaments', href: '#tournaments' },
    { label: 'Sponsors', href: '#sponsors' },
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
        defaults: { ease: 'power3.out' },
      });

      tl.to(surface, { scaleX: 1, opacity: 1, duration: 0.58, ease: 'power3.out' }, 0.05);
      tl.to(logo, { opacity: 1, x: 0, duration: 0.38, ease: 'power3.out' }, 0.28);

      if (navLinks.length > 0) {
        tl.to(
          navLinks,
          { opacity: 1, y: 0, duration: 0.34, stagger: 0.04, ease: 'power3.out' },
          0.32
        );
      }

      tl.to(right, { opacity: 1, x: 0, duration: 0.38, ease: 'power3.out' }, 0.34);

      if (mobileToggle) {
        tl.to(mobileToggle, { opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.38);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [links.length]);

  const handleLinkClick = (e, href, idx) => {
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
                (link.href === '#sponsors' && activeScene === 4) ||
                (link.href === '#contact' && activeScene === 5);

              return (
                <span key={link.label} className="evoq-nav-item">
                  <a
                    href={link.href}
                    className={`evoq-nav-link ${isCurrent ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, link.href, idx)}
                  >
                    {link.label}
                  </a>
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
          <div className="evoq-mobile-menu" role="dialog" aria-label="Mobile Navigation">
            {links.map((link, idx) => (
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
            ))}
          </div>
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
    metrics: { AIM: '092', STR: '078', TEA: '096', PAC: '088', TAC: '064' },
    polygonPoints: '110,35 178,78 162,168 58,168 42,78',
  },
  {
    pwr: 'PWR - 02',
    name: 'BGMI',
    activeStatus: 'ACTIVE',
    tagline: 'Tactical battle royale on massive 8x8 terrain. High-stakes zone rotations, vehicular assaults and clutch squad wipes.',
    metrics: { AIM: '088', STR: '094', TEA: '091', PAC: '074', TAC: '089' },
    polygonPoints: '110,42 165,82 155,160 65,160 55,82',
  },
  {
    pwr: 'PWR - 03',
    name: 'VALORANT',
    activeStatus: 'ACTIVE',
    tagline: 'Character-based 5v5 tactical shooter. Precise gunplay paired with unique agent utility across attack and retake executes.',
    metrics: { AIM: '098', STR: '089', TEA: '095', PAC: '082', TAC: '097' },
    polygonPoints: '110,28 172,74 158,164 62,164 48,74',
  },
  {
    pwr: 'PWR - 04',
    name: 'CALL OF DUTY',
    activeStatus: 'COMPATIBLE',
    tagline: 'Frantic gunfights, scorestreaks, and high-tempo search & destroy rounds in premier mobile and desktop circuits.',
    metrics: { AIM: '091', STR: '076', TEA: '084', PAC: '096', TAC: '078' },
    polygonPoints: '110,38 180,85 148,155 72,155 40,85',
  },
  {
    pwr: 'PWR - 05',
    name: 'CS2',
    activeStatus: 'COMPATIBLE',
    tagline: 'The gold standard of tactical counter-terrorist operations, sub-tick server precision and legendary esports legacy.',
    metrics: { AIM: '099', STR: '096', TEA: '092', PAC: '070', TAC: '098' },
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

/**
 * Procedural Topographic Background Canvas Component
 * Renders living technical elevation contours matching Screenshot 1.
 */
function TopographicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      t += 0.008;

      // Draw 9 undulating contour elevation lines
      const lineCount = 9;
      for (let i = 0; i < lineCount; i++) {
        const offsetRatio = (i + 1) / (lineCount + 1);
        ctx.beginPath();
        const baseAmp = 35 + i * 8;
        const freq = 0.0018 + i * 0.0003;

        for (let x = 0; x <= w; x += 12) {
          const y1 = Math.sin(x * freq + t + i * 0.4) * baseAmp;
          const y2 = Math.cos(x * freq * 1.5 - t * 0.7) * (baseAmp * 0.45);
          const y = h * offsetRatio + y1 + y2;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Highlight every 3rd contour in lime
        if (i % 3 === 0) {
          ctx.strokeStyle = 'rgba(201, 255, 82, 0.16)';
          ctx.lineWidth = 1.4;
        } else {
          ctx.strokeStyle = 'rgba(165, 170, 156, 0.06)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-topographic-canvas" aria-hidden="true" />;
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
          end: '+=5000',
          pin: pinnedStageRef.current,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            let currentIdx = 0;
            if (p < 0.18) currentIdx = 0;
            else if (p < 0.34) currentIdx = 1;
            else if (p < 0.58) currentIdx = 2;
            else if (p < 0.76) currentIdx = 3;
            else if (p < 0.90) currentIdx = 4;
            else currentIdx = 5;

            setActiveScene(currentIdx);

            // Sub-progress for Features (Scene 03)
            if (p >= 0.34 && p < 0.58) {
              const featP = (p - 0.34) / 0.24;
              const fIdx = Math.min(7, Math.max(0, Math.floor(featP * 8)));
              setActiveFeatureIdx(fIdx);
            }

            // Sub-progress for Games (Scene 04)
            if (p >= 0.58 && p < 0.76) {
              const gameP = (p - 0.58) / 0.18;
              const gIdx = Math.min(4, Math.max(0, Math.floor(gameP * 5)));
              setActiveGameIdx(gIdx);
            }
          },
        },
      });

      // Initial state: Hero scene visible
      gsap.set(scenes[0], { opacity: 1, autoAlpha: 1, scale: 1 });
      for (let i = 1; i < scenes.length; i++) {
        gsap.set(scenes[i], { opacity: 0, autoAlpha: 0, scale: 0.98 });
      }

      // ─── SCENE TRANSITION TIMELINE ───
      // 1. Hero -> About
      masterTl
        .to(scenes[0], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 1 }, 1.5)
        .to(scenes[1], { opacity: 1, autoAlpha: 1, scale: 1, duration: 1 }, 1.8)

        // 2. About -> Features (3D Tunnel)
        .to(scenes[1], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 1 }, 3.5)
        .to(scenes[2], { opacity: 1, autoAlpha: 1, scale: 1, duration: 1 }, 3.8)

        // 3. Features -> Games
        .to(scenes[2], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 1 }, 6.2)
        .to(scenes[3], { opacity: 1, autoAlpha: 1, scale: 1, duration: 1 }, 6.5)

        // 4. Games -> Sponsors
        .to(scenes[3], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 1 }, 8.4)
        .to(scenes[4], { opacity: 1, autoAlpha: 1, scale: 1, duration: 1 }, 8.7)

        // 5. Sponsors -> Contact
        .to(scenes[4], { opacity: 0, autoAlpha: 0, scale: 0.96, duration: 1 }, 10.4)
        .to(scenes[5], { opacity: 1, autoAlpha: 1, scale: 1, duration: 1 }, 10.7);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Navbar link click navigation to scenes
  const handleNavToScene = (href) => {
    let scrollFraction = 0;
    if (href === '#about') scrollFraction = 0.22;
    else if (href === '#features' || href === '#tournaments') scrollFraction = 0.44;
    else if (href === '#games') scrollFraction = 0.64;
    else if (href === '#sponsors') scrollFraction = 0.82;
    else if (href === '#contact') scrollFraction = 0.96;

    const totalScroll = 5000;
    window.scrollTo({
      top: scrollFraction * totalScroll,
      behavior: 'smooth',
    });
  };

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
          { label: 'Sponsors', href: '#sponsors' },
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
            >
              {/* Topographic Background & Technical Grid */}
              <TopographicCanvas />
              <div className="hero-grid-overlay" aria-hidden="true" />

              {/* Massive Outlined Background Typography */}
              <div className="hero-bg-wordmark" aria-hidden="true">
                EVOQ
              </div>

              {/* Head Reticle Reticles */}
              <div className="hero-reticle-head" aria-hidden="true" />

              {/* Central Character & Dual-Layer Hover Reveal */}
              <div
                className="hero-character-stage"
                ref={charStageRef}
                onPointerMove={handleCharacterPointerMove}
                onPointerLeave={handleCharacterPointerLeave}
                onTouchMove={handleCharacterTouchMove}
                onTouchStart={handleCharacterTouchMove}
              >
                {/* Base Player Image */}
                <img
                  src="/images/one.png"
                  alt="EVOQ Esports Competitor"
                  className="hero-char-img hero-char-base"
                />

                {/* Enhanced Visor Reveal Layer */}
                <div className="hero-char-reveal-layer" aria-hidden="true">
                  <img
                    src="/images/two.png"
                    alt="EVOQ Esports Competitor Visor Scan"
                    className="hero-char-img hero-char-enhanced"
                  />
                  <div className="hero-char-radar-ring" />
                </div>
              </div>

              {/* Foreground Massive Headline: ESPORTS */}
              <div className="hero-fg-wordmark" aria-hidden="true">
                ESPORTS
              </div>

              {/* Technical HUD Overlay (Exact match to Screenshot 1) */}
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
                    <p className="hud-desc-text">
                      EVOQ connects gamers, teams, and tournament organizers on one professional esports platform. Discover tournaments, compete with players, and showcase your gaming skills.
                    </p>
                  </div>

                  <div className="hud-scroll-cue">
                    <svg className="hud-scroll-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                    <span>SCROLL TO LEVEL UP</span>
                  </div>

                  {/* <div className="hud-status-box">
                    <div className="hud-level-label">LEVEL PROGRESS 000%</div>
                    <div className="hud-status-val">STATUS: PLAYER</div>
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
                  <span>// ABOUT THE OPERATING SYSTEM</span>
                  <span>EST. 2026</span>
                </div>

                <h2 className="about-main-headline">
                  WHERE COMPETITIVE GAMING MEETS <span className="lime">PROFESSIONAL RECOGNITION.</span>
                </h2>

                <div className="about-pillars-grid">
                  <div className="about-pillar-card">
                    <div className="about-pillar-num">01 / DISCOVER & COMPETE</div>
                    <div className="about-pillar-title">SANCTIONED BRACKETS</div>
                    <p className="about-pillar-text">
                      Access verified esports tournaments across multiple genres. Join solo qualifiers or register your squad with real-time seedings.
                    </p>
                  </div>

                  <div className="about-pillar-card">
                    <div className="about-pillar-num">02 / UNIFIED ECOSYSTEM</div>
                    <div className="about-pillar-title">ONE PLATFORM</div>
                    <p className="about-pillar-text">
                      Centralizing players, team captains and tournament organizers into one synchronized operational infrastructure.
                    </p>
                  </div>

                  <div className="about-pillar-card">
                    <div className="about-pillar-num">03 / TAMPER-PROOF CAREER</div>
                    <div className="about-pillar-title">VERIFIED IDENTITY</div>
                    <p className="about-pillar-text">
                      Every sanctioned match result and trophy translates into permanent, verified player credentials on your global gamer passport.
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
            >
              {/* 3D Wireframe Tunnel Frames */}
              <div className="tunnel-stage" aria-hidden="true">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`tunnel-frame ${i === 1 ? 'frame-accent' : ''}`}
                    style={{
                      width: `${600 + i * 160}px`,
                      height: `${400 + i * 105}px`,
                      transform: `translateZ(${-i * 180}px)`,
                    }}
                  />
                ))}
              </div>

              {/* Active Feature Content */}
              <div className="features-container">
                <div className="features-top-hud">
                  <span>// EXPLORE EVOQ FEATURES</span>
                  <span className="active-counter">{currentFeature.num} / 08 FEATURES</span>
                </div>

                <div className="features-main-stage">
                  {/* Left Pane */}
                  <div className="feature-left-pane">
                    <div className="feature-number-outlined">{currentFeature.num}</div>
                    <h3 className="feature-title-huge">{currentFeature.title}</h3>
                    <p className="feature-desc-text">{currentFeature.desc}</p>
                    <div className="feature-path-tag">
                      {currentFeature.path} <span>// {currentFeature.tag}</span>
                    </div>
                  </div>

                  {/* Right Perspective Panel (Screenshot 2) */}
                  <div className="feature-right-pane">
                    <div className="feature-card-glow-edge" />
                    <div className="feature-corner-tick tl" />
                    <div className="feature-corner-tick tr" />
                    <div className="feature-corner-tick bl" />
                    <div className="feature-corner-tick br" />

                    <div className="feature-visual-content">
                      <div className="feature-icon-badge">
                        <div className="feature-icon-circle">
                          {currentFeature.icon}
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', color: '#F4F5EF' }}>
                          EVOQ CORE ENGINE
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', color: '#C9FF52' }}>
                          MODULE READY // STATUS ONLINE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Pips */}
                <div className="features-nav-strip">
                  {FEATURES_LIST.map((feat, idx) => (
                    <div
                      key={feat.num}
                      className={`feature-pip ${idx === activeFeatureIdx ? 'active' : ''}`}
                      onClick={() => setActiveFeatureIdx(idx)}
                      role="button"
                      aria-label={`Feature ${feat.num}`}
                      tabIndex={0}
                    />
                  ))}
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
                        onClick={() => setActiveGameIdx(idx)}
                        onMouseEnter={() => setActiveGameIdx(idx)}
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
                <div className="games-radar-card">
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
                      <text x="110" y="16" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono" textAnchor="middle">AIM</text>
                      <text x="194" y="80" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">STRATEGY</text>
                      <text x="162" y="180" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">TEAMWORK</text>
                      <text x="46" y="180" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono">PACE</text>
                      <text x="26" y="80" fill="#A5AA9C" fontSize="10" fontFamily="Space Mono" textAnchor="end">TACTICS</text>
                    </svg>
                  </div>

                  <div className="game-detail-footer">
                    <h4 className="game-detail-title">{currentGame.name}</h4>
                    <p className="game-detail-desc">{currentGame.tagline}</p>
                    <div className="game-metrics-row">
                      <span>AIM <span className="val">{currentGame.metrics.AIM}</span></span>
                      <span>STR <span className="val">{currentGame.metrics.STR}</span></span>
                      <span>TEA <span className="val">{currentGame.metrics.TEA}</span></span>
                      <span>PAC <span className="val">{currentGame.metrics.PAC}</span></span>
                      <span>TAC <span className="val">{currentGame.metrics.TAC}</span></span>
                    </div>
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
