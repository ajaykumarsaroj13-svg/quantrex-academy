import React, { useState, useEffect, useMemo } from 'react';

// ─── Color Palette ─────────────────────────────────────────────────────────────
const EXAM_CONFIG = {
  'JEE Main': {
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    glow: 'rgba(59,130,246,0.35)',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
  },
  'JEE Advanced': {
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
    glow: 'rgba(124,58,237,0.35)',
    bg: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.35)',
  },
  NDA: {
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #14532d, #16a34a)',
    glow: 'rgba(22,163,74,0.35)',
    bg: 'rgba(22,163,74,0.12)',
    border: 'rgba(22,163,74,0.35)',
  },
  BITSAT: {
    color: '#fb923c',
    gradient: 'linear-gradient(135deg, #9a3412, #ea580c)',
    glow: 'rgba(234,88,12,0.35)',
    bg: 'rgba(234,88,12,0.12)',
    border: 'rgba(234,88,12,0.35)',
  },
  'NCERT 11': {
    color: '#e11d48',
    gradient: 'linear-gradient(135deg, #9f1239, #e11d48)',
    glow: 'rgba(225,29,72,0.35)',
    bg: 'rgba(225,29,72,0.12)',
    border: 'rgba(225,29,72,0.35)',
  },
  'NCERT 12': {
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    glow: 'rgba(6,182,212,0.35)',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.35)',
  },
};

const FILTER_TABS = ['All', 'JEE Main', 'JEE Advanced', 'NDA', 'BITSAT', 'NCERT 11', 'NCERT 12'];

