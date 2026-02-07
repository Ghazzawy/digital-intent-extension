/**
 * Digital Intent Companion - Content Script
 * Runs on every page visit to collect page information
 */

// Log current hostname when content script loads
const hostname = window.location.hostname;
console.log('Content script loaded on:', hostname);

// Send hostname to service worker
chrome.runtime.sendMessage({
  action: 'logHostname',
  hostname: hostname,
  url: window.location.href,
  timestamp: new Date().toISOString()
});
