import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Car, Camera, ShieldAlert, Cpu, Video, Hexagon, Zap, ArrowUpRight, Crosshair, Map, CloudRain, Wind, Leaf } from 'lucide-react';

export default function App() {
  const [data, setData] = useState({
    intersections: [],
    violations: [],
    alerts: [],
    historical_density: [],
    system_status: "Syncing Nodes...",
    total_violations: 0,
    environment: {
        weather: "CLEAR",
        co2_emissions_saved_kg: 0,
        avg_speed_kmh: 0,
        total_vehicles_scanned: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard_data');
        if (response.ok) {
          const result = await response.json();
          if (!result.environment) result.environment = { weather: "CLEAR", co2_emissions_saved_kg: 0, avg_speed_kmh: 0, total_vehicles_scanned: 0 };
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching data, using edge simulation fallback:", error);
        setData(prev => {
            const newIntersections = prev.intersections.length ? [...prev.intersections] : [
                {id: "intersection-1", name: "Main Station", density: 45, signal: "green", wait_time: 0, emergency_override: false, vehicle_count: 54, pedestrian_count: 12},
                {id: "intersection-2", name: "5th Avenue", density: 60, signal: "red", wait_time: 15, emergency_override: false, vehicle_count: 72, pedestrian_count: 4},
                {id: "intersection-3", name: "Broadway", density: 30, signal: "green", wait_time: 0, emergency_override: false, vehicle_count: 36, pedestrian_count: 8},
                {id: "intersection-4", name: "Park Row", density: 80, signal: "red", wait_time: 45, emergency_override: true, vehicle_count: 96, pedestrian_count: 2}
            ];
            
            newIntersections.forEach(int => {
                int.density = Math.max(10, Math.min(95, int.density + Math.floor(Math.random() * 15 - 7)));
                int.vehicle_count = Math.floor(int.density * 1.2);
                if (int.signal === 'red') int.wait_time += 2;
                if (int.wait_time > 40) { int.signal = 'green'; int.wait_time = 0; }
                else if (int.signal === 'green' && Math.random() > 0.8) { int.signal = 'red'; int.wait_time = 0; }
            });

            const avgDensity = Math.floor(newIntersections.reduce((a, b) => a + b.density, 0) / 4);
            const now = new Date();
            
            const newHistory = [...(prev.historical_density || [])];
            if (newHistory.length === 0 || now.getSeconds() % 5 === 0) {
                newHistory.push({ time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), density: avgDensity });
                if (newHistory.length > 20) newHistory.shift();
            }

            const newViolations = [...prev.violations];
            if (Math.random() > 0.8) {
                newViolations.unshift({ id: 'V-'+Math.floor(Math.random()*1000), type: "Over-speeding", plate: "XYS-"+Math.floor(Math.random()*9999), time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), confidence: "98.4%", speed: (60+Math.floor(Math.random()*40))+" km/h", vehicle: "Sedan", fine: "$250" });
                if (newViolations.length > 5) newViolations.pop();
            }

            return {
                intersections: newIntersections,
                violations: newViolations,
                alerts: prev.alerts.length ? prev.alerts : [{id: "A-1", severity: "high", message: "Stranded Vehicle in Lane 2", time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), action_taken: "Tow Requested", model_conf: "95.1%"}],
                historical_density: newHistory,
                system_status: "Live (Edge Sandbox)",
                total_violations: prev.total_violations + (newViolations.length > prev.violations.length ? 1 : 0),
                environment: { weather: "CLEAR", co2_emissions_saved_kg: prev.environment.co2_emissions_saved_kg + 2, avg_speed_kmh: 45 - Math.floor(avgDensity/10), total_vehicles_scanned: prev.environment.total_vehicles_scanned + 15 }
            };
        });
      }
    };
    
    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const getAvgDensity = () => {
    if (data.intersections.length === 0) return 0;
    const sum = data.intersections.reduce((acc, int) => acc + int.density, 0);
    return Math.round(sum / data.intersections.length);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-icon">
          <Hexagon size={28} />
        </div>
        <div className="nav-item active"><Activity size={22} /></div>
        <div className="nav-item"><Map size={22} /></div>
        <div className="nav-item"><Video size={22} /></div>
        <div className="nav-item"><ShieldAlert size={22} /></div>
        <div style={{ flex: 1 }}></div>
        <div className="nav-item"><Zap size={22} color="var(--brand-yellow)" /></div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="page-title">
            Ruby <span style={{ color: "var(--brand-cyan)", fontWeight: 300 }}>Traffic AI</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="env-badge">
              <CloudRain size={16} /> WX: {data.environment?.weather}
            </div>
            <div className="live-indicator">
              <div className="live-pulse"></div>
              {data.system_status}
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <div className="dashboard-grid">
          
          {/* Top KPI Cards (Top Row) */}
          <div className="glass-panel col-3">
            <div className="stat-card-inner">
              <div className="stat-content">
                <h3>Total Tracked Volume</h3>
                <div className="stat-value">{(data.environment?.total_vehicles_scanned || 0).toLocaleString()}</div>
                <div className="stat-trend trend-neutral">
                  <Activity size={14} /> Global Avg: {getAvgDensity()}%
                </div>
              </div>
              <div className="stat-icon icon-cyan">
                <Map size={24} />
              </div>
            </div>
          </div>

          <div className="glass-panel col-3">
            <div className="stat-card-inner">
              <div className="stat-content">
                <h3>Avg Flow Speed</h3>
                <div className="stat-value">{data.environment?.avg_speed_kmh} <span style={{fontSize: "1rem"}}>km/h</span></div>
                <div className="stat-trend trend-cyan">
                  <Wind size={14} /> Fluidity Index
                </div>
              </div>
              <div className="stat-icon icon-cyan">
                <Wind size={24} />
              </div>
            </div>
          </div>

          <div className="glass-panel col-3">
            <div className="stat-card-inner">
              <div className="stat-content">
                <h3>Total Violations Logged</h3>
                <div className="stat-value">{data.total_violations}</div>
                <div className="stat-trend trend-down">
                  <ArrowUpRight size={14} /> Processing Active
                </div>
              </div>
              <div className="stat-icon icon-purple">
                <Camera size={24} />
              </div>
            </div>
          </div>

          <div className="glass-panel col-3">
            <div className="stat-card-inner">
              <div className="stat-content">
                <h3>Critical Alerts</h3>
                <div className="stat-value glow-text" style={{ color: data.alerts.length > 0 ? "var(--brand-red)" : "inherit" }}>
                  {data.alerts.length}
                </div>
                <div className="stat-trend trend-down">
                  <ShieldAlert size={14} /> System Anomalies
                </div>
              </div>
              <div className="stat-icon icon-red">
                <ShieldAlert size={24} />
              </div>
            </div>
          </div>

          {/* Main Chart Area (Middle Row Left) */}
          <div className="glass-panel col-8">
            <div className="panel-header">
              <div className="panel-title">
                <Activity size={20} color="var(--brand-cyan)" /> Real-time Congestion Analytics
              </div>
              <div style={{ fontSize: '0.8rem', color: "var(--brand-cyan)", fontWeight: 600, letterSpacing: '1px' }}>
                <span style={{marginRight: '1rem'}}>AI PREDICTION: STABLE</span>
                <span>CO2 SAVED: {data.environment?.co2_emissions_saved_kg} kg</span>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.historical_density} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-cyan)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--brand-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--panel-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: 'var(--brand-cyan)', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="density" stroke="var(--brand-cyan)" fillOpacity={1} fill="url(#colorCy)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Target Recognitions (Middle Row Right) */}
          <div className="glass-panel col-4" style={{ padding: '0.8rem' }}>
            <div className="cctv-container">
              <img src="/cctv.png" className="cctv-feed" alt="Live CCTV Feed" />
              <div className="cctv-overlay"></div>
              <div className="cctv-crosshair"></div>
              <div className="cctv-rec">
                <div className="cctv-rec-dot"></div> AI TRACKING
              </div>
              
              <div className="feed-container" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0.8rem', maxHeight: '180px' }}>
                {data.violations.slice(0, 2).map(violation => (
                  <div className="feed-item anpr" key={violation.id} style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="feed-top">
                      <span className="feed-title">{violation.type} <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>({violation.vehicle})</span></span>
                      <span className="feed-time">{violation.time}</span>
                    </div>
                    <div className="badge-row">
                      <span className="cyber-badge badge-plate">{violation.plate}</span>
                      <span className="cyber-badge badge-conf">{violation.confidence}</span>
                      <span className="cyber-badge" style={{background: 'rgba(255, 42, 85, 0.2)', color: 'var(--brand-red)', border: '1px solid var(--brand-red)'}}>{violation.fine}</span>
                      <span className="cyber-badge" style={{background: 'rgba(0, 255, 136, 0.1)', color: 'var(--brand-green)'}}>{violation.speed}</span>
                    </div>
                  </div>
                ))}
                {data.violations.length === 0 && <div className="feed-desc" style={{textAlign: "center", color: "var(--brand-cyan)", marginTop: "2rem"}}>Scanning perimeter...</div>}
              </div>
            </div>
          </div>

          {/* Active Nodes Topology (Bottom Row Left) */}
          <div className="glass-panel col-8">
            <div className="panel-header">
              <div className="panel-title">
                <Cpu size={20} color="var(--brand-green)" /> Node Topology Control (Emergency EVP)
              </div>
            </div>
            <div>
              {data.intersections.map(int => (
                <div className={`intersection-item ${int.emergency_override ? 'override' : ''}`} key={int.id}>
                  <div>
                    <div className="int-name">
                      {int.name} 
                      {int.emergency_override && <span className="evp-badge">EVP ACTIVE</span>}
                    </div>
                    <div className="int-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '0.6rem'}}>
                      <span>Density: <span className="int-metric-val">{int.density}%</span></span>
                      <span>Wait: <span className="int-metric-val">{int.wait_time}s</span></span>
                      <span>Vehicles: <span className="int-metric-val">{int.vehicle_count}</span></span>
                      <span>Peds: <span className="int-metric-val">{int.pedestrian_count}</span></span>
                    </div>
                  </div>
                  <div className="traffic-signal">
                    <div className={`signal-light red ${int.signal === 'red' ? 'active' : ''}`}></div>
                    <div className={`signal-light yellow ${int.signal === 'yellow' ? 'active' : ''}`}></div>
                    <div className={`signal-light green ${int.signal === 'green' ? 'active' : ''}`}></div>
                  </div>
                </div>
              ))}
              {data.intersections.length === 0 && <div className="feed-desc" style={{textAlign: "center"}}>Awaiting edge connections...</div>}
            </div>
          </div>

          {/* System Alerts (Bottom Row Right) */}
          <div className="glass-panel col-4">
            <div className="panel-header">
              <div className="panel-title">
                <ShieldAlert size={20} color="var(--brand-red)" /> Anomaly Incident Log
              </div>
            </div>
            <div className="feed-container">
              {data.alerts.map(alert => (
                <div className={`feed-item ${alert.severity === 'critical' ? 'alert-critic' : 'alert-warn'}`} key={alert.id}>
                  <div className="feed-top">
                    <span className="feed-title" style={{color: alert.severity === 'critical' ? 'var(--brand-red)' : 'var(--brand-yellow)'}}>
                      {alert.severity.toUpperCase()} ALERT <span style={{color: 'var(--text-muted)'}}>({alert.model_conf})</span>
                    </span>
                    <span className="feed-time">{alert.time}</span>
                  </div>
                  <div className="feed-desc" style={{color: '#fff', fontWeight: 500, marginBottom: '4px'}}>{alert.message}</div>
                  <div className="badge-row">
                     <span className="cyber-badge" style={{background: 'var(--bg-core)', color: 'var(--brand-cyan)', border: '1px solid var(--border-cyan)'}}>
                       ACT: {alert.action_taken}
                     </span>
                  </div>
                </div>
              ))}
              {data.alerts.length === 0 && <div className="feed-desc" style={{textAlign: "center", marginTop: "2rem"}}>System Nominal</div>}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
