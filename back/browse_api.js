const axios = require('axios'); 

async function fetchBrowseData() {
    try {
        const fileUrl = 'http://localhost:8090/assets/browse_example_client6.json';
        const fileResponse = await axios.get(fileUrl);

        return fileResponse.data;
    } catch (error) {
        console.error('Error:', error.message);
        
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('General error:', error.message);
        }
        
        return { error: 'Failed to read the JSON file' };
    }
}


module.exports = { fetchBrowseData };