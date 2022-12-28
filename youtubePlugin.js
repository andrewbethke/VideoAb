/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */

var API_KEY;

/**
 * Loads the API key from the external apikey.txt file.
 */
async function loadApiKey() {
    let keyFile = await fetch("/apikey.txt")
        .then(response => response.text())
        .then(key => API_KEY = key);
}

function loadGoogleApis() {
    // TODO: Reimplement to use CORS
};

function loadClient() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });
}

function execute() {
    return gapi.client.youtube.channels.list({
        "part": [
            "snippet,contentDetails,statistics"
        ],
        "mine": true
    })
        .then(function (response) {
            // Handle the results here (response.result has the parsed body).
            console.log("Response", response);
        },
            function (err) { console.error("Execute error", err); });
}

function setupApi() {
    authenticate().then(loadClient);
}

/**
 * Run the necessary stuff to get the Google OAuth token.
 */
function getGoogleOauthToken() {
    const googleOauthClient = google.accounts.oauth2.initTokenClient({
        client_id: '50007999406-7vr8taktahml4loqt67aeuutn96mpofg.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.upload',
        callback: (response) => {
            console.log(response);
        }
    });
    googleOauthClient.requestAccessToken();
}

// Create the OAuth client as soon as the script loads so it's ready.