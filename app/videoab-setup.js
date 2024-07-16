/*
This file handles initialization of the app and retrieval of information
needed for everything else.
*/

// First, initialize all the Google API stuff.
var API_KEY, CLIENT_ID;

/*
The Client ID and API key could get here however or be embedded in this
file, but by default we will load them from two separate text files.
*/

/**
 * Loads the API key from an external apikey.txt file.
 */
async function loadApiKey() {
    await fetch("apikey.txt")
        .then(response => response.text())
        .then(key => {
            API_KEY = key
            gapi.client.setApiKey(API_KEY);
        });
}
/**
 * Loads the Client ID from an external clientid.txt file.
 */
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
            videoAb.setupApp(); 
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
        .then(function () { return; },
            function (err) { console.error("Error loading GAPI client: ", err); });

    loadApiKey();
    loadClientId();
}

/**
 * Run gapi.load once the files are loaded.
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


// Initialize videoAb object.
const videoAb = {};
videoAb.selected = "";
videoAb.videoList = document.getElementById("video-list");
videoAb.fetchedVideos = {};

// Creates a constant we can multiply by to get a minute in milliseconds.
const MINUTES = 1000 * 60;

/**
 * Contains video title and thumbnail. Used for sending video info between functions.
 */
class VideoInfo {
    constructor(title, thumbnail) {
        this.title = title;
        this.thumbnail = thumbnail;
    }
}

/**
 * Takes a response from a channels.list request and extracts the uploads
 * playlist id.
 * @param response The response given by channels.list.
 * @returns The channel's uploads playlist ID.
 */
videoAb.getUploadsPlaylist = function (response) {
    return JSON.parse(response.body).items[0].contentDetails.relatedPlaylists.uploads;
}

/**
 * Takes a response from a channels.list request and then requests playlist
 * items from the channel's uploads playlist.
 * @param response The response given by channels.list.
 */
videoAb.handleChannelResponse = function (response) {
    videoAb.playlistId = videoAb.getUploadsPlaylist(response)
    videoAb.backend.requestPlaylistItems(videoAb.playlistId);
}

videoAb.setupApp = function() {
    // Hide authentication, show the app.
    document.getElementById("google-auth").style.display = "none"
    document.getElementById("app").style.display = "";
    
    // Request the channel's information to retrieve the uploads playlist id.
    gapi.client.youtube.channels.list({
        "part": ["contentDetails"],
        "mine": true
    }).then(videoAb.handleChannelResponse, console.error);
}