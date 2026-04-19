from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import random

app = Flask(__name__)
CORS(app)

# Global state to store the latest simulation data
traffic_state = {
    "intersections": [
        {"id": "intersection-1", "name": "Main Station", "density": 0, "signal": "green", "wait_time": 0, "emergency_override": False},
        {"id": "intersection-2", "name": "5th Avenue", "density": 0, "signal": "red", "wait_time": 0, "emergency_override": False},
        {"id": "intersection-3", "name": "Broadway", "density": 0, "signal": "green", "wait_time": 0, "emergency_override": False},
        {"id": "intersection-4", "name": "Park Row", "density": 0, "signal": "red", "wait_time": 0, "emergency_override": False}
    ],
    "violations": [],
    "alerts": [],
    "historical_density": [
        {"time": "10:00", "density": 45},
        {"time": "10:05", "density": 50},
        {"time": "10:10", "density": 48},
        {"time": "10:15", "density": 60},
        {"time": "10:20", "density": 65},
        {"time": "10:25", "density": 55},
        {"time": "10:30", "density": 70},
    ],
    "system_status": "Operational",
    "total_violations": 0,
    "environment": {
        "weather": "CLEAR",
        "co2_emissions_saved_kg": 0,
        "avg_speed_kmh": 45
    }
}

@app.route('/api/dashboard_data', methods=['GET'])
def get_dashboard_data():
    return jsonify(traffic_state)

@app.route('/api/traffic_update', methods=['POST'])
def update_traffic():
    global traffic_state
    data = request.json
    
    if "intersections" in data:
        traffic_state["intersections"] = data["intersections"]
    if "violation" in data:
        traffic_state["violations"].insert(0, data["violation"])
        traffic_state["total_violations"] += 1
        # Keep only latest 10 violations
        traffic_state["violations"] = traffic_state["violations"][:10]
    if "alert" in data:
        traffic_state["alerts"].insert(0, data["alert"])
        traffic_state["alerts"] = traffic_state["alerts"][:5]
    if "historical_density" in data:
        traffic_state["historical_density"] = data["historical_density"]
    if "environment" in data:
        traffic_state["environment"] = data["environment"]
        
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
