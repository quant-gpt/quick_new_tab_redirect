// Copyright (c) 2025 Quantify Labs
// This source code is licensed under the MIT License.

// newtab.js
// This script runs when a new tab is opened and redirects based on stored preferences.

chrome.storage.local.get({ t: null, i: false }, (stored) => {
  const targetURL = stored.t;     // The URL to redirect to
  const isHTTP = stored.i;        // Whether the URL is a standard http/https

  if (!targetURL) return;         // Exit if nothing is set

  // Faster method: direct browser redirect
  if (isHTTP) {
    location.replace(targetURL);
  } else {
    // Use Chrome tabs API for chrome:// or other special pages
    chrome.tabs.update({ url: targetURL });
  }
});
