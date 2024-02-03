/*
This file handles initialization of the app and retrieval of information needed
for everything else.
*/

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
    }).then(videoAb.handleChannelResponse, console.log);
}