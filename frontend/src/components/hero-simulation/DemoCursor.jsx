import React from 'react';

export default function DemoCursor({ cursor, isPaused }) {
  if (!cursor) return null;

  const { x = 50, y = 50, clicking = false } = cursor;

  return (
    <div
      className={`demo-virtual-cursor ${clicking ? 'clicking' : ''} ${isPaused ? 'paused' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      aria-hidden="true"
    >
      {/* Precision Virtual Pointer Icon */}
      <svg
        className="demo-cursor-svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.5 3.2L18.5 12.2L12.2 13.8L9.2 19.5L5.5 3.2Z"
          fill="#C9FF52"
          stroke="#080A08"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>

      {/* Ripple ring on simulated click */}
      {clicking && <span className="demo-click-ripple" />}
    </div>
  );
}

