// Initialize videoAb object.
const videoAb = {};
videoAb.selected = "";

const fetchedVideos = {};

function logError(err) {
    console.log(err);
}

/**
 * Runs when a video in the video list is clicked. Changes styling of the video
 * in the list and sets the program's selected video ID.
 * @param {String} videoId 
 */
function selectVideo(videoId){
    console.log(videoId);
    // Clear visual selection of old video.
    if(videoAb.selected != "")
        document.getElementById(videoAb.selected).removeAttribute("style");
    
    // Select new video.
    videoAb.selected = videoId;
    document.getElementById(videoAb.selected).style.backgroundColor = "#CCFFCC";
}

/**
 * Takes an API response and populates the video list with them.
 */
function populateVideos(response) {
    let parsedResponse = JSON.parse(response.body);
    console.log(parsedResponse);
    for(let video of parsedResponse.items) {
        fetchedVideos[video.contentDetails.videoId] = video;

        let div = document.createElement("div");
        div.classList.add("videolistitem");
        div.id = video.contentDetails.videoId;

        let selectorLink = document.createElement("a");
        selectorLink.onclick = function() {selectVideo(video.contentDetails.videoId)};
        div.appendChild(selectorLink);

        let thumbnail = document.createElement("img");
        thumbnail.src = video.snippet.thumbnails.medium.url;
        thumbnail.classList.add("videolistthumbnail");
        selectorLink.appendChild(thumbnail);

        let info = document.createElement("div");
        selectorLink.appendChild(info);

        let title = document.createElement("h3");
        title.innerText = video.snippet.title;
        info.appendChild(title);

        let date = document.createElement("p");
        date.innerText = new Date(video.contentDetails.videoPublishedAt).toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"});
        info.appendChild(date);

        let link = document.createElement("a");
        link.href = `http://www.youtube.com/watch?v=${video.contentDetails.videoId}`;
        link.classList.add("videolistitemlink");
        info.appendChild(link);

        document.getElementById("videolist").appendChild(div);
    }
}

/**
 * Takes a response to channels.list and gets the videos themselves.
 */
function fetchVideos(response) {
    let uploadsPlaylistId = JSON.parse(response.body).items[0].contentDetails.relatedPlaylists.uploads;
    gapi.client.youtube.playlistItems.list({
        "playlistId": uploadsPlaylistId,
        "part": ["snippet,contentDetails"],
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
    let snippet = fetchedVideos[videoId].snippet;
    snippet.title = newTitle;
    // TODO: Change to use the currently set category for the video.
    snippet.categoryId = "20";
    gapi.client.youtube.videos.update({
        "part": [
            "snippet"
        ],
        "resource": {
            "id": videoId,
            "snippet": snippet
        }
    }).then(function (response) {console.log(response)}, logError);
}

/**
 * Runs when the button in the control panel is pressed. Performs the necessary
 * setup to run an AB Test.
 */
function beginABTest(){
    // TODO: Implement
}

function setupApp() {
    // Hide authentication, show the app.
    document.getElementById("google-auth").style.display = "none"
    document.getElementById("app").style.display = "block";
    // Request the channel's information to retrieve the uploads playlist id.
    gapi.client.youtube.channels.list({
        "part": ["contentDetails"],
        "mine": true
    }).then(fetchVideos, logError);
}