// This script listens for messages from the content scripts.
console.log('Background script started.');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    if (message.type === 'FORM_OPENED') {
        // Notification logic has been removed.
        // This block is intentionally left empty.
    } else if (message.type === 'FORM_SUBMITTED') {
        const formTitle = message.payload.title || 'Unknown Form';

        // Get the user's email using the identity API.
        chrome.identity.getProfileUserInfo({ 'accountStatus': 'ANY' }, (userInfo) => {
            let userEmail = 'Email Not Found';
            if (chrome.runtime.lastError) {
                console.error('Could not retrieve email. Error:', chrome.runtime.lastError.message);
            } else if (userInfo && userInfo.email) {
                userEmail = userInfo.email;
            }

            // Prepare the data for the backend.
            const submissionData = {
                gmail: userEmail,
                title: formTitle,
                timestamp: new Date().toISOString()
            };

            // Send the data to your server.
            sendDataToServer(submissionData);
        });
    }
    // Return true to indicate you wish to send a response asynchronously.
    return true;
});

/**
 * Sends the collected submission data to your backend server.
 * @param {object} data The submission data to send.
 */
async function sendDataToServer(data) {
    console.log('Sending data to backend:', data);
    try {
        const response = await fetch('https://chrome-extension-of-forms.onrender.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Backend response:', result);

    } catch (error) {
        console.error('❌ Failed to send data to backend:', error);
    }
}

// The showNotification function has been completely removed.
