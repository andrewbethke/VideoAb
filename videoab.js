
function logError(err) {
    console.log(err);
}

/**
 * Takes an API response and populates the video list
 * with them.
 */
function populateVideos(response) {
    let parsedResponse = JSON.parse(response.body);
    //TEMPORARY: STRAIGHT COPY FROM OLD AROBSITE.COM CODE
    var printout = "";
    for(let video of parsedResponse.items) {
        printout += '<div class="videoobject"><a class="video" href="http://www.youtube.com/watch?v=' + video.snippet.resourceId.videoId + '"><h3>' + video.snippet.title + '</h3><img src="https://i.ytimg.com/vi/' + video.snippet.resourceId.videoId + '/hqdefault.jpg" class="thumbnail" /></div>';
    }
    document.getElementById("app").innerHTML = printout;
}

/**
 * Takes a response to channels.list and gets the videos themselves.
 */
function fetchVideos(response) {
    let channel = response.body;
    let parsedResponse = JSON.parse(channel);
    let uploadsPlaylistId = parsedResponse.items[0].contentDetails.relatedPlaylists.uploads;
    gapi.client.youtube.playlistItems.list({
        "playlistId": uploadsPlaylistId,
        "part": ["snippet"]
    }).then(populateVideos, logError);
}

/**
 * 
 * @param {*} videoId 
 * @param {*} newThumbnail 
 */
function changeThumbnail(videoId, newThumbnail) {

}

/**
 * 
 * @param {*} videoId 
 * @param {*} newTitle 
 */
function changeTitle(videoId, newTitle) {
    // TODO: Implement Title Changing
}

function setupApp() {
    // Hide authentication, show the app.
    document.getElementById("google-auth").style.display = "none"
    document.getElementById("app").style.display = "block";
    // Populate the videos list for the first time.
    gapi.client.youtube.channels.list({
        "part": ["contentDetails"],
        "mine": true
    }).then(fetchVideos, logError);
}