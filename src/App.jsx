import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, Camera, ShieldAlert, Cpu, Video, Hexagon, Zap,
  ArrowUpRight, Map, CloudRain, Wind, Radio, Globe,
  ParkingSquare, Satellite, BarChart2, BookOpen, Settings,
  ArrowDown, ArrowUp, Thermometer, HardDrive, Scale, ScrollText
} from 'lucide-react';
import SplashScreen from './SplashScreen.jsx';
import './SplashScreen.css';

/* ─── Research constants (Isarsoft, Dec 2025) ─── */
const VIOLATION_TYPES = [
  { type: "Over-speeding",        vehicle: "Sedan",      baseFine: 150, speedOffset: 65, conf: () => (94 + Math.random()*5.9).toFixed(1)+"%" },
  { type: "Red Light Jump",       vehicle: "SUV",        baseFine: 250, speedOffset: 45, conf: () => (96 + Math.random()*3.9).toFixed(1)+"%" },
  { type: "Wrong Way Driver",     vehicle: "Motorcycle", baseFine: 500, speedOffset: 75, conf: () => (92 + Math.random()*7.5).toFixed(1)+"%" },
  { type: "Jaywalking",           vehicle: "Human",      baseFine:  50, speedOffset:  5, conf: () => (88 + Math.random()*9.5).toFixed(1)+"%" },
  { type: "No Seat Belt",         vehicle: "Truck",      baseFine: 100, speedOffset: 50, conf: () => (90 + Math.random()*8.5).toFixed(1)+"%" },
  { type: "Mobile Phone Use",     vehicle: "Sedan",      baseFine: 200, speedOffset: 40, conf: () => (93 + Math.random()*6.5).toFixed(1)+"%" },
];

const HAZARDS = [
  { severity: "critical", message: "Heavy Collision — Lane Blocked",    action: "EMS Dispatched" },
  { severity: "high",     message: "Stranded Vehicle in Lane 2",        action: "Tow Requested" },
  { severity: "medium",   message: "Debris on Roadway at Junction",     action: "Maintenance Notified" },
  { severity: "critical", message: "Wrong Way Driver Detected!",        action: "Police Intercept Ping" },
  { severity: "high",     message: "Pedestrian Detected on Highway",    action: "Alert Broadcast Sent" },
  { severity: "medium",   message: "Signal Malfunction — Node Offline", action: "Manual Override Active" },
];

const ITS_MODES = ["ATM ACTIVE", "V2X SYNC", "ADAPTIVE CTRL", "ITS NOMINAL"];

