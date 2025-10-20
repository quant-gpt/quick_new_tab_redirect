// Copyright (c) 2025 Quantify Labs
// This source code is licensed under the MIT License.

// options.js
// This script handles the logic for saving and restoring redirect settings in the options page.

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("redirectURL");
  const statusMessage = document.getElementById("statusMessage");

  // Toggle the floating status message with the correct styling.
  const showStatus = (message, type) => {
    statusMessage.textContent = message;
    statusMessage.className = type ? `status ${type}` : "status";
  };

  // Ensure the URL has a protocol and optionally append .com for quick shortcuts.
  const normalizeUrl = (rawValue, options = {}) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return "";

    const hasScheme = /^[a-zA-Z][\w+\-.]*:/.test(trimmed);
    if (hasScheme) {
      if (options.appendDotCom) {
        try {
          const parsed = new URL(trimmed);
          const hostnameNeedsDotCom =
            (parsed.protocol === "http:" || parsed.protocol === "https:") &&
            parsed.hostname &&
            !parsed.hostname.includes(".") &&
            /^[a-z0-9-]+$/i.test(parsed.hostname);

          if (hostnameNeedsDotCom) {
            parsed.hostname = `${parsed.hostname}.com`;
            return parsed.toString();
          }
        } catch (error) {
          // Fall through and let validation handle invalid URLs later.
        }
      }
      return trimmed;
    }

    let candidate = `https://${trimmed}`;

    if (
      options.appendDotCom &&
      /^[a-z0-9-]+$/i.test(trimmed) &&
      !trimmed.includes(".")
    ) {
      candidate = `https://${trimmed}.com`;
    }

    return candidate;
  };

  // Validate the final URL and return the normalized value plus protocol hint.
  const validateUrl = (rawValue, options = {}) => {
    const normalized = normalizeUrl(rawValue, options);
    const url = normalized.trim();

    if (!url) {
      showStatus("Please enter a URL before saving.", "error");
      return null;
    }

    try {
      const parsed = new URL(url);
      const allowedProtocols = [
        "http:",
        "https:",
        "chrome:",
        "edge:",
        "file:",
        "about:",
        "chrome-extension:"
      ];

      if (!allowedProtocols.includes(parsed.protocol)) {
        showStatus("That URL uses an unsupported scheme.", "error");
        return null;
      }

      const isHTTP = parsed.protocol === "http:" || parsed.protocol === "https:";
      return { url: parsed.href, isHTTP };
    } catch (error) {
      showStatus("Enter a fully qualified and valid URL.", "error");
      return null;
    }
  };

  // Persist the URL and update the UI after successful validation.
  const saveSettings = (options = {}) => {
    const result = validateUrl(urlInput.value, options);
    if (!result) {
      return;
    }

    urlInput.value = result.url;
    chrome.storage.local.set({ t: result.url, i: result.isHTTP }, () => {
      showStatus("Redirect saved successfully.", "success");
    });
  };

  // Restore previous settings
  chrome.storage.local.get({ t: "", i: false }, (result) => {
    urlInput.value = result.t || "";
  });

  // Clear status message as the user types to avoid stale notices.
  urlInput.addEventListener("input", () => {
    showStatus("", "");
  });

  // Save settings on input blur
  urlInput.addEventListener("blur", saveSettings);

  // Allow pressing Enter to save immediately
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const shouldAppendDotCom = event.shiftKey || event.ctrlKey;
      saveSettings({ appendDotCom: shouldAppendDotCom });
    }
  });
});
