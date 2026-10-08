"""
SmartDog Backend - Full CRUD API Test Suite
Tests ALL endpoints: Health, Auth, Public QR, Dogs CRUD,
Map, Dashboard, Alerts, Incidents, Telemetry, Admin Users
"""
import sys
import json
import time
import uuid
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
PASS_COUNT = 0
FAIL_COUNT = 0
TOKEN = None
RESULTS = []

def req(method, path, data=None, token=None):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=10)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}
    except Exception as ex:
        return 0, {"error": str(ex)}

def check(label, status, data, expect_status=None, expect_key=None, expect_value=None):
    global PASS_COUNT, FAIL_COUNT
    ok = True
    reasons = []
    if expect_status and status != expect_status:
        ok = False
        reasons.append(f"HTTP {status} != expected {expect_status}")
    if expect_key and isinstance(data, dict) and expect_key not in data:
        ok = False
        reasons.append(f"missing key '{expect_key}'")
    if expect_value is not None and expect_key:
        actual = data.get(expect_key) if isinstance(data, dict) else None
        if actual != expect_value:
            ok = False
            reasons.append(f"'{expect_key}'={repr(actual)} != expected {repr(expect_value)}")
    symbol = "PASS" if ok else "FAIL"
    msg = f"  [{symbol}] {label}"
    if reasons:
        msg += f"\n         => {'; '.join(reasons)}"
        snippet = json.dumps(data)[:200] if isinstance(data, dict) else str(data)[:200]
        msg += f"\n         Response: {snippet}"
    print(msg)
    RESULTS.append({"label": label, "pass": ok, "status": status})
    if ok:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1
    return ok, data

def section(title):
    print(f"\n{'='*64}")
    print(f"  {title}")
    print(f"{'='*64}")

time.sleep(1)

# ==============================================================
# 1. HEALTH CHECK
# ==============================================================
section("1. HEALTH CHECK  GET /")
s, d = req("GET", "/")
check("GET /  status=running", s, d, 200, "status", "running")
check("GET /  has docs field", s, d, 200, "docs")
check("GET /  has version field", s, d, 200, "version")

# ==============================================================
# 2. AUTH - LOGIN & ME
# ==============================================================
section("2a. AUTH  POST /auth/admin/login")
s, d = req("POST", "/auth/admin/login", {"email": "admin@amc.gov.in", "password": "admin123"})
ok, d = check("POST /auth/admin/login  correct creds -> 200 + token", s, d, 200, "access_token")
if ok:
    TOKEN = d["access_token"]
    print(f"         Token: {TOKEN[:50]}...")
    check("  login response has user.email", s, d, 200, "user")

s, d = req("POST", "/auth/admin/login", {"email": "admin@amc.gov.in", "password": "WRONG"})
check("POST /auth/admin/login  wrong password -> 401", s, d, 401)

s, d = req("POST", "/auth/admin/login", {"email": "nobody@fake.com", "password": "x"})
check("POST /auth/admin/login  unknown email -> 401", s, d, 401)

section("2b. AUTH  GET /auth/me")
s, d = req("GET", "/auth/me", token=TOKEN)
check("GET /auth/me  with valid token -> 200", s, d, 200, "email", "admin@amc.gov.in")
check("GET /auth/me  has role field", s, d, 200, "role")

s, d = req("GET", "/auth/me")
check("GET /auth/me  no token -> 401", s, d, 401)

s, d = req("GET", "/auth/me", token="bad.token.here")
check("GET /auth/me  invalid token -> 401", s, d, 401)

# ==============================================================
# 3. PUBLIC QR PORTAL
# ==============================================================
section("3. PUBLIC QR PORTAL  GET /public/dog/{code_or_hash}")
s, d = req("GET", "/public/dog/QR042MOTI")
check("GET /public/dog/QR042MOTI  by qr_hash -> Moti", s, d, 200, "name", "Moti")
check("  response has vetRecord", s, d, 200, "vetRecord")
check("  response has trailPoints list", s, d, 200, "trailPoints")
check("  response has coordinates obj", s, d, 200, "coordinates")
check("  response has healthStatus", s, d, 200, "healthStatus")
print(f"         Dog: {d.get('name')}, Health: {d.get('healthStatus')}, Temp: {d.get('temperatureC')}C")

s, d = req("GET", "/public/dog/DOG042")
check("GET /public/dog/DOG042  by code -> Moti", s, d, 200, "code", "DOG042")

