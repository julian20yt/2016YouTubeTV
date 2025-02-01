const axios = require('axios');

// Function to get lounge token batch
async function getLoungeTokenBatch(screenIds) {
    try {
        // Construct the URL with the screen_ids query parameter
        const url = `https://www.youtube.com/api/lounge/pairing/get_lounge_token_batch?screen_ids=${screenIds}`;

        // Perform the GET request
        const response = await axios.get(url);

        // Process the response
        if (response.data && response.data.screens) {
            response.data.screens.forEach(screen => {
                if (screen.screenId === screenIds) {
                    console.log('Found lounge token:', screen.loungeToken);
                }
            });
        }

        return response.data; // Return the full response
    } catch (error) {
        console.error('Error getting lounge token batch:', error.message);
        throw error;
    }
}


// Function to generate a screen ID by calling the register pairing code endpoint
async function generateScreenId(pairingCode) {
    try {
        const response = await axios.post('https://www.youtube.com/api/lounge/pairing/register_pairing_code', {
            pairing_code: pairingCode
        });
        return response.data;
    } catch (error) {
        console.error('Error generating screen ID:', error.message);
        throw error;
    }
}

// Function to get pairing code
async function getPairingCode(screenId) {
    try {
        const response = await axios.get(`https://www.youtube.com/api/lounge/pairing/get_pairing_code`, {
            params: { screen_id: screenId }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting pairing code:', error.message);
        throw error;
    }
}

// Function to register pairing code
async function registerPairingCode(pairingCode) {
    try {
        const response = await axios.post('https://www.youtube.com/api/lounge/pairing/register_pairing_code', {
            pairing_code: pairingCode
        });
        return response.data;
    } catch (error) {
        console.error('Error registering pairing code:', error.message);
        throw error;
    }
}

// Function to fetch lounge details
async function getLoungeDetails(screenId) {
    try {
        const response = await axios.get(`https://www.youtube.com/api/lounge/pairing/get_lounge_details`, {
            params: { screen_id: screenId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching lounge details:', error.message);
        throw error;
    }
}

module.exports = {
    getLoungeTokenBatch,
    generateScreenId,
    getPairingCode,
    registerPairingCode,
    getLoungeDetails
};
