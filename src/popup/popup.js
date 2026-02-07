/**
 * Digital Intent Companion - Popup Script
 * Manages popup UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  
  // Get current tab information
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    console.log('Current tab:', currentTab.url);
  });
});