// ─── Inline Global Styles ───────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tsp-root {
    font-family: 'Inter', sans-serif;
    background: #0a0a1a;
    min-height: 100vh;
    color: #e2e8f0;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0d22; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

  /* ── Header ── */
  .tsp-header {
    background: linear-gradient(135deg, #0d0d2b 0%, #0f1535 40%, #0a0a1a 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
  }
  .tsp-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    gap: 16px;
  }
  .tsp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .tsp-logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(99,102,241,0.5);
    flex-shrink: 0;
  }
  .tsp-logo-text {
    font-size: 18px;
    font-weight: 800;
    background: linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.3px;
  }
  .tsp-logo-sub {
    font-size: 10px;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: -2px;
  }
  .tsp-user-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    padding: 6px 14px 6px 8px;
  }
  .tsp-user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  .tsp-user-name {
    font-size: 13px;
    font-weight: 500;
    color: #cbd5e1;
  }

  /* ── Hero Banner ── */
  .tsp-hero {
    background: linear-gradient(135deg, #0d0d2b 0%, #110a2e 50%, #0f1535 100%);
    padding: 48px 24px 36px;
    position: relative;
    overflow: hidden;
  }
  .tsp-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 80% at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, rgba(139,92,246,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 30% 40% at 50% 100%, rgba(59,130,246,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .tsp-hero-inner {
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
  }
  .tsp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #a5b4fc;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }
  .tsp-hero-title {
    font-size: clamp(26px, 4vw, 42px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1.1;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #f1f5f9 0%, #c7d2fe 50%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tsp-hero-desc {
    font-size: 15px;
    color: #64748b;
    font-weight: 400;
    max-width: 560px;
    line-height: 1.6;
  }

  /* ── Stats Bar ── */
  .tsp-stats-bar {
    background: rgba(255,255,255,0.03);
    border-top: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding: 0 24px;
  }
  .tsp-stats-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tsp-stats-inner::-webkit-scrollbar { display: none; }
  .tsp-stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border-right: 1px solid rgba(255,255,255,0.05);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tsp-stat-item:last-child { border-right: none; }
  .tsp-stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .tsp-stat-value {
    font-size: 20px;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1;
  }
  .tsp-stat-label {
    font-size: 11px;
    color: #475569;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* ── Controls ── */
  .tsp-controls {
    padding: 24px 24px 0;
    max-width: 1280px;
    margin: 0 auto;
  }
  .tsp-search-wrap {
    position: relative;
    margin-bottom: 20px;
  }
  .tsp-search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    font-size: 16px;
    pointer-events: none;
  }
  .tsp-search-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 13px 16px 13px 44px;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .tsp-search-input::placeholder { color: #475569; }
  .tsp-search-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.05);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .tsp-search-clear {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.08);
    border: none;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    font-size: 12px;
    transition: background 0.2s;
  }
  .tsp-search-clear:hover { background: rgba(255,255,255,0.15); }

  /* ── Filter Tabs ── */
  .tsp-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .tsp-tabs::-webkit-scrollbar { display: none; }
  .tsp-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
  }
  .tsp-tab:hover {
    border-color: rgba(255,255,255,0.15);
    color: #94a3b8;
    background: rgba(255,255,255,0.06);
  }
  .tsp-tab-count {
    font-size: 11px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 100px;
    background: rgba(255,255,255,0.06);
  }

  /* ── Grid ── */
  .tsp-grid-section {
    max-width: 1280px;
    margin: 0 auto;
    padding: 28px 24px 60px;
  }
  .tsp-grid-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .tsp-grid-title {
    font-size: 13px;
    color: #475569;
    font-weight: 500;
  }
  .tsp-grid-count {
    font-size: 13px;
    color: #64748b;
  }
  .tsp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  /* ── Test Card ── */
  .tsp-card {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
    cursor: default;
    position: relative;
  }
  .tsp-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }
  .tsp-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border-color: rgba(255,255,255,0.12);
  }
  .tsp-card-accent {
    height: 3px;
    width: 100%;
  }
  .tsp-card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    backdrop-filter: blur(12px);
  }
  .tsp-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .tsp-exam-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    border: 1px solid;
    flex-shrink: 0;
  }
  .tsp-badges-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tsp-badge {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .tsp-badge-official {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #fbbf24;
    background: rgba(251,191,36,0.1);
    border: 1px solid rgba(251,191,36,0.25);
  }
  .tsp-badge-free {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #4ade80;
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2);
  }
  .tsp-card-title {
    font-size: 15px;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.35;
    letter-spacing: -0.2px;
  }
  .tsp-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tsp-meta-dot {
    width: 3px;
    height: 3px;
    background: #334155;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .tsp-meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }
  .tsp-meta-item span:first-child { font-size: 13px; }
  .tsp-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
  }
  .tsp-stats-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .tsp-stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex: 1;
  }
  .tsp-stat-box + .tsp-stat-box {
    border-left: 1px solid rgba(255,255,255,0.05);
  }
  .tsp-stat-box-val {
    font-size: 16px;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1;
  }
  .tsp-stat-box-label {
    font-size: 10px;
    font-weight: 500;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tsp-card-actions {
    display: flex;
    gap: 10px;
    margin-top: 2px;
  }
  .tsp-btn-start {
    flex: 1;
    padding: 11px 16px;
    border-radius: 12px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.2px;
  }
  .tsp-btn-start:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(22,163,74,0.4);
  }
  .tsp-btn-practice {
    flex: 1;
    padding: 11px 16px;
    border-radius: 12px;
    border: 1px solid;
    font-size: 13px;
    font-weight: 700;
    background: transparent;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.2px;
  }
  .tsp-btn-practice:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(59,130,246,0.3);
  }

  /* ── Skeleton ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .tsp-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 8px;
  }
  .tsp-skeleton-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Empty State ── */
  .tsp-empty {
    text-align: center;
    padding: 80px 20px;
    grid-column: 1 / -1;
  }
  .tsp-empty-icon {
    font-size: 56px;
    margin-bottom: 16px;
    opacity: 0.4;
  }
  .tsp-empty-title {
    font-size: 18px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 8px;
  }
  .tsp-empty-desc {
    font-size: 14px;
    color: #1e293b;
  }

  /* ── Error Banner ── */
  .tsp-error {
    margin: 24px;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #fca5a5;
  }
  .tsp-error-retry {
    margin-left: auto;
    padding: 7px 16px;
    border-radius: 10px;
    border: 1px solid rgba(239,68,68,0.3);
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s;
  }
  .tsp-error-retry:hover { background: rgba(239,68,68,0.2); }

  /* ── Floating particles ── */
  @keyframes floatParticle {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
    33%       { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
    66%       { transform: translateY(-10px) translateX(-8px); opacity: 0.5; }
  }
  .tsp-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: floatParticle linear infinite;
  }

  @media (max-width: 640px) {
    .tsp-grid { grid-template-columns: 1fr; }
    .tsp-hero { padding: 32px 16px 24px; }
    .tsp-controls, .tsp-grid-section { padding-left: 16px; padding-right: 16px; }
    .tsp-header { padding: 0 16px; }
    .tsp-stats-inner { gap: 0; }
    .tsp-stat-item { padding: 14px 16px; }
    .tsp-stats-bar { padding: 0 16px; }
  }
