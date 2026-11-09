import React from 'react';
import { DEMO_CHAPTERS } from './demoSequence.js';

export default function DemoControls({
  isPlaying,
  currentStep,
  currentStepIndex,
  totalSteps,
  onTogglePlay,
  onReplay,
  onSelectChapter,
}) {
  const currentChapter = currentStep?.chapter;

  return (
    <div className="demo-controls-container">
      {/* Chapter Tabs */}
      <div className="demo-chapter-switch">
        <button
          className={`demo-chapter-btn ${currentChapter === DEMO_CHAPTERS.ORGANIZER ? 'active-organizer' : ''}`}
          onClick={() => onSelectChapter(DEMO_CHAPTERS.ORGANIZER)}
          title="Switch to Organizer Workspace Simulation"
        >
          <span>Organizer</span>
        </button>

        <button
          className={`demo-chapter-btn ${currentChapter === DEMO_CHAPTERS.GAMER ? 'active-gamer' : ''}`}
          onClick={() => onSelectChapter(DEMO_CHAPTERS.GAMER)}
          title="Switch to Gamer Workspace Simulation"
        >
          <span>Gamer</span>
        </button>
      </div>

      {/* Step description tracker */}
      <div className="demo-step-tracker">
        <span className="demo-step-pill">
          {currentStepIndex + 1}/{totalSteps}
        </span>
        <span className="demo-step-title">{currentStep?.title || 'Interactive Product Tour'}</span>
      </div>

      {/* Playback action buttons */}
      <div className="demo-playback-actions">
        <button
          className="demo-playback-btn"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          <span className="demo-ctrl-label">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          className="demo-playback-btn"
          onClick={onReplay}
          aria-label="Replay Demo"
          title="Restart Simulation"
        >
          <span className="demo-ctrl-label">Replay</span>
        </button>
      </div>
    </div>
  );
}

