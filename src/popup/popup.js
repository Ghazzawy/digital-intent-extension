/**
 * Digital Intent Companion - Popup Script
 * Manages popup UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Step 1: Get the current tab information
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = currentTab.url;
    
    console.log('Current tab URL:', url);
    
    // Display the URL
    document.getElementById('siteUrl').textContent = extractDomain(url);
    
    // Step 2: Detect the category based on the site classification
    const category = detectCategory(url);
    document.getElementById('siteCategory').textContent = `Category: ${category}`;
  });

  // Step 3: Update time display with REAL elapsed time
  updateTimeDisplay();

  // Step 4: Button click handlers
  document.getElementById('toggleBtn').addEventListener('click', () => {
    alert('Toggle button clicked! (Feature coming soon)');
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    alert('Settings button clicked! (Feature coming soon)');
  });
});

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
function detectCategory(url) {
  // Get the domain
  const domain = extractDomain(url);
  
  // Site classifications (from data/site-classification.json)
  const categories = {
    'social': ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'tiktok.com'],
    'education': ['coursera.org', 'udemy.com', 'khanacademy.org', 'github.com', 'stackoverflow.com', 'wikipedia.org'],
    'entertainment': ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'hulu.com'],
    'productivity': ['gmail.com', 'google.com', 'notion.so', 'trello.com', 'asana.com'],
    'news': ['bbc.com', 'cnn.com', 'nytimes.com', 'bbc.co.uk']
  };

  // Check which category the domain belongs to
  for (const [category, sites] of Object.entries(categories)) {
    if (sites.some(site => domain.includes(site))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return 'Other';
}

/**
 * Update time display - Get start time from storage and update every second
 */
function updateTimeDisplay() {
  console.log('updateTimeDisplay() called');
  
  // Get the start time we saved in storage
  chrome.storage.local.get(['siteStartTime'], (result) => {
    console.log('Storage result:', result);
    
    let startTime = result.siteStartTime;
    console.log('Retrieved startTime:', startTime);
    
    // If start time doesn't exist, save it NOW
    if (!startTime) {
      startTime = new Date().getTime();
      chrome.storage.local.set({ 'siteStartTime': startTime });
      console.log('First visit - saved new start time:', startTime);
    }
    
    // Update time display every 1 second (1000 milliseconds)
    const intervalId = setInterval(() => {
      const currentTime = new Date().getTime();
      const minutes = calculateElapsedMinutes(startTime, currentTime);
      console.log('Updating - CurrentTime:', currentTime, 'StartTime:', startTime, 'Minutes:', minutes);
      document.getElementById('timeDisplay').textContent = minutes + ' min';
    }, 1000);
    
    console.log('Interval started with ID:', intervalId);
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