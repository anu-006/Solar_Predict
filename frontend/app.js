/**
 * Solar Predict - Full Dashboard Application Controller
 * Handles live slider inputs, SVG animations, tab switching, admin/notification popups,
 * telemetry data table rendering, search filters, and export capabilities.
 */

// Default reference values matching mockup
const DEFAULT_PARAMS = {
  wind: 7.4,
  sunshine: 9.1,
  pressure: 1014,
  radiation: 845,
  temp: 28.6,
  humidity: 62
};

// Application State
let currentParams = { ...DEFAULT_PARAMS };
let activeTab = 'dashboard';

// Sample Historical Telemetry Data from dataset
const SAMPLE_HISTORY_DATA = [
  { datetime: '10.09.2017-08:00', wind: 6.6, sunshine: 0, pressure: 1020.5, radiation: 239.2, temp: 12.1, humidity: 78, prod: 4693.2 },
  { datetime: '20.08.2017-12:00', wind: 6.4, sunshine: 26, pressure: 996.6, radiation: 266.3, temp: -5.3, humidity: 97, prod: 373.0 },
  { datetime: '07.09.2017-14:00', wind: 9.5, sunshine: 49, pressure: 994.6, radiation: 157.8, temp: 3.8, humidity: 52, prod: 9.2 },
  { datetime: '15.06.2017-13:00', wind: 7.4, sunshine: 60, pressure: 1014.2, radiation: 845.0, temp: 28.6, humidity: 62, prod: 1845.7 },
  { datetime: '15.06.2017-12:00', wind: 7.1, sunshine: 58, pressure: 1014.0, radiation: 810.5, temp: 27.9, humidity: 64, prod: 1780.4 },
  { datetime: '15.06.2017-11:00', wind: 6.8, sunshine: 55, pressure: 1013.8, radiation: 720.0, temp: 26.4, humidity: 68, prod: 1590.2 },
  { datetime: '15.06.2017-10:00', wind: 6.2, sunshine: 50, pressure: 1013.5, radiation: 590.0, temp: 24.8, humidity: 72, prod: 1240.0 },
  { datetime: '15.06.2017-09:00', wind: 5.8, sunshine: 42, pressure: 1013.2, radiation: 410.0, temp: 22.5, humidity: 76, prod: 860.5 },
  { datetime: '15.06.2017-08:00', wind: 5.4, sunshine: 30, pressure: 1013.0, radiation: 250.0, temp: 20.1, humidity: 80, prod: 490.0 },
  { datetime: '15.06.2017-14:00', wind: 7.8, sunshine: 57, pressure: 1014.5, radiation: 790.0, temp: 28.9, humidity: 60, prod: 1710.0 },
  { datetime: '15.06.2017-15:00', wind: 8.1, sunshine: 52, pressure: 1014.7, radiation: 650.0, temp: 28.4, humidity: 63, prod: 1420.0 },
  { datetime: '15.06.2017-16:00', wind: 7.9, sunshine: 45, pressure: 1015.0, radiation: 480.0, temp: 27.2, humidity: 67, prod: 1120.0 },
  { datetime: '15.06.2017-17:00', wind: 7.2, sunshine: 32, pressure: 1015.2, radiation: 290.0, temp: 25.5, humidity: 71, prod: 640.0 },
  { datetime: '15.06.2017-18:00', wind: 6.5, sunshine: 15, pressure: 1015.5, radiation: 120.0, temp: 23.8, humidity: 75, prod: 340.0 },
  { datetime: '15.06.2017-19:00', wind: 5.9, sunshine: 0, pressure: 1015.8, radiation: 20.0, temp: 22.0, humidity: 79, prod: 45.0 }
];

