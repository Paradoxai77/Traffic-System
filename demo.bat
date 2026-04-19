@echo off
echo Starting Nexus Traffic AI Hackathon Demo...

echo [1/3] Starting Backend Server...
start "Backend" cmd /k "cd backend && python app.py"

ping 127.0.0.1 -n 3 > nul

echo [2/3] Starting Edge AI Simulation...
start "Edge Sim" cmd /k "cd edge && python sim.py"

echo [3/3] Starting Vite Frontend Dashboard...
start "Frontend" cmd /k "npm run dev"

echo All services started! Check the Vite output for the localhost port.
pause
