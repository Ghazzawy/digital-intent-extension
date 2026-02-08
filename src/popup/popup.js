/**
 * Digital Intent Companion - Popup Script
 * Manages popup UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Load settings first, then initialize the popup UI and timer
  loadSettings(() => {
    loadCategories(() => {
      // Step 1: Get the current tab information
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;

        console.log('Current tab URL:', url);

        // Display the URL
        document.getElementById('siteUrl').textContent = extractDomain(url);

        // Step 2: Detect the category based on the site classification
        const categoryLabel = detectCategoryLabel(url);
        document.getElementById('siteCategory').textContent = `Category: ${categoryLabel}`;

        // Step 3: Update time display with REAL elapsed time (pass URL)
        updateTimeDisplay(url);
      });
    });
  });

  // Step 4: Button click handlers
  document.getElementById('toggleBtn').addEventListener('click', () => {
    showToast('Toggle button clicked! (Feature coming soon)');
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    openSettings();
  });

  // Step 5: Reset button handler
  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      const currentTab=tabs[0];
      const url=currentTab.url;
      const domain=extractDomain(url);
      const storageKey='siteStartTime_'+domain;
      const reminderKey='reminderSent_'+domain;
        chrome.storage.local.remove([storageKey, reminderKey], () => {
          console.log('Reset timer for:', domain);
          // Reset the UI display immediately
          document.getElementById('timeDisplay').textContent = '0 min';
          // Notify the user (non-blocking)
            showToast(`Timer reset for ${domain}!`);
          // Reset in-memory reminder flag and restart the timer for this site immediately
          sentReminders[domain] = false;
          updateTimeDisplay(url);
        });
    })
    // Code will go here
  });
});

// Track the active interval so we can clear/restart it when needed
let currentIntervalId = null;
let currentDomain = null;
let toastTimeoutId = null;
let categoriesData = null;
// User-configurable settings (loaded from storage)
let userSettings = {
  remindersEnabled: true,
  reminderInterval: 10,
  enabledCategories: { social: true, education: true, entertainment: true, productivity: true, news: true }
};
// In-memory map of reminders already sent per domain
let sentReminders = {};

/**
 * Show a non-blocking toast notification in the popup
 */
function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) {
    // Fallback to alert if toast element is missing
    alert(message);
    return;
  }
  // Clear any existing timeout so multiple toasts replace cleanly
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
    toastTimeoutId = null;
  }
  toast.textContent = message;
  toast.classList.add('visible');
  toast.focus && toast.focus();
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove('visible');
    toastTimeoutId = null;
  }, duration);
}

/**
 * Extract domain name from URL
 * Example: https://www.youtube.com/watch?v=123 → youtube.com
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return 'Unknown';
  }
}

/**
 * Detect category from site classification JSON
 */
function loadCategories(cb) {
  const url = chrome.runtime.getURL('data/site-classification.json');
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      categoriesData = data;
    })
    .catch((error) => {
      console.warn('Failed to load site categories:', error);
      categoriesData = null;
    })
    .finally(() => {
      if (typeof cb === 'function') cb();
    });
}

function getCategoriesSource() {
  if (categoriesData && categoriesData.categories) return categoriesData.categories;
  return null;
}

function detectCategoryKey(url) {
  const domain = extractDomain(url);
  const source = getCategoriesSource();

  if (source) {
    for (const [categoryKey, info] of Object.entries(source)) {
      const sites = info && info.sites ? info.sites : [];
      if (sites.some(site => domain.includes(site))) return categoryKey;
    }
  }

  // Fallback if JSON fails to load
  const fallback = {
    social: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'tiktok.com'],
    education: ['coursera.org', 'udemy.com', 'khanacademy.org', 'github.com', 'stackoverflow.com', 'wikipedia.org'],
    entertainment: ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'hulu.com'],
    productivity: ['gmail.com', 'google.com', 'notion.so', 'trello.com', 'asana.com'],
    news: ['bbc.com', 'cnn.com', 'nytimes.com', 'bbc.co.uk']
  };

  for (const [categoryKey, sites] of Object.entries(fallback)) {
    if (sites.some(site => domain.includes(site))) return categoryKey;
  }

  return 'other';
}

