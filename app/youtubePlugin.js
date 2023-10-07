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

async function loadClientId() {
    await fetch("./clientid.txt")
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
 * Once gapi has loaded, set up gapi and load necessary scopes.
 */
function setupGapi() {
    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });

    loadApiKey();
    loadClientId();
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

function getGoogleOauthTokenOneTap(credential){
    gapi.auth2.authorize({
        response_type: 'permission', // Access Token.
        scope: 'https://www.googleapis.com/auth/youtube',
        client_id: CLIENT_ID,
        login_hint: credential
    }, function(result) {console.log(result)});
}

function handleGoogleCredentials(response){
    console.log(response);
    getGoogleOauthTokenOneTap(response.clientId);
}

/**
 * Setup Google Identity API
 */
function setupGoogleIdentity() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleCredentials
    });

    const parent = document.getElementById('google-signin-button');
    google.accounts.id.renderButton(parent, {theme: "filled_blue", shape:"pill", context: "use"});
}

loadGapi();