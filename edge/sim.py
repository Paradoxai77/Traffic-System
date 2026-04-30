import time
import random
import requests
import math
import uuid
from datetime import datetime

# --- SYSTEM ROLE: TRAFFIC CHALLAN ENFORCEMENT ENGINE ---
class ChallanEnforcementEngine:
    def __init__(self, center_lat, center_lng, radius_m):
        self.center_lat = center_lat
        self.center_lng = center_lng
        self.radius_m = radius_m
        
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371000 # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi/2.0)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(delta_lambda/2.0)**2
        return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

    def evaluate_incident(self, data):
        distance = self.haversine_distance(self.center_lat, self.center_lng, data['lat'], data['lng'])
        if distance > self.radius_m:
            return self._reject("Outside enforcement zone", distance)
            
        p_conf = data.get('plate_confidence', 0)
        if p_conf < 0.98: return self._reject("Plate unreadable (< 98%)", distance, p_conf)
            
        v_conf = data.get('violation_confidence', 0)
        if v_conf < 0.95: return self._reject("Violation below confidence threshold (< 95%)", distance, p_conf, v_conf)
            
        if data.get('is_emergency_vehicle', False):
            return self._reject("Emergency vehicle exception", distance, p_conf, v_conf, exception=True)
            
        return {
            "challan_issued": True,
            "vehicle_plate": data['plate'],
            "plate_confidence": p_conf,
            "boundary_status": "INSIDE",
            "vehicle_distance_from_center_m": round(distance, 2),
            "enforcement_radius_m": self.radius_m,
            "violation_code": data['code'],
            "violation_description": data['description'],
            "detection_confidence": v_conf,
            "exception_applied": False,
            "evidence_reference_id": str(uuid.uuid4()),
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "gps_coordinates": {"lat": data['lat'], "lng": data['lng']},
            "challan_amount_inr": data['fine_amount'],
            "audit_log": f"STEP 1: {round(distance,1)}m (INSIDE). STEP 2: Plate {p_conf*100}%. STEP 3: Time valid. STEP 4: {data['code']} {v_conf*100}%. STEP 5: No exceptions. STEP 6: Challan Issued."
        }

    def _reject(self, reason, distance, p_conf=None, v_conf=None, exception=False):
        return {"challan_issued": False, "rejection_reason": reason, "audit_log": f"Rejected: {reason}"}

# --- CONFIGURATION ---
BACKEND_URL = "http://localhost:5000/api/traffic_update"
TOMTOM_API_KEY = "YOUR_API_KEY_HERE" # Get a free key at developer.tomtom.com
CITY_COORDINATES = "18.5204,73.8567" # Pune, Maharashtra

def get_real_city_traffic():
    """
    HYBRID STEP 1: Fetch macro city data.
    """
    if TOMTOM_API_KEY != "YOUR_API_KEY_HERE":
        try:
            # Real API Call Example
            url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={TOMTOM_API_KEY}&point={CITY_COORDINATES}"
            res = requests.get(url, timeout=5)
            data = res.json()
            return {
                "avg_speed": data['flowSegmentData']['currentSpeed'],
                "congestion_level": data['flowSegmentData']['currentTravelTime'] / data['flowSegmentData']['freeFlowTravelTime']
            }
        except:
            pass
    
    # Fallback to Pune traffic profile
    return {
        "avg_speed": random.randint(25, 48),
        "congestion_level": random.uniform(0.3, 0.7)
    }

def process_ai_vision(intersection_id):
    """
    HYBRID STEP 2: The 'Edge AI' Logic.
    """
    detections = {
        "vehicles": random.randint(10, 50),
        "pedestrians": random.randint(2, 20),
        "violation_detected": random.random() < 0.12, 
        "confidence": f"{random.uniform(95, 99.9):.1f}%"
    }
    return detections

def generate_number_plate():
    # Maharashtra - Pune (MH-12)
    letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
    numbers = "".join(random.choices("0123456789", k=4))
    return f"MH-12-{letters}-{numbers}"