function detectCategoryLabel(url) {
  const key = detectCategoryKey(url);
  const source = getCategoriesSource();
  if (source && source[key] && source[key].label) return source[key].label;
  if (key === 'other') return 'Other';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Update time display - Get start time from storage and update every second
 * Now with per-site tracking!
 */
function updateTimeDisplay(url) {
  console.log('updateTimeDisplay() called for URL:', url);
  
  // Create a unique key for this site
  const domain = extractDomain(url);
  const storageKey = 'siteStartTime_' + domain;
  
  console.log('Using storage key:', storageKey);
  
  // Get the start time we saved in storage for THIS specific site
  chrome.storage.local.get([storageKey], (result) => {
    console.log('Storage result for', domain, ':', result);

    let startTime = result[storageKey];
    console.log('Retrieved startTime for', domain, ':', startTime);

    // If start time doesn't exist, save it NOW
    if (!startTime) {
      startTime = new Date().getTime();
      const storageObj = {};
      storageObj[storageKey] = startTime;
      chrome.storage.local.set(storageObj);
      console.log('First visit to', domain, '- saved new start time:', startTime);
    }

    // If an interval is already running, clear it before starting a new one
    if (currentIntervalId) {
      clearInterval(currentIntervalId);
      currentIntervalId = null;
      console.log('Cleared previous interval');
    }

    // Remember current domain so reset can restart the correct timer
    currentDomain = domain;

    // Load whether a reminder has already been sent for this domain
    const reminderKey = 'reminderSent_' + domain;
    chrome.storage.local.get([reminderKey], (r) => {
      sentReminders[domain] = !!r[reminderKey];

      // Update time display every 1 second (1000 milliseconds)
      currentIntervalId = setInterval(() => {
        const currentTime = new Date().getTime();
        const minutes = calculateElapsedMinutes(startTime, currentTime);
        console.log('Updating', domain, '- CurrentTime:', currentTime, 'StartTime:', startTime, 'Minutes:', minutes);
        document.getElementById('timeDisplay').textContent = minutes + ' min';

        // Reminder logic using loaded userSettings
        if (userSettings.remindersEnabled) {
          const categoryKey = detectCategoryKey(url);
          const enabled = userSettings.enabledCategories[categoryKey];
          if (enabled && !sentReminders[domain] && minutes >= userSettings.reminderInterval) {
            // Send reminder
            showToast(`Reminder: ${domain} — ${minutes} min spent`);
            sentReminders[domain] = true;
            const obj = {};
            obj[reminderKey] = true;
            chrome.storage.local.set(obj);
          }
        }
      }, 1000);

      console.log('Interval started with ID:', currentIntervalId);
    });
  });
}

/**
 * Calculate elapsed minutes from start time to current time
 */
function calculateElapsedMinutes(startTime, currentTime) {
  let millisecondsPassed = currentTime - startTime;
  let secondsPassed = millisecondsPassed / 1000;
  let minutesPassed = secondsPassed / 60;
  return Math.floor(minutesPassed);
}

/**
 * Settings UI helpers
 */
function openSettings() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  panel.style.display = 'block';
  panel.setAttribute('aria-hidden', 'false');
  // populate UI from userSettings
  document.getElementById('remindersEnabled').checked = !!userSettings.remindersEnabled;
  document.getElementById('reminderInterval').value = userSettings.reminderInterval || 10;
  const boxes = document.querySelectorAll('.category-checkbox');
  boxes.forEach(b => {
    const cat = b.getAttribute('data-cat');
    b.checked = !!userSettings.enabledCategories[cat];
  });
}

function closeSettings() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  panel.style.display = 'none';
  panel.setAttribute('aria-hidden', 'true');
}

function loadSettings(cb) {
  chrome.storage.local.get(['remindersEnabled','reminderInterval','enabledCategories'], (res) => {
    if (typeof res.remindersEnabled !== 'undefined') userSettings.remindersEnabled = res.remindersEnabled;
    if (typeof res.reminderInterval !== 'undefined') userSettings.reminderInterval = res.reminderInterval;
    if (typeof res.enabledCategories !== 'undefined') userSettings.enabledCategories = res.enabledCategories;
    // ensure defaults
    userSettings.reminderInterval = userSettings.reminderInterval || 10;
    userSettings.enabledCategories = userSettings.enabledCategories || { social: true, education: true, entertainment: true, productivity: true, news: true };
    console.log('Loaded settings', userSettings);
    if (typeof cb === 'function') cb();
  });
}

function saveSettingsFromUI() {
  const enabled = document.getElementById('remindersEnabled').checked;
  const interval = parseInt(document.getElementById('reminderInterval').value, 10) || 10;
  const boxes = document.querySelectorAll('.category-checkbox');
  const cats = {};
  boxes.forEach(b => { cats[b.getAttribute('data-cat')] = !!b.checked; });
  userSettings.remindersEnabled = enabled;
  userSettings.reminderInterval = interval;
  userSettings.enabledCategories = cats;
  chrome.storage.local.set({ remindersEnabled: enabled, reminderInterval: interval, enabledCategories: cats }, () => {
    showToast('Settings saved');
    closeSettings();
  });
}

// Wire settings buttons
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveSettingsFromUI);
  if (closeBtn) closeBtn.addEventListener('click', closeSettings);
});
