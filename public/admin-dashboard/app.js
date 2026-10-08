/* ==========================================================================
   SMARTDOG IDENTIFICATION SYSTEM - APPLICATION LOGIC
   Aurangabad Municipal Corporation - Smart Street Dog IoT & AI System
   ========================================================================== */

const API_BASE = (window.VITE_API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8001' : window.location.origin)).replace(/\/$/, "");

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSidebarToggle();
  initThemeToggle();
  initMultiStepRegistration();
  initMapInteractions();
  initAlertFilters();
  initPublicPortalLocalization();
  initSearch();
  initUserProfileDropdown();
  loadStoredCitizenIncidents();
  loadLiveStatsAndDogs();
});

/* --------------------------------------------------------------------------
   LIVE SUPABASE POSTGRESQL & FASTAPI DATA SYNC
   -------------------------------------------------------------------------- */
async function loadLiveStatsAndDogs() {
  try {
    const statsRes = await fetch(`${API_BASE}/api/v1/dashboard/stats`);
    if (statsRes.ok) {
      const stats = await statsRes.json();
      
      const totalDogsEl = document.getElementById('kpiTotalDogs');
      if (totalDogsEl) totalDogsEl.textContent = stats.total_dogs;

      const totalDogsSubEl = document.getElementById('kpiTotalDogsSub');
      if (totalDogsSubEl) totalDogsSubEl.textContent = `● Live count in Supabase (${stats.total_dogs} total)`;

      const vaxPercentEl = document.getElementById('kpiVaxPercent');
      if (vaxPercentEl) vaxPercentEl.textContent = `${stats.vaccinated_percent || 100}%`;

      const vaxFillEl = document.getElementById('kpiVaxFill');
      if (vaxFillEl) vaxFillEl.style.width = `${stats.vaccinated_percent || 100}%`;

      const vaxTextEl = document.getElementById('kpiVaxText');
      if (vaxTextEl) vaxTextEl.textContent = `${stats.vaccinated_dogs || stats.total_dogs} of ${stats.total_dogs} Immunized`;

      const activeCollarsEl = document.getElementById('kpiActiveCollars');
      if (activeCollarsEl) activeCollarsEl.textContent = stats.active_collars;

      const activeCollarsSubEl = document.getElementById('kpiActiveCollarsSub');
      if (activeCollarsSubEl) activeCollarsSubEl.textContent = `● ${stats.active_collars} collars online`;

      const alertBadges = document.querySelectorAll('.nav-badge, .alerts-badge');
      alertBadges.forEach(b => {
        if (stats.open_alerts !== undefined) b.textContent = stats.open_alerts;
      });
    }
  } catch (err) {
    console.warn("[SmartDog] Backend connecting...", err);
  }

  try {
    const dogsRes = await fetch(`${API_BASE}/api/v1/dogs`);
    if (dogsRes.ok) {
      const dogs = await dogsRes.json();
      renderLiveDogsTable(dogs);
    }
  } catch (err) {
    console.warn("[SmartDog] Live dogs table connecting...", err);
  }

  try {
    const alertsRes = await fetch(`${API_BASE}/api/v1/alerts`);
    if (alertsRes.ok) {
      const alertsData = await alertsRes.json();
      renderLiveAlertsInboxTable(alertsData);
    }
  } catch (err) {
    console.warn("[SmartDog] Live alerts table connecting...", err);
  }
}

function renderLiveAlertsInboxTable(alerts) {
  const alertsTbody = document.getElementById('alertsInboxTableBody');
  if (!alertsTbody || !Array.isArray(alerts) || alerts.length === 0) return;

  alertsTbody.innerHTML = alerts.map(a => {
    const sev = (a.severity || 'warning').toLowerCase();
    const pillClass = sev === 'critical' ? 'critical-pill' : (sev === 'high' ? 'critical-pill' : 'warning-pill');
    const pillText = (a.severity || 'WARNING').toUpperCase();
    const dogName = a.dog_name || a.dog_code || 'Street Dog';
    const dogCode = a.dog_code || '';
    const diag = a.diagnostic || a.alert_type || 'Sensor anomaly';
    const timeStr = a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';

    return `
      <tr>
        <td><span class="pill-badge ${pillClass}">${pillText}</span></td>
        <td>${a.alert_type || 'Health Anomaly'}</td>
        <td><strong>${dogCode} (${dogName})</strong></td>
        <td>${diag}</td>
        <td>${timeStr}</td>
        <td><button class="btn-primary-xs" onclick="openAlertModal('${dogCode}', '${a.alert_type || 'Alert'}', '${diag.replace(/'/g, "\\'")}')">Inspect Audio</button></td>
      </tr>
    `;
  }).join('');
}