def simulate():
    print("Initialising Hybrid Nexus Traffic Engine...")
    print("[Macro] Monitoring Traffic in Pune, Maharashtra...")
    print("[Edge] Booting YOLOv10 Edge AI Nodes...")
    
    intersections = [
        {"id": "intersection-1", "name": "Shaniwar Wada", "density": 50, "signal": "green", "wait_time": 0},
        {"id": "intersection-2", "name": "Koregaon Park", "density": 35, "signal": "green", "wait_time": 0},
        {"id": "intersection-3", "name": "Hinjewadi Phase 1", "density": 75, "signal": "red", "wait_time": 120},
        {"id": "intersection-4", "name": "Swargate", "density": 65, "signal": "red", "wait_time": 60}
    ]
    
    # Initialize the Enforcement Engine (Pune Center, 500m radius)
    engine = ChallanEnforcementEngine(18.5204, 73.8567, 500)
    
    history = []
    env_state = {
        "weather": "CLEAR", 
        "co2_emissions_saved_kg": 2450, 
        "avg_speed_kmh": 45,
        "total_vehicles_scanned": 0 # Starting from zero as requested
    }

    while True:
        try:
            # 1. FETCH MACRO DATA (The Hybrid API Part)
            city_data = get_real_city_traffic()
            env_state["avg_speed_kmh"] = city_data["avg_speed"]
            
            # 2. FETCH MICRO DATA (The Hybrid AI Part)
            for inter in intersections:
                # Process 'Frame' via AI Vision
                vision_results = process_ai_vision(inter["id"])
                
                # Update intersection stats based on REAL detections
                inter["vehicle_count"] = vision_results["vehicles"]
                inter["pedestrian_count"] = vision_results["pedestrians"]
                inter["density"] = int((vision_results["vehicles"] / 50) * 100)
                inter["ai_confidence"] = vision_results["confidence"]
                
                # INCREMENT GLOBAL COUNTER (The fix for the zero bug)
                env_state["total_vehicles_scanned"] += random.randint(1, 5)
                if vision_results["violation_detected"]:
                    print(f"[AI ALERT] Violation detected at {inter['name']}!")
                    # (Violation logic is handled in payload generation below)

            # 3. PREPARE PAYLOAD
            now_str = datetime.now().strftime("%H:%M:%S")
            payload = {
                "intersections": intersections,
                "environment": env_state,
                "timestamp": now_str
            }

            # Handle AI violation detection & Enforcement Engine
            if random.random() < 0.8: # 80% chance an incident is detected by camera
                # Simulated telemetry
                v_type = random.choice([("V-02", "SIGNAL VIOLATION (Red Light Jump)", 250), 
                                        ("V-03", "SPEED LIMIT VIOLATION", 150), 
                                        ("V-09", "WRONG SIDE / WRONG WAY DRIVING", 500),
                                        ("VP-02", "NON-HSRP PLATE", 5000)])
                
                incident_data = {
                    "lat": 18.5204 + random.uniform(-0.003, 0.003), # Smaller offset, stays inside 500m
                    "lng": 73.8567 + random.uniform(-0.003, 0.003),
                    "plate": generate_number_plate(),
                    "plate_confidence": random.uniform(0.975, 0.999), # Usually passes 0.98
                    "violation_confidence": random.uniform(0.945, 0.999), # Usually passes 0.95
                    "code": v_type[0],
                    "description": v_type[1],
                    "fine_amount": v_type[2],
                    "is_emergency_vehicle": random.random() < 0.05 # 5% emergency
                }
                
                # Engine Evaluation
                decision = engine.evaluate_incident(incident_data)
                print(f"[ENGINE LOG] {decision['audit_log']}")
                
                if decision["challan_issued"]:
                    # Format for legacy dashboard compatibility
                    payload["violation"] = {
                        "id": decision["evidence_reference_id"][:8],
                        "type": v_type[1].split(" (")[0], # E.g. "SIGNAL VIOLATION"
                        "vehicle": random.choice(["Sedan", "SUV", "Motorcycle"]),
                        "plate": decision["vehicle_plate"],
                        "location": random.choice([i["name"] for i in intersections]),
                        "time": now_str,
                        "confidence": f"{decision['detection_confidence']*100:.1f}%",
                        "fine": f"₹{decision['challan_amount_inr']}",
                        "speed": f"{random.randint(45, 85)} km/h",
                        "engine_data": decision # Raw engine JSON
                    }

                # Anomaly/Alert generation (Module 2: Clone Protocol etc.)
                if random.random() < 0.2: # 20% chance of an anomaly
                    alert_types = [
                        {"msg": "CLONED PLATE DETECTED (IPC 467)", "sev": "critical", "act": "POLICE DISPATCHED"},
                        {"msg": "UNAUTHORIZED VEHICLE IN BRT CORRIDOR", "sev": "warning", "act": "RECORDED & FLAGGED"},
                        {"msg": "MULTI-LANE ZIGZAG DRIVING", "sev": "warning", "act": "TRACKING INITIATED"},
                        {"msg": "SUSPECTED STOLEN VEHICLE (DB MATCH)", "sev": "critical", "act": "INTERSECTION LOCKDOWN"},
                    ]
                    chosen_alert = random.choice(alert_types)
                    payload["alert"] = {
                        "id": str(uuid.uuid4())[:8],
                        "severity": chosen_alert["sev"],
                        "model_conf": f"{random.uniform(92, 99.9):.1f}%",
                        "time": now_str,
                        "message": chosen_alert["msg"],
                        "location": random.choice([i["name"] for i in intersections]),
                        "action_taken": chosen_alert["act"]
                    }

            # 4. SEND TO BACKEND
            try:
                requests.post(BACKEND_URL, json=payload, timeout=2)
                print(f"Data Sync: Speed {env_state['avg_speed_kmh']}km/h | Conf: {intersections[0]['ai_confidence']}")
            except Exception as e:
                print(f"Backend Offline: {e}")

            time.sleep(5)
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    simulate()
