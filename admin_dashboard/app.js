/* ==========================================================================
   SMARTDOG IDENTIFICATION SYSTEM - APPLICATION LOGIC
   Aurangabad Municipal Corporation - Smart Street Dog IoT & AI System
   ========================================================================== */

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
});

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
    nextBtn.addEventListener('click', () => {
      if (currentStep < 5) {
        currentStep++;
        updateStepUI();
      } else {
        // Final submit
        addNewDogRecord();
        currentStep = 1;
        updateStepUI();
        alert('Dog registered successfully into Aurangabad Municipal Database!');
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

  // Photo Input Preview
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          photoPreviewImg.src = event.target.result;
          photoPreviewContainer.style.display = 'block';
          dropzone.style.display = 'none';
        };
        reader.readAsDataURL(file);
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

function addNewDogRecord() {
  const dogName = document.getElementById('regDogName').value || 'Tommy';
  const breed = document.getElementById('regBreed').value || 'Indian Pariah';
  const area = document.getElementById('regArea').value || 'N-8 CIDCO';
  const newId = 'DOG' + Math.floor(252 + Math.random() * 50);

  const tbody = document.getElementById('recentDogsTableBody');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="dog-table-cell">
          <img src="assets/dog_moti.png" class="dog-table-avatar" alt="Dog photo">
          <strong>${dogName}</strong>
        </div>
      </td>
      <td><span class="dog-id-pill">${newId}</span></td>
      <td>${breed}</td>
      <td>${area}</td>
      <td><span class="status-indicator healthy">● Healthy</span></td>
      <td><button class="btn-tag-xs" onclick="openQrModal('${newId}', '${dogName}', '${breed}', '${area}')">View QR Tag</button></td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
  }
}

/* --------------------------------------------------------------------------
   4. MAP INTERACTIONS
   -------------------------------------------------------------------------- */
function initMapInteractions() {
  const pins = document.querySelectorAll('.dog-pin');
  const popup = document.getElementById('mapPopupCard');
  const closeBtn = document.getElementById('closeMapPopup');
  const statusFilter = document.getElementById('mapStatusFilter');

  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const dogId = pin.getAttribute('data-dog');
      const name = pin.getAttribute('data-name');
      const status = pin.getAttribute('data-status');
      const area = pin.getAttribute('data-area');
      const isCritical = pin.classList.contains('critical-pin');
      const isWarning = pin.classList.contains('warning-pin');

      document.getElementById('popDogId').textContent = dogId;
      document.getElementById('popDogName').textContent = `${name} (${pin.classList.contains('healthy-pin') ? 'Indian Pariah' : 'Stray Dog'})`;
      document.getElementById('popDogArea').textContent = `📍 ${area}`;
      document.getElementById('popDogStatusTag').textContent = isCritical ? 'Critical' : (isWarning ? 'Warning' : 'Healthy');
      document.getElementById('popDogStatusTag').className = `status-badge ${isCritical ? 'critical' : (isWarning ? 'warning' : 'healthy')}`;

      popup.style.display = 'block';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
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

function openQrModal(dogId, dogName, breed, area) {
  const modal = document.getElementById('qrModal');
  document.getElementById('qrDogTitle').textContent = `${dogId} - ${dogName}`;
  document.getElementById('qrDogMeta').textContent = `${breed} · ${area}`;
  modal.classList.add('active');
}

function closeQrModal() {
  document.getElementById('qrModal').classList.remove('active');
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
  const t = translations[lang] || translations.en;
  document.getElementById('pubDogName').textContent = t.name;
  document.getElementById('pubDogBreed').textContent = t.breed;
  document.getElementById('labelZone').textContent = t.labelZone;
  document.getElementById('valZone').textContent = t.valZone;
  document.getElementById('labelVax').textContent = t.labelVax;
  document.getElementById('valVax').textContent = t.valVax;
  document.getElementById('labelMotion').textContent = t.labelMotion;
  document.getElementById('valMotion').textContent = t.valMotion;
  document.getElementById('labelHealth').textContent = t.labelHealth;
  document.getElementById('valHealth').textContent = t.valHealth;
  document.getElementById('labelReportTitle').textContent = t.labelReportTitle;
  document.getElementById('labelReportSub').textContent = t.labelReportSub;
  document.getElementById('btnSubmitReport').textContent = t.btnSubmitReport;
}

function openPublicPortal(dogId) {
  document.getElementById('publicPortalModal').classList.add('active');
}

function closePublicPortal() {
  document.getElementById('publicPortalModal').classList.remove('active');
}

function trackDogOnMap() {
  closePublicPortal();
  window.location.href = 'city-map.html';
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
  const mapContainer = document.getElementById('cityMapContainer');
  if (!mapContainer || typeof L === 'undefined') return;

  // Clear static placeholder content
  mapContainer.innerHTML = '';

  // Centered precisely on Chhatrapati Sambhajinagar (Aurangabad)
  realGisMap = L.map('cityMapContainer').setView([19.8762, 75.3433], 13);

  // Carto / OpenStreetMap Voyager tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(realGisMap);

  // Real Chhatrapati Sambhajinagar Municipal Collar Pins
  const collarPins = [
    { id: 'DOG042', name: 'Moti', lat: 19.8732, lng: 75.3245, area: 'Kranti Chowk', status: 'CRITICAL: Distress Bark' },
    { id: 'DOG251', name: 'Tommy', lat: 19.8835, lng: 75.3621, area: 'CIDCO N-8 (Prozone)', status: 'HEALTHY: Active' },
    { id: 'DOG117', name: 'Sheru', lat: 19.8450, lng: 75.2280, area: 'Waluj MIDC Sector 3', status: 'WARNING: High Temp' },
    { id: 'DOG249', name: 'Max', lat: 19.8680, lng: 75.3480, area: 'Seven Hills / Garkheda', status: 'HEALTHY: Active' },
    { id: 'DOG143', name: 'Simba', lat: 19.8920, lng: 75.3180, area: 'Delhi Gate / Begumpura', status: 'HEALTHY' },
    { id: 'DOG099', name: 'Tyson', lat: 19.8600, lng: 75.3200, area: 'Railway Station Road', status: 'NORMAL' },
    { id: 'DOG089', name: 'Kalu', lat: 19.8400, lng: 75.3350, area: 'Satara Parisar (Beed Bypass)', status: 'WARNING: Limping' }
  ];

  collarPins.forEach(pin => {
    const marker = L.marker([pin.lat, pin.lng]).addTo(realGisMap);
    marker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; font-size: 13px;">
        <strong style="color: #5c3818; font-size: 14px;">📍 ${pin.name} (${pin.id})</strong><br>
        <span style="color: #666;">📍 ${pin.area}</span><br>
        <span style="font-weight: 700; color: ${pin.status.includes('CRITICAL') ? '#ef4444' : pin.status.includes('WARNING') ? '#d97706' : '#10b981'};">Status: ${pin.status}</span><br>
        <small style="color: #888;">Chhatrapati Sambhajinagar CSMC Collar</small>
      </div>
    `);
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
