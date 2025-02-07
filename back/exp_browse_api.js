const fs = require('fs');
const path = require('path');
const axios = require('axios');

const settingsPath = path.join(__dirname, 'settings.json');

let settings;

if (!fs.existsSync(settingsPath)) {
    const defaultSettings = { 
        serverIp: 'localhost',  
        expBrowse: false        
    };
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 4));
    console.log("Created settings.json with default serverIp = localhost and expBrowse = false.");
    settings = defaultSettings;
} else {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

const serverIp = settings.serverIp || "localhost";

async function fetchBrowseData(browseId, authHeader = null) { 
    const apiKey = 'AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8';
    const apiUrl = `https://www.googleapis.com/youtubei/v1/browse?key=${apiKey}`;

    if (browseId == "home") {
        browseId = "FEtopics";
    }

    const postData = {
        context: {
            client: {
                clientName: 'TVHTML5',
                clientVersion: '7.20240701.16.00',
                hl: 'en',
                gl: 'US',
            }
        },
        browseId: browseId
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    if (authHeader) {
        headers['Authorization'] = `Bearer ${authHeader}`;
    }

    try {
        console.log('Sending request to YouTube Browse API with payload:', postData);

        const response = await axios.post(apiUrl, postData, { headers });

        console.log('Received response from YouTube Browse API:', response.data);

        if (response.status !== 200) {
            console.error('Error: Received non-200 status from YouTube API:', response.status);
            return { error: `YouTube API returned status code ${response.status}` };
        }

        const updatedData = convertToV5(response.data);

        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir); 
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFilePath = path.join(logsDir, `browse-response-${timestamp}.json`);
        fs.writeFileSync(logFilePath, JSON.stringify(updatedData, null, 2)); 

        console.log('Updated response saved to log file:', logFilePath);

        return updatedData;
    } catch (error) {
        console.error('Error fetching browse data:', error.message);

        if (error.response) {
            console.error('Error Response:', error.response.data);
            return { error: `Error from YouTube API: ${error.response.data}` };
        } else if (error.request) {
            console.error('No response received:', error.request);
            return { error: 'No response received from YouTube API.' };
        } else {
            console.error('General error:', error.message);
            return { error: `Failed to fetch data from YouTube Browse API: ${error.message}` };
        }
    }
}

function convertToV5(data) {
    console.log('Received Data:', data);

    const sectionListRendererContents = data?.contents?.tvBrowseRenderer?.content?.tvSurfaceContentRenderer?.content?.sectionListRenderer?.contents;

    console.log('sectionListRenderer.contents:', sectionListRendererContents);

    if (Array.isArray(sectionListRendererContents)) {
        sectionListRendererContents.forEach((item, index) => {
            console.log(`Processing Item ${index}:`, item);

            try {
                if (item && item.shelfRenderer) {
                    // Extract text from the shelfHeaderRenderer to use as the title text
                    const headerText = item.shelfRenderer.headerRenderer?.shelfHeaderRenderer?.avatarLockup?.avatarLockupRenderer?.title?.runs?.[0]?.text || "Trending";

                    item.shelfRenderer.title = item.shelfRenderer.title || {
                        runs: [
                            {
                                text: headerText // Use the extracted text from headerRenderer
                            }
                        ]
                    };

                    const horizontalList = item.shelfRenderer.content?.horizontalListRenderer?.items;

                    if (Array.isArray(horizontalList)) {
                        horizontalList.forEach((videoItem, videoIndex) => {
                            if (videoItem.tileRenderer) {

                                const videoId = videoItem.tileRenderer.onSelectCommand?.watchEndpoint?.videoId || "";
                               
                                const thumbnail = {
                                    thumbnails: [
                                        { url: `https://i.ytimg.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
                                        { url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180 },
                                        { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?sqp=-oaymwEXCLwDEPoBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAkg3xb3N0myg-Owh_bJrW1rAXJTg`, width: 444, height: 250 },
                                        { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 },
                                        { url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`, width: 640, height: 480 },
                                        { url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, width: 1920, height: 1080 }
                                    ]
                                };

                                const metadata = videoItem.tileRenderer.metadata?.tileMetadataRenderer || {};

                                const titleText = metadata.title?.simpleText || "Untitled Video";
                                const viewCountText = metadata.lines?.[1]?.lineRenderer?.items?.[0]?.lineItemRenderer?.text?.simpleText || "0 views";
                                const publishedTimeText = metadata.lines?.[1]?.lineRenderer?.items?.[2]?.lineItemRenderer?.text?.simpleText || "Unknown";
                                const lengthText = videoItem.tileRenderer.metadataBadge?.metadataBadgeRenderer?.label || "0:00";
                                
                                const navigationEndpoint = {
                                    clickTrackingParams: "CCsQlDUYACITCMGSzriaguECFddATAgdB1AO4jILZy10b3BpYy10cnZaD0ZFd2hhdF90b193YXRjaA==",
                                    watchEndpoint: {
                                        videoId: videoId,
                                        params: "6gILT3hvT1NvaG1hYWfqAgt1a3BxYlNYdFZMVeoCC1RjTUJGU0dWaTFj6gILb3IyR1FmZmpuYWvqAgtDLW8wUmdpWFFmQeoCC1VtaFhoVG1QMGEw6gILZm95dWZENTJhb2fqAgtDa3pqRzRoNko0UeoCCzk3dDdYal9pQnYw6gILeHF1bXBYazNCYk3qAgtvSjJINURPVmxKZ-oCC3lhYndacEFmOFFz6gILbVBYRGwtSFJqbGvqAgs5Qk5WRzZNZHFaMPoCCFRyZW5kaW5n"
                                    }
                                };

                                const shortBylineText = {
                                    runs: [
                                        {
                                            text: "The Slow Mo Guys",
                                            navigationEndpoint: {
                                                clickTrackingParams: "CCsQlDUYACITCMGSzriaguECFddATAgdB1AO4g==",
                                                browseEndpoint: {
                                                    browseId: "UCUK0HBIBWgM2c4vsPhkYY4w",
                                                    canonicalBaseUrl: "/user/theslowmoguys"
                                                }
                                            }
                                        }
                                    ]
                                };
                                
                                videoItem.gridVideoRenderer = {
                                    videoId: videoId,
                                    thumbnail: thumbnail,
                                    title: { runs: [{ text: titleText }] },
                                    viewCountText: { runs: [{ text: viewCountText }] },
                                    publishedTimeText: { runs: [{ text: publishedTimeText }] },
                                    lengthText: {
                                        runs: [{ text: lengthText }],
                                        accessibility: { accessibilityData: { label: lengthText } }
                                    },
                                    navigationEndpoint: navigationEndpoint,
                                    shortBylineText: shortBylineText
                                };

                                delete videoItem.tileRenderer; 

                                console.log(`Converted tileRenderer to gridVideoRenderer in Item ${index}, Video ${videoIndex}, VideoId: ${videoId}`);
                            } else {
                                videoItem.gridVideoRenderer = {};
                            }
                        });
                    }

                    console.log(`Processed shelfRenderer for Item ${index}: ${headerText}`);
                } else {
                    console.warn(`Item ${index} is undefined or malformed.`);
                }
            } catch (err) {
                console.error(`Error processing item ${index}:`, err);
            }
        });
    } else {
        console.warn('sectionListRenderer.contents is missing or not an array');
    }

    return data; 
}



module.exports = { fetchBrowseData };
