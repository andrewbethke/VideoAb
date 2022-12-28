/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */

var API_KEY;

/**
 * Loads the API key from the external apikey.txt file.
 */
async function loadApiKey() {
    await fetch("/apikey.txt")
        .then(response => response.text())
        .then(key => {
            API_KEY = key
            gapi.client.setApiKey(API_KEY);
        });
}

function loadGoogleApis() {
    // TODO: Reimplement to use CORS
}

/**
 * Test function from google examples for YouTube API
 * @returns
 */
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

/**
 * Get a Google OAuth token and give it to gapi.
 */
function getGoogleOauthToken() {
    const googleOauthClient = google.accounts.oauth2.initTokenClient({
        client_id: '50007999406-7vr8taktahml4loqt67aeuutn96mpofg.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        callback: (response) => gapi.client.setToken(response)
    });
    googleOauthClient.requestAccessToken();
}

/**
 * Once gapi has loaded, set up gapi and load necessary scopes.
 */
function setupGapi() {
    gapi.client.setApiKey(API_KEY);

    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });

    loadApiKey();
}

/**
 * Load gapi, handling the case that gapi has not yet loaded.
 */
function loadGapi() {
    // If not yet loaded, wait 10 milliseconds and recurse.
    if (typeof gapi === 'undefined'){
        window.setTimeout(loadGapi, 10);
        return;
    }

    // If it is loaded, then setup gapi
    gapi.load('client', setupGapi);
}

loadGapi();