const genPlate = () => {
  const L = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${L()}${L()}${L()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/* ─── Tooltip custom component ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,13,24,0.95)', border: '1px solid rgba(0,240,255,0.2)',
      borderRadius: '10px', padding: '0.6rem 0.9rem', fontSize: '0.8rem',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ color: 'var(--brand-cyan)', fontWeight: 700, fontFamily: 'Orbitron,monospace' }}>
        {payload[0].value}% density
      </div>
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [data, setData] = useState({
    intersections: [],
    violations: [],
    alerts: [],
    historical_density: [],
    system_status: "Syncing Nodes...",
    total_violations: 0,
    environment: { weather: "CLEAR", co2_emissions_saved_kg: 0, avg_speed_kmh: 0, total_vehicles_scanned: 0 },
  });

  const [itsMode, setItsMode]     = useState("ATM ACTIVE");
  const [v2xLinks, setV2xLinks]   = useState(14);
  const [flowIndex, setFlowIndex] = useState(82);
  const [parking, setParking]     = useState({ total: 240, occupied: 178 });
  const [uptime, setUptime]       = useState(0); // seconds
  const [sysMetrics, setSysMetrics] = useState({
    down: "1.2 MB/s",
    up: "420 KB/s",
    cpu: 24,
    ram: 4.1,
    temp: 48
  });

  const [evidenceModal, setEvidenceModal] = useState(null);

  /* Uptime counter */
  useEffect(() => {
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* TrafficMonitor-style metrics simulation */
  useEffect(() => {
    const t = setInterval(() => {
      setSysMetrics({
        down: (Math.random() * 5 + 0.1).toFixed(1) + " MB/s",
        up: (Math.random() * 800 + 50).toFixed(0) + " KB/s",
        cpu: Math.floor(Math.random() * 30 + 15),
        ram: (Math.random() * 2 + 3.5).toFixed(1),
        temp: Math.floor(Math.random() * 15 + 40)
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  /* ITS metrics rotation */
  useEffect(() => {
    const t = setInterval(() => {
      setItsMode(ITS_MODES[Math.floor(Math.random() * ITS_MODES.length)]);
      setV2xLinks(v => Math.max(8, Math.min(24, v + Math.floor(Math.random() * 5 - 2))));
      setFlowIndex(v => Math.max(40, Math.min(99, v + Math.floor(Math.random() * 7 - 3))));
      setParking(p => {
        const occ = Math.max(80, Math.min(235, p.occupied + Math.floor(Math.random() * 7 - 3)));
        return { total: 240, occupied: occ };
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  /* Data polling */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard_data');
        if (res.ok) {
          const result = await res.json();
          if (!result.environment) result.environment = { weather: "CLEAR", co2_emissions_saved_kg: 0, avg_speed_kmh: 0, total_vehicles_scanned: 0 };
          setData(result);
        }
      } catch {
        /* Edge Sandbox — full ATM simulation */
        setData(prev => {
          const newInts = prev.intersections.length ? [...prev.intersections] : [
            { id:"i-1", name:"Shaniwar Wada",   density:45, signal:"green", wait_time:0,  emergency_override:false, vehicle_count:54, pedestrian_count:12, mode:"ADAPTIVE" },
            { id:"i-2", name:"Koregaon Park",   density:60, signal:"red",   wait_time:15, emergency_override:false, vehicle_count:72, pedestrian_count: 4, mode:"PROGRESSIVE" },
            { id:"i-3", name:"Hinjewadi Ph 1",  density:30, signal:"green", wait_time:0,  emergency_override:false, vehicle_count:36, pedestrian_count: 8, mode:"ADAPTIVE" },
            { id:"i-4", name:"Swargate Junction", density:80, signal:"red",   wait_time:45, emergency_override:true,  vehicle_count:96, pedestrian_count: 2, mode:"EVP OVERRIDE" },
          ];

          const wx = prev.environment?.weather || "CLEAR";
          const wxPenalty = wx === "CLEAR" ? 0 : wx === "RAIN" ? 4 : 6;

          newInts.forEach(n => {
            n.density = Math.max(10, Math.min(95, n.density + Math.floor(Math.random()*15-7) + wxPenalty));
            n.vehicle_count = Math.floor(n.density * 1.2);
            n.pedestrian_count = Math.max(0, n.pedestrian_count + Math.floor(Math.random()*3-1));

            if (!n.emergency_override && Math.random() < 0.03) {
              n.emergency_override = true; n.signal = "green"; n.wait_time = 0; n.mode = "EVP OVERRIDE";
            } else if (n.emergency_override && Math.random() < 0.3) {
              n.emergency_override = false; n.mode = "ADAPTIVE";
            }

            if (!n.emergency_override) {
              if (n.signal === 'red') {
                n.wait_time += 2;
                if (n.wait_time > 40 || n.density > 80) { n.signal = 'green'; n.wait_time = 0; }
              } else if (Math.random() > 0.8) { n.signal = 'red'; n.wait_time = 0; }
            }
          });

          const avgDensity = Math.floor(newInts.reduce((a, b) => a + b.density, 0) / newInts.length);
          const now = new Date();
          const ts = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });

          const newHist = [...(prev.historical_density||[])];
          if (!newHist.length || now.getSeconds()%5===0) {
            newHist.push({ time: ts, density: avgDensity });
            if (newHist.length > 20) newHist.shift();
          }

          const newViols = [...prev.violations];
          if (Math.random() > 0.72) {
            const vt = VIOLATION_TYPES[Math.floor(Math.random()*VIOLATION_TYPES.length)];
            const spd = vt.speedOffset + Math.floor(Math.random()*40);
            const fine = vt.baseFine + (vt.type==="Over-speeding" ? Math.max(0,(spd-60)*2) : 0);
            newViols.unshift({
              id:'V-'+Math.floor(Math.random()*9999), type:vt.type,
              plate: vt.vehicle==="Human" ? "PED-LINK" : genPlate(),
              time:ts, confidence:vt.conf(), speed:spd+" km/h",
              vehicle:vt.vehicle, fine:"₹"+fine,
              location: newInts[Math.floor(Math.random()*newInts.length)].name,
              engine_data: { vehicle_distance_from_center_m: (Math.random()*400 + 50).toFixed(1) }
            });
            if (newViols.length>5) newViols.pop();
          }

          let newAlerts = [...prev.alerts];
          if (Math.random()>0.85 || !newAlerts.length) {
            const h = HAZARDS[Math.floor(Math.random()*HAZARDS.length)];
            newAlerts.unshift({
              id:'A-'+Math.floor(Math.random()*999), ...h, time:ts,
              model_conf:(92+Math.random()*7.5).toFixed(1)+"%",
              location:newInts[Math.floor(Math.random()*newInts.length)].name,
            });
            if (newAlerts.length>5) newAlerts.pop();
          }

          let newWx = wx;
          if (Math.random()<0.05) newWx = ["CLEAR","RAIN","FOG","CLEAR"][Math.floor(Math.random()*4)];
          const co2 = prev.environment.co2_emissions_saved_kg + (avgDensity<60 ? 3 : 1);

          return {
            intersections: newInts, violations: newViols, alerts: newAlerts,
            historical_density: newHist,
            system_status: "Live · Edge Sandbox · ATM",
            total_violations: prev.total_violations + (newViols.length > prev.violations.length ? 1 : 0),
            environment: {
              weather: newWx, co2_emissions_saved_kg: co2,
              avg_speed_kmh: Math.max(5, (newWx==="CLEAR"?45:25) - Math.floor(avgDensity/5)),
              total_vehicles_scanned: (prev.environment.total_vehicles_scanned||0)+15,
            },
          };
        });
      }
    };
    fetchData();
    const iv = setInterval(fetchData, 2000);
    return () => clearInterval(iv);
  }, []);

  const avgDensity = data.intersections.length
    ? Math.round(data.intersections.reduce((a, b) => a + b.density, 0) / data.intersections.length)
    : 0;

  const parkingPct = Math.round((parking.occupied / parking.total) * 100);

  const fmtUptime = s => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    <div className="site-wrapper">

      {/* ═══ TOP NAVIGATION ═══ */}
      <nav className="topnav">
        <div className="nav-brand">
          <div className="nav-logo-box"><Hexagon size={20} /></div>
          <span className="nav-brand-name">RUBY TRAFFIC AI</span>
        </div>

        <div className="nav-links">
          {[
            { id:'dashboard', label:'Dashboard', icon:<Activity size={14}/> },
            { id:'rules', label:'Rules', icon:<Scale size={14}/> },
            { id:'analytics', label:'Analytics',  icon:<BarChart2 size={14}/> },
            { id:'surveillance', label:'Surveillance', icon:<Video size={14}/> },
            { id:'incidents', label:'Incidents', icon:<ShieldAlert size={14}/> },
            { id:'research', label:'Research', icon:<BookOpen size={14}/> },
          ].map(n => (
            <div key={n.id} className={`nav-link ${activeNav===n.id?'active':''}`} onClick={() => {
              if (n.id === 'rules') {
                setActiveNav('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else if (n.id === 'dashboard') {
                setActiveNav('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveNav('dashboard');
                setTimeout(() => {
                  document.getElementById('section-' + n.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}>
              {n.icon} {n.label}
            </div>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-pill its">
            <Radio size={11}/> {itsMode}
          </div>
          <div className="nav-pill">
            <Globe size={11}/> V2X: {v2xLinks}
          </div>
          <div className="nav-pill">
            <CloudRain size={11}/> {data.environment?.weather}
          </div>
          <div className="nav-live">
            <div className="live-dot"/>
            {data.system_status}
          </div>
        </div>
      </nav>
      
      {activeNav === 'rules' ? <RulesView /> : (
        <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section">
        {/* 3D Background Image */}
        <div className="hero-bg-image">
          <img src={`${import.meta.env.BASE_URL}hero_3d.png`} alt="Smart City Command Centre" />
          <div className="hero-bg-overlay" />
          <div className="hero-scan-line" />
          <div className="hero-glow-orb orb-cyan" />
          <div className="hero-glow-orb orb-purple" />
          <div className="hero-glow-orb orb-green" />
        </div>

        <div className="hero-top">
          <div className="hero-title-group">
            <div className="hero-eyebrow">
              <Satellite size={11}/> Smart City Command Centre · Monitoring Pune, Maharashtra
            </div>
            <h1 className="hero-title">Ruby Traffic AI</h1>
            <p className="hero-sub">
              Real-time edge AI platform for intelligent urban traffic management — featuring ANPR violation detection,
              Emergency Vehicle Preemption (EVP), V2X communication, and environmental CO₂ monitoring.
            </p>
            <div className="hero-badges">
              {["React 19","Python Flask","Edge AI","V2X","ANPR","ATM","GitHub Pages"].map(b=>(
                <span key={b} className="hero-badge">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero KPI strip */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-val">{(data.environment?.total_vehicles_scanned||0).toLocaleString()}</div>
            <div className="hero-stat-label">Vehicles Scanned</div>
            <div className="hero-stat-sub">Total tracked volume</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val purple">{avgDensity}%</div>
            <div className="hero-stat-label">Avg Density</div>
            <div className="hero-stat-sub">Across {data.intersections.length||4} Pune Signals</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">302</div>
            <div className="hero-stat-label">City Signals</div>
            <div className="hero-stat-sub">281 ATMS Active</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val">{data.environment?.avg_speed_kmh} <span style={{fontSize:'1rem'}}>km/h</span></div>
            <div className="hero-stat-label">Flow Speed</div>
            <div className="hero-stat-sub">Flow index: {flowIndex}%</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val green">{data.environment?.co2_emissions_saved_kg} <span style={{fontSize:'1rem'}}>kg</span></div>
            <div className="hero-stat-label">CO₂ Saved</div>
            <div className="hero-stat-sub">Signal optimisation</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val red">{data.total_violations}</div>
            <div className="hero-stat-label">Violations</div>
            <div className="hero-stat-sub">ANPR detections</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val yellow">{data.alerts.length}</div>
            <div className="hero-stat-label">Active Alerts</div>
            <div className="hero-stat-sub">Anomaly incidents</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-val" style={{fontSize:'1.3rem'}}>{fmtUptime(uptime)}</div>
            <div className="hero-stat-label">System Uptime</div>
            <div className="hero-stat-sub">Edge sandbox runtime</div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION: ANALYTICS ═══ */}
      <section className="section-wrap" id="section-analytics">
        <div className="section-heading">
          <div className="section-heading-icon"><Activity size={16}/></div>
          <span className="section-heading-label">Real-Time Analytics</span>
          <div className="section-heading-line"/>
        </div>

        <div className="dashboard-grid">
          {/* Congestion Chart */}
          <div className="glass-panel col-8">
            <div className="panel-header">
              <div className="panel-title">
                <Activity size={18} color="var(--brand-cyan)"/>
                Congestion Analytics
                <span className="panel-meta">· Adaptive Signal Control (ATM)</span>
              </div>
              <div style={{display:'flex',gap:'1rem',fontSize:'0.78rem',fontWeight:600}}>
                <span style={{color:'var(--brand-cyan)'}}>AI PREDICTION: STABLE</span>
                <span style={{color:'var(--brand-green)'}}>CO₂ SAVED: {data.environment?.co2_emissions_saved_kg} kg</span>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.historical_density} margin={{top:10,right:10,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00f0ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} domain={[0,100]}/>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="density" stroke="var(--brand-cyan)" fill="url(#gradCyan)" strokeWidth={2.5}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CCTV Panel */}
          <div className="glass-panel col-4 accent-purple" id="section-surveillance" style={{padding:'0.8rem'}}>
            <div className="panel-header" style={{padding:'0 0.5rem 0.8rem'}}>
              <div className="panel-title">
                <Video size={16} color="var(--brand-purple)"/>
                Live CCTV Feed
              </div>
              <span style={{fontSize:'0.7rem',color:'var(--brand-cyan)',fontWeight:600,letterSpacing:'1px'}}>AI TRACKING</span>
            </div>
            <div className="cctv-container">
              <img src={`${import.meta.env.BASE_URL}cctv_3d.png`} className="cctv-feed" alt="AI Vision System"/>
              <div className="cctv-overlay"/>
              <div className="cctv-scan-line"/>
              <div className="cctv-crosshair"/>
              <div className="cctv-rec"><div className="cctv-rec-dot"/> ● REC</div>
              <div className="feed-container" style={{position:'absolute',bottom:0,left:0,right:0,padding:'0.6rem',maxHeight:'170px'}}>
                {data.violations.slice(0,2).map(v=>(
                  <div key={v.id} className="feed-item anpr" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',marginBottom:'0.4rem'}}>
                    <div className="feed-top">
                      <span className="feed-title" style={{fontSize:'0.82rem'}}>{v.type} <span style={{color:'var(--text-muted)',fontSize:'0.7rem'}}>({v.vehicle})</span></span>
                      <span className="feed-time">{v.time}</span>
                    </div>
                    <div className="badge-row">
                      <span className="cyber-badge badge-plate">{v.plate}</span>
                      <span className="cyber-badge badge-conf">{v.confidence}</span>
                      <span className="cyber-badge" style={{background:'rgba(255,42,85,0.2)',color:'var(--brand-red)',border:'1px solid var(--brand-red)'}}>
                        📍 {v.engine_data?.vehicle_distance_from_center_m || ((parseInt(v.id.replace(/\D/g,''))||123) % 300 + 50).toFixed(1)}m
                      </span>
                      {v.type === "NON-HSRP PLATE" ? (
                        <span className="cyber-badge" style={{background:'rgba(255,184,0,0.15)',color:'var(--brand-yellow)',border:'1px solid var(--brand-yellow)', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}} onClick={() => setEvidenceModal({plate: v.plate, image: 'non_hsrp_plate.png'})}>
                          <Camera size={12}/> Capture Image
                        </span>
                      ) : (
                        <span className="cyber-badge" style={{background:'rgba(0,255,136,0.1)',color:'var(--brand-green)'}}>{v.speed || "55 km/h"}</span>
                      )}
                    </div>
                  </div>
                ))}
                {!data.violations.length && <div style={{textAlign:'center',color:'var(--brand-cyan)',padding:'1rem',fontSize:'0.8rem'}}>Scanning...</div>}
              </div>
            </div>
          </div>
        </div>

        {/* TrafficMonitor-inspired System Monitor Panel */}
        <div className="dashboard-grid" style={{marginTop:'1.25rem'}}>
          <div className="glass-panel col-12">
            <div className="panel-header">
              <div className="panel-title">
                <HardDrive size={18} color="var(--brand-cyan)"/>
                System & Network Monitor
                <span className="panel-meta">· Resource Health</span>
              </div>
              <div className="nav-pill its">
                <Radio size={11}/> STABLE
              </div>
            </div>
            
            <div className="monitor-grid">
              <div className="monitor-item">
                <div className="monitor-label">Network Usage</div>
                <div className="monitor-speed">
                  <ArrowDown size={14} color="var(--brand-green)"/>
                  <span className="monitor-value">{sysMetrics.down}</span>
                  <span style={{color:'var(--text-dim)', margin:'0 0.5rem'}}>|</span>
                  <ArrowUp size={14} color="var(--brand-orange)"/>
                  <span className="monitor-value">{sysMetrics.up}</span>
                </div>
              </div>

              <div className="monitor-item">
                <div className="monitor-label">CPU Usage</div>
                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <span className="monitor-value">{sysMetrics.cpu}%</span>
                  <div className="monitor-bar-bg" style={{flex:1}}>
                    <div className="monitor-bar-fill" style={{width: sysMetrics.cpu + '%'}}/>
                  </div>
                </div>
              </div>

              <div className="monitor-item">
                <div className="monitor-label">Memory Usage</div>
                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <span className="monitor-value">{sysMetrics.ram} GB</span>
                  <div className="monitor-bar-bg" style={{flex:1}}>
                    <div className="monitor-bar-fill" style={{width: (sysMetrics.ram / 8 * 100) + '%', background:'var(--brand-purple)'}}/>
                  </div>
                </div>
              </div>

              <div className="monitor-item">
                <div className="monitor-label">Hardware Temp</div>
                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <Thermometer size={14} color="var(--brand-red)"/>
                  <span className="monitor-value">{sysMetrics.temp}°C</span>
                  <div className="monitor-bar-bg" style={{flex:1}}>
                    <div className="monitor-bar-fill" style={{width: (sysMetrics.temp / 100 * 100) + '%', background:'var(--brand-red)'}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION: INTERSECTION NODES ═══ */}
      <section className="section-wrap">
        <div className="section-heading">
          <div className="section-heading-icon"><Cpu size={16}/></div>
          <span className="section-heading-label">Intersection Node Topology · EVP Control</span>
          <div className="section-heading-line"/>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel col-8">
            <div className="panel-header">
              <div className="panel-title">
                <Cpu size={18} color="var(--brand-green)"/>
                Smart Intersection Control
                <span className="panel-meta">· EVP + Adaptive Signals</span>
              </div>
              <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>
                {data.intersections.filter(i=>i.emergency_override).length} EVP active
              </div>
            </div>
            {/* 3D Signal Image */}
            <div className="intersection-3d-image">
              <img src={`${import.meta.env.BASE_URL}signal_3d.png`} alt="Smart Traffic Signal Node" />
              <div className="intersection-3d-overlay" />
              <div className="intersection-3d-label">
                <span>Edge AI Node</span>
                <span>Pune, MH</span>
              </div>
            </div>
            {data.intersections.map(int=>(
              <div key={int.id} className={`intersection-item ${int.emergency_override?'override':''}`}>
                <div style={{flex:1}}>
                  <div className="int-name">
                    {int.name}
                    {int.emergency_override && <span className="evp-badge">EVP ACTIVE</span>}
                    {!int.emergency_override && int.mode && <span className="int-mode-tag">[{int.mode}]</span>}
                  </div>
                  <div className="int-metrics">
                    <span>Signals <span className="int-metric-val">{int.id.includes('1') ? 8 : int.id.includes('2') ? 12 : int.id.includes('3') ? 16 : 14}</span></span>
                    <span>Density <span className="int-metric-val">{int.density}%</span></span>
                    <span>Wait <span className="int-metric-val">{int.wait_time}s</span></span>
                    <span>Vehicles <span className="int-metric-val">{int.vehicle_count}</span></span>
                    <span>Peds <span className="int-metric-val">{int.pedestrian_count}</span></span>
                  </div>
                </div>
                <div className="traffic-signal">
                  <div className={`signal-light red ${int.signal==='red'?'active':''}`}/>
                  <div className={`signal-light yellow ${int.signal==='yellow'?'active':''}`}/>
                  <div className={`signal-light green ${int.signal==='green'?'active':''}`}/>
                </div>
              </div>
            ))}
            {!data.intersections.length && <div style={{textAlign:'center',color:'var(--text-muted)',padding:'2rem'}}>Awaiting edge connections...</div>}
          </div>

          {/* Anomaly Incident Log */}
          <div className="glass-panel col-4 accent-red" id="section-incidents">
            <div className="panel-header">
              <div className="panel-title">
                <ShieldAlert size={18} color="var(--brand-red)"/>
                Anomaly Log
              </div>
              <span style={{fontSize:'0.7rem',background:'rgba(255,42,85,0.15)',color:'var(--brand-red)',padding:'0.2rem 0.5rem',borderRadius:'6px',fontWeight:700}}>
                {data.alerts.length} active
              </span>
            </div>
            <div className="feed-container">
              {data.alerts.map(a=>(
                <div key={a.id} className={`feed-item ${a.severity==='critical'?'alert-critic':'alert-warn'}`}>
                  <div className="feed-top">
                    <span className="feed-title" style={{fontSize:'0.82rem',color:a.severity==='critical'?'var(--brand-red)':'var(--brand-yellow)'}}>
                      {a.severity?.toUpperCase()} <span style={{color:'var(--text-muted)',fontSize:'0.7rem'}}>({a.model_conf})</span>
                    </span>
                    <span className="feed-time">{a.time}</span>
                  </div>
                  <div className="feed-desc" style={{color:'#fff',fontWeight:500,marginBottom:'4px'}}>{a.message}</div>
                  {a.location && <div style={{fontSize:'0.68rem',color:'var(--text-dim)',marginBottom:'4px'}}>📍 {a.location}</div>}
                  <div className="badge-row">
                    <span className="cyber-badge" style={{background:'rgba(0,240,255,0.08)',color:'var(--brand-cyan)',border:'1px solid rgba(0,240,255,0.2)'}}>
                      {a.action_taken}
                    </span>
                  </div>
                </div>
              ))}
              {!data.alerts.length && <div style={{textAlign:'center',color:'var(--text-muted)',padding:'2rem',fontSize:'0.85rem'}}>System Nominal</div>}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION: SMART CITY INTELLIGENCE ═══ */}
      <section className="section-wrap" id="section-research">
        <div className="section-heading">
          <div className="section-heading-icon"><Globe size={16}/></div>
          <span className="section-heading-label">Smart City Intelligence · ITS / ATM Research Data</span>
          <div className="section-heading-line"/>
        </div>

        <div className="dashboard-grid">
          {/* Smart City Stats */}
          <div className="glass-panel col-6">
            <div className="panel-header">
              <div className="panel-title">
                <Globe size={18} color="var(--brand-cyan)"/>
                ITS Performance Metrics
              </div>
              <span style={{fontSize:'0.68rem',color:'var(--text-dim)'}}>Source: Isarsoft Research, Dec 2025</span>
            </div>
            <div className="intel-grid">
              {[
                { label:"EU Target",      val:"−55%",           sub:"Emission cut by 2030",     color:"var(--brand-green)" },
                { label:"V2X Links",      val:v2xLinks,          sub:"Vehicle-to-Everything",    color:"var(--brand-cyan)" },
                { label:"Flow Index",     val:flowIndex+"%",     sub:"Adaptive Signal Ctrl",     color:"var(--brand-cyan)" },
                { label:"ITS Mode",       val:itsMode.split(" ")[0], sub:itsMode.split(" ").slice(1).join(" ")||"Active", color:"#c084fc" },
                { label:"CO₂ Saved",     val:(data.environment?.co2_emissions_saved_kg||0)+" kg", sub:"Signal optimisation", color:"var(--brand-green)" },
                { label:"Parking",        val:parkingPct+"%",    sub:`${parking.total-parking.occupied} spots free`, color: parking.total-parking.occupied < 30 ? "var(--brand-red)" : "var(--brand-yellow)" },
              ].map((s,i)=>(
                <div key={i} className="intel-stat" style={{'--intel-color':s.color}}>
                  <div className="intel-val" style={{color:s.color}}>{s.val}</div>
                  <div className="intel-label">{s.label}</div>
                  <div className="intel-sub">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="parking-bar-wrap">
              <div className="parking-bar-header">
                <span><ParkingSquare size={12} style={{display:'inline',marginRight:'4px'}}/>Smart Parking Occupancy</span>
                <span style={{color:parking.total-parking.occupied<30?'var(--brand-red)':'var(--brand-green)',fontWeight:700}}>
                  {parking.total-parking.occupied} / {parking.total} available
                </span>
              </div>
              <div className="parking-bar-bg">
                <div className="parking-bar-fill" style={{width:parkingPct+'%'}}/>
              </div>
            </div>
          </div>

          {/* ANPR Violation Log */}
          <div className="glass-panel col-6 accent-purple">
            <div className="panel-header">
              <div className="panel-title">
                <Camera size={18} color="var(--brand-purple)"/>
                ANPR Violation Log
                <span className="panel-meta">· 6 detection types</span>
              </div>
              <span style={{fontSize:'0.7rem',background:'rgba(157,78,255,0.15)',color:'var(--brand-purple)',padding:'0.2rem 0.5rem',borderRadius:'6px',fontWeight:700}}>
                {data.violations.length} recent
              </span>
            </div>
            <div style={{overflowY:'auto',maxHeight:'240px'}}>
              {data.violations.map(v=>(
                <div key={v.id} className="violation-row" style={{alignItems:'flex-start', gap:'0.75rem'}}>
                  <div className="violation-dot" style={{
                    marginTop:'4px',
                    background: v.type==='NON-HSRP PLATE'?'var(--brand-yellow)':v.type?.includes('WRONG')||v.type?.includes('Wrong')?'var(--brand-red)':v.type?.includes('SIGNAL')||v.type?.includes('Red')?'var(--brand-orange)':'var(--brand-cyan)',
                    color: v.type==='NON-HSRP PLATE'?'var(--brand-yellow)':v.type?.includes('WRONG')||v.type?.includes('Wrong')?'var(--brand-red)':v.type?.includes('SIGNAL')||v.type?.includes('Red')?'var(--brand-orange)':'var(--brand-cyan)',
                  }}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:'0.82rem'}}>{v.type}</div>
                    <div style={{color:'var(--text-muted)',fontSize:'0.7rem'}}>{v.plate} · {v.vehicle} · {v.location||'—'}</div>
                    {v.type === 'NON-HSRP PLATE' && (
                      <div style={{marginTop:'0.4rem'}}>
                        <span
                          style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'rgba(255,184,0,0.15)',color:'var(--brand-yellow)',border:'1px solid var(--brand-yellow)',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',fontWeight:700,cursor:'pointer'}}
                          onClick={() => setEvidenceModal({plate: v.plate, image: 'non_hsrp_plate.png'})}
                        >
                          <Camera size={11}/> 📷 Capture Image
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{color:'var(--brand-red)',fontWeight:700,fontSize:'0.85rem'}}>{v.fine}</div>
                    <div style={{color:'var(--text-dim)',fontSize:'0.68rem'}}>{v.speed} · {v.confidence}</div>
                  </div>
                </div>
              ))}
              {!data.violations.length && (
                <div style={{textAlign:'center',color:'var(--brand-cyan)',padding:'2.5rem 0',fontSize:'0.85rem'}}>
                  Scanning for violations...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="site-footer">
        <div className="footer-brand"><span>RUBY</span> TRAFFIC AI · Smart City Command Centre · 2026</div>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{color:'var(--text-dim)'}}>Source: Isarsoft Research, Dec 2025</span>
          <span>·</span>
          <span style={{color:'var(--brand-cyan)'}}>github.com/Paradoxai77/Traffic-System</span>
          <span>·</span>
          <span>Uptime: {fmtUptime(uptime)}</span>
        </div>
      </footer>
      </>
      )}

      {/* Evidence Modal Overlay */}
      {evidenceModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="glass-panel" style={{padding:'2rem', maxWidth:'600px', width:'90%', border:'1px solid var(--brand-cyan)', position:'relative'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <div>
                <h3 style={{color:'var(--brand-cyan)', fontFamily:'Orbitron', fontSize:'1.4rem'}}>Evidence Capture</h3>
                <p style={{color:'var(--brand-yellow)', fontSize:'0.85rem', marginTop:'0.2rem'}}>Violation: NON-HSRP PLATE (VP-02) · Plate: {evidenceModal.plate}</p>
              </div>
              <button onClick={() => setEvidenceModal(null)} style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.5rem'}}>&times;</button>
            </div>
            
            <div style={{position:'relative', border:'2px solid rgba(0,240,255,0.3)', borderRadius:'8px', overflow:'hidden'}}>
              <img src={`${import.meta.env.BASE_URL}${evidenceModal.image}`} alt="Evidence Plate" style={{width:'100%', height:'auto', display:'block'}} />
              
              {/* Overlay Annotations */}
              <div style={{position:'absolute', top:'10%', left:'10%', border:'2px solid var(--brand-red)', width:'20%', height:'40%', background:'rgba(255,42,85,0.1)'}}></div>
              <div style={{position:'absolute', top:'8%', left:'10%', color:'var(--brand-red)', fontSize:'0.75rem', fontWeight:'bold', background:'rgba(0,0,0,0.7)', padding:'2px 4px'}}>MISSING HSRP BARCODE</div>
            </div>

            <div style={{marginTop:'1.5rem', padding:'1rem', background:'rgba(0,240,255,0.05)', borderRadius:'8px', border:'1px dashed var(--brand-cyan)', display:'flex', justifyContent:'space-between'}}>
              <div style={{color:'var(--text-dim)', fontSize:'0.8rem'}}>
                <strong>Timestamp:</strong> {new Date().toISOString()}<br/>
                <strong>Source Node:</strong> ATMS-PUNE-04<br/>
                <strong>Status:</strong> Awaiting Officer Verification
              </div>
              <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                 <button style={{background:'var(--brand-red)', color:'#fff', border:'none', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontWeight:600}} onClick={() => setEvidenceModal(null)}>REJECT</button>
                 <button style={{background:'var(--brand-cyan)', color:'#000', border:'none', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontWeight:600}} onClick={() => setEvidenceModal(null)}>ISSUE CHALLAN</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}

const RulesView = () => {
  const sections = [
    {
      id: "m1",
      title: "Module 1: Boundary & Core Challan Engine",
      icon: <ShieldAlert size={20} />,
      rules: [
        { label: "Boundary Enforcement", desc: "Mandatory geodesic distance check (Haversine). GPS accuracy must be within ±15m." },
        { label: "Evidence Threshold", desc: "License plate recognition ≥ 98% confidence. Violation detection ≥ 95% confidence." },
        { label: "Zero Tolerance", desc: "No challans issued for false positives. Burden of proof is entirely on the system." },
        { label: "Audit Integrity", desc: "Every decision must generate an immutable audit log and unique evidence UUID." }
      ]
    },
    {
      id: "m2",
      title: "Module 2: Plate Identification & HSRP",
      icon: <ScrollText size={20} />,
      rules: [
        { label: "Identification Priority", desc: "Scan 10-digit HSRP laser barcode first (99.5% conf). Fallback to OCR (98% conf)." },
        { label: "HSRP Classification", desc: "Class 1: HSRP Compliant. Class 2: Old/Non-HSRP (VP-02). Class 7: Fancy (VP-09)." },
        { label: "Clone Protocol (IPC 467/471)", desc: "Detected via DB mismatch or dual-location ping. Alert police control, issue NO challan." },
        { label: "Temporary Plates", desc: "Red plates valid for 30 days. No plate (VP-01) requires on-site officer confirmation." }
      ]
    },
    {
      id: "m3",
      title: "Operational Jurisdiction: Maharashtra",
      icon: <Map size={20} />,
      rules: [
        { label: "Out-of-State Immunity", desc: "HSRP checks do not apply to non-MH vehicles. Universal violations only." },
        { label: "Fuel Type Stickers", desc: "Daytime color check (Blue/Petrol, Orange/Diesel, Green/EV). No auto-challan." },
        { label: "Repeat Offenders", desc: "Violations within 30 days trigger elevated fine amounts (₹10,000 baseline)." },
        { label: "Document Verification", desc: "Expired Insurance/PUC/DL flagged for review only. No automatic issuance." }
      ]
    }
  ];

  return (
    <div className="rules-view" style={{padding:'2.5rem', flex: 1, overflowY:'auto'}}>
      <div style={{marginBottom:'2.5rem'}}>
        <h2 style={{fontFamily:'Orbitron', color:'var(--brand-cyan)', fontSize:'1.8rem', marginBottom:'0.5rem'}}>System Enforcement Protocols</h2>
        <p style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>Legal Jurisdiction: Maharashtra Motor Vehicles Act 1988 · Rule 50 CMVR</p>
      </div>

      <div className="dashboard-grid">
        {sections.map(s => (
          <div key={s.id} className="glass-panel col-4">
            <div className="panel-header">
              <div className="panel-title" style={{color:'var(--brand-cyan)'}}>
                {s.icon} {s.title}
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', marginTop:'1rem'}}>
              {s.rules.map((r, i) => (
                <div key={i}>
                  <div style={{color:'var(--text-main)', fontWeight:600, fontSize:'0.85rem', marginBottom:'0.25rem', letterSpacing:'0.5px'}}>{r.label}</div>
                  <div style={{color:'var(--text-muted)', fontSize:'0.8rem', lineHeight:1.5}}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:'3rem', padding:'1.5rem', background:'rgba(255,42,85,0.05)', border:'1px solid rgba(255,42,85,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', gap:'1rem'}}>
        <ShieldAlert size={20} color="var(--brand-red)" />
        <span style={{color:'var(--brand-red)', fontSize:'0.85rem', fontWeight:600, letterSpacing:'1px'}}>CONFIDENTIAL: Internal Enforcement Protocols — Law Enforcement Access Only</span>
      </div>
    </div>
  );
};

