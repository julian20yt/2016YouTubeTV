const fs = require('fs');
const axios = require('axios');
const path = require('path');

const TOKEN_FILE = path.join(__dirname, 'token', 'oauth_token.json');

// Function to read and return the access token from oauth_token.json
async function getAccessToken() {
    if (!fs.existsSync(TOKEN_FILE)) {
        throw new Error('Token file not found. Please authenticate first.');
    }

    const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    const { access_token, expires_in } = tokenData;

    if (expires_in <= 0) {
        throw new Error('Access token has expired.');
    }

    return access_token;
}

async function handleLikeAction(req, res) {
    const { action } = req.params; // 'like', 'removelike', or 'dislike'
    const { videoId } = req.body.target;  // Extract videoId from the 'target' object

    // Log the body to verify the correct structure
    console.log('Incoming request body:', req.body);  // For debugging

    // Validate videoId
    if (!videoId || typeof videoId !== 'string' || !videoId.trim()) {
        return res.status(400).json({
            error: 'Video ID is required and must be a non-empty string.'
        });
    }

    // Validate action
    if (!['like', 'removelike', 'dislike'].includes(action)) {
        return res.status(400).json({
            error: 'Invalid action. Valid actions are "like", "removelike", and "dislike".'
        });
    }

    try {
        const accessToken = await getAccessToken();

        let apiUrl = '';
        switch (action) {
            case 'like':
                apiUrl = 'https://www.youtube.com/youtubei/v1/like/like';
                break;
            case 'removelike':
                apiUrl = 'https://www.youtube.com/youtubei/v1/like/removelike';
                break;
            case 'dislike':
                apiUrl = 'https://www.youtube.com/youtubei/v1/like/dislike';
                break;
        }

        const requestBody = {
            context: {
                client: {
                    clientName: "TVHTML5",
                    clientVersion: "5.20150715",
                    screenWidthPoints: 1632,
                    screenHeightPoints: 904,
                    screenPixelDensity: 1,
                    theme: "CLASSIC",
                    webpSupport: false,
                    acceptRegion: "US",
                    acceptLanguage: "en-US"
                },
                user: {
                    enableSafetyMode: false
                }
            },
            target: {
                videoId
            }
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            message: `Successfully ${action}d the video.`,
            data: response.data
        });
    } catch (error) {
        console.error('Error performing like action:', error.message);
        res.status(500).json({
            error: 'Failed to perform the like action.',
            details: error.message || 'No additional details available.'
        });
    }
}

async function handleSubscriptionAction(req, res) {
    const { action } = req.params; 
    const { channelIds } = req.body;  

    console.log('Incoming request body:', req.body);  

    // Validate channelIds
    if (!Array.isArray(channelIds) || channelIds.length === 0 || !channelIds[0]) {
        return res.status(400).json({
            error: 'Channel IDs are required and must be a non-empty array.'
        });
    }


    if (!['subscribe', 'unsubscribe'].includes(action)) {
        return res.status(400).json({
            error: 'Invalid action. Valid actions are "subscribe" and "unsubscribe".'
        });
    }

    try {
        const accessToken = await getAccessToken();

        let apiUrl = '';
        switch (action) {
            case 'subscribe':
                apiUrl = 'https://www.youtube.com/youtubei/v1/subscription/subscribe';
                break;
            case 'unsubscribe':
                apiUrl = 'https://www.youtube.com/youtubei/v1/subscription/unsubscribe';
                break;
        }

        const requestBody = {
            context: {
                client: {
                    clientName: "TVHTML5",
                    clientVersion: "5.20150715",
                    screenWidthPoints: 1632,
                    screenHeightPoints: 904,
                    screenPixelDensity: 1,
                    theme: "CLASSIC",
                    webpSupport: false,
                    acceptRegion: "US",
                    acceptLanguage: "en-US"
                },
                user: {
                    enableSafetyMode: false
                }
            },
            target: {
                channelIds 
            }
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({
            message: `Successfully ${action}d the channel.`,
            data: response.data
        });
    } catch (error) {
        console.error('Error performing subscription action:', error.message);
        res.status(500).json({
            error: 'Failed to perform the subscription action.',
            details: error.message || 'No additional details available.'
        });
    }
}

module.exports = function(app) {
    app.post('/api/like/:action', handleLikeAction);  
    app.post('/api/subscription/:action', handleSubscriptionAction);  
};