// DOM Elements Cache
const elements = {
  // Navigation Tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabViews: document.querySelectorAll('.tab-view'),
  logoHome: document.getElementById('logo-home'),

  // Dropdowns
  userProfileBtn: document.getElementById('user-profile-btn'),
  profileDropdown: document.getElementById('profile-dropdown'),
  notifBtn: document.getElementById('notif-btn'),
  notifDropdown: document.getElementById('notif-dropdown'),
  btnLogout: document.getElementById('btn-logout'),

  // Sliders
  sliderWind: document.getElementById('slider-wind'),
  sliderSunshine: document.getElementById('slider-sunshine'),
  sliderPressure: document.getElementById('slider-pressure'),
  sliderRadiation: document.getElementById('slider-radiation'),
  sliderTemp: document.getElementById('slider-temp'),
  sliderHumidity: document.getElementById('slider-humidity'),

  // Value Badges
  valWind: document.getElementById('val-wind'),
  valSunshine: document.getElementById('val-sunshine'),
  valPressure: document.getElementById('val-pressure'),
  valRadiation: document.getElementById('val-radiation'),
  valTemp: document.getElementById('val-temp'),
  valHumidity: document.getElementById('val-humidity'),

  // KPI Outputs
  displaySystemProd: document.getElementById('display-system-prod'),
  displayDailyForecast: document.getElementById('display-daily-forecast'),
  displayWeather: document.getElementById('display-weather'),

  // Gauge Elements
  gaugeActiveArc: document.getElementById('gauge-active-arc'),
  gaugeNeedle: document.getElementById('gauge-needle'),
  gaugePctLabel: document.getElementById('gauge-pct-label'),

  // 24h Chart Elements
  curvePredicted: document.getElementById('curve-predicted'),
  curveActual: document.getElementById('curve-actual'),
  peakTooltip: document.getElementById('peak-tooltip'),
  tooltipVal: document.getElementById('tooltip-val'),

  // Sidebar Buttons
  btnApply: document.getElementById('btn-apply'),
  btnClear: document.getElementById('btn-clear'),

  // History & Forecast Table/Actions
  historyTableBody: document.getElementById('history-table-body'),
  historySearch: document.getElementById('history-search'),
  btnExportHistory: document.getElementById('btn-export-history'),
  btnExportForecast: document.getElementById('btn-export-forecast'),
  btnSaveSettings: document.getElementById('btn-save-settings')
};

/**
 * Initialize Dashboard
 */
function initDashboard() {
  attachTabNavigation();
  attachDropdownHandlers();
  attachSliderListeners();
  populateHistoricalTable(SAMPLE_HISTORY_DATA);
  attachExportHandlers();
  updateDashboard(currentParams);
}

/**
 * Tab Navigation (Dashboard, Forecasts, Historical Data, Settings)
 */
function attachTabNavigation() {
  elements.navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  if (elements.logoHome) {
    elements.logoHome.addEventListener('click', () => {
      switchTab('dashboard');
    });
  }
}

