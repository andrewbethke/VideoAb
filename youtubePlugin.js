/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */

var API_KEY = "";

async function loadApiKey() {
    let keyFile = await fetch("/apikey.txt")
        .then(response => response.text())
        .then(key => API_KEY = key);
}

function loadGoogleApis() {
    // TODO: Reimplement to use CORS
};

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
        .then(function () { console.log("Sign-in successful"); },
            function (err) { console.error("Error signing in", err); });
}

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

gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: "50007999406-lekpivmd7rn6v3oev43qivqm38647dra.apps.googleusercontent.com" });
});

function setupApi() {
    authenticate().then(loadClient);
}

/**
 * Handle the javascript callback provided by
 * the "Sign In With Google" button.
 * @param {*} response 
 */
function loginToGoogle(response) {
    // OBVIOUSLY VERY TEMPORARY
    // NEED TO FIGURE OUT WHAT INFO I GET
    console.log(response);
}