`;

// ─── Particles decoration ───────────────────────────────────────────────────────
const Particles = () => {
  const particles = [
    { size: 4,  top: '15%', left: '8%',  color: '#6366f1', duration: '8s',  delay: '0s'   },
    { size: 3,  top: '30%', left: '92%', color: '#8b5cf6', duration: '11s', delay: '2s'   },
    { size: 5,  top: '60%', left: '5%',  color: '#3b82f6', duration: '9s',  delay: '1s'   },
    { size: 3,  top: '75%', left: '88%', color: '#a78bfa', duration: '12s', delay: '3s'   },
    { size: 4,  top: '45%', left: '95%', color: '#6366f1', duration: '10s', delay: '0.5s' },
    { size: 2,  top: '20%', left: '50%', color: '#818cf8', duration: '7s',  delay: '1.5s' },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="tsp-particle"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </>
  );
};

// ─── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="tsp-skeleton-card">
    <div className="tsp-skeleton" style={{ height: 4 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="tsp-skeleton" style={{ height: 22, width: '30%' }} />
      <div className="tsp-skeleton" style={{ height: 22, width: '20%' }} />
    </div>
    <div className="tsp-skeleton" style={{ height: 18, width: '80%' }} />
    <div className="tsp-skeleton" style={{ height: 14, width: '60%' }} />
    <div className="tsp-divider" />
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          <div className="tsp-skeleton" style={{ height: 20, width: 44 }} />
          <div className="tsp-skeleton" style={{ height: 10, width: 56 }} />
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <div className="tsp-skeleton" style={{ height: 42, flex: 1, borderRadius: 12 }} />
      <div className="tsp-skeleton" style={{ height: 42, flex: 1, borderRadius: 12 }} />
    </div>
  </div>
);

// ─── Test Card ─────────────────────────────────────────────────────────────────
const TestCard = ({ test, onStartTest }) => {
  const [hovered, setHovered] = useState(false);
  const cfg = EXAM_CONFIG[test.examType] || EXAM_CONFIG['JEE Main'];

  const durationHrs = test.duration
    ? test.duration >= 60
      ? `${test.duration / 60} hrs`
      : `${test.duration} min`
    : '3 hrs';

  return (
    <div
      className="tsp-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}` : 'none',
        borderColor: hovered ? cfg.border : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Accent line */}
      <div
        className="tsp-card-accent"
        style={{ background: cfg.gradient }}
      />

      <div
        className="tsp-card-body"
        style={{
          background: hovered
            ? `linear-gradient(180deg, ${cfg.bg} 0%, rgba(255,255,255,0.02) 100%)`
            : 'transparent',
          transition: 'background 0.25s',
        }}
      >
        {/* Top row: exam badge + special badges */}
        <div className="tsp-card-top">
          <div
            className="tsp-exam-badge"
            style={{
              color: cfg.color,
              background: cfg.bg,
              borderColor: cfg.border,
            }}
          >
            <span>
              {test.examType === 'JEE Main' ? '🔷' :
               test.examType === 'JEE Advanced' ? '💎' :
               test.examType === 'NDA' ? '🛡️' :
               test.examType === 'BITSAT' ? '⚡' :
               test.examType === 'NCERT 11' ? '📖' : '📕'}
            </span>
            {test.examType}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {test.isOfficial && (
              <span className="tsp-badge-official">⭐ Official</span>
            )}
            {(test.isFree || test.free) && (
              <span className="tsp-badge-free">✓ Free</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="tsp-card-title">{test.title || test.name || 'Untitled Test'}</div>

        {/* Year / Session / Shift badges */}
        <div className="tsp-meta-row">
          {test.year && (
            <>
              <div className="tsp-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                {test.year}
              </div>
              <div className="tsp-meta-dot" />
            </>
          )}
          {test.session && (
            <>
              <div className="tsp-badge">Session {test.session}</div>
              <div className="tsp-meta-dot" />
            </>
          )}
          {test.shift && (
            <div className="tsp-badge">{test.shift}</div>
          )}
        </div>

        {/* Meta info */}
        <div className="tsp-meta-row">
          <div className="tsp-meta-item">
            <span>📅</span>
            <span>{test.examDate || test.date || 'Scheduled'}</span>
          </div>
        </div>

        <div className="tsp-divider" />

        {/* Stats */}
        <div className="tsp-stats-row">
          <div className="tsp-stat-box">
            <div className="tsp-stat-box-val" style={{ color: cfg.color }}>
              {test.totalQuestions || test.questions || 75}
            </div>
            <div className="tsp-stat-box-label">Questions</div>
          </div>
          <div className="tsp-stat-box">
            <div className="tsp-stat-box-val" style={{ color: cfg.color }}>
              {durationHrs}
            </div>
            <div className="tsp-stat-box-label">Duration</div>
          </div>
          <div className="tsp-stat-box">
            <div className="tsp-stat-box-val" style={{ color: cfg.color }}>
              {test.totalMarks || test.marks || 300}
            </div>
            <div className="tsp-stat-box-label">Marks</div>
          </div>
        </div>

        <div className="tsp-divider" />

        {/* Buttons */}
        <div className="tsp-card-actions">
          <button
            className="tsp-btn-start"
            style={{
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              boxShadow: hovered ? '0 4px 16px rgba(22,163,74,0.4)' : 'none',
            }}
            onClick={() => onStartTest(test.id || test._id, 'exam')}
          >
            ▶ Start Test
          </button>
          <button
            className="tsp-btn-practice"
            style={{
              color: '#60a5fa',
              borderColor: 'rgba(59,130,246,0.35)',
              background: hovered ? 'rgba(59,130,246,0.08)' : 'transparent',
            }}
            onClick={() => onStartTest(test.id || test._id, 'practice')}
          >
            📝 Practice
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const TestSeriesPage = ({ user, onStartTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/test-series`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // Accept array or { tests: [...] } or { data: [...] }
      const arr = Array.isArray(data) ? data : (data.tests || data.data || []);
      const mapped = arr.map(t => ({
        ...t,
        examType: t.examType || t.exam,
        duration: t.duration || t.durationMinutes
      }));
      setTests(mapped);
    } catch (err) {
      console.error('Failed to fetch test series:', err);
      setError(err.message || 'Failed to load test series');
      // Demo data so layout can be seen even on error
      setTests(DEMO_TESTS.map(t => ({
        ...t,
        examType: t.examType || t.exam,
        duration: t.duration || t.durationMinutes
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, []);

  // Counts per tab
  const tabCounts = useMemo(() => {
    const counts = { All: tests.length };
    ['JEE Main', 'JEE Advanced', 'NDA', 'BITSAT', 'NCERT 11', 'NCERT 12'].forEach(tab => {
      counts[tab] = tests.filter(t => t.examType === tab).length;
    });
    return counts;
  }, [tests]);

  // Filter + search
  const filtered = useMemo(() => {
    let arr = tests;
    if (activeTab !== 'All') arr = arr.filter(t => t.examType === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(t =>
        (t.title || t.name || '').toLowerCase().includes(q) ||
        String(t.year || '').includes(q) ||
        (t.examType || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [tests, activeTab, searchQuery]);

  // Stats
  const officialCount = tests.filter(t => t.isOfficial).length;
  const freeCount = tests.filter(t => t.isFree || t.free).length;
  const examTypes = [...new Set(tests.map(t => t.examType).filter(Boolean))].length;

  const userName = user?.name || 'Student';
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const TAB_ICONS = {
    'All': '📚',
    'JEE Main': '🔷',
    'JEE Advanced': '💎',
    'NDA': '🛡️',
    'BITSAT': '⚡',
    'NCERT 11': '📖',
    'NCERT 12': '📕',
  };

  return (
    <div className="tsp-root">
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ── */}
      <header className="tsp-header">
        <div className="tsp-header-inner">
          <a className="tsp-logo" href="/">
            <div className="tsp-logo-icon">⚛️</div>
            <div>
              <div className="tsp-logo-text">Quantrex Academy</div>
              <div className="tsp-logo-sub">Test Series</div>
            </div>
          </a>
          {user && (
            <div className="tsp-user-pill">
              <div className="tsp-user-avatar">{initials}</div>
              <span className="tsp-user-name">{userName}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="tsp-hero">
        <Particles />
        <div className="tsp-hero-inner">
          <div className="tsp-hero-badge">
            <span>🎯</span> Premium Test Series
          </div>
          <h1 className="tsp-hero-title">
            Master Your Exam<br />with Real Papers
          </h1>
          <p className="tsp-hero-desc">
            Practice with official JEE Main, JEE Advanced, NDA, BITSAT, and NCERT Class 11th & 12th papers.
            Timed exam mode or flexible practice — your choice.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="tsp-stats-bar">
        <div className="tsp-stats-inner">
          {[
            { icon: '📋', iconBg: 'rgba(99,102,241,0.15)', value: tests.length, label: 'Total Tests' },
            { icon: '⭐', iconBg: 'rgba(251,191,36,0.12)', value: officialCount, label: 'Official Papers' },
            { icon: '🆓', iconBg: 'rgba(74,222,128,0.1)',  value: freeCount,    label: 'Free Tests' },
            { icon: '📘', iconBg: 'rgba(59,130,246,0.12)', value: examTypes,    label: 'Exam Categories' },
          ].map((s, i) => (
            <div key={i} className="tsp-stat-item">
              <div className="tsp-stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
              <div>
                <div className="tsp-stat-value">{loading ? '—' : s.value}</div>
                <div className="tsp-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '0 24px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="tsp-error" style={{ margin: '20px 0 0' }}>
            <span>⚠️</span>
            <span>Could not fetch live data — showing demo tests. ({error})</span>
            <button className="tsp-error-retry" onClick={fetchTests}>Retry</button>
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 0' }}>
        {/* Search */}
        <div className="tsp-search-wrap">
          <span className="tsp-search-icon">🔍</span>
          <input
            className="tsp-search-input"
            type="text"
            placeholder="Search by exam, year, or paper..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="tsp-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="tsp-tabs">
          {FILTER_TABS.map(tab => {
            const active = activeTab === tab;
            const cfg = tab !== 'All' ? EXAM_CONFIG[tab] : null;
            return (
              <button
                key={tab}
                className="tsp-tab"
                onClick={() => setActiveTab(tab)}
                style={active ? {
                  background: cfg ? cfg.bg : 'rgba(99,102,241,0.15)',
                  borderColor: cfg ? cfg.border : 'rgba(99,102,241,0.4)',
                  color: cfg ? cfg.color : '#a5b4fc',
                } : {}}
              >
                <span>{TAB_ICONS[tab]}</span>
                {tab}
                <span
                  className="tsp-tab-count"
                  style={active ? {
                    background: cfg ? cfg.bg : 'rgba(99,102,241,0.2)',
                    color: cfg ? cfg.color : '#a5b4fc',
                  } : {}}
                >
                  {tabCounts[tab] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="tsp-grid-section">
        <div className="tsp-grid-header">
          <span className="tsp-grid-title">
            {activeTab === 'All' ? 'All Tests' : activeTab + ' Tests'}
            {searchQuery && ` · "${searchQuery}"`}
          </span>
          <span className="tsp-grid-count">
            {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="tsp-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="tsp-empty">
              <div className="tsp-empty-icon">🔍</div>
              <div className="tsp-empty-title">No tests found</div>
              <div className="tsp-empty-desc">
                Try a different filter or search term.
              </div>
            </div>
          ) : (
            filtered.map(test => (
              <TestCard
                key={test._id || test.id || Math.random()}
                test={test}
                onStartTest={onStartTest || (() => {})}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Demo / Fallback Data ───────────────────────────────────────────────────────
const DEMO_TESTS = [
  {
    _id: 'd1',
    examType: 'JEE Main',
    title: 'JEE Main 2026 (April 2nd, Shift 2)',
    year: 2026, session: 2, shift: 'Shift 2',
    examDate: 'Apr 02, 2026',
    totalQuestions: 75, duration: 180, totalMarks: 300,
    isOfficial: true, isFree: true,
  },
  {
    _id: 'd2',
    examType: 'JEE Main',
    title: 'JEE Main 2025 (January 22nd, Shift 1)',
    year: 2025, session: 1, shift: 'Shift 1',
    examDate: 'Jan 22, 2025',
    totalQuestions: 75, duration: 180, totalMarks: 300,
    isOfficial: true, isFree: false,
  },
  {
    _id: 'd3',
    examType: 'JEE Advanced',
    title: 'JEE Advanced 2025 — Paper 1',
    year: 2025, session: 1, shift: 'Paper 1',
    examDate: 'May 18, 2025',
    totalQuestions: 54, duration: 180, totalMarks: 183,
    isOfficial: true, isFree: true,
  },
  {
    _id: 'd4',
    examType: 'JEE Advanced',
    title: 'JEE Advanced 2024 — Paper 2',
    year: 2024, session: 1, shift: 'Paper 2',
    examDate: 'May 26, 2024',
    totalQuestions: 54, duration: 180, totalMarks: 183,
    isOfficial: true, isFree: false,
  },
  {
    _id: 'd5',
    examType: 'NDA',
    title: 'NDA & NA (I) 2025 — Mathematics',
    year: 2025, session: 1, shift: 'Paper 1',
    examDate: 'Apr 13, 2025',
    totalQuestions: 120, duration: 150, totalMarks: 300,
    isOfficial: true, isFree: true,
  },
  {
    _id: 'd6',
    examType: 'BITSAT',
    title: 'BITSAT 2025 — Full Mock Test',
    year: 2025, session: 1, shift: 'Morning',
    examDate: 'May 20, 2025',
    totalQuestions: 130, duration: 180, totalMarks: 390,
    isOfficial: false, isFree: true,
  },
];

export default TestSeriesPage;