function switchTab(tabName) {
  activeTab = tabName;

  // Update Navbar Tab Active Class
  elements.navTabs.forEach((tab) => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Switch View Visibility
  elements.tabViews.forEach((view) => {
    if (view.id === `view-${tabName}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  closeAllDropdowns();
}

/**
 * Dropdown Menu Event Handlers (Admin Profile & Notifications)
 */
function attachDropdownHandlers() {
  // Toggle Admin Profile Dropdown
  if (elements.userProfileBtn && elements.profileDropdown) {
    elements.userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = elements.profileDropdown.classList.contains('hidden');
      closeAllDropdowns();
      if (isHidden) {
        elements.profileDropdown.classList.remove('hidden');
        elements.userProfileBtn.classList.add('open');
      }
    });
  }

  // Toggle Notifications Dropdown
  if (elements.notifBtn && elements.notifDropdown) {
    elements.notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = elements.notifDropdown.classList.contains('hidden');
      closeAllDropdowns();
      if (isHidden) {
        elements.notifDropdown.classList.remove('hidden');
      }
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-panel') && !e.target.closest('.user-profile') && !e.target.closest('.notification-btn')) {
      closeAllDropdowns();
    }
  });

  // Admin dropdown menu items
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  dropdownItems.forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      if (action === 'account-settings') {
        switchTab('settings');
      } else {
        alert(`Opening: ${item.querySelector('span').textContent}`);
      }
      closeAllDropdowns();
    });
  });

  if (elements.btnLogout) {
    elements.btnLogout.addEventListener('click', () => {
      alert('Logged out successfully. Reloading session...');
      location.reload();
    });
  }
}

function closeAllDropdowns() {
  if (elements.profileDropdown) elements.profileDropdown.classList.add('hidden');
  if (elements.notifDropdown) elements.notifDropdown.classList.add('hidden');
  if (elements.userProfileBtn) elements.userProfileBtn.classList.remove('open');
}

/**
 * Attach Event Listeners to Sliders and Buttons
 */
function attachSliderListeners() {
  const sliders = [
    { el: elements.sliderWind, key: 'wind', badge: elements.valWind, decimals: 1 },
    { el: elements.sliderSunshine, key: 'sunshine', badge: elements.valSunshine, decimals: 1 },
    { el: elements.sliderPressure, key: 'pressure', badge: elements.valPressure, decimals: 0 },
    { el: elements.sliderRadiation, key: 'radiation', badge: elements.valRadiation, decimals: 0 },
    { el: elements.sliderTemp, key: 'temp', badge: elements.valTemp, decimals: 1 },
    { el: elements.sliderHumidity, key: 'humidity', badge: elements.valHumidity, decimals: 0 }
  ];

  sliders.forEach(({ el, key, badge, decimals }) => {
    if (!el) return;
    el.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      currentParams[key] = val;
      badge.textContent = decimals === 0 ? Math.round(val) : val.toFixed(decimals);
      updateDashboard(currentParams);
    });
  });

  // Apply Button
  if (elements.btnApply) {
    elements.btnApply.addEventListener('click', () => {
      elements.btnApply.textContent = 'Applying...';
      elements.btnApply.style.opacity = '0.7';

      setTimeout(() => {
        updateDashboard(currentParams);
        elements.btnApply.textContent = 'Apply Parameters';
        elements.btnApply.style.opacity = '1';
      }, 250);
    });
  }

  // Clear Button
  if (elements.btnClear) {
    elements.btnClear.addEventListener('click', () => {
      resetToDefaults();
    });
  }

  // Save Settings Button
  if (elements.btnSaveSettings) {
    elements.btnSaveSettings.addEventListener('click', () => {
      elements.btnSaveSettings.textContent = 'Saving...';
      setTimeout(() => {
        elements.btnSaveSettings.textContent = 'Saved Successfully ✓';
        setTimeout(() => {
          elements.btnSaveSettings.textContent = 'Save Changes';
        }, 2000);
      }, 400);
    });
  }
}

/**
 * Reset all parameters to default reference values
 */
function resetToDefaults() {
  currentParams = { ...DEFAULT_PARAMS };

  elements.sliderWind.value = currentParams.wind;
  elements.sliderSunshine.value = currentParams.sunshine;
  elements.sliderPressure.value = currentParams.pressure;
  elements.sliderRadiation.value = currentParams.radiation;
  elements.sliderTemp.value = currentParams.temp;
  elements.sliderHumidity.value = currentParams.humidity;

  elements.valWind.textContent = currentParams.wind.toFixed(1);
  elements.valSunshine.textContent = currentParams.sunshine.toFixed(1);
  elements.valPressure.textContent = Math.round(currentParams.pressure);
  elements.valRadiation.textContent = Math.round(currentParams.radiation);
  elements.valTemp.textContent = currentParams.temp.toFixed(1);
  elements.valHumidity.textContent = Math.round(currentParams.humidity);

  updateDashboard(currentParams);
}

/**
 * Calculate Model Predictions
 */
function calculatePrediction(params) {
  const { wind, sunshine, pressure, radiation, temp, humidity } = params;

  // Base calculation mirroring trained XGBoost characteristics
  const radiationFactor = (radiation / 845) * 1650;
  const sunshineFactor = (sunshine / 9.1) * 220;
  const tempPenalty = (temp - 25) * 3.5;
  const humidityPenalty = (humidity - 50) * 1.5;
  const windCoolingBonus = (wind - 5) * 4.0;

  let peakProduction = radiationFactor + sunshineFactor - tempPenalty - humidityPenalty + windCoolingBonus;
  peakProduction = Math.max(0, Math.min(2000, peakProduction));

  const percentage = Math.round((peakProduction / 2000) * 100);
  const dailyMWh = (peakProduction * 0.0051).toFixed(1);

  let weatherCondition = 'Sunny';
  if (radiation < 300 || humidity > 80) weatherCondition = 'Cloudy';
  else if (radiation < 600 || humidity > 70) weatherCondition = 'Partly Cloudy';
  const weatherText = `${weatherCondition} | ${Math.round(temp)}°C`;

  return {
    peakProduction: peakProduction.toFixed(1),
    percentage,
    dailyMWh,
    weatherText
  };
}

/**
 * Update Dashboard Visualizations
 */
async function updateDashboard(params) {
  let peakVal;
  let weatherCondition = 'Sunny';
  if (params.radiation < 300 || params.humidity > 80) weatherCondition = 'Cloudy';
  else if (params.radiation < 600 || params.humidity > 70) weatherCondition = 'Partly Cloudy';
  let weatherText = `${weatherCondition} | ${Math.round(params.temp)}°C`;

  try {
    const payload = {
      WindSpeed: parseFloat(params.wind),
      Sunshine: parseFloat(params.sunshine),
      AirPressure: parseFloat(params.pressure),
      Radiation: parseFloat(params.radiation),
      AirTemperature: parseFloat(params.temp),
      RelativeAirHumidity: parseFloat(params.humidity)
    };

    const apiUrl = (window.location.protocol.startsWith('http') && (window.location.port === '8000' || !window.location.port))
      ? '/api/predict'
      : 'http://127.0.0.1:8000/api/predict';

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.predicted_power !== undefined) {
        peakVal = parseFloat(data.predicted_power);
      }
    }
  } catch (err) {
    // Fallback to local computation if backend is starting or offline
  }

  if (peakVal === undefined) {
    const result = calculatePrediction(params);
    peakVal = parseFloat(result.peakProduction);
  }

  const percentage = Math.min(100, Math.round((peakVal / 2000) * 100));
  const dailyMWh = (peakVal * 0.0051).toFixed(1);

  // 1. Update KPI Text
  if (elements.displaySystemProd) elements.displaySystemProd.textContent = peakVal.toFixed(1);
  if (elements.displayDailyForecast) elements.displayDailyForecast.textContent = `${dailyMWh} MWh`;
  if (elements.displayWeather) elements.displayWeather.textContent = weatherText;

  // 2. Update Gauge
  updateGauge(percentage);

  // 3. Update 24h Curve
  updateCurveAndTooltip(peakVal);
}

/**
 * Update Semi-Circular Radial Gauge
 */
function updateGauge(percentage) {
  if (elements.gaugePctLabel) elements.gaugePctLabel.textContent = `${percentage}%`;

  const maxDash = 220;
  const progressDash = maxDash - (percentage / 100) * maxDash;

  if (elements.gaugeActiveArc) {
    elements.gaugeActiveArc.style.strokeDashoffset = progressDash;
  }

  const angleRad = Math.PI * (1 - percentage / 100);
  const needleLength = 58;
  const cx = 90;
  const cy = 95;
  const targetX = cx + needleLength * Math.cos(angleRad);
  const targetY = cy - needleLength * Math.sin(angleRad);

  if (elements.gaugeNeedle) {
    elements.gaugeNeedle.setAttribute('x2', targetX.toFixed(1));
    elements.gaugeNeedle.setAttribute('y2', targetY.toFixed(1));
  }
}

/**
 * Update 24h Solar Curve SVG and Tooltip
 */
function updateCurveAndTooltip(peakKw) {
  const baseY = 280;
  const scaleY = 240 / 2000;
  const peakY = Math.max(38, baseY - peakKw * scaleY);

  const dPredicted = `M 55 280 C 140 280 180 270 230 ${Math.min(270, (baseY + peakY * 2.5) / 3.5)} C 280 ${Math.min(250, (baseY + peakY * 4) / 5)} 330 ${peakY + 15} 395 ${peakY} C 460 ${peakY + 20} 500 ${Math.min(250, (baseY + peakY * 4) / 5)} 550 ${Math.min(270, (baseY + peakY * 2.5) / 3.5)} C 600 270 660 280 720 280`;

  if (elements.curvePredicted) {
    elements.curvePredicted.setAttribute('d', dPredicted);
  }

  if (elements.peakTooltip) {
    elements.peakTooltip.setAttribute('transform', `translate(395, ${peakY.toFixed(1)})`);
  }
  if (elements.tooltipVal) {
    elements.tooltipVal.textContent = `${Math.round(peakKw)} kW`;
  }
}

/**
 * Populate Historical Telemetry Table
 */
function populateHistoricalTable(data) {
  if (!elements.historyTableBody) return;

  elements.historyTableBody.innerHTML = '';
  data.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.datetime}</td>
      <td>${row.wind.toFixed(1)}</td>
      <td>${row.sunshine}</td>
      <td>${row.pressure.toFixed(1)}</td>
      <td>${row.radiation.toFixed(1)}</td>
      <td>${row.temp.toFixed(1)}</td>
      <td>${row.humidity}%</td>
      <td class="highlight-prod">${row.prod.toFixed(1)}</td>
    `;
    elements.historyTableBody.appendChild(tr);
  });

  // Search Filter
  if (elements.historySearch) {
    elements.historySearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = SAMPLE_HISTORY_DATA.filter(
        (r) => r.datetime.toLowerCase().includes(q) || r.prod.toString().includes(q)
      );
      populateHistoricalTable(filtered);
    });
  }
}

