import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_DEMO_DATA } from './demoData.js';
import { DEMO_STEPS, DEMO_CHAPTERS } from './demoSequence.js';
import DemoHeader from './DemoHeader.jsx';
import DemoSidebar from './DemoSidebar.jsx';
import OrganizerDemo from './OrganizerDemo.jsx';
import GamerDemo from './GamerDemo.jsx';
import DemoCursor from './DemoCursor.jsx';
import DemoControls from './DemoControls.jsx';
import './ProductSimulation.css';

export default function ProductSimulation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoData, setDemoData] = useState(() => JSON.parse(JSON.stringify(INITIAL_DEMO_DATA)));
  const [isAchievementUnlocked, setIsAchievementUnlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const currentStep = DEMO_STEPS[stepIndex] || DEMO_STEPS[0];
  const { chapter, screen, cursor, duration = 3000, action } = currentStep;

  // Execute state updates associated with the step
  const executeStepAction = useCallback((act) => {
    if (!act) return;

    if (act === 'approveRegistrations') {
      setDemoData((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => ({ ...t, status: 'Approved' })),
      }));
    } else if (act === 'startTournament') {
      setDemoData((prev) => ({
        ...prev,
        tournament: { ...prev.tournament, status: 'Live' },
        match: { ...prev.match, status: 'In Progress' },
      }));
    } else if (act === 'sendCredentials') {
      setDemoData((prev) => ({
        ...prev,
        match: { ...prev.match, credentialsSent: true },
      }));
    } else if (act === 'submitScore') {
      setDemoData((prev) => ({
        ...prev,
        match: { ...prev.match, teamAScore: 2, teamBScore: 1 },
      }));
    } else if (act === 'approveResult') {
      setDemoData((prev) => ({
        ...prev,
        match: { ...prev.match, status: 'Completed', resultApproved: true },
        tournament: { ...prev.tournament, status: 'Completed' },
      }));
    } else if (act === 'unlockAchievement') {
      setIsAchievementUnlocked(true);
    }
  }, []);

  // Run step action whenever step changes
  useEffect(() => {
    if (action) {
      executeStepAction(action);
    }
  }, [stepIndex, action, executeStepAction]);

  // Handle automatic step advance timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying || !isVisible) {
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const adjustedDuration = prefersReducedMotion ? Math.max(duration * 0.75, 1800) : duration;

    timerRef.current = setTimeout(() => {
      setStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
    }, adjustedDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [stepIndex, isPlaying, isVisible, duration]);

  // Pause simulation when hero is scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Controls Handlers
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDemoData(JSON.parse(JSON.stringify(INITIAL_DEMO_DATA)));
    setIsAchievementUnlocked(false);
    setStepIndex(0);
    setIsPlaying(true);
  };

  const handleSelectChapter = (targetChapter) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (targetChapter === DEMO_CHAPTERS.ORGANIZER) {
      setStepIndex(0);
    } else if (targetChapter === DEMO_CHAPTERS.GAMER) {
      // Find the first gamer step
      const gamerIndex = DEMO_STEPS.findIndex((s) => s.chapter === DEMO_CHAPTERS.GAMER);
      setStepIndex(gamerIndex !== -1 ? gamerIndex : 14);
      // Ensure organizer actions are fulfilled so gamer experience has full context
      setDemoData((prev) => ({
        ...prev,
        teams: prev.teams.map((t) => ({ ...t, status: 'Approved' })),
        match: { ...prev.match, credentialsSent: true, resultApproved: true },
      }));
    }
  };

  return (
    <div className="product-simulation-frame" ref={containerRef}>
      {/* 1. Simulation Application Window Bar */}
      <DemoHeader chapter={chapter} screen={screen} />

      {/* 2. Simulation Interior Layout */}
      <div className="demo-window-body">
        {/* Sidebar Navigation */}
        <DemoSidebar
          chapter={chapter}
          screen={screen}
          onNavigate={(targetScreen) => {
            // Find corresponding step for quick user exploration
            const matchIndex = DEMO_STEPS.findIndex((s) => s.screen === targetScreen && s.chapter === chapter);
            if (matchIndex !== -1) {
              setStepIndex(matchIndex);
              setIsPlaying(false);
            }
          }}
        />

        {/* Main Stage Display Area */}
        <main className="demo-main-stage">
          {/* CHAPTER 1: ORGANIZER WORKSPACE */}
          {chapter === DEMO_CHAPTERS.ORGANIZER && (
            <OrganizerDemo screen={screen} data={demoData} />
          )}

          {/* TRANSITION: CONNECTED TRUST BRIDGE */}
          {chapter === DEMO_CHAPTERS.TRANSITION && (
            <div className="demo-view-container transition-view animate-fade-in">
              <div className="demo-transition-card">
                <span className="demo-transition-badge">THE COMPETITION CONTINUES</span>
                <h3 className="demo-transition-title">From Organizer to Gamer</h3>
                <p className="demo-transition-text">
                  When Vortex Esports Operations approves the official match outcome, EVOQ cryptographically links the result to each team roster.
                </p>

                <div className="demo-bridge-visual">
                  <div className="demo-bridge-node">
                    <span className="demo-node-icon" style={{ fontSize: '0.85rem', fontWeight: 800 }}>OPS</span>
                    <span className="demo-node-label">Approved Result</span>
                  </div>
                  <div className="demo-bridge-connector">
                    <span className="demo-pulse-particle" />
                    <span className="demo-connector-line" />
                    <span className="demo-connector-hash">0x8f2d...4a91</span>
                  </div>
                  <div className="demo-bridge-node">
                    <span className="demo-node-icon" style={{ fontSize: '0.85rem', fontWeight: 800 }}>PRO</span>
                    <span className="demo-node-label">Gamer Identity</span>
                  </div>
                </div>

                <span className="demo-text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
                  Switching to Gamer Workspace view...
                </span>
              </div>
            </div>
          )}

          {/* CHAPTER 2: GAMER WORKSPACE */}
          {chapter === DEMO_CHAPTERS.GAMER && (
            <GamerDemo
              screen={screen}
              data={demoData}
              isAchievementUnlocked={isAchievementUnlocked}
            />
          )}

          {/* CHAPTER 3: FINAL STATE */}
          {chapter === DEMO_CHAPTERS.FINAL && (
            <div className="demo-view-container final-view animate-fade-in">
              <div className="demo-final-card">
                <div className="demo-eyebrow" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <span className="demo-eyebrow-dot" />
                  THE PROFESSIONAL ESPORTS ECOSYSTEM
                </div>
                <h3 className="demo-final-heading">PLAY. COMPETE. ACHIEVE. GET RECOGNIZED.</h3>
                <p className="demo-final-desc">
                  You’ve just watched EVOQ’s connected trust infrastructure in action: an organizer creates a tournament, distributes room credentials, and verifies results — instantly generating permanent career achievements for every competitor.
                </p>

                <div className="demo-final-actions">
                  <button className="demo-btn-lime" onClick={handleReplay}>
                    Replay Demo
                  </button>
                  <Link to="/gamer/register" className="demo-btn-outline">
                    Enter Gamer Arena ↗
                  </Link>
                  <Link to="/organizer/register" className="demo-btn-outline">
                    Organizer Portal ↗
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Precision Virtual Pointer */}
          <DemoCursor cursor={cursor} isPaused={!isPlaying} />
        </main>
      </div>

      {/* 3. Demo Playback Control Strip */}
      <DemoControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        currentStepIndex={stepIndex}
        totalSteps={DEMO_STEPS.length}
        onTogglePlay={handleTogglePlay}
        onReplay={handleReplay}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}