s, d = req("GET", "/public/dog/DOG251?lang=mr")
check("GET /public/dog/DOG251?lang=mr  Marathi param", s, d, 200, "name", "Tommy")

s, d = req("GET", "/public/dog/QR117SHER?lang=hi")
check("GET /public/dog/QR117SHER?lang=hi  Hindi param", s, d, 200, "name", "Sheru")

s, d = req("GET", "/public/dog/DOG042?lang=en")
check("GET /public/dog/DOG042?lang=en  English default", s, d, 200, "name", "Moti")

s, d = req("GET", "/public/dog/INVALID_CODE_XYZ")
check("GET /public/dog/INVALID_CODE_XYZ  unknown -> 404", s, d, 404)

# ==============================================================
# 4. DOGS CRUD
# ==============================================================
section("4a. DOGS  GET /api/v1/dogs")
s, d = req("GET", "/api/v1/dogs")
check("GET /api/v1/dogs  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} dogs returned")
    if len(d) >= 7:
        PASS_COUNT += 1
        print("  [PASS] GET /api/v1/dogs  >= 7 seeded dogs present")
    else:
        FAIL_COUNT += 1
        print(f"  [FAIL] GET /api/v1/dogs  expected >=7 dogs, got {len(d)}")
    RESULTS.append({"label": "dogs list count check", "pass": len(d) >= 7, "status": s})

section("4b. DOGS  POST /api/v1/dogs  (registration wizard)")
dog_payload = {
    "name": "Bruno",
    "collar_hardware_id": "ESP32-COLLAR-TEST99",
    "lat": 19.8900, "lng": 75.3600,
    "breed": "Indian Pariah",
    "breed_confidence": 94.5,
    "gender": "Male",
    "approx_age": "1-2 years",
    "nature": "Playful",
    "area": "JNEC Campus",
    "vaccination_status": "Vaccinated",
    "special_notes": "Test dog - API registration",
    "vaccine_batch": "RBV-2026-TEST",
    "vaccine_date": "2026-09-01",
    "vaccine_expiry": "2027-09-01",
    "sterilisation_clinic": "AMC City Clinic",
    "sterilisation_date": "2026-09-02",
    "vet_doctor": "Dr. Test Vet",
    "deworming_date": "2026-09-10",
    "weight_kg": 14.5,
    "microchip_id": "982009102499999",
    "clinical_notes": "API test insertion"
}
s, d = req("POST", "/api/v1/dogs", dog_payload)
ok, created = check("POST /api/v1/dogs  register Bruno -> 201", s, d, 201, "name", "Bruno")
check("  created dog has code (DOGxxx)", s, d, 201, "code")
check("  created dog has qr_hash compatible id", s, d, 201, "id")
check("  vetRecord returned in response", s, d, 201, "vetRecord")
CREATED_DOG_ID = created.get("id") if ok else None
CREATED_DOG_CODE = created.get("code") if ok else None
print(f"         Created: id={CREATED_DOG_ID}, code={CREATED_DOG_CODE}")

section("4c. DOGS  GET /api/v1/dogs/{id}")
if CREATED_DOG_ID:
    s, d = req("GET", f"/api/v1/dogs/{CREATED_DOG_ID}")
    check(f"GET /api/v1/dogs/{CREATED_DOG_ID}  -> Bruno", s, d, 200, "name", "Bruno")
    check("  area field correct", s, d, 200, "area", "JNEC Campus")
    check("  has vet record", s, d, 200, "vetRecord")

s, d = req("GET", "/api/v1/dogs/nonexistent_id_abc")
check("GET /api/v1/dogs/nonexistent  -> 404", s, d, 404)

section("4d. DOGS  PUT /api/v1/dogs/{id}  (update fields)")
if CREATED_DOG_ID:
    s, d = req("PUT", f"/api/v1/dogs/{CREATED_DOG_ID}", {
        "health_status": "Under Observation",
        "area": "JNEC Main Gate",
        "special_notes": "Updated via PUT - now under observation",
        "is_geofenced_safe": False
    })
    check(f"PUT /api/v1/dogs/{CREATED_DOG_ID}  health_status updated", s, d, 200, "healthStatus", "Under Observation")
    check("  area updated", s, d, 200, "area", "JNEC Main Gate")

    s, d = req("PUT", f"/api/v1/dogs/{CREATED_DOG_ID}", {"special_notes": "Second update"})
    check("  second PUT partial update works", s, d, 200, "specialNotes", "Second update")

