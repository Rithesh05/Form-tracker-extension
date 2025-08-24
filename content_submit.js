// This script runs on the confirmation page after a Google Form is submitted.
console.log('Google Form Notifier: Submission page detected.');

try {
    let formTitle = 'Unknown Form';

    // Method 1: Get the title from the document's main <title> tag.
    // This is generally more reliable than relying on specific class names.
    if (document.title) {
        // The page title is often "Your Form Name - Google Forms", so we clean it up.
        formTitle = document.title.replace(' - Google Forms', '').trim();
        console.log('Found title from document.title:', formTitle);
    }

    // Fallback Method 2: If the first method fails, try the old class selector just in case.
    if (formTitle === 'Unknown Form') {
        const titleElement = document.querySelector('.freebirdFormviewerViewHeaderTitle');
        if (titleElement) {
            formTitle = titleElement.textContent.trim();
            console.log('Found title using fallback class selector:', formTitle);
        }
    }

    if (formTitle === 'Unknown Form') {
        console.log('Could not find form title using any method. Sending default.');
    }

    // Send the found title (or the default 'Unknown Form') to the background script.
    chrome.runtime.sendMessage({
        type: 'FORM_SUBMITTED',
        payload: {
            title: formTitle
        }
    });

} catch (error) {
    console.error('Error in content_submit.js:', error);
}
