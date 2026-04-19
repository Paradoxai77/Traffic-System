import time
import random
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:5000/api/traffic_update"

def generate_number_plate():
    letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
    numbers = "".join(random.choices("0123456789", k=4))
    return f"{letters}-{numbers}"

def simulate():
    print("Starting Deep Analytics Edge AI Traffic Simulation...")
    
    intersections = [
        {"id": "intersection-1", "name": "Main Station", "density": random.randint(10, 80), "signal": "green", "wait_time": 0, "emergency_override": False, "vehicle_count": 0, "pedestrian_count": 0},
        {"id": "intersection-2", "name": "5th Avenue", "density": random.randint(10, 80), "signal": "red", "wait_time": 45, "emergency_override": False, "vehicle_count": 0, "pedestrian_count": 0},
        {"id": "intersection-3", "name": "Broadway", "density": random.randint(10, 80), "signal": "green", "wait_time": 0, "emergency_override": False, "vehicle_count": 0, "pedestrian_count": 0},
        {"id": "intersection-4", "name": "Park Row", "density": random.randint(10, 80), "signal": "red", "wait_time": 30, "emergency_override": False, "vehicle_count": 0, "pedestrian_count": 0}
    ]
    
    history = [
        {"time": "10:00", "density": 45}, {"time": "10:05", "density": 50},
        {"time": "10:10", "density": 48}, {"time": "10:15", "density": 60},
        {"time": "10:20", "density": 65}, {"time": "10:25", "density": 55},
        {"time": "10:30", "density": 70},
    ]

    env_state = {
        "weather": "CLEAR",
        "co2_emissions_saved_kg": 1500,
        "avg_speed_kmh": 45,
        "active_drones": 2,
        "total_vehicles_scanned": 12540
    }

    while True:
        try:
            # Weather changing logic
            if random.random() < 0.05:
                env_state["weather"] = random.choice(["CLEAR", "RAIN", "FOG", "CLEAR"])

            # Adjust speeds based on weather
            base_speed = 45 if env_state["weather"] == "CLEAR" else 25
            
            avg_density = 0
            # 1. Update Intersection Densities & smart signal control
            for inter in intersections:
                # Random walk density
                change = random.randint(-8, 8)
                if env_state["weather"] in ["RAIN", "FOG"]:
                    change += random.randint(2, 5) # Weather increases density/slows down
                
                inter["density"] = max(0, min(100, inter["density"] + change))
                inter["vehicle_count"] = int(inter["density"] * random.uniform(1.2, 2.5))
                inter["pedestrian_count"] = random.randint(0, 15) if inter["density"] > 20 else random.randint(0, 5)

                avg_density += inter["density"]
                env_state["total_vehicles_scanned"] += random.randint(2, 10)
                
                # Check for Emergency Vehicle (Ambulance/Fire) Override
                if inter["emergency_override"]:
                    if random.random() < 0.3:
                        inter["emergency_override"] = False
                else:
                    if random.random() < 0.03: # 3% chance of ambulance
                        inter["emergency_override"] = True
                        inter["signal"] = "green"
                        inter["wait_time"] = 0

                # Smart signal logic if NOT in emergency override
                if not inter["emergency_override"]:
                    if inter["signal"] == "red":
                        inter["wait_time"] += 5
                        if inter["wait_time"] > 60 or inter["density"] > 80:
                            inter["signal"] = "green"
                            inter["wait_time"] = 0
                            env_state["co2_emissions_saved_kg"] += random.randint(1, 4) 
                    else: # green light implies wait time is 0 for the stopped side, but we focus on flowing
                        inter["wait_time"] = 0
                        if inter["density"] < 25 or random.random() < 0.1:
                            inter["signal"] = "red"

            avg_density = int(avg_density / len(intersections))
            env_state["avg_speed_kmh"] = max(5, base_speed - int(avg_density / 5))

            now_str = datetime.now().strftime("%H:%M:%S")
            history.append({"time": now_str, "density": avg_density})
            if len(history) > 10:
                history.pop(0)

            payload = {
                "intersections": intersections,
                "historical_density": history,
                "environment": env_state
            }

            # 2. Violations with deep info
            if random.random() < 0.3:
                violation_types = ["Red Light Jump", "Over-speeding", "Wrong Way", "Jaywalking Pedestrian"]
                v_type = random.choice(violation_types)
                speed = random.randint(40, 130) if "Pedestrian" not in v_type else random.randint(3, 10)
                vehicle_cls = random.choice(["Sedan", "SUV", "Motorcycle", "Truck"]) if "Pedestrian" not in v_type else "Human"
                
                fine = 0
                if v_type == "Red Light Jump": fine = 250
                elif v_type == "Over-speeding": fine = 150 + (speed - 60)*2
                elif v_type == "Wrong Way": fine = 500
                elif v_type == "Jaywalking Pedestrian": fine = 50

                violation = {
                    "id": f"V-{random.randint(1000, 9999)}",
                    "type": v_type,
                    "plate": generate_number_plate() if "Pedestrian" not in v_type else "PED-LINK",
                    "location": random.choice([i["name"] for i in intersections]),
                    "time": now_str,
                    "confidence": f"{random.uniform(88.0, 99.9):.1f}%",
                    "speed": f"{speed} km/h",
                    "vehicle": vehicle_cls,
                    "fine": f"${fine}"
                }
                payload["violation"] = violation

            # 3. AI Alerts with deeply tracked info
            if random.random() < 0.15:
                hazards = [
                    ("critical", "Heavy Collision Detected", "EMS Dispatched"),
                    ("high", "Stranded Vehicle in Lane 2", "Tow Requested"),
                    ("medium", "Debris on Roadway", "Maintenance Notified"),
                    ("critical", "Wrong Way Driver Detected!", "Police Intercept Auto-Ping")
                ]
                severity, msg, action = random.choice(hazards)
                alert = {
                    "id": f"A-{random.randint(100, 999)}",
                    "severity": severity,
                    "message": msg,
                    "location": random.choice([i["name"] for i in intersections]),
                    "time": now_str,
                    "action_taken": action,
                    "model_conf": f"{random.uniform(92.0, 99.5):.1f}%"
                }
                payload["alert"] = alert

            # Send to backend
            try:
                requests.post(BACKEND_URL, json=payload, timeout=2)
            except Exception as e:
                print(f"Error sending payload: {e}")

            time.sleep(5)
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    simulate()
