<div align="center">

<img src="./assets/banner_3d.png" alt="Ruby Traffic AI 3D Banner" width="100%" />
<br/>

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=40&duration=3000&pause=1000&color=00FFEA&center=true&vCenter=true&width=800&lines=RUBY+TRAFFIC+AI;Smart+City+Command+Center;Edge+AI+%7C+Real-Time+Analytics" alt="Ruby Traffic AI" />

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-00FFEA?style=for-the-badge&logoColor=black)](https://Paradoxai77.github.io/Traffic-System/)
[![GitHub Stars](https://img.shields.io/github/stars/Paradoxai77/Traffic-System?style=for-the-badge&color=FFD700&logo=github)](https://github.com/Paradoxai77/Traffic-System/stargazers)
[![Built With React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Powered By Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Python Backend](https://img.shields.io/badge/Python_Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://flask.palletsprojects.com)
[![License MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

<br/>

> **⚡ An intelligent, cyberpunk-themed smart city traffic management platform powered by Edge AI — delivering real-time congestion analytics, automated ANPR violation detection, emergency vehicle preemption (EVP), and environmental CO₂ monitoring from a single command-and-control dashboard.**

<br/>

---

</div>

## 📸 Dashboard Preview

<div align="center">

| Real-time Analytics | Node Topology | ANPR Detection |
|---|---|---|
| 🟢 Live congestion area charts | 🔵 Emergency EVP override | 🔴 Plate recognition + fine |
| AI-predicted traffic stability | Multi-node signal control | 98.4% confidence scoring |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 Edge AI Intelligence
- Real-time **vehicle density prediction**
- AI-powered **anomaly & incident detection**
- ML confidence scoring per event
- Automated **emergency escalation**

### 📷 ANPR Surveillance
- Automatic **Number Plate Recognition**
- Over-speeding detection with speed readings
- Per-vehicle fine generation
- Live CCTV feed with AI tracking overlay

</td>
<td width="50%">

### 🚨 Emergency Vehicle Preemption (EVP)
- Instant **signal override** for emergency vehicles
- Cross-intersection topology control
- Real-time pedestrian + vehicle occupancy count
- Wait-time optimization per node

### 🌿 Environmental Monitoring
- Live **CO₂ emissions saved** tracker
- Average traffic flow speed (km/h)
- Weather condition integration
- Total vehicles scanned counter

</td>
</tr>
</table>


---

## 🏛️ Jurisdiction & Enforcement Protocols

Ruby Traffic AI is specifically calibrated for the **Pune, Maharashtra (MH-12)** jurisdiction, integrating strict legal and geographic frameworks directly into its decision engine.

### 📍 Pune Smart City Deployment
- **Geofencing:** Active enforcement within a 500-meter radius of the Pune Command Center (Lat: `18.5204`, Lng: `73.8567`).
- **Nodes Monitored:** Shaniwar Wada, Koregaon Park, Hinjewadi Phase 1, Swargate.
- **Traffic Modeling:** Adapts to Pune's unique density patterns and peak-hour vehicle flow.

### 📜 System Enforcement Modules
The platform operates on a rigid 3-module framework designed for Zero-Tolerance accuracy:

*   **Module 1: Boundary & Core Challan Engine:** Validates Haversine distance, timestamp integrity, and AI confidence thresholds (>98% plate, >95% violation) before generating a valid challan.
*   **Module 2: Plate Identification & HSRP:** Scans for 10-digit HSRP laser barcodes. Automatically flags non-compliant plates (VP-02) and cloned plates (IPC 467/471) for human verification.
*   **Module 3: Maharashtra Operations:** Enforces localized rules such as out-of-state immunity for certain HSRP checks and elevated baseline fines (₹10,000) for repeat offenders within 30 days.

> **Note:** The platform includes an interactive **Evidence Capture** module for Non-HSRP plates, allowing officers to verify AI-highlighted missing barcodes before issuing final challans.

---

## 🏗️ Architecture

<div align="center">
  <img src="./assets/architecture_3d.png" alt="3D Isometric Architecture Diagram" width="800" />
</div>

<br/>

<details>
<summary><b>🔍 View Technical Architecture Details</b></summary>
<br/>

The system is built on a distributed **Edge-to-Cloud architecture**:
- **Frontend (Command Center):** React 19 + Vite 8 dashboard providing real-time data visualization via Recharts.
- **Backend (API Gateway):** Python Flask REST API securely handling data bridging and historical logging.
- **Edge Sandbox:** Self-contained edge simulation generating probabilistic traffic density, ANPR events, and emergency alerts.

</details>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | `≥ 18.x` |
| Python | `≥ 3.10` |
| npm | `≥ 9.x` |

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/Paradoxai77/Traffic-System.git
cd Traffic-System

# Install frontend dependencies
npm install
```

### 2️⃣ Start the Backend

```bash
cd backend
pip install flask flask-cors
python app.py
```

### 3️⃣ Start the Pune Edge AI Simulation

```bash
cd edge
pip install requests
python sim.py
```

> 💡 The Edge AI node simulates **real-time Pune traffic** — generating ANPR events, HSRP violations, and anomaly alerts every 5 seconds. If no backend is running, the dashboard automatically falls back to a built-in sandbox.

### 4️⃣ Launch the Dashboard

```bash
npm run dev
```

Open your browser at **`http://localhost:5173`** 🎉

---

## 📦 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | UI framework & bundler |
| **Charts** | Recharts | Real-time area charts |
| **Icons** | Lucide React | Cyberpunk icon set |
| **Styling** | Vanilla CSS + Glassmorphism | Dark mode & animations |
| **Backend** | Python Flask | REST API data server |
| **Deployment** | GitHub Pages + GH Actions | CI/CD pipeline |

</div>

---

## 🧩 Project Structure

```
Traffic-System/
├── 📁 src/
│   ├── App.jsx          # Main dashboard + RulesView component
│   ├── App.css          # Cyberpunk component styles
│   ├── index.css        # Global CSS design system
│   └── main.jsx         # React entry point
├── 📁 backend/
│   └── app.py           # Flask REST API — stores violations, alerts & telemetry
├── 📁 edge/
│   └── sim.py           # Pune Edge AI node — Challan Engine + ANPR simulation
├── 📁 public/
│   ├── cctv.png         # CCTV feed asset
│   ├── hsrp_plate.png   # Compliant HSRP plate sample
│   └── non_hsrp_plate.png # Non-HSRP evidence capture asset
├── 📁 .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions CI/CD
├── index.html           # HTML entry point
├── vite.config.js       # Vite config (base: /Traffic-System/)
└── package.json         # Project manifest
```

---

## 🌐 Deployment

The project is automatically deployed to **GitHub Pages** via GitHub Actions on every push to `main`.

```yaml
# Triggered on push to main
name: Deploy Ruby Traffic AI
on:
  push:
    branches: [main]
```

**Live URL:** [`https://Paradoxai77.github.io/Traffic-System/`](https://Paradoxai77.github.io/Traffic-System/)

---

## 📊 Dashboard Panels

| Panel | Description |
|---|---|
| **KPI Cards** | Total vehicles scanned, avg flow speed, active violations, critical alerts |
| **Congestion Analytics** | Real-time area chart with rolling history, CO₂ savings & Pune weather state |
| **Live CCTV AI Feed** | Simulated camera overlay with ANPR bounding boxes, confidence % and violation badges |
| **Node Topology** | Shaniwar Wada, Koregaon Park, Hinjewadi Ph.1, Swargate — live density, wait times, signal state |
| **ANPR Violation Log** | Timestamped challans with plate, vehicle type, fine amount, and evidence capture for Non-HSRP |
| **Anomaly Incident Log** | AI-flagged threats (cloned plates, BRT intrusions, stolen vehicles) with confidence scores and action taken |
| **System Enforcement Rules** | Full interactive reference for Module 1, 2 & Maharashtra Jurisdiction protocols |

---

## 🤖 Edge AI Simulation — Pune (`edge/sim.py`)

The `sim.py` module is a standalone **Challan Enforcement Engine** that continuously simulates real Pune traffic conditions:

- 📍 **4 Pune Smart Nodes** — Shaniwar Wada, Koregaon Park, Hinjewadi Phase 1, Swargate
- 🔁 **5-second telemetry cycle** — density, speed, and AI confidence updated per tick
- ⚖️ **Haversine geofencing** — incidents outside the 500m Pune Command Center radius are auto-rejected
- 🎯 **Strict confidence thresholds** — plate confidence >98%, violation confidence >95% required for challan issuance
- 🚗 **4 Violation Types** — Signal Jump (V-02), Speeding (V-03), Wrong Way (V-09), Non-HSRP (VP-02)
- 🚨 **Anomaly Engine** — 20% chance per cycle of flagging cloned plates (IPC 467), BRT intrusions, or stolen vehicle DB matches
- 🚑 **Emergency Vehicle Exception** — 5% of incidents auto-exempt as EVP, no challan issued
- 🌿 **CO₂ & environmental state** synced to backend on every tick

---

## 🛠️ Scripts

```bash
npm run dev        # Start local development server
npm run build      # Build for production (outputs to /dist)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint on all source files
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Smart City Innovation**

[![GitHub](https://img.shields.io/badge/GitHub-Paradoxai77-181717?style=for-the-badge&logo=github)](https://github.com/Paradoxai77)

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=14&duration=4000&pause=1000&color=00FFEA&center=true&vCenter=true&width=400&lines=Edge+AI+%7C+Real-Time+%7C+Smart+City;Always+watching.+Always+optimizing." alt="Footer" />

</div>