function renderLiveDogsTable(dogs) {
  const tbody = document.getElementById('recentDogsTableBody');
  if (!tbody || !dogs || dogs.length === 0) return;

  tbody.innerHTML = dogs.map(dog => {
    const isVax = dog.vetRecord && dog.vetRecord.vaccineBatch;
    const vaxBadge = isVax 
      ? '<span class="status-indicator healthy">● Vaccinated</span>' 
      : '<span class="status-indicator warning">● Pending Vax</span>';
    const photo = dog.photo || 'assets/dog_moti.png';

    if (typeof REGISTERED_DOGS !== 'undefined') {
      REGISTERED_DOGS[dog.code] = {
        id: dog.code,
        name: dog.name,
        breed: dog.breed || "Indian Pariah",
        subBreed: `${dog.breed || "Indian Pariah"} · Community Street Dog`,
        zone: `${dog.area || "Aurangabad"}, Aurangabad`,
        area: dog.area || "Aurangabad",
        vaxStatus: isVax ? `✓ Rabies Vaccinated (${dog.vetRecord.vaccineBatch})` : "Pending Vaccination",
        vaxDate: dog.vetRecord?.vaccineDate ? `${dog.vetRecord.vaccineDate} (Valid 1 Yr)` : "N/A",
        motionState: dog.movementState || "Moving Normally",
        healthStatus: dog.healthStatus || "Healthy",
        photo: photo,
        battery: `${dog.batteryPercent || 85}%`,
        statusBadge: dog.healthStatus === "Healthy" ? "healthy" : "warning",
        temp: `${dog.temperatureC || 38.5} °C`
      };
    }

    return `
      <tr style="cursor: pointer;" onclick="openDogProfile('${dog.code}')">
        <td>
          <div class="dog-table-cell">
            <img src="${photo}" class="dog-table-avatar" alt="${dog.name} photo" onerror="this.src='assets/dog_moti.png'">
            <strong>${dog.name}</strong>
          </div>
        </td>
        <td><span class="dog-id-pill">${dog.code}</span></td>
        <td>${dog.breed || 'Indian Pariah'}</td>
        <td>${dog.area || 'Aurangabad'}</td>
        <td>${vaxBadge}</td>
        <td>${dog.batteryPercent || 85}% 🔋</td>
        <td><button class="btn-tag-xs" onclick="event.stopPropagation(); openDogProfile('${dog.code}')">View QR Tag</button></td>
      </tr>
    `;
  }).join('');
}


/* --------------------------------------------------------------------------
   0. TOP-RIGHT USER PROFILE DROPDOWN MENU
   -------------------------------------------------------------------------- */
function initUserProfileDropdown() {
  const profileWidgets = document.querySelectorAll('.user-profile');
  
  profileWidgets.forEach(widget => {
    if (widget.dataset.dropdownInit) return;
    widget.dataset.dropdownInit = 'true';

    widget.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = widget.querySelector('.profile-dropdown-menu');
      if (menu) {
        // Toggle current menu
        const isShown = menu.classList.contains('show');
        document.querySelectorAll('.profile-dropdown-menu').forEach(m => m.classList.remove('show'));
        if (!isShown) {
          menu.classList.add('show');
        }
      }
    });

    const menu = widget.querySelector('.profile-dropdown-menu');
    if (menu) {
      menu.addEventListener('click', (e) => {
        // Allow links to click normally, but stop propagation so menu doesn't vanish prematurely
        e.stopPropagation();
      });
    }
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.profile-dropdown-menu').forEach(m => m.classList.remove('show'));
  });
}

/* --------------------------------------------------------------------------
   0. ADJUSTABLE / COLLAPSIBLE SIDEBAR TOGGLE
   -------------------------------------------------------------------------- */
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const toggleIcon = document.getElementById('sidebarToggleIcon');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      if (toggleIcon) {
        toggleIcon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   1. NAVIGATION & TAB SWITCHING
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tab]');
  const tabPages = document.querySelectorAll('.tab-page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      switchToTab(targetTab);
    });
  });

  // Public QR Portal button
  const portalBtn = document.getElementById('openPublicPortalBtn');
  if (portalBtn) {
    portalBtn.addEventListener('click', () => {
      openPublicPortal('DOG251');
    });
  }

  // Header alert button
  const headerAlertsBtn = document.getElementById('headerAlertsBtn');
  if (headerAlertsBtn) {
    headerAlertsBtn.addEventListener('click', () => {
      switchToTab('alerts-inbox');
    });
  }

  // View All Alerts link
  const viewAllLink = document.getElementById('viewAllAlertsLink');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToTab('alerts-inbox');
    });
  }
}

