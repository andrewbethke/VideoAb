/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */

var API_KEY;

/**
 * Loads the API key from the external apikey.txt file.
 */
async function loadApiKey() {
    await fetch("apikey.txt")
        .then(response => response.text())
        .then(key => {
            API_KEY = key
            gapi.client.setApiKey(API_KEY);
        });
}

async function loadClientId() {
    await fetch("clientid.txt")
        .then(response => response.text())
        .then(id => {
            CLIENT_ID = id;
        })
}

/**
 * Get a Google OAuth token and give it to gapi.
 */
function getGoogleOauthToken() {
    const googleOauthClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/youtube',
        callback: (response) => {
            gapi.client.setToken(response)
            setupApp();
        }
    });
    googleOauthClient.requestAccessToken();
}

/**
 * Once gapi has loaded, set up gapi with the necessary scopes and get api key
 * and client id.
 */
function setupGapi() {
    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });

    loadApiKey();
    loadClientId();
}

/**
 * Run gapi.load, or wait 10ms if google apis are still being retrieved.
 */
function loadGapi() {
    // If not yet loaded, wait 10 milliseconds and recurse.
    if (typeof gapi === 'undefined')
        window.setTimeout(loadGapi, 10);
    else
        // If it is loaded, then setup gapi 
        gapi.load('client', setupGapi);
}

loadGapi();