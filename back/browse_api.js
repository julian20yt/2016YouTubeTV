const axios = require('axios'); // Axios module to make HTTP requests

// Function to fetch browse data from the JSON file
async function fetchBrowseData() {
    try {
        // Fetch the JSON file from the server via HTTP request
        const fileUrl = 'http://localhost:8090/assets/browse_example_client6.json';
        const fileResponse = await axios.get(fileUrl);

        // Return the file data directly
        return fileResponse.data;
    } catch (error) {
        console.error('Error:', error.message);
        
        // Log the error for debugging
        if (error.response) {
            // The server returned an error response
            console.error('Error Response:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something else caused the error
            console.error('General error:', error.message);
        }
        
        return { error: 'Failed to read the JSON file' };
    }
}

// Export the fetchBrowseData function for use in other modules
module.exports = { fetchBrowseData };