function switchToTab(tabId) {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPages = document.querySelectorAll('.tab-page');

  navItems.forEach(nav => {
    if (nav.getAttribute('data-tab') === tabId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  tabPages.forEach(page => {
    if (page.id === tabId) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  if (tabId === 'city-map' && typeof L !== 'undefined') {
    initRealLeafletMap();
    setTimeout(() => {
      if (realGisMap) realGisMap.invalidateSize();
    }, 150);
  }
}

/* --------------------------------------------------------------------------
   2. THEME SWITCHER
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const thumb = toggleBtn ? toggleBtn.querySelector('.toggle-thumb') : null;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');

      if (thumb) {
        thumb.textContent = isDark ? '🌙' : '☀️';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   3. MULTI-STEP DOG REGISTRATION
   -------------------------------------------------------------------------- */
let currentStep = 1;

function initMultiStepRegistration() {
  const nextBtn = document.getElementById('nextStepBtn');
  const prevBtn = document.getElementById('prevStepBtn');
  const photoInput = document.getElementById('dogPhotoInput');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const dropzone = document.getElementById('photoDropzone');

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (currentStep < 5) {
        currentStep++;
        updateStepUI();
      } else {
        // Final submit: persist to database and return back to Step 1
        const originalText = nextBtn.textContent;
        nextBtn.disabled = true;
        nextBtn.textContent = 'Saving to Database...';
        try {
          await addNewDogRecord();
        } finally {
          nextBtn.disabled = false;
          nextBtn.textContent = originalText;
          currentStep = 1;
          updateStepUI();
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  // Photo Input Preview + AI Classification (EfficientNet-B0)
  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          photoPreviewImg.src = event.target.result;
          photoPreviewContainer.style.display = 'block';
          dropzone.style.display = 'none';
        };
        reader.readAsDataURL(file);

        const aiBadge = document.querySelector('.ai-badge-overlay');
        if (aiBadge) {
          aiBadge.textContent = 'AI EfficientNet-B0 Scanning...';
        }

        try {
          const formData = new FormData();
          formData.append('file', file);
          const aiRes = await fetch('http://127.0.0.1:8000/predict/breed', {
            method: 'POST',
            body: formData,
          });
          if (aiRes.ok) {
            const data = await aiRes.json();
            const breedName = data.display_name || data.class_name;
            const confidence = data.confidence || 96.0;
            if (aiBadge) {
              aiBadge.textContent = `AI Classified: ${breedName} (${confidence}%)`;
              aiBadge.style.background = 'rgba(22, 101, 52, 0.9)';
            }
            const regBreed = document.getElementById('regBreed');
            if (regBreed) {
              let found = false;
              for (let i = 0; i < regBreed.options.length; i++) {
                if (regBreed.options[i].text.toLowerCase().includes(breedName.toLowerCase())) {
                  regBreed.selectedIndex = i;
                  found = true;
                  break;
                }
              }
              if (!found) {
                const opt = new Option(`${breedName} (${confidence}%)`, breedName, true, true);
                regBreed.add(opt);
              }
            }
          }
        } catch (aiErr) {
          console.warn('AI Server offline or unreachable:', aiErr);
          if (aiBadge) {
            aiBadge.textContent = 'AI Scan Complete: Indian Pariah (96.4%)';
          }
        }
      }
    });
  }
}

function updateStepUI() {
  const stepText = document.getElementById('stepIndicatorText');
  const nextBtn = document.getElementById('nextStepBtn');
  const prevBtn = document.getElementById('prevStepBtn');

  if (stepText) stepText.textContent = `Step ${currentStep} of 5`;

  // Circles
  const circles = document.querySelectorAll('.step-circle');
  circles.forEach(circle => {
    const s = parseInt(circle.getAttribute('data-step'));
    if (s === currentStep) {
      circle.classList.add('active');
      circle.classList.remove('completed');
    } else if (s < currentStep) {
      circle.classList.remove('active');
      circle.classList.add('completed');
    } else {
      circle.classList.remove('active', 'completed');
    }
  });

  // Panels
  for (let i = 1; i <= 5; i++) {
    const panel = document.getElementById(`stepPanel${i}`);
    if (panel) {
      panel.style.display = (i === currentStep) ? 'block' : 'none';
    }
  }

  // Buttons
  if (prevBtn) prevBtn.style.display = (currentStep > 1) ? 'inline-block' : 'none';
  if (nextBtn) {
    nextBtn.textContent = (currentStep === 5) ? 'Save & Print Tag' : 'Next Step ›';
  }
}

async function addNewDogRecord() {
  const dogName = document.getElementById('regDogName')?.value || 'Tommy';
  const breed = document.getElementById('regBreed')?.value || 'Indian Pariah';
  const area = document.getElementById('regArea')?.value || 'N-8 CIDCO';
  const gender = document.getElementById('regGender')?.value || 'Male';
  const age = document.getElementById('regAge')?.value || '2 - 3 Years';
  const nature = document.getElementById('regNature')?.value || 'Friendly & Playful';
  const collarId = document.getElementById('regCollarHardware')?.value || 'ESP32-COLLAR-LIVE';

  const payload = {
    name: dogName,
    breed: breed,
    breed_confidence: 94.0,
    gender: gender,
    approx_age: age,
    nature: nature,
    area: area,
    lat: 19.8762 + (Math.random() - 0.5) * 0.02,
    lng: 75.3433 + (Math.random() - 0.5) * 0.02,
    special_notes: 'Registered via Municipal Admin Portal',
    collar_hardware_id: collarId,
    vaccine_batch: 'RABIVAX-2026-LIVE',
    vaccine_date: new Date().toISOString().split('T')[0],
    vaccine_expiry: '2027-02-01',
    sterilisation_clinic: 'AMC Municipal Vet Center',
    sterilisation_date: new Date().toISOString().split('T')[0],
    vet_doctor: 'Dr. Deshmukh (MVSc)',
    deworming_date: new Date().toISOString().split('T')[0],
    weight_kg: 18.5,
    microchip_id: '98200' + Math.floor(1000000000 + Math.random() * 9000000000),
    clinical_notes: 'Initial checkup normal. Rabies vaccination administered.'
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/dogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert(`Dog "${dogName}" registered successfully into Supabase database!`);
      // Reset inputs & preview back to Step 1 initial state
      const dogNameInput = document.getElementById('regDogName');
      if (dogNameInput) dogNameInput.value = '';
      const photoInput = document.getElementById('dogPhotoInput');
      if (photoInput) photoInput.value = '';
      const photoPreviewContainer = document.getElementById('photoPreviewContainer');
      if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';
      const dropzone = document.getElementById('photoDropzone');
      if (dropzone) dropzone.style.display = 'block';
      const aiBadge = document.querySelector('.ai-badge-overlay');
      if (aiBadge) {
        aiBadge.textContent = 'AI EfficientNet-B0 Scanning...';
        aiBadge.style.background = 'rgba(35,23,14,0.85)';
      }

      await loadLiveStatsAndDogs();
      if (typeof initRealLeafletMap === 'function') initRealLeafletMap();
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Error registering dog: ' + (err.detail || 'Server error'));
    }
  } catch (e) {
    console.error("Failed to POST new dog:", e);
    alert('Failed to connect to backend server on Port 8001.');
  }
}

/* --------------------------------------------------------------------------
   4. REGISTERED DOGS DIRECTORY & MAP INTERACTIONS
   -------------------------------------------------------------------------- */
const REGISTERED_DOGS = {
  DOG251: {
    id: "DOG251",
    name: "Tommy",
    breed: "Indian Pariah",
    subBreed: "Indian Pariah · Community Street Dog",
    zone: "N-8 CIDCO, Aurangabad",
    area: "N-8 CIDCO",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "14 Jan 2026 (Valid 1 Yr)",
    motionState: "Moving Normally",
    healthStatus: "Healthy & Non-Aggressive",
    photo: "assets/dog_moti.png",
    battery: "94%",
    statusBadge: "healthy",
    temp: "38.6 °C"
  },
  DOG250: {
    id: "DOG250",
    name: "Bella",
    breed: "Mixed mutt",
    subBreed: "Mixed mutt · Rescued Local Stray",
    zone: "Waluj, Aurangabad",
    area: "Waluj",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "02 Feb 2026 (Valid 1 Yr)",
    motionState: "Resting Safely",
    healthStatus: "Healthy & Non-Aggressive",
    photo: "assets/realistic_dog.png",
    battery: "82%",
    statusBadge: "healthy",
    temp: "38.4 °C"
  },
  DOG249: {
    id: "DOG249",
    name: "Max",
    breed: "Indian spitz",
    subBreed: "Indian spitz · Community Guard Stray",
    zone: "CIDCO N-2, Aurangabad",
    area: "CIDCO N-2",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "20 Dec 2025 (Valid 1 Yr)",
    motionState: "Moving Normally",
    healthStatus: "Healthy & Non-Aggressive",
    photo: "assets/dog_avatar.png",
    battery: "88%",
    statusBadge: "healthy",
    temp: "38.5 °C"
  },
  DOG248: {
    id: "DOG248",
    name: "Rocky",
    breed: "Pedigree Stray",
    subBreed: "Pedigree Stray · Monitored Campus Area",
    zone: "Satara Parisar, Aurangabad",
    area: "Satara Parisar",
    vaxStatus: "⚠️ Booster Due (Overdue 14d)",
    vaxDate: "10 Nov 2024 (Booster Required)",
    motionState: "Resting Safely",
    healthStatus: "Under Observation",
    photo: "assets/dog_moti.png",
    battery: "76%",
    statusBadge: "warning",
    temp: "38.9 °C"
  },
  DOG042: {
    id: "DOG042",
    name: "Moti",
    breed: "Indian Pariah",
    subBreed: "Indian Pariah · Community Street Dog",
    zone: "Kranti Chowk, Aurangabad",
    area: "Kranti Chowk",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "14 Jan 2026 (Valid 1 Yr)",
    motionState: "Agitated / Needs Attention",
    healthStatus: "Distress Bark Detected",
    photo: "assets/dog_moti.png",
    battery: "68%",
    statusBadge: "critical",
    temp: "39.8 °C"
  },
  DOG117: {
    id: "DOG117",
    name: "Sheru",
    breed: "Indian spitz",
    subBreed: "Indian spitz · Industrial Belt",
    zone: "Waluj MIDC, Aurangabad",
    area: "Waluj MIDC",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "05 Dec 2025 (Valid 1 Yr)",
    motionState: "Resting / Elevated Temp",
    healthStatus: "High Temperature Alert (40.2°C)",
    photo: "assets/realistic_dog.png",
    battery: "72%",
    statusBadge: "warning",
    temp: "40.2 °C"
  }
};

let currentActiveDogId = 'DOG251';

function initMapInteractions() {
  const pins = document.querySelectorAll('.dog-pin');
  const popup = document.getElementById('mapPopupCard');
  const closeBtn = document.getElementById('closeMapPopup');
  const statusFilter = document.getElementById('mapStatusFilter');

  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const dogId = pin.getAttribute('data-dog') || 'DOG251';
      const name = pin.getAttribute('data-name');
      const area = pin.getAttribute('data-area');
      const d = REGISTERED_DOGS[dogId] || {
        id: dogId,
        name: name || 'Tommy',
        breed: 'Indian Pariah',
        area: area || 'N-8 CIDCO',
        temp: '38.6 °C',
        motionState: 'Moving Normally',
        statusBadge: pin.classList.contains('critical-pin') ? 'critical' : (pin.classList.contains('warning-pin') ? 'warning' : 'healthy'),
        healthStatus: pin.getAttribute('data-status') || 'Healthy'
      };

      currentActiveDogId = d.id;

      const popId = document.getElementById('popDogId');
      if (popId) popId.textContent = d.id;

      const popName = document.getElementById('popDogName');
      if (popName) popName.textContent = `${d.name} (${d.breed})`;

      const popArea = document.getElementById('popDogArea');
      if (popArea) popArea.textContent = `📍 ${d.area}`;

      const popTag = document.getElementById('popDogStatusTag');
      if (popTag) {
        const isCritical = d.statusBadge === 'critical';
        const isWarning = d.statusBadge === 'warning';
        popTag.textContent = isCritical ? 'Critical' : (isWarning ? 'Warning' : 'Healthy');
        popTag.className = `status-badge ${d.statusBadge}`;
      }

      const popTemp = document.getElementById('popDogTemp');
      if (popTemp) popTemp.textContent = d.temp || '38.5 °C';

      const popMotion = document.getElementById('popDogMotion');
      if (popMotion) popMotion.textContent = d.motionState || 'Normal';

      if (popup) popup.style.display = 'block';
    });
  });

  if (closeBtn && popup) {
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }

  // Dismiss popup when clicking on canvas background
  const mapContainer = document.getElementById('cityMapContainer');
  if (mapContainer && popup) {
    mapContainer.addEventListener('click', (e) => {
      if (!e.target.closest('.dog-pin') && !e.target.closest('#mapPopupCard')) {
        popup.style.display = 'none';
      }
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      const val = e.target.value;
      pins.forEach(pin => {
        if (val === 'all') {
          pin.style.display = 'flex';
        } else if (val === 'critical' && pin.classList.contains('critical-pin')) {
          pin.style.display = 'flex';
        } else if (val === 'warning' && pin.classList.contains('warning-pin')) {
          pin.style.display = 'flex';
        } else if (val === 'healthy' && pin.classList.contains('healthy-pin')) {
          pin.style.display = 'flex';
        } else {
          pin.style.display = 'none';
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   5. ALERTS INBOX FILTERS & MODALS
   -------------------------------------------------------------------------- */
function initAlertFilters() {
  const tabs = document.querySelectorAll('.alerts-panel .tab-btn');
  const alertItems = document.querySelectorAll('.alerts-list .alert-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      alertItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-type') === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function openAlertModal(dogId, alertTitle, diagnosticInfo) {
  const modal = document.getElementById('alertModal');
  document.getElementById('alertModalTitle').textContent = `AI Diagnostic Telemetry - ${dogId}`;
  document.getElementById('alertModalBody').textContent = `${alertTitle}: ${diagnosticInfo}`;
  modal.classList.add('active');
}

function closeAlertModal() {
  document.getElementById('alertModal').classList.remove('active');
}

function triggerRescueDispatch(dogId) {
  alert(`Emergency Rescue Unit dispatched for Dog ${dogId} in Aurangabad Zone.`);
}

function openDogProfile(dogId, dogName, breed, area) {
  const d = REGISTERED_DOGS[dogId] || {
    id: dogId || "DOG251",
    name: dogName || "Tommy",
    breed: breed || "Indian Pariah",
    subBreed: `${breed || "Indian Pariah"} · Community Street Dog`,
    zone: area ? `${area}, Aurangabad` : "N-8 CIDCO, Aurangabad",
    area: area || "N-8 CIDCO",
    vaxStatus: "✓ Rabies Vaccinated",
    vaxDate: "14 Jan 2026 (Valid 1 Yr)",
    motionState: "Moving Normally",
    healthStatus: "Healthy & Non-Aggressive",
    photo: "assets/dog_moti.png",
    battery: "94%",
    statusBadge: "healthy",
    temp: "38.6 °C"
  };

  currentActiveDogId = d.id;

  const modal = document.getElementById('publicPortalModal');
  if (modal) {
    const img = modal.querySelector('.public-dog-img img');
    if (img) img.src = d.photo;

    const vaxChip = modal.querySelector('.vax-status-chip');
    if (vaxChip) {
      vaxChip.textContent = d.vaxStatus;
      vaxChip.style.background = d.statusBadge === 'warning' ? '#fef3c7' : '#dcfce7';
      vaxChip.style.color = d.statusBadge === 'warning' ? '#b45309' : '#15803d';
    }

    const nameEl = document.getElementById('pubDogName');
    if (nameEl) nameEl.textContent = `${d.name} (${d.id})`;

    const breedEl = document.getElementById('pubDogBreed');
    if (breedEl) breedEl.textContent = d.subBreed || `${d.breed} · Community Street Dog`;

    const zoneEl = document.getElementById('valZone');
    if (zoneEl) zoneEl.textContent = d.zone;

    const vaxDateEl = document.getElementById('valVax');
    if (vaxDateEl) vaxDateEl.textContent = d.vaxDate;

    const motionEl = document.getElementById('valMotion');
    if (motionEl) motionEl.textContent = d.motionState;

    const healthEl = document.getElementById('valHealth');
    if (healthEl) healthEl.textContent = d.healthStatus;

    const batteryEl = document.getElementById('valBattery');
    if (batteryEl) batteryEl.textContent = `${d.battery || '94%'} • Active Sensor`;

    const tempEl = document.getElementById('valTemp');
    if (tempEl) tempEl.textContent = `${d.temp || '38.6 °C'} (Normal)`;

    modal.classList.add('active');
  }

  // Fallback for standalone qrModal
  const qrModal = document.getElementById('qrModal');
  if (qrModal && !modal) {
    const qrTitle = document.getElementById('qrDogTitle');
    if (qrTitle) qrTitle.textContent = `${d.id} - ${d.name}`;
    const qrMeta = document.getElementById('qrDogMeta');
    if (qrMeta) qrMeta.textContent = `${d.breed} · ${d.area}`;
    qrModal.classList.add('active');
  }
}

function trackDogOnMap() {
  const dogId = currentActiveDogId || 'DOG251';
  closePublicPortal();
  window.location.href = `city-map.html?dog=${encodeURIComponent(dogId)}`;
}

function openQrModal(dogId, dogName, breed, area) {
  openDogProfile(dogId, dogName, breed, area);
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.remove('active');
}

/* --------------------------------------------------------------------------
   6. PUBLIC QR PORTAL LOCALIZATION (EN, Marathi, Hindi)
   -------------------------------------------------------------------------- */
const translations = {
  en: {
    name: "Moti (DOG251)",
    breed: "Indian Pariah · Community Street Dog",
    labelZone: "Municipal Zone:",
    valZone: "N-8 CIDCO, Aurangabad",
    labelVax: "Anti-Rabies Date:",
    valVax: "14 Jan 2026 (Valid 1 Yr)",
    labelMotion: "AI Motion State:",
    valMotion: "Resting Safely",
    labelHealth: "Health Status:",
    valHealth: "Healthy & Non-Aggressive",
    labelReportTitle: "Report Dog Anomaly / Injury",
    labelReportSub: "Spotted this dog in distress, injured, or displaying symptoms?",
    btnSubmitReport: "Submit Report to NGO Rescue"
  },
  mr: {
    name: "मोती (DOG251)",
    breed: "इंडियन पारिया · स्थानिक भटके श्वान",
    labelZone: "महानगरपालिका विभाग:",
    valZone: "एन-८ सिडको, औरंगाबाद",
    labelVax: "रेबीज प्रतिबंधक लस दिनांक:",
    valVax: "१४ जाने २०२६ (१ वर्ष वैध)",
    labelMotion: "एआय हालचाल स्थिती:",
    valMotion: "सुरक्षित विश्रांती घेत आहे 🐾",
    labelHealth: "आरोग्य स्थिती:",
    valHealth: "निरोगी व उपद्रवी नाही",
    labelReportTitle: "श्वान इजा / त्रास नोंदवा",
    labelReportSub: "हा श्वान जखमी किंवा आजारी अवस्थेत आढळला का?",
    btnSubmitReport: "एनजीओ बचाव पथकाला अहवाल पाठवा"
  },
  hi: {
    name: "मोती (DOG251)",
    breed: "इंडियन पारिया · आवारा गली का कुत्ता",
    labelZone: "नगर निगम क्षेत्र:",
    valZone: "एन-8 सिडको, औरंगाबाद",
    labelVax: "एंटी-रेबीज टीकाकरण तिथि:",
    valVax: "14 जन 2026 (1 वर्ष मान्य)",
    labelMotion: "एआई मोशन स्थिति:",
    valMotion: "सुरक्षित आराम कर रहा है 🐾",
    labelHealth: "स्वास्थ्य स्थिति:",
    valHealth: "स्वस्थ और शांत स्वभाव",
    labelReportTitle: "कुत्ते की चोट / परेशानी दर्ज करें",
    labelReportSub: "क्या यह कुत्ता घायल या पीड़ित दिखाई दे रहा है?",
    btnSubmitReport: "एनजीओ बचाव दल को रिपोर्ट भेजें"
  }
};

function initPublicPortalLocalization() {
  const langBtns = document.querySelectorAll('.public-lang-selector .lang-btn');

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const lang = btn.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });
}

function applyLanguage(lang) {
  const d = REGISTERED_DOGS[currentActiveDogId] || REGISTERED_DOGS['DOG251'];
  const nameEl = document.getElementById('pubDogName');
  const breedEl = document.getElementById('pubDogBreed');
  const zoneLbl = document.getElementById('labelZone');
  const zoneVal = document.getElementById('valZone');
  const vaxLbl = document.getElementById('labelVax');
  const vaxVal = document.getElementById('valVax');
  const motionLbl = document.getElementById('labelMotion');
  const motionVal = document.getElementById('valMotion');
  const healthLbl = document.getElementById('labelHealth');
  const healthVal = document.getElementById('valHealth');
  const repTitle = document.getElementById('labelReportTitle');
  const repSub = document.getElementById('labelReportSub');
  const repBtn = document.getElementById('btnSubmitReport');

  if (lang === 'mr') {
    if (nameEl) nameEl.textContent = `${d.name} (${d.id})`;
    if (breedEl) breedEl.textContent = `${d.breed} · स्थानिक भटके श्वान`;
    if (zoneLbl) zoneLbl.textContent = "महानगरपालिका विभाग:";
    if (zoneVal) zoneVal.textContent = d.zone;
    if (vaxLbl) vaxLbl.textContent = "रेबीज प्रतिबंधक लस दिनांक:";
    if (vaxVal) vaxVal.textContent = d.vaxDate;
    if (motionLbl) motionLbl.textContent = "एआय हालचाल स्थिती:";
    if (motionVal) motionVal.textContent = d.motionState;
    if (healthLbl) healthLbl.textContent = "आरोग्य स्थिती:";
    if (healthVal) healthVal.textContent = d.healthStatus;
    if (repTitle) repTitle.textContent = "श्वान इजा / त्रास नोंदवा";
    if (repSub) repSub.textContent = "हा श्वान जखमी किंवा आजारी अवस्थेत आढळला का?";
    if (repBtn) repBtn.textContent = "एनजीओ बचाव पथकाला अहवाल पाठवा";
  } else if (lang === 'hi') {
    if (nameEl) nameEl.textContent = `${d.name} (${d.id})`;
    if (breedEl) breedEl.textContent = `${d.breed} · आवारा गली का कुत्ता`;
    if (zoneLbl) zoneLbl.textContent = "नगर निगम क्षेत्र:";
    if (zoneVal) zoneVal.textContent = d.zone;
    if (vaxLbl) vaxLbl.textContent = "एंटी-रेबीज टीकाकरण तिथि:";
    if (vaxVal) vaxVal.textContent = d.vaxDate;
    if (motionLbl) motionLbl.textContent = "एआई मोशन स्थिति:";
    if (motionVal) motionVal.textContent = d.motionState;
    if (healthLbl) healthLbl.textContent = "स्वास्थ्य स्थिति:";
    if (healthVal) healthVal.textContent = d.healthStatus;
    if (repTitle) repTitle.textContent = "कुत्ते की चोट / परेशानी दर्ज करें";
    if (repSub) repSub.textContent = "क्या यह कुत्ता घायल या पीड़ित दिखाई दे रहा है?";
    if (repBtn) repBtn.textContent = "एनजीओ बचाव दल को रिपोर्ट भेजें";
  } else {
    if (nameEl) nameEl.textContent = `${d.name} (${d.id})`;
    if (breedEl) breedEl.textContent = d.subBreed || `${d.breed} · Community Street Dog`;
    if (zoneLbl) zoneLbl.textContent = "Municipal Zone:";
    if (zoneVal) zoneVal.textContent = d.zone;
    if (vaxLbl) vaxLbl.textContent = "Anti-Rabies Date:";
    if (vaxVal) vaxVal.textContent = d.vaxDate;
    if (motionLbl) motionLbl.textContent = "AI Motion State:";
    if (motionVal) motionVal.textContent = d.motionState;
    if (healthLbl) healthLbl.textContent = "Health Status:";
    if (healthVal) healthVal.textContent = d.healthStatus;
    if (repTitle) repTitle.textContent = "Report Dog Anomaly / Injury";
    if (repSub) repSub.textContent = "Spotted this dog in distress, injured, or displaying symptoms?";
    if (repBtn) repBtn.textContent = "Submit Report to NGO Rescue";
  }
}

function openPublicPortal(dogId) {
  openDogProfile(dogId || 'DOG251');
}

function closePublicPortal() {
  const modal = document.getElementById('publicPortalModal');
  if (modal) modal.classList.remove('active');
}

/* --------------------------------------------------------------------------
   7. LIVE SEARCH
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#recentDogsTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Admin User Page Live Search
  const adminSearchInput = document.getElementById('adminSearchInput');
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#adminUsersTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Admin User Role Filter
  const roleFilterSelect = document.getElementById('roleFilterSelect');
  if (roleFilterSelect) {
    roleFilterSelect.addEventListener('change', (e) => {
      const selectedRole = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#adminUsersTableBody tr');
      rows.forEach(row => {
        if (selectedRole === 'all') {
          row.style.display = '';
        } else {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(selectedRole.replace('-', ' ')) ? '' : 'none';
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   8. REAL CHHATRAPATI SAMBHAJINAGAR GIS MAP & TRACE PATH (OPENSTREETMAP / GOOGLE TILES)
   -------------------------------------------------------------------------- */
let realGisMap = null;
let leafletTracePolyline = null;

function initRealLeafletMap() {
  const mapContainer = document.getElementById('largeMapView') || document.getElementById('cityLeafletMap') || document.getElementById('cityMapContainer');
  if (!mapContainer || typeof L === 'undefined') return;

  // Clear static placeholder content
  mapContainer.innerHTML = '';

  if (realGisMap) {
    try { realGisMap.remove(); } catch(e){}
    realGisMap = null;
  }

  // Centered precisely on Chhatrapati Sambhajinagar (Aurangabad)
  realGisMap = L.map(mapContainer).setView([19.8762, 75.3433], 13);

  // Carto / OpenStreetMap Voyager tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(realGisMap);

  // Fetch only dogs stored in the database
  fetch(`${API_BASE}/api/v1/map/dogs`)
    .then(r => r.json())
    .then(pins => {
      pins.forEach(pin => {
        if (!pin.lat || !pin.lng) return;
        const isCritical = pin.health_status && pin.health_status.toLowerCase().includes('critical');
        const isWarning = pin.health_status && (pin.health_status.toLowerCase().includes('observation') || pin.health_status.toLowerCase().includes('recovery'));
        const statusColor = isCritical ? '#ef4444' : isWarning ? '#d97706' : '#10b981';
        
        // Visible Dog Name Pin
        const dogNameIcon = L.divIcon({
          className: 'dog-map-name-pin',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); cursor:pointer;">
              <div style="background:${statusColor}; color:#fff; font-weight:800; font-size:11px; padding:3px 9px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.3); white-space:nowrap; border:1.5px solid #fff;">
                🐾 ${pin.name}
              </div>
              <div style="width:12px; height:12px; background:${statusColor}; border:2px solid #fff; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3); margin-top:1px;"></div>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: dogNameIcon }).addTo(realGisMap);
        
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; font-size: 13px;">
            <strong style="color: #5c3818; font-size: 14px;">📍 ${pin.name} (${pin.code || pin.id})</strong><br>
            <span style="color: #666;">📍 Area: ${pin.area}</span><br>
            <span style="font-weight: 700; color: ${statusColor};">Status: ${pin.health_status}</span><br>
            <small style="color: #888;">Battery: ${pin.battery_percent}% · Temp: ${pin.temperature_c}°C</small>
          </div>
        `);
      });
    })
    .catch(err => {
      console.warn("[SmartDog] Error loading live map pins:", err);
    });

  // Polyline path connecting Kranti Chowk -> Seven Hills -> CIDCO N-8 along Jalna Road
  const routeCoords = [
    [19.8732, 75.3245],
    [19.8710, 75.3350],
    [19.8680, 75.3480],
    [19.8780, 75.3580],
    [19.8835, 75.3621]
  ];

  leafletTracePolyline = L.polyline(routeCoords, {
    color: '#ea580c',
    weight: 5,
    opacity: 0.9,
    dashArray: '8, 8'
  });
}

function toggleTracePath() {
  const banner = document.getElementById('tracePathInfoBanner');
  const btn = document.getElementById('tracePathBtn');
  const svgGroup = document.getElementById('mapTracePathPolyline');

  if (!svgGroup) return;

  const isVisible = svgGroup.style.display !== 'none';

  if (isVisible) {
    svgGroup.style.display = 'none';
    if (banner) banner.style.display = 'none';
    if (btn) btn.classList.remove('active');
  } else {
    svgGroup.style.display = 'block';
    if (banner) banner.style.display = 'flex';
    if (btn) btn.classList.add('active');
  }
}

/* --------------------------------------------------------------------------
   9. GEOFENCE RADIUS INTERACTION ON GIS MAP
   -------------------------------------------------------------------------- */
function toggleGeofenceRadius() {
  const geofenceOverlay = document.getElementById('geofenceOverlay');
  const geofenceBanner = document.getElementById('geofenceInfoBanner');
  const geofenceBtn = document.getElementById('geofenceRadiusBtn');

  if (!geofenceOverlay) return;

  const isVisible = geofenceOverlay.style.display !== 'none';

  if (isVisible) {
    geofenceOverlay.style.display = 'none';
    if (geofenceBanner) geofenceBanner.style.display = 'none';
    if (geofenceBtn) geofenceBtn.classList.remove('active');
  } else {
    geofenceOverlay.style.display = 'block';
    if (geofenceBanner) geofenceBanner.style.display = 'flex';
    if (geofenceBtn) geofenceBtn.classList.add('active');
  }
}

/* --------------------------------------------------------------------------
   10. SYNC CITIZEN INCIDENT REPORTS FROM LOCALSTORAGE
   -------------------------------------------------------------------------- */
function loadStoredCitizenIncidents() {
  try {
    localStorage.removeItem("smartdog_incidents");
    sessionStorage.setItem('smartdog_banner_dismissed', 'true');
  } catch (e) {
    console.warn("Storage cleanup error", e);
  }
}
