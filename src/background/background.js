/**
 * Digital Intent Companion - Service Worker
 * Handles background tasks and event listeners
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Digital Intent Companion installed');
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logHostname') {
    console.log('Content script reported:', request.hostname);
    sendResponse({ status: 'received' });
  }
});
