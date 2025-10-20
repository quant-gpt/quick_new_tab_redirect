// Copyright (c) 2025 Quantify Labs
// This source code is licensed under the MIT License.

// Keep options accessible both on install and via toolbar clicks.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
