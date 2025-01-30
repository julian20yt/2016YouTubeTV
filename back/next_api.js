const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to fetch the access token from a file (if it exists)
async function getAccessToken() {
    const tokenFilePath = path.join(__dirname, 'token', 'oauth_token.json');
    if (!fs.existsSync(tokenFilePath)) {
        console.log('OAuth token file not found. Proceeding without the access token.');
        return null; // Return null if the token file is not found
    }

    const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf-8'));
    const { access_token } = tokenData;

    if (!access_token) {
        console.log('No access token found in oauth_token.json. Proceeding without the access token.');
        return null; // Return null if the access token is not found
    }

    return access_token;
}

async function fetchNextData(videoId) {
    const apiKey = 'AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8';
    const apiUrl = `https://www.googleapis.com/youtubei/v1/next?key=${apiKey}`;

    const params = "qgMCZGG6AwoI5tiC0qjb9sRrugMKCNPa26_4mbGDJboDCgjYjIz7k73C8X26AwsIsuTT3PDW45rJAboDCgj_neig0riToyG6AwsI4Ifex42A0rbBAboDCwiBv8K9jND2_LkBugMLCJ6Oxdqf5r_QugG6AwsIiLTcqYLIvozQAboDCgi54P_p4OqE13m6AwsIkNCS1LL";

    if (!params || params.trim() === "") {
        throw new Error('"params" must be a non-empty string.');
    }

    const postData = {
        context: {
            client: {
                clientName: 'TVHTML5',
                clientVersion: '5.20150715',
                screenWidthPoints: 600,
                screenHeightPoints: 275,
                screenPixelDensity: 2,
                theme: 'CLASSIC',
                webpSupport: false,
                acceptRegion: 'US',
                acceptLanguage: 'en-US',
            },
            user: {
                enableSafetyMode: false,
            },
        },
        params: params, 
        videoId: videoId, 
    };

    try {
        console.log('Sending request to YouTube /next API with payload:', postData);

        const accessToken = await getAccessToken();

        const headers = {
            'Content-Type': 'application/json',
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.post(apiUrl, postData, { headers });

        console.log('Received response from YouTube /next API.');

        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFilePath = path.join(logsDir, `next-response-${timestamp}.json`);

        fs.writeFileSync(logFilePath, JSON.stringify(response.data, null, 2), 'utf-8');

        console.log('Response saved to:', logFilePath);

        return response.data;
    } catch (error) {
        console.error('Error fetching next data:', error.message);

        if (error.response && error.response.data) {
            console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
        }

        throw new Error('Failed to fetch data from YouTube /next API.');
    }
}

module.exports = { fetchNextData };
