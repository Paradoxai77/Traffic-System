import React, { useState, useEffect, useRef } from 'react';

const BOOT_LINES = [
  { text: "[SYS] Initializing Ruby Traffic AI Engine...", delay: 0 },
  { text: "[NET] Establishing V2X Communication Links...", delay: 400 },
  { text: "[GPU] Loading YOLOv10 Edge Vision Model...", delay: 800 },
  { text: "[API] Connecting to TomTom Traffic API...", delay: 1200 },
  { text: "[CAM] Activating ANPR Camera Nodes...", delay: 1600 },
  { text: "[MAP] Mapping Pune, Maharashtra Intersections...", delay: 2000 },
  { text: "[EVP] Emergency Vehicle Preemption Module: READY", delay: 2400 },
  { text: "[ATM] Adaptive Traffic Management: ONLINE", delay: 2800 },
  { text: "[OK ] All Systems Operational. Launching Dashboard...", delay: 3200 },
];

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState('boot'); // boot -> reveal -> exit
  const [scanAngle, setScanAngle] = useState(0);
  const onFinishRef = useRef(onFinish);

  // Keep ref in sync
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // Boot sequence terminal lines
  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.2;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Scanning ring rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 2) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Phase transitions — NO dependency on onFinish so timers don't reset
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 3400);
    const t2 = setTimeout(() => setPhase('exit'), 4800);
    const t3 = setTimeout(() => onFinishRef.current(), 5600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`splash-screen ${phase === 'exit' ? 'splash-exit' : ''}`}>
      {/* Animated background grid */}
      <div className="splash-grid" />
      
      {/* Floating particles */}
      <div className="splash-particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo + Title at top */}
        <div className={`splash-header ${phase !== 'boot' ? 'splash-header-up' : ''}`}>
          <div className="splash-logo-ring">
            <svg viewBox="0 0 120 120" className="splash-ring-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,240,255,0.08)" strokeWidth="2" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scanGrad)" strokeWidth="3"
                strokeDasharray="30 310"
                style={{ transform: `rotate(${scanAngle}deg)`, transformOrigin: '60px 60px' }} />
              <defs>
                <linearGradient id="scanGrad">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="splash-logo-hex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          </div>
          <h1 className="splash-title">RUBY TRAFFIC AI</h1>
          <p className="splash-subtitle">Smart City Command Centre</p>
        </div>

        {/* Traffic image with scanning overlay */}
        <div className={`splash-image-container ${phase === 'reveal' || phase === 'exit' ? 'splash-image-active' : ''}`}>
          <img src={`${import.meta.env.BASE_URL}splash_traffic.png`} alt="Traffic" className="splash-image" />
          <div className="splash-image-overlay" />
          <div className="splash-scan-bar" />
          {/* AI Detection boxes */}
          <div className="splash-detect-box" style={{ top: '25%', left: '15%', width: '80px', height: '55px', animationDelay: '0.2s' }}>
            <span className="detect-label">CAR 94.2%</span>
          </div>
          <div className="splash-detect-box" style={{ top: '20%', left: '55%', width: '100px', height: '70px', animationDelay: '0.5s' }}>
            <span className="detect-label">BUS 97.8%</span>
          </div>
          <div className="splash-detect-box" style={{ top: '40%', left: '35%', width: '70px', height: '50px', animationDelay: '0.8s' }}>
            <span className="detect-label">SUV 96.1%</span>
          </div>
          <div className="splash-detect-box" style={{ top: '55%', left: '70%', width: '60px', height: '45px', animationDelay: '1.1s' }}>
            <span className="detect-label">CAR 98.4%</span>
          </div>
          {/* Corner brackets */}
          <div className="splash-bracket tl" />
          <div className="splash-bracket tr" />
          <div className="splash-bracket bl" />
          <div className="splash-bracket br" />
        </div>

        {/* Boot terminal */}
        <div className={`splash-terminal ${phase !== 'boot' ? 'splash-terminal-hide' : ''}`}>
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`terminal-line ${i === visibleLines - 1 ? 'terminal-line-new' : ''}`}>
              <span className="terminal-prompt">&gt;</span>
              <span className={
                line.text.includes('[OK ]') ? 'terminal-success' :
                line.text.includes('[GPU]') || line.text.includes('[CAM]') ? 'terminal-warn' :
                'terminal-info'
              }>{line.text}</span>
            </div>
          ))}
          <div className="terminal-cursor">_</div>
        </div>

        {/* Progress bar */}
        <div className={`splash-progress-wrap ${phase !== 'boot' ? 'splash-progress-hide' : ''}`}>
          <div className="splash-progress-track">
            <div className="splash-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}>
              <div className="splash-progress-glow" />
            </div>
          </div>
          <div className="splash-progress-text">
            {Math.min(Math.floor(progress), 100)}% — Initializing Edge Nodes
          </div>
        </div>

        {/* Stats that appear during reveal */}
        <div className={`splash-stats ${phase === 'reveal' || phase === 'exit' ? 'splash-stats-show' : ''}`}>
          <div className="splash-stat-item">
            <div className="splash-stat-num">4</div>
            <div className="splash-stat-label">AI Camera Nodes</div>
          </div>
          <div className="splash-stat-item">
            <div className="splash-stat-num">24</div>
            <div className="splash-stat-label">V2X Links</div>
          </div>
          <div className="splash-stat-item">
            <div className="splash-stat-num">99.4%</div>
            <div className="splash-stat-label">Model Accuracy</div>
          </div>
          <div className="splash-stat-item">
            <div className="splash-stat-num">PUNE</div>
            <div className="splash-stat-label">Maharashtra</div>
          </div>
        </div>
      </div>
    </div>
  );
}