/**
 * Export Handlers
 */
function attachExportHandlers() {
  // Export Historical CSV
  if (elements.btnExportHistory) {
    elements.btnExportHistory.addEventListener('click', () => {
      let csvContent = 'data:text/csv;charset=utf-8,Date-Hour,WindSpeed,Sunshine,AirPressure,Radiation,AirTemp,Humidity,SystemProduction\n';
      SAMPLE_HISTORY_DATA.forEach((r) => {
        csvContent += `${r.datetime},${r.wind},${r.sunshine},${r.pressure},${r.radiation},${r.temp},${r.humidity},${r.prod}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'solar_power_historical_telemetry.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Export 7-Day Forecast JSON
  if (elements.btnExportForecast) {
    elements.btnExportForecast.addEventListener('click', () => {
      const forecastData = {
        plant: 'Solar Farm #04 (2.0 MWp)',
        generatedAt: new Date().toISOString(),
        forecast: [
          { day: 'Monday', date: '2026-09-01', yieldMWh: 9.4, peakKw: 1845, weather: 'Clear & Sunny' },
          { day: 'Tuesday', date: '2026-09-02', yieldMWh: 8.8, peakKw: 1720, weather: 'Partly Sunny' },
          { day: 'Wednesday', date: '2026-09-03', yieldMWh: 6.9, peakKw: 1350, weather: 'Scattered Clouds' },
          { day: 'Thursday', date: '2026-09-04', yieldMWh: 9.7, peakKw: 1890, weather: 'Clear Sky' },
          { day: 'Friday', date: '2026-09-05', yieldMWh: 8.5, peakKw: 1680, weather: 'Mostly Sunny' },
          { day: 'Saturday', date: '2026-09-06', yieldMWh: 3.8, peakKw: 750, weather: 'Light Rain' },
          { day: 'Sunday', date: '2026-09-07', yieldMWh: 9.9, peakKw: 1920, weather: 'Full Sun' }
        ]
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(forecastData, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', 'solar_7day_forecast.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

// Backend Connection Hook
window.SolarBackend = {
  apiEndpoint: 'http://localhost:8000/api/predict',
  fetchPrediction: async function (parameters) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend server offline, running client model simulator:', err);
      return calculatePrediction(parameters);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);