s, d = req("PUT", "/api/v1/dogs/bad_id_xyz", {"health_status": "Healthy"})
check("PUT /api/v1/dogs/bad_id  -> 404", s, d, 404)

section("4e. DOGS  GET /api/v1/dogs/{id}/trail  (breadcrumb trail)")
s, d = req("GET", "/api/v1/dogs/moti/trail")
check("GET /api/v1/dogs/moti/trail  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         Moti trail: {len(d)} waypoints")
    RESULTS.append({"label": "moti trail is list", "pass": True, "status": s})
    PASS_COUNT += 1

s, d = req("GET", "/api/v1/dogs/moti/trail?limit=2")
check("GET trail?limit=2  respects limit", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    if len(d) <= 2:
        PASS_COUNT += 1
        print(f"  [PASS] limit=2 respected, got {len(d)} points")
        RESULTS.append({"label": "trail limit=2", "pass": True, "status": 200})
    else:
        FAIL_COUNT += 1
        print(f"  [FAIL] limit=2 not respected, got {len(d)} points")
        RESULTS.append({"label": "trail limit=2", "pass": False, "status": 200})

section("4f. DOGS  DELETE /api/v1/dogs/{id}")
if CREATED_DOG_ID:
    s, d = req("DELETE", f"/api/v1/dogs/{CREATED_DOG_ID}")
    check(f"DELETE /api/v1/dogs/{CREATED_DOG_ID}  -> deleted", s, d, 200, "status", "deleted")
    s2, d2 = req("GET", f"/api/v1/dogs/{CREATED_DOG_ID}")
    check("  GET after DELETE -> 404 (gone)", s2, d2, 404)

s, d = req("DELETE", "/api/v1/dogs/nonexistent_xyz")
check("DELETE /api/v1/dogs/nonexistent -> 404", s, d, 404)

# ==============================================================
# 5. MAP PINS & DASHBOARD
# ==============================================================
section("5a. MAP PINS  GET /api/v1/map/dogs")
s, d = req("GET", "/api/v1/map/dogs")
check("GET /api/v1/map/dogs  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} dog map pins returned")
    RESULTS.append({"label": "map pins is list", "pass": True, "status": 200})
    PASS_COUNT += 1
    if d:
        pin = d[0]
        for field in ["id", "code", "name", "lat", "lng", "health_status", "temperature_c",
                      "battery_percent", "is_geofenced_safe", "inferred_state"]:
            present = field in pin
            symbol = "PASS" if present else "FAIL"
            print(f"  [{symbol}] map pin has '{field}' field")
            RESULTS.append({"label": f"map pin field {field}", "pass": present, "status": 200})
            if present:
                PASS_COUNT += 1
            else:
                FAIL_COUNT += 1

section("5b. DASHBOARD STATS  GET /api/v1/dashboard/stats")
s, d = req("GET", "/api/v1/dashboard/stats")
check("GET /api/v1/dashboard/stats  -> 200", s, d, 200, "total_dogs")
check("  has active_collars field", s, d, 200, "active_collars")
check("  has open_alerts field", s, d, 200, "open_alerts")
check("  has geofence_breaches field", s, d, 200, "geofence_breaches")
print(f"         Stats: {d}")

# ==============================================================
# 6. ALERTS
# ==============================================================
section("6a. ALERTS  GET /api/v1/alerts")
s, d = req("GET", "/api/v1/alerts")
check("GET /api/v1/alerts  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    ALERT_ID = d[0]["id"] if d else None
    print(f"         {len(d)} alerts found")
    if d:
        a = d[0]
        for f in ["id", "severity", "alert_type", "dog_id", "dog_name",
                  "dog_code", "diagnostic", "sensor_source", "status", "timestamp"]:
            present = f in a
            symbol = "PASS" if present else "FAIL"
            print(f"  [{symbol}] alert has '{f}' field")
            RESULTS.append({"label": f"alert field {f}", "pass": present, "status": 200})
            if present:
                PASS_COUNT += 1
            else:
                FAIL_COUNT += 1
else:
    ALERT_ID = None

s, d = req("GET", "/api/v1/alerts?status=open")
check("GET /api/v1/alerts?status=open  filter by status", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} open alerts")
    RESULTS.append({"label": "alerts filter status=open", "pass": True, "status": 200})
    PASS_COUNT += 1

s, d = req("GET", "/api/v1/alerts?severity=CRITICAL")
check("GET /api/v1/alerts?severity=CRITICAL  filter by severity", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} CRITICAL alerts")
    RESULTS.append({"label": "alerts filter severity=CRITICAL", "pass": True, "status": 200})
    PASS_COUNT += 1

s, d = req("GET", "/api/v1/alerts?limit=1")
check("GET /api/v1/alerts?limit=1  limit param", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    RESULTS.append({"label": "alerts limit=1", "pass": len(d) <= 1, "status": 200})
    if len(d) <= 1:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1
    print(f"         limit=1 returned {len(d)} alerts")

section("6b. ALERTS  GET /api/v1/alerts/count")
s, d = req("GET", "/api/v1/alerts/count")
check("GET /api/v1/alerts/count  has count field", s, d, 200, "count")
check("  has status field", s, d, 200, "status")
print(f"         Open alert count: {d.get('count')}")

section("6c. ALERTS  PUT /api/v1/alerts/{id}/investigate")
if ALERT_ID:
    s, d = req("PUT", f"/api/v1/alerts/{ALERT_ID}/investigate")
    check(f"PUT /api/v1/alerts/{ALERT_ID[:8]}../investigate -> investigating", s, d, 200, "status", "investigating")

section("6d. ALERTS  PUT /api/v1/alerts/{id}/resolve")
if ALERT_ID:
    s, d = req("PUT", f"/api/v1/alerts/{ALERT_ID}/resolve?resolved_by=Ashish+Joshi")
    check(f"PUT /api/v1/alerts/{ALERT_ID[:8]}../resolve -> resolved", s, d, 200, "status", "resolved")
    check("  resolved_by field present", s, d, 200, "resolved_by")
    print(f"         Resolved by: {d.get('resolved_by')}")

# ==============================================================
# 7. INCIDENTS (EmergencyModal)
# ==============================================================
section("7a. INCIDENTS  POST /api/v1/incidents  (all 5 categories)")
CATEGORIES = ["injured", "aggression", "lost_collar", "food_water", "sighting"]
INCIDENT_ID = None
for cat in CATEGORIES:
    s, d = req("POST", "/api/v1/incidents", {
        "dog_id": "moti",
        "dog_name": "Moti",
        "dog_code": "DOG042",
        "category": cat,
        "location": f"Test location for {cat}",
        "description": f"Test incident category={cat}",
        "reporter_name": "Test Reporter",
        "reporter_phone": "9876543210",
        "lat": 19.8758, "lng": 75.3437
    })
    ok, rd = check(f"POST /api/v1/incidents  category={cat} -> 201", s, d, 201, "ticket_id")
    if ok:
        ticket = rd.get("ticket_id", "")
        starts_mgm = ticket.startswith("MGM-")
        sym = "PASS" if starts_mgm else "FAIL"
        print(f"  [{sym}] ticket_id format is MGM-XXXX: {ticket}")
        RESULTS.append({"label": f"ticket format {cat}", "pass": starts_mgm, "status": 201})
        if starts_mgm:
            PASS_COUNT += 1
        else:
            FAIL_COUNT += 1
        if INCIDENT_ID is None:
            INCIDENT_ID = rd.get("id")

section("7b. INCIDENTS  GET /api/v1/incidents")
s, d = req("GET", "/api/v1/incidents")
check("GET /api/v1/incidents  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} total incidents")
    RESULTS.append({"label": "incidents list", "pass": True, "status": 200})
    PASS_COUNT += 1

s, d = req("GET", "/api/v1/incidents?status=dispatched")
check("GET /api/v1/incidents?status=dispatched  filter works", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} dispatched incidents")
    RESULTS.append({"label": "incidents filter dispatched", "pass": True, "status": 200})
    PASS_COUNT += 1

s, d = req("GET", "/api/v1/incidents?limit=3")
check("GET /api/v1/incidents?limit=3  limit param", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    RESULTS.append({"label": "incidents limit=3", "pass": len(d) <= 3, "status": 200})
    if len(d) <= 3:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1
    print(f"         limit=3 returned {len(d)} incidents")

section("7c. INCIDENTS  PUT /api/v1/incidents/{id}  (status lifecycle)")
if INCIDENT_ID:
    s, d = req("PUT", f"/api/v1/incidents/{INCIDENT_ID}", {"status": "investigating"})
    check(f"PUT incident -> investigating", s, d, 200, "status", "investigating")

    s, d = req("PUT", f"/api/v1/incidents/{INCIDENT_ID}", {"status": "resolved"})
    check(f"PUT incident -> resolved", s, d, 200, "status", "resolved")

    s, d = req("PUT", "/api/v1/incidents/nonexistent_id", {"status": "resolved"})
    check("PUT /api/v1/incidents/nonexistent -> 404", s, d, 404)

# ==============================================================
# 8. TELEMETRY (ESP32 Ingestion)
# ==============================================================
section("8a. TELEMETRY  POST /api/v1/telemetry  (normal walking)")
s, d = req("POST", "/api/v1/telemetry", {
    "collar_mac": "ESP32-COLLAR-8042",
    "dog_id": "moti",
    "battery_percent": 68,
    "temperature_c": 38.5,
    "activity_score": 72,
    "coordinates": {"lat": 19.8762, "lng": 75.3440, "accuracy_meters": 4},
    "movement": {
        "accel_max_g": 1.2,
        "accel_variance": 0.07,
        "gyro_variance": 0.06,
        "inferred_state": "walking"
    }
})
check("POST /api/v1/telemetry  normal data -> received", s, d, 200, "status", "received")
check("  has alert_triggered field", s, d, 200, "alert_triggered")
check("  has message field", s, d, 200, "message")
print(f"         alert_triggered={d.get('alert_triggered')}, msg={d.get('message')}")

section("8b. TELEMETRY  POST /api/v1/telemetry  (fever - triggers CRITICAL alert)")
s, d = req("POST", "/api/v1/telemetry", {
    "collar_mac": "ESP32-COLLAR-8117",
    "dog_id": "sheru",
    "battery_percent": 52,
    "temperature_c": 40.8,
    "activity_score": 15,
    "coordinates": {"lat": 19.8521, "lng": 75.2933, "accuracy_meters": 6},
    "movement": {
        "accel_max_g": 0.4,
        "accel_variance": 0.01,
        "gyro_variance": 0.01,
        "inferred_state": "resting"
    }
})
check("POST /api/v1/telemetry  fever (40.8C) -> alert triggered", s, d, 200, "alert_triggered", True)
print(f"         Alert type: {d.get('alert_type')}")

section("8c. TELEMETRY  POST /api/v1/telemetry  (limping/gait anomaly)")
s, d = req("POST", "/api/v1/telemetry", {
    "collar_mac": "ESP32-COLLAR-8089",
    "dog_id": "kalu",
    "battery_percent": 79,
    "temperature_c": 38.9,
    "activity_score": 28,
    "coordinates": {"lat": 19.8610, "lng": 75.3280, "accuracy_meters": 5},
    "movement": {
        "accel_max_g": 3.5,
        "accel_variance": 0.28,
        "gyro_variance": 0.32,
        "inferred_state": "limping"
    }
})
check("POST /api/v1/telemetry  gait anomaly (variance=0.28) -> alert", s, d, 200, "alert_triggered", True)
print(f"         Alert type: {d.get('alert_type')}")

section("8d. TELEMETRY  POST /api/v1/telemetry  (unknown collar)")
s, d = req("POST", "/api/v1/telemetry", {
    "collar_mac": "UNKNOWN-9999",
    "battery_percent": 90,
    "temperature_c": 38.2,
    "activity_score": 60
})
check("POST /api/v1/telemetry  unknown collar -> graceful received", s, d, 200, "status", "received")

section("8e. TELEMETRY  POST /api/v1/telemetry  (resting - no alert)")
s, d = req("POST", "/api/v1/telemetry", {
    "collar_mac": "ESP32-COLLAR-8251",
    "dog_id": "tommy",
    "battery_percent": 88,
    "temperature_c": 38.2,
    "activity_score": 40,
    "coordinates": {"lat": 19.8689, "lng": 75.3512, "accuracy_meters": 3},
    "movement": {
        "accel_max_g": 0.3,
        "accel_variance": 0.01,
        "gyro_variance": 0.01,
        "inferred_state": "resting"
    }
})
check("POST /api/v1/telemetry  resting - no alert triggered", s, d, 200, "alert_triggered", False)

# ==============================================================
# 9. ADMIN USERS CRUD
# ==============================================================
section("9a. ADMIN USERS  GET /api/v1/admin-users")
s, d = req("GET", "/api/v1/admin-users")
check("GET /api/v1/admin-users  returns list", s, {}, 200 if isinstance(d, list) else 500)
if isinstance(d, list):
    print(f"         {len(d)} active admin users")
    RESULTS.append({"label": "admin users list", "pass": True, "status": 200})
    PASS_COUNT += 1
    if d:
        u = d[0]
        for f in ["id", "name", "email", "role", "department", "is_active", "created_at"]:
            present = f in u
            sym = "PASS" if present else "FAIL"
            print(f"  [{sym}] admin user has '{f}' field")
            RESULTS.append({"label": f"admin user field {f}", "pass": present, "status": 200})
            if present:
                PASS_COUNT += 1
            else:
                FAIL_COUNT += 1

section("9b. ADMIN USERS  POST /api/v1/admin-users  (create staff)")
UNIQUE_EMAIL = f"teststaff_{uuid.uuid4().hex[:6]}@amc.gov.in"
s, d = req("POST", "/api/v1/admin-users", {
    "name": "Field Inspector Raj",
    "email": UNIQUE_EMAIL,
    "password": "staff123",
    "role": "staff",
    "department": "Field Operations"
})
ok, nu = check("POST /api/v1/admin-users  create staff user -> 201", s, d, 201, "email", UNIQUE_EMAIL)
check("  role is staff", s, d, 201, "role", "staff")
check("  has created_at", s, d, 201, "created_at")
NEW_USER_ID = nu.get("id") if ok else None

s, d = req("POST", "/api/v1/admin-users", {
    "name": "Duplicate",
    "email": UNIQUE_EMAIL,
    "password": "abc123",
    "role": "staff",
    "department": "Test"
})
check("POST /api/v1/admin-users  duplicate email -> 400", s, d, 400)

s, d = req("POST", "/api/v1/admin-users", {
    "name": "Dr. Veterinarian",
    "email": f"vet_{uuid.uuid4().hex[:6]}@amc.gov.in",
    "password": "vet123secure",
    "role": "vet",
    "department": "Animal Welfare"
})
check("POST /api/v1/admin-users  create vet user -> 201", s, d, 201, "role", "vet")

section("9c. ADMIN USERS  DELETE /api/v1/admin-users/{id}  (deactivate)")
if NEW_USER_ID:
    s, d = req("DELETE", f"/api/v1/admin-users/{NEW_USER_ID}")
    check(f"DELETE /api/v1/admin-users/{NEW_USER_ID[:8]}..  -> deactivated", s, d, 200, "status", "deactivated")
    s2, d2 = req("GET", "/api/v1/admin-users")
    ids = [u["id"] for u in d2] if isinstance(d2, list) else []
    gone = NEW_USER_ID not in ids
    sym = "PASS" if gone else "FAIL"
    print(f"  [{sym}] Deactivated user absent from GET list: {gone}")
    RESULTS.append({"label": "deactivated user absent from list", "pass": gone, "status": 200})
    if gone:
        PASS_COUNT += 1
    else:
        FAIL_COUNT += 1

s, d = req("DELETE", "/api/v1/admin-users/nonexistent_user_id")
check("DELETE /api/v1/admin-users/nonexistent -> 404", s, d, 404)

# ==============================================================
# SUMMARY
# ==============================================================
TOTAL = PASS_COUNT + FAIL_COUNT
SCORE = round(PASS_COUNT / TOTAL * 100, 1) if TOTAL > 0 else 0

print(f"\n{'='*64}")
print(f"  FINAL TEST RESULTS")
print(f"{'='*64}")
print(f"  PASSED  : {PASS_COUNT}/{TOTAL}")
print(f"  FAILED  : {FAIL_COUNT}/{TOTAL}")
print(f"  SCORE   : {SCORE}%")
if FAIL_COUNT == 0:
    print(f"  STATUS  : ALL TESTS PASSED")
else:
    print(f"  STATUS  : {FAIL_COUNT} test(s) failed")
    failed = [r for r in RESULTS if not r["pass"]]
    for f in failed:
        print(f"    - {f['label']} (HTTP {f['status']})")
print(f"{'='*64}")

sys.exit(0 if FAIL_COUNT == 0 else 1)
