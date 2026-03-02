import { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

// ─────────────────────────────────────────
//  SENTIMENT HELPER
// ─────────────────────────────────────────
const getSentiment = (rating) => {
  const r = parseFloat(rating) || 0;
  if (r === 0)  return { emoji:"🤔", label:"Not enough reviews yet",        bannerClass:"mood-unknown", color:"#807090", glowColor:"rgba(160,140,180,0.5)",  cardAccent:"160,140,180" };
  if (r >= 4.5) return { emoji:"😍", label:"Customers absolutely love this!", bannerClass:"mood-love",    color:"#b04060", glowColor:"rgba(220,80,120,0.55)",  cardAccent:"220,80,120"  };
  if (r >= 4.0) return { emoji:"😊", label:"Highly rated by buyers",          bannerClass:"mood-great",   color:"#2e7050", glowColor:"rgba(60,170,100,0.55)",  cardAccent:"60,170,100"  };
  if (r >= 3.5) return { emoji:"🙂", label:"Good overall feedback",           bannerClass:"mood-good",    color:"#906010", glowColor:"rgba(200,160,40,0.55)",  cardAccent:"200,160,40"  };
  if (r >= 3.0) return { emoji:"😐", label:"Mixed opinions from buyers",      bannerClass:"mood-meh",     color:"#606080", glowColor:"rgba(150,150,180,0.5)",  cardAccent:"150,150,180" };
  return              { emoji:"😕", label:"Buyers have concerns",             bannerClass:"mood-poor",    color:"#903030", glowColor:"rgba(200,80,60,0.55)",   cardAccent:"200,80,60"   };
};

// Particle sets per mood
const PARTICLES = {
  "mood-love":    ["💕","✨","🌹","💖"],
  "mood-great":   ["🌿","✅","👍","🌟"],
  "mood-good":    ["👌","🙌","💛","⭐"],
  "mood-meh":     ["🤷","💭","🔄","❓"],
  "mood-poor":    ["⚠️","💔","😬","🔻"],
  "mood-unknown": ["❔","🔍","📊","💤"],
};

// ─────────────────────────────────────────
//  BEST DEAL CELEBRATION OVERLAY
// ─────────────────────────────────────────
const CELEBRATE_SPARKS = [
  { emoji:"✦", x:-38, y:-52, delay:0,    dur:1.6, size:"1.0rem" },
  { emoji:"✧", x: 44, y:-48, delay:0.08, dur:1.5, size:"0.85rem" },
  { emoji:"✦", x:-62, y: 10, delay:0.12, dur:1.7, size:"0.75rem" },
  { emoji:"✧", x: 60, y: 18, delay:0.06, dur:1.6, size:"0.9rem"  },
  { emoji:"✦", x:-24, y: 54, delay:0.15, dur:1.5, size:"0.7rem"  },
  { emoji:"✧", x: 30, y: 50, delay:0.05, dur:1.8, size:"0.8rem"  },
  { emoji:"✦", x: 0,  y:-60, delay:0.10, dur:1.6, size:"0.65rem" },
  { emoji:"✧", x: 70, y:-20, delay:0.18, dur:1.5, size:"0.75rem" },
  { emoji:"✦", x:-70, y:-18, delay:0.04, dur:1.7, size:"0.8rem"  },
];

const BestDealCelebration = ({ active }) => {
  if (!active) return null;
  return (
    <div className="cel-overlay">
      {/* Ripple rings */}
      <div className="cel-ring cel-ring-1"/>
      <div className="cel-ring cel-ring-2"/>
      <div className="cel-ring cel-ring-3"/>

      {/* Toast pill */}
      <div className="cel-toast">
        <span className="cel-crown">👑</span>
        <span className="cel-toast-text">Best Deal Found!</span>
        <span className="cel-glow-dot"/>
      </div>

      {/* Floating sparkles around toast */}
      {CELEBRATE_SPARKS.map((s, i) => (
        <span key={i} className="cel-spark" style={{
          "--csx": `${s.x}px`, "--csy": `${s.y}px`,
          "--csd": `${s.delay}s`, "--csf": `${s.dur}s`,
          fontSize: s.size,
        }}>{s.emoji}</span>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #fdf6f2;
      --bg2:       #f8ede8;
      --white:     #ffffff;
      --rose:      #c0607a;
      --rose-lt:   #d4809a;
      --rose-dk:   #a04060;
      --rose-pale: #fdeef2;
      --blush:     #f5d8e0;
      --border:    #f0d0d8;
      --text:      #2a1a20;
      --text2:     #6a3a4a;
      --text3:     #b08090;
      --amber:     #c07830;
      --shadow:    rgba(180,80,100,0.10);
      --shadow2:   rgba(180,80,100,0.05);
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'Nunito Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }

    .page-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 55% at 5%  5%,  rgba(220,140,160,0.13) 0%, transparent 60%),
        radial-gradient(ellipse 55% 45% at 95% 95%, rgba(200,120,160,0.09) 0%, transparent 60%),
        radial-gradient(ellipse 45% 40% at 60% 30%, rgba(240,200,210,0.13) 0%, transparent 65%),
        var(--bg);
    }
    .app-root { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 0 24px 80px; }

    /* ── ANIMATIONS ── */
    @keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
    @keyframes dots     { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }

    /* ── BEST DEAL CELEBRATION ── */
    @keyframes celToastIn {
      0%   { opacity:0; transform:translate(-50%,-50%) scale(0.7); }
      55%  { opacity:1; transform:translate(-50%,-50%) scale(1.04); }
      75%  { transform:translate(-50%,-50%) scale(0.98); }
      85%  { opacity:1; transform:translate(-50%,-50%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-50%) scale(0.92); }
    }
    @keyframes celRingOut {
      0%   { transform:translate(-50%,-50%) scale(0.05); opacity:0.8; }
      70%  { opacity:0.25; }
      100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
    }
    @keyframes celSparkFloat {
      0%   { opacity:0; transform:translate(0,0) scale(0) rotate(0deg); }
      20%  { opacity:1; }
      70%  { opacity:1; transform:translate(var(--csx), var(--csy)) scale(1) rotate(180deg); }
      100% { opacity:0; transform:translate(calc(var(--csx)*1.2), calc(var(--csy)*1.2)) scale(0.5) rotate(270deg); }
    }
    @keyframes celGlowPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(192,96,122,0.5); }
      50%     { box-shadow: 0 0 0 6px rgba(192,96,122,0); }
    }
    @keyframes crownBounce {
      0%,100% { transform: translateY(0) rotate(-5deg); }
      40%     { transform: translateY(-5px) rotate(5deg); }
    }

    /* Overlay — fixed, centered, non-blocking (pointer-events:none) */
    .cel-overlay {
      position: fixed; inset: 0; z-index: 9999;
      pointer-events: none;
      display: flex; align-items: center; justify-content: center;
    }

    /* Ripple rings — rose-tinted, expand from center */
    .cel-ring {
      position: absolute; left: 50%; top: 50%;
      border-radius: 50%; border: 1.5px solid rgba(192,96,122,0.35);
      pointer-events: none;
    }
    .cel-ring-1 { width:180px; height:180px; animation: celRingOut 1.1s 0.05s ease-out forwards; }
    .cel-ring-2 { width:280px; height:280px; animation: celRingOut 1.3s 0.18s ease-out forwards; border-color: rgba(192,96,122,0.22); }
    .cel-ring-3 { width:390px; height:390px; animation: celRingOut 1.5s 0.32s ease-out forwards; border-color: rgba(192,96,122,0.12); }

    /* Central toast pill */
    .cel-toast {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%,-50%);
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #fff0f4, #fde8ee);
      border: 1.5px solid rgba(192,96,122,0.35);
      border-radius: 999px;
      padding: 14px 28px 14px 20px;
      box-shadow:
        0 8px 40px rgba(192,96,122,0.22),
        0 2px 12px rgba(192,96,122,0.14),
        0 0 0 5px rgba(192,96,122,0.07);
      animation: celToastIn 2.2s cubic-bezier(.34,1.2,.64,1) forwards;
      white-space: nowrap;
    }
    .cel-crown {
      font-size: 1.6rem;
      animation: crownBounce 0.7s 0.4s ease-in-out 2;
      filter: drop-shadow(0 2px 6px rgba(255,200,50,0.45));
    }
    .cel-toast-text {
      font-family: 'Nunito', sans-serif;
      font-size: 1.05rem; font-weight: 900;
      letter-spacing: 0.3px;
      background: linear-gradient(135deg, #c0607a, #a04060);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .cel-glow-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--rose);
      animation: celGlowPulse 0.7s 0.3s ease-in-out 3;
    }

    /* Floating sparkle chars */
    .cel-spark {
      position: absolute; left: 50%; top: 50%;
      color: var(--rose); line-height: 1;
      transform-origin: center;
      animation: celSparkFloat var(--csf) var(--csd) ease-out forwards;
    }

    /* ── HEADER ── */
    .header { padding: 46px 0 32px; display: flex; flex-direction: column; align-items: center; gap: 10px; animation: fadeDown 0.6s ease both; }
    .logo-lockup { display: flex; align-items: center; gap: 13px; }
    .logo-mark { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(145deg, #fde8ee, #ffd0de); border: 1.5px solid rgba(192,96,122,0.3); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(192,96,122,0.18); }
    .logo-name { font-family: 'Nunito', sans-serif; font-size: 2.6rem; font-weight: 900; color: var(--text); letter-spacing: -1px; line-height: 1; }
    .logo-name span { color: var(--rose); }
    .tagline { font-size: 0.83rem; color: var(--text3); letter-spacing: 1.8px; text-transform: uppercase; font-weight: 600; }
    .platform-row { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; margin-top: 8px; }
    .p-pill { font-size: 0.7rem; padding: 4px 13px; border-radius: 999px; background: var(--white); border: 1px solid var(--border); color: var(--text2); font-weight: 600; box-shadow: 0 1px 5px var(--shadow2); transition: border-color 0.18s, color 0.18s, box-shadow 0.18s; }
    .p-pill:hover { border-color: var(--rose-lt); color: var(--rose); box-shadow: 0 2px 10px var(--shadow); }

    /* ── SEARCH CARD ── */
    .search-card { background: var(--white); border: 1px solid var(--border); border-radius: 24px; padding: 26px 28px; box-shadow: 0 4px 28px var(--shadow), 0 1px 0 rgba(255,255,255,0.9) inset; margin-bottom: 28px; animation: fadeUp 0.6s 0.1s ease both; }
    .s-row { display: flex; gap: 10px; align-items: stretch; }
    .s-group { flex: 1; position: relative; }
    .s-group-sm { max-width: 185px; }
    .s-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: 0.35; pointer-events: none; }
    .s-input { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: 13px; padding: 13px 16px 13px 42px; font-family: 'Nunito Sans', sans-serif; font-size: 0.95rem; color: var(--text); outline: none; font-weight: 500; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
    .s-input::placeholder { color: var(--text3); }
    .s-input:focus { border-color: var(--rose); background: var(--white); box-shadow: 0 0 0 3px rgba(192,96,122,0.10); }
    .s-btn { background: linear-gradient(135deg, var(--rose-lt), var(--rose-dk)); color: #fff; border: none; border-radius: 13px; padding: 0 26px; font-size: 0.9rem; font-weight: 700; font-family: 'Nunito', sans-serif; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 7px; box-shadow: 0 4px 18px rgba(192,96,122,0.34); transition: transform 0.15s, box-shadow 0.15s; }
    .s-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 24px rgba(192,96,122,0.44); }
    .s-btn:active:not(:disabled) { transform: translateY(0); }
    .s-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .quick-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; align-items: center; }
    .q-label { font-size: 0.73rem; color: var(--text3); font-weight: 600; }
    .q-chip { font-size: 0.73rem; padding: 5px 13px; border-radius: 999px; background: var(--rose-pale); border: 1px solid var(--border); color: var(--text2); cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .q-chip:hover { background: var(--rose); border-color: var(--rose); color: #fff; }

    /* ── STATS BAR ── */
    .stats-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; animation: fadeUp 0.5s ease both; }

    /* Base stat chip — shared layout only */
    .stat-chip {
      display: flex; align-items: center; gap: 12px;
      border-radius: 16px; padding: 14px 18px;
      flex: 1; min-width: 130px; position: relative; overflow: hidden;
      transition: transform 0.22s cubic-bezier(.34,1.45,.64,1), box-shadow 0.22s;
    }
    .stat-chip:hover { transform: translateY(-3px) scale(1.025); }

    /* Shine sweep on hover */
    .stat-chip::before {
      content:''; position:absolute; inset:0; pointer-events:none; border-radius:16px;
      background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%);
      background-size:200% 100%; background-position:200% 0;
      transition: background-position 0.55s ease;
    }
    .stat-chip:hover::before { background-position:-40% 0; }

    .stat-icon { font-size: 1.45rem; flex-shrink: 0; }
    .stat-val { font-family: 'Nunito', sans-serif; font-size: 1.08rem; font-weight: 800; line-height: 1.1; }
    .stat-lbl { font-size: 0.67rem; font-weight: 700; margin-top: 2px; }

    /* ── CHIP 1 — Avg Deal Score — rose/pink theme ── */
    .stat-chip.chip-score {
      background: linear-gradient(135deg, #fff0f4, #fde8ee);
      border: 1.5px solid rgba(192,96,122,0.28);
      box-shadow: 0 3px 16px rgba(192,96,122,0.10);
    }
    .stat-chip.chip-score:hover { box-shadow: 0 8px 26px rgba(192,96,122,0.18); border-color: rgba(192,96,122,0.5); }
    .stat-chip.chip-score .stat-val { color: #b04060; }
    .stat-chip.chip-score .stat-lbl { color: #c06080; }

    /* ── CHIP 2 — Platforms — purple/indigo theme ── */
    .stat-chip.chip-platforms {
      background: linear-gradient(135deg, #f2f0ff, #ece8ff);
      border: 1.5px solid rgba(120,90,200,0.25);
      box-shadow: 0 3px 16px rgba(120,90,200,0.09);
    }
    .stat-chip.chip-platforms:hover { box-shadow: 0 8px 26px rgba(120,90,200,0.17); border-color: rgba(120,90,200,0.45); }
    .stat-chip.chip-platforms .stat-val { color: #6040b0; }
    .stat-chip.chip-platforms .stat-lbl { color: #8060c0; }

    /* ── CHIP 3 — Lowest Price — teal/green theme ── */
    .stat-chip.chip-price {
      background: linear-gradient(135deg, #edfaf3, #e4f7ed);
      border: 1.5px solid rgba(50,160,90,0.25);
      box-shadow: 0 3px 16px rgba(50,160,90,0.09);
    }
    .stat-chip.chip-price:hover { box-shadow: 0 8px 26px rgba(50,160,90,0.17); border-color: rgba(50,160,90,0.45); }
    .stat-chip.chip-price .stat-val { color: #2a7048; }
    .stat-chip.chip-price .stat-lbl { color: #3a8058; }

    /* ── CHIP 4 — Highest Rated — amber/gold theme ── */
    .stat-chip.max-rating {
      background: linear-gradient(135deg, #fffbea, #fff5d6);
      border: 1.5px solid rgba(192,120,48,0.30);
      box-shadow: 0 3px 16px rgba(192,120,48,0.11);
    }
    .stat-chip.max-rating:hover { box-shadow: 0 8px 26px rgba(192,120,48,0.20); border-color: rgba(192,120,48,0.50); }
    .stat-chip.max-rating .stat-val { color: #a05010; }
    .stat-chip.max-rating .stat-lbl { color: #b06020; }

    /* ── LOADING ── */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 0; }
    .spin { width: 42px; height: 42px; border-radius: 50%; border: 3px solid var(--blush); border-top-color: var(--rose); animation: spin 0.85s linear infinite; }
    .loading-txt { font-size: 0.88rem; color: var(--text3); font-weight: 600; }
    .dots::after { content:''; animation: dots 1.4s steps(4,end) infinite; }

    /* ── RESULTS HEADER ── */
    .res-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 8px; animation: fadeUp 0.4s ease both; }
    .res-title { font-family: 'Nunito', sans-serif; font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
    .res-sub { font-size: 0.77rem; color: var(--text3); margin-top: 3px; font-weight: 500; }
    .ml-badge { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(192,96,122,0.08), rgba(192,96,122,0.13)); border: 1px solid rgba(192,96,122,0.22); border-radius: 999px; padding: 6px 14px; font-size: 0.72rem; font-weight: 700; color: var(--rose); font-family: 'Nunito', sans-serif; }
    .ml-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rose); animation: pulse 2s ease-in-out infinite; }

    /* ── BEST DEAL HERO CARD ── */
    @keyframes crownFloat   { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-6px) rotate(6deg)} }
    @keyframes shimmerSlide { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes ringFill     { from{stroke-dashoffset:213.6} to{stroke-dashoffset:var(--ring-end)} }
    @keyframes badgePop     { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }

    .best-deal-hero {
      display: block; text-decoration: none; color: inherit;
      position: relative; overflow: hidden; border-radius: 28px;
      background: linear-gradient(145deg, #fff8fb 0%, #fffcfd 40%, #fff9f5 100%);
      border: 2px solid rgba(192,96,122,0.28);
      box-shadow:
        0 0 0 5px rgba(192,96,122,0.06),
        0 10px 40px rgba(192,96,122,0.11),
        0 2px 0 rgba(255,255,255,0.9) inset;
      margin-bottom: 28px;
      animation: fadeUp 0.6s ease both;
      cursor: pointer;
      transition: transform 0.38s cubic-bezier(.34,1.45,.64,1), box-shadow 0.38s, border-color 0.3s;
    }
    .best-deal-hero:hover {
      transform: translateY(-10px) scale(1.016);
      box-shadow:
        0 0 0 5px rgba(192,96,122,0.11),
        0 32px 72px rgba(192,96,122,0.16),
        0 10px 28px rgba(192,96,122,0.10),
        0 2px 0 rgba(255,255,255,0.9) inset;
      border-color: rgba(192,96,122,0.55);
    }
    /* Animated gradient top-bar */
    .bdh-top-bar {
      height: 4px; width: 100%;
      background: linear-gradient(90deg, var(--rose-lt), var(--rose-dk), var(--rose-lt));
      background-size: 200% 100%;
      animation: shimmerSlide 3s linear infinite;
    }
    /* Shine sweep on hover */
    .best-deal-hero::before {
      content: ''; position: absolute; inset: 0; z-index: 1;
      border-radius: 26px; pointer-events: none;
      background: linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.48) 50%, transparent 72%);
      background-size: 200% 100%; background-position: 200% 0;
      transition: background-position 0.75s ease;
    }
    .best-deal-hero:hover::before { background-position: -60% 0; }
    /* Decorative radial blobs */
    .best-deal-hero::after {
      content: ''; position: absolute; top: -60px; right: -60px;
      width: 220px; height: 220px; border-radius: 50%; z-index: 0; pointer-events: none;
      background: radial-gradient(circle, rgba(192,96,122,0.07) 0%, transparent 65%);
    }

    /* Crown row */
    .bdh-crown-row {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 24px 0; position: relative; z-index: 2;
    }
    .bdh-crown { font-size: 1.6rem; animation: crownFloat 2.2s ease-in-out infinite; filter: drop-shadow(0 2px 8px rgba(255,200,50,0.5)); }
    .bdh-hero-label {
      font-family: 'Nunito', sans-serif; font-size: 0.7rem; font-weight: 900;
      text-transform: uppercase; letter-spacing: 2.5px; color: var(--rose); flex: 1;
    }
    .bdh-disc-pill {
      background: linear-gradient(135deg, var(--amber), #a05010); color: #fff;
      font-size: 0.66rem; font-weight: 800; padding: 5px 13px; border-radius: 999px;
      font-family: 'Nunito', sans-serif; box-shadow: 0 3px 12px rgba(192,120,48,0.35);
      animation: badgePop 0.5s 0.3s cubic-bezier(.34,1.56,.64,1) both;
    }

    /* Body layout */
    .bdh-body {
      display: flex; align-items: center; gap: 24px;
      padding: 18px 24px 20px; position: relative; z-index: 2; flex-wrap: wrap;
    }

    /* Product image box */
    .bdh-img-box {
      width: 120px; height: 120px; flex-shrink: 0; position: relative;
      background: var(--rose-pale); border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(192,96,122,0.13);
      overflow: hidden; transition: box-shadow 0.35s, transform 0.35s;
    }
    .best-deal-hero:hover .bdh-img-box {
      box-shadow: 0 10px 34px rgba(192,96,122,0.22);
      transform: translateY(-3px) scale(1.04);
    }
    .bdh-img-box img {
      width: 96px; height: 96px; object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.10));
      transition: transform 0.4s cubic-bezier(.34,1.4,.64,1);
    }
    .best-deal-hero:hover .bdh-img-box img { transform: scale(1.12) translateY(-4px); }
    .bdh-no-img {
      font-size: 3.6rem; opacity: 0.4;
      transition: transform 0.4s cubic-bezier(.34,1.4,.64,1), opacity 0.3s;
    }
    .best-deal-hero:hover .bdh-no-img { transform: scale(1.14) translateY(-4px); opacity: 0.6; }

    /* Info */
    .bdh-info { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 8px; }
    .bdh-platform {
      font-size: 0.63rem; text-transform: uppercase; letter-spacing: 1.8px;
      font-weight: 800; font-family: 'Nunito', sans-serif;
    }
    .bdh-title {
      font-family: 'Nunito', sans-serif; font-size: 1.1rem; font-weight: 800;
      color: var(--text); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .bdh-price-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .bdh-price {
      font-family: 'Nunito', sans-serif; font-size: 1.75rem; font-weight: 900; color: var(--text);
      line-height: 1;
    }
    .bdh-chip {
      font-size: 0.67rem; padding: 4px 11px; border-radius: 999px;
      font-weight: 700; font-family: 'Nunito', sans-serif;
    }
    .bdh-chip-green { background: rgba(50,160,90,0.10); border: 1px solid rgba(50,160,90,0.28); color: #2e7050; }
    .bdh-chip-blue  { background: rgba(50,110,220,0.08); border: 1px solid rgba(50,110,220,0.22); color: #2850a0; }
    .bdh-chip-orange{ background: rgba(192,120,48,0.10); border: 1px solid rgba(192,120,48,0.28); color: #8a4a10; }
    .bdh-sentiment-row { display: flex; align-items: center; gap: 8px; }
    .bdh-sent-emoji { font-size: 1.35rem; }
    .bdh-sent-text  { font-size: 0.8rem; font-weight: 700; font-family: 'Nunito', sans-serif; }
    .bdh-rating-txt { font-size: 0.72rem; color: var(--text3); font-weight: 600; }

    /* Score ring */
    .bdh-score-col { display: flex; flex-direction: column; align-items: center; gap: 9px; flex-shrink: 0; }
    .bdh-ring-wrap  { position: relative; width: 90px; height: 90px; }
    .bdh-ring-svg   { width: 90px; height: 90px; transform: rotate(-90deg); }
    .bdh-ring-track { fill: none; stroke: var(--border); stroke-width: 7; }
    .bdh-ring-fill  {
      fill: none; stroke-width: 7; stroke-linecap: round;
      stroke-dasharray: 213.6;
      animation: ringFill 1.2s 0.2s cubic-bezier(.4,0,.2,1) both;
    }
    .bdh-ring-inner {
      position: absolute; inset: 0; display: flex;
      flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    }
    .bdh-ring-num { font-family: 'Nunito', sans-serif; font-size: 1.5rem; font-weight: 900; line-height: 1; }
    .bdh-ring-lbl { font-size: 0.52rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); font-family: 'Nunito', sans-serif; }
    .bdh-score-label {
      font-size: 0.68rem; font-weight: 800; padding: 5px 16px; border-radius: 999px;
      color: #fff; font-family: 'Nunito', sans-serif; white-space: nowrap;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      animation: badgePop 0.5s 0.5s cubic-bezier(.34,1.56,.64,1) both;
    }

    /* Feature pills row */
    .bdh-features {
      display: flex; flex-wrap: wrap; gap: 7px; padding: 0 24px 18px;
      position: relative; z-index: 2; border-top: 1px solid var(--border); margin-top: 2px; padding-top: 14px;
    }
    .bdh-feat {
      display: flex; align-items: center; gap: 6px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 6px 12px; font-size: 0.7rem; font-weight: 600; color: var(--text2);
      font-family: 'Nunito', sans-serif; transition: background 0.2s, border-color 0.2s;
    }
    .bdh-feat.on { background: var(--white); }
    .bdh-feat.off { opacity: 0.45; }
    .best-deal-hero:hover .bdh-feat.on { background: rgba(192,96,122,0.05); border-color: rgba(192,96,122,0.2); }

    /* CTA strip */
    .bdh-cta {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 13px 24px; border-top: 1px solid var(--border);
      font-size: 0.82rem; font-weight: 700; font-family: 'Nunito', sans-serif;
      color: var(--rose); position: relative; z-index: 2;
      opacity: 0; background: rgba(192,96,122,0.03);
      transition: opacity 0.25s, background 0.25s;
    }
    .best-deal-hero:hover .bdh-cta { opacity: 1; background: rgba(192,96,122,0.06); }
    .bdh-cta-arrow { transition: transform 0.22s; }
    .best-deal-hero:hover .bdh-cta-arrow { transform: translateX(5px); }

    /* ── PETAL SPARKLE BURST on best-deal-hero hover ── */
    .bdh-confetti-wrap {
      position: absolute; inset: 0; z-index: 3;
      border-radius: 28px; overflow: hidden; pointer-events: none;
    }

    /* ── PRODUCT GRID ── */
    .product-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); }

    /* ════════════════════════════════════════════════
       PRODUCT CARD — full hover highlight system
    ════════════════════════════════════════════════ */
    .pcard {
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 22px; overflow: hidden;
      display: flex; flex-direction: column; position: relative;
      box-shadow: 0 2px 14px var(--shadow2);
      cursor: pointer;
      /* smooth everything */
      transition:
        transform      0.32s cubic-bezier(.34,1.45,.64,1),
        box-shadow     0.32s ease,
        border-color   0.28s ease,
        background     0.28s ease;
      animation: fadeUp 0.5s ease both;
      /* CSS custom prop for per-card accent colour */
      --ca: 192,96,122;
    }

    /* Hover: strong lift + vivid mood-coloured outer ring + deep glow + gradient tint */
    .pcard:hover {
      transform: translateY(-12px) scale(1.028);
      box-shadow:
        0 0    0 3px  rgba(var(--ca), 0.72),
        0 0    0 8px  rgba(var(--ca), 0.13),
        0 32px 70px   rgba(var(--ca), 0.26),
        0 12px 30px   rgba(var(--ca), 0.20);
      border-color: rgba(var(--ca), 0.85);
      background: linear-gradient(155deg,
        rgba(var(--ca), 0.10) 0%,
        rgba(var(--ca), 0.03) 38%,
        var(--white) 68%);
    }

    /* Best card always has faint rose ring */
    .pcard.is-best {
      border-color: rgba(192,96,122,0.40);
      box-shadow: 0 4px 24px rgba(192,96,122,0.14), 0 0 0 1.5px rgba(192,96,122,0.12);
    }

    /* ── FOCUS MODE OVERLAY — backdrop + centered card ── */
    @keyframes backdropIn  { from{opacity:0} to{opacity:1} }
    @keyframes backdropOut { from{opacity:1} to{opacity:0} }
    @keyframes focusCardIn {
      from { opacity:0; transform:translate(-50%,-50%) scale(0.82); }
      to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
    }
    @keyframes focusCardOut {
      from { opacity:1; transform:translate(-50%,-50%) scale(1); }
      to   { opacity:0; transform:translate(-50%,-50%) scale(0.88); }
    }

    /* Fullscreen dimmed backdrop */
    .focus-backdrop {
      position: fixed; inset: 0; z-index: 900;
      background: rgba(20, 8, 14, 0.72);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      animation: backdropIn 0.28s ease both;
      cursor: pointer;
    }
    .focus-backdrop.closing { animation: backdropOut 0.22s ease both; }

    /* The card rendered in focus-center */
    .focus-card-wrap {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      width: min(420px, 92vw);
      max-height: 92vh;
      overflow-y: auto;
      border-radius: 26px;
      animation: focusCardIn 0.32s cubic-bezier(.34,1.45,.64,1) both;
      scrollbar-width: none;
    }
    .focus-card-wrap::-webkit-scrollbar { display: none; }
    .focus-card-wrap.closing { animation: focusCardOut 0.2s ease both; }

    /* Card inside focus — overrides grid sizing */
    .focus-card-wrap .pcard {
      width: 100%; border-radius: 24px;
      background: #ffffff !important;
      transform: none !important;
      animation: none !important;
      cursor: default;
    }
    /* Re-apply every theme colour explicitly — portal is outside app-root */
    .focus-card-wrap .card-img         { background: #fdeef2 !important; height: 190px; }
    .focus-card-wrap .card-img img     { width: 140px !important; height: 140px !important; }
    .focus-card-wrap .card-body        { background: #ffffff !important; color: #2a1a20 !important; }
    .focus-card-wrap .card-src         { /* platform colour set inline, keep */ }
    .focus-card-wrap .card-title       { color: #2a1a20 !important; -webkit-line-clamp: 3; }
    .focus-card-wrap .card-price       { color: #2a1a20 !important; }
    .focus-card-wrap .ship-free        { background: rgba(90,144,112,0.12) !important; color: #3a7050 !important; border-color: rgba(90,144,112,0.3) !important; }
    .focus-card-wrap .ship-paid        { background: #fdf6f2 !important; color: #b08090 !important; border-color: #f0d0d8 !important; }
    .focus-card-wrap .rating-row       { background: #fdf6f2 !important; border-color: #f0d0d8 !important; }
    .focus-card-wrap .rating-val       { color: #2a1a20 !important; }
    .focus-card-wrap .rating-stars     { color: #c07830 !important; }
    .focus-card-wrap .features-title   { color: #b08090 !important; }
    .focus-card-wrap .feature-item     { background: #fdf6f2 !important; border-color: #f0d0d8 !important; }
    .focus-card-wrap .feature-item.active { background: #ffffff !important; }
    .focus-card-wrap .feature-item.inactive { opacity: 0.40; }
    .focus-card-wrap .feat-label       { color: #6a3a4a !important; }
    .focus-card-wrap .feat-val         { color: #b08090 !important; }
    .focus-card-wrap .card-divider     { background: #f8ede8 !important; }
    .focus-card-wrap .score-badge-wrap { background: #ffffff !important; border-color: #f0d0d8 !important; box-shadow: 0 2px 12px rgba(180,80,100,0.10) !important; }
    .focus-card-wrap .mood-banner      { filter: none !important; }
    .focus-card-wrap .best-ribbon      { /* keep gradient */ }
    .focus-card-wrap .disc-tag         { /* keep gradient */ }

    /* Visit CTA — rose themed */
    .card-visit-hint {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 16px; margin: 8px 0 0;
      border-radius: 13px; cursor: pointer;
      font-size: 0.88rem; font-weight: 800; font-family: 'Nunito', sans-serif;
      transition: filter 0.18s, transform 0.2s, box-shadow 0.2s;
    }
    .card-visit-hint:hover { filter: brightness(1.06); transform: translateY(-2px); }
    .hint-arrow { display: inline-block; transition: transform 0.2s; }
    .card-visit-hint:hover .hint-arrow { transform: translateX(5px); }

    /* Ghost placeholder — keeps grid layout stable while card is in focus */
    .pcard-ghost {
      border-radius: 22px;
      border: 2px dashed rgba(var(--ca), 0.25);
      background: rgba(var(--ca), 0.04);
      min-height: 420px;
    }

    /* ✕ close button — rose themed */
    .focus-close {
      position: absolute; top: 12px; right: 12px; z-index: 10;
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(192,96,122,0.10);
      border: 1.5px solid rgba(192,96,122,0.30);
      color: #c0607a; font-size: 0.9rem; font-weight: 900;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
      font-family: 'Nunito', sans-serif;
    }
    .focus-close:hover { background: rgba(192,96,122,0.20); transform: scale(1.1); box-shadow: 0 3px 12px rgba(192,96,122,0.25); }

    /* Shine sweep on hover */
    .pcard::before {
      content: '';
      position: absolute; inset: 0; z-index: 2;
      border-radius: 22px;
      background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
      background-size: 200% 100%;
      background-position: 200% 0;
      transition: background-position 0.55s ease;
      pointer-events: none;
    }
    .pcard:hover::before { background-position: -40% 0; }

    /* Image zooms and tints on hover */
    .card-img { width: 100%; height: 150px; background: var(--rose-pale); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; transition: background 0.28s; }
    .pcard:hover .card-img { background: rgba(var(--ca), 0.10); }
    .card-img img { width: 108px; height: 108px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.09)); transition: transform 0.38s cubic-bezier(.34,1.4,.64,1), filter 0.28s; }
    .pcard:hover .card-img img { transform: scale(1.13) translateY(-4px); filter: drop-shadow(0 10px 22px rgba(var(--ca),0.30)); }
    .no-img { font-size: 2.8rem; opacity: 0.15; transition: opacity 0.28s, transform 0.38s; }
    .pcard:hover .no-img { opacity: 0.28; transform: scale(1.12); }

    /* Mood banner */
    .mood-banner { width: 100%; padding: 7px 14px; display: flex; align-items: center; gap: 7px; font-size: 0.7rem; font-weight: 700; font-family: 'Nunito', sans-serif; flex-shrink: 0; transition: filter 0.2s; }
    .pcard:hover .mood-banner { filter: brightness(1.06); }
    .mood-emoji-sm { font-size: 1.05rem; }
    .mood-love    { background: rgba(220,80,120,0.08);  color: #b04060; border-bottom: 1px solid rgba(220,80,120,0.15); }
    .mood-great   { background: rgba(60,170,100,0.09);  color: #2e7050; border-bottom: 1px solid rgba(60,170,100,0.15); }
    .mood-good    { background: rgba(200,160,40,0.09);  color: #906010; border-bottom: 1px solid rgba(200,160,40,0.15); }
    .mood-meh     { background: rgba(150,150,180,0.09); color: #606080; border-bottom: 1px solid rgba(150,150,180,0.15); }
    .mood-poor    { background: rgba(200,80,60,0.09);   color: #903030; border-bottom: 1px solid rgba(200,80,60,0.15); }
    .mood-unknown { background: rgba(160,140,180,0.07); color: #807090; border-bottom: 1px solid rgba(160,140,180,0.12); }

    /* Best ribbon */
    .best-ribbon { position: absolute; top: 40px; left: 11px; z-index: 5; background: linear-gradient(135deg, var(--rose-lt), var(--rose-dk)); color: #fff; font-size: 0.6rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.3px; text-transform: uppercase; box-shadow: 0 2px 8px rgba(192,96,122,0.38); font-family: 'Nunito', sans-serif; }

    /* Deal score badge */
    .score-badge-wrap { position: absolute; top: 36px; right: 10px; z-index: 5; background: var(--white); border-radius: 14px; padding: 7px 10px; box-shadow: 0 2px 12px var(--shadow); border: 1.5px solid var(--border); min-width: 58px; text-align: center; transition: box-shadow 0.28s, transform 0.28s; }
    .pcard:hover .score-badge-wrap { transform: scale(1.08); box-shadow: 0 6px 20px rgba(var(--ca),0.22); }
    .score-badge-num   { font-family: 'Nunito', sans-serif; font-size: 1.3rem; font-weight: 900; line-height: 1; }
    .score-badge-label { font-size: 0.54rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; font-family: 'Nunito', sans-serif; }
    .score-badge-bar   { width: 100%; height: 3px; border-radius: 999px; margin-top: 4px; overflow: hidden; background: var(--border); }
    .score-badge-fill  { height: 100%; border-radius: 999px; }

    /* Discount tag */
    .disc-tag { position: absolute; bottom: 0; left: 0; background: linear-gradient(135deg, var(--amber), #a05010); color: #fff; font-size: 0.62rem; font-weight: 800; padding: 3px 10px; border-radius: 0 10px 0 0; font-family: 'Nunito', sans-serif; }

    /* Card body */
    .card-body  { padding: 13px 15px 15px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .card-src   { font-size: 0.63rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; font-family: 'Nunito', sans-serif; transition: letter-spacing 0.2s; }
    .pcard:hover .card-src { letter-spacing: 1.4px; }
    .card-title { font-size: 0.87rem; font-weight: 600; line-height: 1.45; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
    .pcard:hover .card-title { color: var(--text); }

    .price-row  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .card-price { font-family: 'Nunito', sans-serif; font-size: 1.4rem; font-weight: 900; color: var(--text); transition: transform 0.2s; }
    .pcard:hover .card-price { transform: scale(1.04); }
    .ship-chip  { font-size: 0.68rem; padding: 3px 9px; border-radius: 999px; font-weight: 700; font-family: 'Nunito', sans-serif; }
    .ship-free  { background: rgba(90,144,112,0.12); color: #3a7050; border: 1px solid rgba(90,144,112,0.3); }
    .ship-paid  { background: var(--bg); color: var(--text3); border: 1px solid var(--border); }

    /* Rating row */
    .rating-row     { display: flex; align-items: center; gap: 9px; background: var(--bg); border: 1px solid var(--border); border-radius: 11px; padding: 8px 11px; transition: background 0.25s, border-color 0.25s; }
    .pcard:hover .rating-row { background: rgba(var(--ca),0.05); border-color: rgba(var(--ca),0.22); }
    .rating-emoji   { font-size: 1.4rem; flex-shrink: 0; transition: transform 0.3s; }
    .pcard:hover .rating-emoji { transform: scale(1.18) rotate(-6deg); }
    .rating-details { display: flex; flex-direction: column; gap: 1px; }
    .rating-val     { font-family: 'Nunito', sans-serif; font-size: 0.88rem; font-weight: 800; color: var(--text); }
    .rating-stars   { font-size: 0.7rem; color: var(--amber); }
    .rating-sub     { font-size: 0.62rem; color: var(--text3); font-weight: 600; }

    /* Feature grid */
    .features-section { display: flex; flex-direction: column; gap: 6px; }
    .features-title   { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); font-weight: 700; font-family: 'Nunito', sans-serif; }
    .features-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .feature-item     { display: flex; align-items: center; gap: 6px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 6px 9px; transition: background 0.2s, border-color 0.2s, transform 0.2s; }
    .feature-item.active   { background: var(--white); }
    .feature-item.inactive { opacity: 0.40; }
    .pcard:hover .feature-item.active { border-color: rgba(var(--ca),0.20); background: rgba(var(--ca),0.04); }
    .feat-icon  { font-size: 0.9rem; flex-shrink: 0; }
    .feat-text  { display: flex; flex-direction: column; }
    .feat-label { font-size: 0.62rem; font-weight: 700; color: var(--text2); font-family: 'Nunito', sans-serif; line-height: 1.2; }
    .feat-val   { font-size: 0.6rem; color: var(--text3); font-weight: 500; line-height: 1.2; }

    .card-divider { height: 1px; background: var(--bg2); margin: 2px -15px 0; }

    /* CTA button */
    .card-cta { display: block; text-align: center; text-decoration: none; padding: 10px; border-radius: 11px; margin-top: 4px; font-size: 0.82rem; font-weight: 700; font-family: 'Nunito', sans-serif; transition: opacity 0.18s, transform 0.22s, box-shadow 0.22s, letter-spacing 0.18s; }
    .pcard:hover .card-cta { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(var(--ca),0.28); letter-spacing: 0.3px; opacity: 1 !important; }

    /* Card stagger */
    .pcard:nth-child(1){animation-delay:0.04s} .pcard:nth-child(2){animation-delay:0.08s}
    .pcard:nth-child(3){animation-delay:0.12s} .pcard:nth-child(4){animation-delay:0.16s}
    .pcard:nth-child(5){animation-delay:0.20s} .pcard:nth-child(6){animation-delay:0.24s}
    .pcard:nth-child(n+7){animation-delay:0.28s}

    /* ── FOCUS SIDE PANELS — float left/right of focused card ── */
    @keyframes sideIn-left  { from{opacity:0; transform:translateX(-36px) scale(0.88)} to{opacity:1; transform:translateX(0) scale(1)} }
    @keyframes sideIn-right { from{opacity:0; transform:translateX(36px)  scale(0.88)} to{opacity:1; transform:translateX(0) scale(1)} }
    @keyframes floatUp   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
    @keyframes floatDown { 0%,100%{transform:translateY(0)}   50%{transform:translateY(10px)} }
    @keyframes spinSlow  { to{transform:rotate(360deg)} }
    @keyframes sparkPop  { 0%{opacity:0;transform:scale(0)} 60%{opacity:1;transform:scale(1.2)} 100%{opacity:1;transform:scale(1)} }

    .focus-side {
      position: fixed; top: 50%; z-index: 1001;
      transform: translateY(-50%);
      display: flex; flex-direction: column; align-items: center;
      gap: 22px; pointer-events: none;
    }
    .focus-side-left  { left: calc(50% - 260px); animation: sideIn-left  0.45s 0.15s cubic-bezier(.34,1.45,.64,1) both; }
    .focus-side-right { right: calc(50% - 260px); animation: sideIn-right 0.45s 0.15s cubic-bezier(.34,1.45,.64,1) both; }

    /* Individual floating item */
    .fsi {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      animation: sparkPop 0.4s var(--fi-delay, 0s) cubic-bezier(.34,1.56,.64,1) both;
    }
    .fsi-emoji {
      font-size: var(--fi-size, 2.2rem);
      filter: drop-shadow(0 4px 14px var(--fi-glow, rgba(192,96,122,0.5)));
      animation: floatUp var(--fi-dur, 2.8s) var(--fi-phase, 0s) ease-in-out infinite;
    }
    .fsi-emoji.down { animation-name: floatDown; }
    .fsi-label {
      font-family: 'Nunito', sans-serif; font-size: 0.62rem; font-weight: 800;
      color: rgba(255,255,255,0.7); letter-spacing: 0.8px; text-transform: uppercase;
      text-align: center; white-space: nowrap;
    }

    /* Spinning ring accent */
    .fsi-ring {
      width: var(--fi-ring, 48px); height: var(--fi-ring, 48px);
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.12);
      border-top-color: rgba(255,255,255,0.55);
      animation: spinSlow var(--fi-spin, 4s) linear infinite;
      display: flex; align-items: center; justify-content: center;
    }

    /* Error / Empty */
    .err-box { background: rgba(192,96,122,0.07); border: 1px solid rgba(192,96,122,0.25); border-radius: 14px; padding: 15px 18px; color: var(--rose); font-size: 0.88rem; margin-bottom: 18px; animation: fadeUp 0.3s ease both; font-weight: 600; }
    .empty { text-align: center; padding: 72px 20px; color: var(--text3); animation: fadeUp 0.4s ease both; }
    .empty-icon { font-size: 3.2rem; margin-bottom: 14px; opacity: 0.45; }
  `}</style>
);

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
const scoreStyle = (s) => {
  if (s >= 75) return { color:"#2e7d4f", fill:"linear-gradient(90deg,#4caf80,#80d4a8)", label:"Great Deal" };
  if (s >= 50) return { color:"#b06010", fill:"linear-gradient(90deg,#e08830,#f0b860)", label:"Good Deal"  };
  return          { color:"#a03050", fill:"linear-gradient(90deg,#c0607a,#e090a8)", label:"Fair Deal"  };
};

const platformColors = {
  amazon:"#e47911", flipkart:"#2874f0", myntra:"#ff3f6c",
  snapdeal:"#ef4c24", meesho:"#9f2089", shopsy:"#f7971d",
  croma:"#1c4f9c", jiomart:"#0052b4", "tata cliq":"#d0021b",
  nykaa:"#fc2779", ajio:"#333",
};
const getPlatColor = (src="") => {
  const s = src.toLowerCase();
  for (const [k,v] of Object.entries(platformColors)) if (s.includes(k)) return v;
  return "#c0607a";
};

const fmtPrice = (p) => {
  if (!p && p !== 0) return "N/A";
  const n = typeof p === "string" ? parseFloat(p.replace(/[₹,]/g,"")) : p;
  return isNaN(n) ? p : "₹" + n.toLocaleString("en-IN");
};

const starsStr = (r) => {
  const v = Math.round(parseFloat(r)||0);
  return "★".repeat(v) + "☆".repeat(5-v);
};

// ─────────────────────────────────────────
//  FOCUS SIDE PANELS
//  Float left & right of the focused card,
//  themed to the product's sentiment colour.
//  Stays clear of the card — purely decorative.
// ─────────────────────────────────────────
const FocusSidePanels = ({ sentiment }) => {
  if (!sentiment) return null;
  const g = sentiment.glowColor;
  const e = sentiment.emoji;

  // Left panel items — mood emojis + stars, staggered float
  const left = [
    { emoji: e,    size:"2.6rem", dur:"2.6s", phase:"0s",    delay:"0.18s", glow: g },
    { emoji:"⭐",  size:"1.8rem", dur:"3.1s", phase:"0.8s",  delay:"0.28s", glow:"rgba(192,120,48,0.6)", dir:"down" },
    { emoji: e,    size:"1.6rem", dur:"2.3s", phase:"1.4s",  delay:"0.38s", glow: g },
    { emoji:"✨",  size:"1.4rem", dur:"3.4s", phase:"0.3s",  delay:"0.48s", glow:"rgba(255,220,100,0.6)" },
  ];

  // Right panel items — deal/price themed
  const right = [
    { emoji:"🏷️",  size:"2.4rem", dur:"2.8s", phase:"0.5s",  delay:"0.22s", glow:"rgba(192,120,48,0.55)" },
    { emoji: e,    size:"2.0rem", dur:"2.4s", phase:"1.2s",  delay:"0.32s", glow: g, dir:"down" },
    { emoji:"💰",  size:"1.8rem", dur:"3.2s", phase:"0s",    delay:"0.42s", glow:"rgba(100,180,100,0.6)" },
    { emoji:"✨",  size:"1.4rem", dur:"2.9s", phase:"1.8s",  delay:"0.52s", glow:"rgba(255,220,100,0.6)" },
  ];

  const Item = ({ emoji, size, dur, phase, delay, glow, dir }) => (
    <div className="fsi" style={{ "--fi-delay": delay }}>
      <span
        className={`fsi-emoji${dir === "down" ? " down" : ""}`}
        style={{ "--fi-size": size, "--fi-dur": dur, "--fi-phase": phase, "--fi-glow": glow }}
      >
        {emoji}
      </span>
    </div>
  );

  return ReactDOM.createPortal(
    <>
      <div className="focus-side focus-side-left">
        {left.map((p, i) => <Item key={i} {...p}/>)}
      </div>
      <div className="focus-side focus-side-right">
        {right.map((p, i) => <Item key={i} {...p}/>)}
      </div>
    </>,
    document.body
  );
};

// ─────────────────────────────────────────
//  PRODUCT CARD INNER — shared between grid card and focus overlay
// ─────────────────────────────────────────
const CardInner = ({ product, isBest, ss, pc, disc, sentiment, delivDays, onVisit, focusMode }) => (
  <>
    {/* Mood banner */}
    <div className={`mood-banner ${sentiment.bannerClass}`}>
      <span className="mood-emoji-sm">{sentiment.emoji}</span>
      <span>{sentiment.label}</span>
    </div>

    {isBest && <div className="best-ribbon">🏆 Best Deal</div>}

    {/* Deal score badge */}
    <div className="score-badge-wrap">
      <div className="score-badge-num"   style={{ color: ss.color }}>{Math.round(product.deal_score || 0)}</div>
      <div className="score-badge-label" style={{ color: ss.color }}>{ss.label}</div>
      <div className="score-badge-bar">
        <div className="score-badge-fill" style={{ width:`${Math.round(product.deal_score||0)}%`, background: ss.fill }}/>
      </div>
    </div>

    {/* Image */}
    <div className="card-img">
      {product.thumbnail
        ? <img src={product.thumbnail} alt={product.title} loading="lazy"/>
        : <span className="no-img">🛍️</span>
      }
      {disc > 0 && <div className="disc-tag">-{disc}% OFF</div>}
    </div>

    {/* Body */}
    <div className="card-body">
      <div className="card-src" style={{ color: pc }}>{product.source || "Store"}</div>
      <div className="card-title">{product.title || "Product"}</div>

      <div className="price-row">
        <span className="card-price">{fmtPrice(product.price)}</span>
        <span className={`ship-chip ${product.free_shipping ? "ship-free" : "ship-paid"}`}>
          {product.free_shipping ? "✓ Free Shipping" : "+ Shipping"}
        </span>
      </div>

      {/* Rating row */}
      <div className="rating-row">
        <span className="rating-emoji">{sentiment.emoji}</span>
        <div className="rating-details">
          <span className="rating-val">
            {product.rating > 0 ? `${parseFloat(product.rating).toFixed(1)} / 5.0` : "No rating"}
          </span>
          {product.rating > 0 && <span className="rating-stars">{starsStr(product.rating)}</span>}
          <span className="rating-sub" style={{ color: sentiment.color }}>
            {sentiment.label}{product.reviews > 0 ? ` · ${parseInt(product.reviews).toLocaleString()} reviews` : ""}
          </span>
        </div>
      </div>

      {/* Feature grid */}
      <div className="features-section">
        <div className="features-title">Deal Features</div>
        <div className="features-grid">
          <div className={`feature-item ${product.cod_available ? "active" : "inactive"}`}>
            <span className="feat-icon">💳</span>
            <div className="feat-text">
              <span className="feat-label" style={{ color: product.cod_available ? "#3a7050" : "inherit" }}>Cash on Delivery</span>
              <span className="feat-val">{product.cod_available ? "✓ Available" : "✗ Not available"}</span>
            </div>
          </div>
          <div className={`feature-item ${delivDays != null ? "active" : "inactive"}`}>
            <span className="feat-icon">🚚</span>
            <div className="feat-text">
              <span className="feat-label" style={{ color: delivDays <= 2 ? "#3a7050" : delivDays <= 4 ? "#b06010" : "inherit" }}>Delivery Speed</span>
              <span className="feat-val">
                {delivDays === 0 ? "✓ Same Day" : delivDays === 1 ? "✓ Next Day"
                : delivDays <= 3 ? `✓ ${delivDays} Days` : delivDays ? `${delivDays} Days` : "Not specified"}
              </span>
            </div>
          </div>
          <div className={`feature-item ${product.free_shipping ? "active" : "inactive"}`}>
            <span className="feat-icon">📦</span>
            <div className="feat-text">
              <span className="feat-label" style={{ color: product.free_shipping ? "#3a7050" : "inherit" }}>Free Shipping</span>
              <span className="feat-val">{product.free_shipping ? "✓ Included" : "✗ Extra charge"}</span>
            </div>
          </div>
          <div className={`feature-item ${product.reviews > 0 ? "active" : "inactive"}`}>
            <span className="feat-icon">💬</span>
            <div className="feat-text">
              <span className="feat-label">Reviews</span>
              <span className="feat-val">{product.reviews > 0 ? `${parseInt(product.reviews).toLocaleString()} reviews` : "No reviews yet"}</span>
            </div>
          </div>
          <div className={`feature-item ${disc > 0 ? "active" : "inactive"}`}>
            <span className="feat-icon">🏷️</span>
            <div className="feat-text">
              <span className="feat-label" style={{ color: disc >= 20 ? "#b06010" : "inherit" }}>Discount</span>
              <span className="feat-val">{disc > 0 ? `${disc}% off` : "No discount"}</span>
            </div>
          </div>
          <div className={`feature-item ${product.rating > 0 ? "active" : "inactive"}`}>
            <span className="feat-icon">⭐</span>
            <div className="feat-text">
              <span className="feat-label" style={{ color: product.rating >= 4 ? "#b06010" : "inherit" }}>Rating</span>
              <span className="feat-val">{product.rating > 0 ? `${parseFloat(product.rating).toFixed(1)} / 5.0` : "Not rated"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-divider"/>

      {/* Visit CTA — shown in focus mode */}
      {focusMode && (
        <div
          className="card-visit-hint"
          style={{ color: pc, background: `${pc}14`, border: `1.5px solid ${pc}35` }}
          onClick={onVisit}
        >
          🛒 Tap to visit on {product.source || "Store"} <span className="hint-arrow">→</span>
        </div>
      )}
    </div>
  </>
);

// ─────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────
const ProductCard = ({ product, isBest, idx, onHoverStart, onHoverEnd, expandedId, onExpand, onClose }) => {
  const score     = Math.round(product.deal_score || 0);
  const ss        = scoreStyle(score);
  const pc        = getPlatColor(product.source);
  const disc      = Math.round(product.discount_percentage || 0);
  const sentiment = getSentiment(product.rating);
  const delivDays = product.delivery_days;
  const [closing, setClosing] = useState(false);

  const cardId     = product.link || idx;
  const isExpanded = expandedId === cardId;

  const handleGridClick = (e) => {
    e.preventDefault();
    onExpand(cardId);
  };

  const handleClose = useCallback((e) => {
    e && e.stopPropagation();
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  }, [onClose]);

  const handleVisit = (e) => {
    e.stopPropagation();
    if (product.link) window.open(product.link, "_blank", "noopener,noreferrer");
  };

  // Prevent body scroll when focused
  useEffect(() => {
    if (isExpanded) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);

  const sharedProps = { product, isBest, ss, pc, disc, sentiment, delivDays };

  return (
    <>
      {/* ── Ghost placeholder keeps grid layout stable ── */}
      {isExpanded
        ? <div className="pcard-ghost" style={{ "--ca": sentiment.cardAccent }}/>
        : (
          <a
            href={product.link || "#"}
            className={`pcard${isBest ? " is-best" : ""}`}
            style={{
              animationDelay: `${idx * 0.04}s`,
              "--ca": sentiment.cardAccent,
              textDecoration: "none", color: "inherit",
              display: "flex", flexDirection: "column",
            }}
            onClick={handleGridClick}
            onMouseEnter={() => onHoverStart(sentiment)}
            onMouseLeave={() => onHoverEnd()}
          >
            <CardInner {...sharedProps} focusMode={false}/>
          </a>
        )
      }

      {/* ── Focus overlay — rendered into document.body via portal ── */}
      {isExpanded && typeof document !== "undefined" && ReactDOM.createPortal(
        <>
          {/* Backdrop — click to close */}
          <div
            className={`focus-backdrop${closing ? " closing" : ""}`}
            onClick={handleClose}
          />

          {/* Side panels — float left & right, never cover the card */}
          {!closing && <FocusSidePanels sentiment={sentiment}/>}

          {/* Centered card wrapper — re-declares ALL CSS vars so portal renders correctly */}
          <div
            className={`focus-card-wrap${closing ? " closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              "--bg":        "#fdf6f2",
              "--bg2":       "#f8ede8",
              "--white":     "#ffffff",
              "--rose":      "#c0607a",
              "--rose-lt":   "#d4809a",
              "--rose-dk":   "#a04060",
              "--rose-pale": "#fdeef2",
              "--blush":     "#f5d8e0",
              "--border":    "#f0d0d8",
              "--text":      "#2a1a20",
              "--text2":     "#6a3a4a",
              "--text3":     "#b08090",
              "--amber":     "#c07830",
              "--shadow":    "rgba(180,80,100,0.10)",
              "--shadow2":   "rgba(180,80,100,0.05)",
              "--ca":        sentiment.cardAccent,
            }}
          >
            {/* Full card rendered inside the overlay */}
            <div
              className={`pcard${isBest ? " is-best" : ""}`}
              style={{
                "--ca": sentiment.cardAccent,
                borderRadius: "24px",
                background: "#ffffff",
                borderColor: `rgba(${sentiment.cardAccent},0.75)`,
                boxShadow: `0 0 0 4px rgba(${sentiment.cardAccent},0.12), 0 0 0 10px rgba(${sentiment.cardAccent},0.06), 0 40px 80px rgba(${sentiment.cardAccent},0.30), 0 12px 32px rgba(0,0,0,0.16)`,
                cursor: "default",
                animation: "none",
                position: "relative",
              }}
            >
              {/* ✕ close button */}
              <button className="focus-close" onClick={handleClose} aria-label="Close">✕</button>
              <CardInner {...sharedProps} onVisit={handleVisit} focusMode={true}/>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

// ─────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────
export default function App() {
  const [query,           setQuery]           = useState("");
  const [results,         setResults]         = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [searched,        setSearched]        = useState(false);
  const [lastQuery,       setLastQuery]       = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedCard,    setExpandedCard]    = useState(null);

  // No-op hover handlers — kept for ProductCard API compatibility
  const handleHoverStart = useCallback(() => {}, []);
  const handleHoverEnd   = useCallback(() => {}, []);

  // ── Expand / close focus mode ──
  const handleExpand = useCallback((cardId) => { setExpandedCard(cardId); }, []);
  const handleClose  = useCallback(() => { setExpandedCard(null); }, []);

  // ESC key closes focus mode
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setExpandedCard(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const tags = ["wireless headphones","laptop","running shoes","smartphone","smartwatch","earbuds"];

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true); setError(null); setSearched(true); setResults([]);
    setLastQuery(q.trim());
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search`, {
        params: { q: q.trim() }
      });
      setResults(res.data.products || res.data || []);
      // Trigger celebration if results found
      if ((res.data.products || res.data || []).length > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2400);
      }
    } catch (e) {
      setError(e.response?.data?.error || "Search failed. Make sure the backend server is running.");
    } finally { setLoading(false); }
  };

  const sorted    = [...results].sort((a,b) => (b.deal_score||0) - (a.deal_score||0));
  const best      = sorted[0] || null;
  const platforms = [...new Set(results.map(r => r.source).filter(Boolean))].length;
  const avgScore  = results.length
    ? Math.round(results.reduce((s,p) => s + (p.deal_score||0), 0) / results.length) : 0;
  const minPrice  = results.length
    ? Math.min(...results.map(r => r.price || Infinity)) : 0;

  // ── MAX RATING ── highest rated product
  const maxRated      = results.length
    ? [...results].sort((a,b) => (b.rating||0) - (a.rating||0))[0] : null;
  const maxRatingVal  = maxRated ? parseFloat(maxRated.rating).toFixed(1) : "—";
  const maxRatingSrc  = maxRated?.source || "";
  const maxRatingSent = maxRated ? getSentiment(maxRated.rating) : null;

  const bestSentiment = best ? getSentiment(best.rating) : null;

  return (
    <>
      <GlobalStyles/>
      <div className="page-bg"/>

      {/* ── Best Deal Celebration ── */}
      <BestDealCelebration active={showCelebration}/>

      <div className="app-root">

        {/* Header */}
        <header className="header">
          <div className="logo-lockup">
            <div className="logo-mark">
              <span style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 900,
                fontSize: "1.25rem",
                letterSpacing: "-1px",
                background: "linear-gradient(135deg, #d4809a, #a04060)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>BD</span>
            </div>
            <div className="logo-name">Best<span>Deal</span></div>
          </div>
          <div className="tagline">Your smart shopping companion · Crafted with care 🛍️</div>
          <div className="platform-row">
            {["Amazon","Flipkart","Myntra","Snapdeal","Meesho","Shopsy","Nykaa","+ More"].map(p => (
              <span key={p} className="p-pill">{p}</span>
            ))}
          </div>
        </header>

        {/* Search */}
        <div className="search-card">
          <div className="s-row">
            <div className="s-group">
              <span className="s-icon">🔍</span>
              <input className="s-input" placeholder="Search for any product..."
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}/>
            </div>
            <button className="s-btn" onClick={() => handleSearch()} disabled={loading || !query.trim()}>
              {loading ? <><span className="dots">Searching</span></> : <>🔍 Search Deals</>}
            </button>
          </div>
          <div className="quick-row">
            <span className="q-label">Try:</span>
            {tags.map(t => (
              <button key={t} className="q-chip" onClick={() => { setQuery(t); handleSearch(t); }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-wrap">
            <div className="spin"/>
            <div className="loading-txt">Scanning deals across platforms<span className="dots"/></div>
          </div>
        )}

        {/* Error */}
        {error && !loading && <div className="err-box">⚠️ {error}</div>}

        {/* Results */}
        {!loading && sorted.length > 0 && (<>

          {/* ── Stats bar — each chip has its own colour theme ── */}
          <div className="stats-bar">
            <div className="stat-chip chip-score">
              <span className="stat-icon">🎯</span>
              <div>
                <div className="stat-val">{avgScore}</div>
                <div className="stat-lbl">Avg Deal Score</div>
              </div>
            </div>
            <div className="stat-chip chip-platforms">
              <span className="stat-icon">🏪</span>
              <div>
                <div className="stat-val">{platforms}</div>
                <div className="stat-lbl">Platforms</div>
              </div>
            </div>
            <div className="stat-chip chip-price">
              <span className="stat-icon">💰</span>
              <div>
                <div className="stat-val">{fmtPrice(minPrice)}</div>
                <div className="stat-lbl">Lowest Price</div>
              </div>
            </div>

            {/* MAX RATING replaces Avg Deal Score */}
            <div className="stat-chip max-rating">
              <span className="stat-icon">
                {maxRatingSent ? maxRatingSent.emoji : "⭐"}
              </span>
              <div>
                <div className="stat-val">{maxRatingVal} ★</div>
                <div className="stat-lbl">
                  Highest Rated
                  {maxRatingSrc ? ` · ${maxRatingSrc}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className="res-header">
            <div>
              <div className="res-title">Best Products Found for "{lastQuery}"</div>
              <div className="res-sub">Ranked by ML deal score · highest value shown first</div>
            </div>
            <div className="ml-badge"><span className="ml-dot"/><span>ML Powered</span></div>
          </div>

          {/* Best deal hero card */}
          {best && bestSentiment && (() => {
            const score   = Math.round(best.deal_score || 0);
            const ss      = scoreStyle(score);
            const pc      = getPlatColor(best.source);
            const disc    = Math.round(best.discount_percentage || 0);
            const delivD  = best.delivery_days;
            const ringEnd = (213.6 - (213.6 * score / 100)).toFixed(1);
            const ringColor = ss.color.includes("7d") ? "#4caf80" : ss.color.includes("b06") ? "#e08830" : "#c0607a";
            return (
              <a
                className="best-deal-hero"
                href={best.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Animated shimmer top bar */}
                <div className="bdh-top-bar"/>

                {/* Crown + label + discount */}
                <div className="bdh-crown-row">
                  <span className="bdh-crown">👑</span>
                  <span className="bdh-hero-label">Best Deal Found</span>
                  {disc > 0 && <span className="bdh-disc-pill">-{disc}% OFF</span>}
                </div>

                {/* Main body */}
                <div className="bdh-body">

                  {/* Product image */}
                  <div className="bdh-img-box">
                    {best.thumbnail
                      ? <img src={best.thumbnail} alt={best.title} loading="lazy"/>
                      : <span className="bdh-no-img">🛍️</span>
                    }
                  </div>

                  {/* Info column */}
                  <div className="bdh-info">
                    <div className="bdh-platform" style={{ color: pc }}>{best.source || "Store"}</div>
                    <div className="bdh-title">{best.title}</div>
                    <div className="bdh-price-row">
                      <span className="bdh-price">{fmtPrice(best.price)}</span>
                      {best.free_shipping && <span className="bdh-chip bdh-chip-green">✓ Free Shipping</span>}
                      {best.cod_available  && <span className="bdh-chip bdh-chip-blue">✓ COD</span>}
                      {delivD === 0 && <span className="bdh-chip bdh-chip-orange">⚡ Same Day</span>}
                      {delivD === 1 && <span className="bdh-chip bdh-chip-orange">⚡ Next Day</span>}
                      {delivD >= 2 && delivD <= 3 && <span className="bdh-chip bdh-chip-orange">✓ {delivD} Days</span>}
                    </div>
                    <div className="bdh-sentiment-row">
                      <span className="bdh-sent-emoji">{bestSentiment.emoji}</span>
                      <span className="bdh-sent-text" style={{ color: bestSentiment.color }}>{bestSentiment.label}</span>
                      {best.rating > 0 && <span className="bdh-rating-txt">· ⭐ {parseFloat(best.rating).toFixed(1)} / 5.0</span>}
                      {best.reviews > 0 && <span className="bdh-rating-txt">· {parseInt(best.reviews).toLocaleString()} reviews</span>}
                    </div>
                  </div>

                  {/* Score ring */}
                  <div className="bdh-score-col">
                    <div className="bdh-ring-wrap">
                      <svg viewBox="0 0 90 90" className="bdh-ring-svg">
                        <circle cx="45" cy="45" r="34" className="bdh-ring-track"/>
                        <circle cx="45" cy="45" r="34" className="bdh-ring-fill"
                          style={{ stroke: ringColor, "--ring-end": ringEnd, strokeDashoffset: ringEnd }}
                        />
                      </svg>
                      <div className="bdh-ring-inner">
                        <div className="bdh-ring-num" style={{ color: ringColor }}>{score}</div>
                        <div className="bdh-ring-lbl">Score</div>
                      </div>
                    </div>
                    <div className="bdh-score-label" style={{ background: ss.fill }}>{ss.label}</div>
                  </div>

                </div>

                {/* Feature pills */}
                <div className="bdh-features">
                  <div className={`bdh-feat ${best.free_shipping ? "on" : "off"}`}>📦 {best.free_shipping ? "Free Shipping" : "Paid Shipping"}</div>
                  <div className={`bdh-feat ${best.cod_available ? "on" : "off"}`}>💳 {best.cod_available ? "COD Available" : "No COD"}</div>
                  <div className={`bdh-feat ${delivD != null ? "on" : "off"}`}>🚚 {delivD === 0 ? "Same Day" : delivD === 1 ? "Next Day" : delivD ? `${delivD}-day delivery` : "Delivery TBD"}</div>
                  <div className={`bdh-feat ${best.reviews > 0 ? "on" : "off"}`}>💬 {best.reviews > 0 ? `${parseInt(best.reviews).toLocaleString()} reviews` : "No reviews"}</div>
                  {disc > 0 && <div className="bdh-feat on">🏷️ {disc}% off</div>}
                </div>

                {/* CTA strip */}
                <div className="bdh-cta" style={{ color: pc }}>
                  🛒 View on {best.source || "Store"} <span className="bdh-cta-arrow">→</span>
                </div>

              </a>
            );
          })()}

          {/* Product grid */}
          <div className="product-grid">
            {sorted.map((p, i) => (
              <ProductCard
                key={p.link || i}
                product={p}
                isBest={i === 0}
                idx={i}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
                expandedId={expandedCard}
                onExpand={handleExpand}
                onClose={handleClose}
              />
            ))}
          </div>

        </>)}

        {/* Empty */}
        {!loading && searched && sorted.length === 0 && !error && (
          <div className="empty">
            <div className="empty-icon">🌸</div>
            <div style={{ fontSize:"0.95rem", fontWeight:600 }}>No results found. Try a different search.</div>
          </div>
        )}

      </div>
    </>
  );
}