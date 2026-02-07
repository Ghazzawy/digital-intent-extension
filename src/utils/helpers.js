/**
 * Digital Intent Companion - Helper Utilities
 * Shared utility functions for the extension
 */

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string} - Domain name
 */
function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
    return null;
  }
}

/**
 * Format timestamp to readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Store data in chrome.storage.local
 * @param {object} data - Data to store
 * @returns {Promise}
 */
function storeData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Retrieve data from chrome.storage.local
 * @param {string|array} keys - Key(s) to retrieve
 * @returns {Promise}
 */
function getData(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDomainFromUrl,
    formatTimestamp,
    storeData,
    getData
  };
}
