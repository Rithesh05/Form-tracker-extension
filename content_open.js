// This script runs on the main page of a Google Form.
// It sends a message to the background script to trigger the "targeted" notification.

chrome.runtime.sendMessage({ type: 'FORM_OPENED' });
