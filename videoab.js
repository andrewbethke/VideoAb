// Initialize videoAb object.
const videoAb = {};
videoAb.selected = "";

const fetchedVideos = {};

// Creates a constant we can multiply by to get a minute in milliseconds.
const MINUTES = 1000 * 60;

function logError(err) {
    console.log(err);
}

/**
 * Runs when a video in the video list is clicked. Changes styling of the video
 * in the list and sets the program's selected video ID.
 * @param {String} videoId 
 */
function selectVideo(videoId) {
    // Clear visual selection of old video.
    if (videoAb.selected != "")
        document.getElementById(videoAb.selected).removeAttribute("style");

    // Select new video.
    videoAb.selected = videoId;
    document.getElementById(videoAb.selected).style.backgroundColor = "#CCFFCC";
}

/**
 * Takes a video from videos.list, creates a list entry for it, and adds it to
 * the end of the list in the HTML.
 * @param video 
 */
function createVideoNode(video) {
    // Creates the parent block for the whole list entry.
    let div = document.createElement("div");
    div.classList.add("videolistitem");
    div.id = video.id;

    // Adds the link the user clicks to select the video. 
    let selectorLink = document.createElement("a");
    selectorLink.onclick = function () { selectVideo(video.id) };
    div.appendChild(selectorLink);

    // Adds the thumbnail image.
    let thumbnail = document.createElement("img");
    thumbnail.src = video.snippet.thumbnails.medium.url;
    thumbnail.classList.add("videolistthumbnail");
    selectorLink.appendChild(thumbnail);

    // Adds a div to contain all the information on the video.
    let info = document.createElement("div");
    selectorLink.appendChild(info);

    // Adds the title.
    let title = document.createElement("h3");
    title.innerText = video.snippet.title;
    info.appendChild(title);

    // Adds the publish date (or upload date if the video is unlisted/private).
    let date = document.createElement("p");
    date.innerText = new Date(video.snippet.publishedAt).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" });
    info.appendChild(date);

    let viewCount = document.createElement("p");
    viewCount.innerText = `${video.statistics.viewCount} views`;
    info.appendChild(viewCount);

    // Adds a link to the video on youtube.
    let link = document.createElement("a");
    link.href = `http://www.youtube.com/watch?v=${video.id}`;
    link.classList.add("videolistitemlink");
    info.appendChild(link);

    document.getElementById("videolist").appendChild(div);
}

/**
 * Takes an API response and populates the video list with them.
 */
function populateVideos(response) {
    let parsedResponse = JSON.parse(response.body);
    for (let video of parsedResponse.items) {
        // Adds the video's response object to an object so it can be retrieved later.
        fetchedVideos[video.id] = video;
        // Creates the list entry on the webpage.
        createVideoNode(video);
    }
}

/**
 * Takes a response to a playlistItems.list request and sends a videos.list
 * request to get more information about the videos.
 */
function requestVideos(response) {
    let parsedResponse = JSON.parse(response.body);
    let videoIdList = "";
    for (let video of parsedResponse.items) {
        videoIdList = videoIdList + video.contentDetails.videoId + ",";
    }

    gapi.client.youtube.videos.list({
        "part": ["snippet,contentDetails,statistics"],
        "id": videoIdList
    }).then(populateVideos, logError);
}

/**
 * Runs a playlistItems.list request and then passes the response to
 * requestVideos to retrieve even more information about the videos.
 * @param {*} playlistId The playlist ID to request items from.
 * @param {*} pageToken the page token to retrieve.
 */
function requestPlaylistItems(playlistId, pageToken = null) {
    gapi.client.youtube.playlistItems.list({
        "playlistId": playlistId,
        "part": ["snippet,contentDetails"],
        "maxResults": 10,
        "pageToken": pageToken
    }).then(requestVideos, logError);
}

/**
 * Takes a response from a channels.list request and extracts the uploads
 * playlist id.
 * @param response The response given by channels.list.
 * @returns The channel's uploads playlist ID.
 */
function getUploadsPlaylist(response) {
    return JSON.parse(response.body).items[0].contentDetails.relatedPlaylists.uploads;
}

/**
 * Takes a response from a channels.list request and then requests playlist
 * items from the channel's uploads playlist.
 * @param response The response given by channels.list.
 */
function handleChannelResponse(response) {
    requestPlaylistItems(getUploadsPlaylist(response));
}

/**
 * Changes the thumbnail of the given video to the given new thumbnail.
 * @param {*} videoId The ID of the video whose thumbnail we're changing.
 * @param {*} newThumbnail The new thumbnail for the video.
 */
function changeThumbnail(videoId, newThumbnail) {
    fetch(`https:/www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`, {
        "method": "POST",
        "headers": {
            "Authorization": `Bearer ${gapi.client.getToken().access_token}`,
            "Content-Type": newThumbnail.type
        },
        "body": newThumbnail
    }).then(function (response) { console.log(response) }, logError);
}

/**
 * Changes the title of the given video to the given new title.
 * @param {String} videoId The ID of the video whose title we're changing.
 * @param {String} newTitle The new title for the video.
 */
function changeTitle(videoId, newTitle) {
    let snippet = fetchedVideos[videoId].snippet;
    snippet.title = newTitle;
    gapi.client.youtube.videos.update({
        "part": [
            "snippet"
        ],
        "resource": {
            "id": videoId,
            "snippet": snippet
        }
    }).then(function (response) { console.log(response) }, logError);
}

/**
 * Changes both the title and the thumbnail of the given video.
 * @param {String} videoId the ID of the video whose details we're changing.
 * @param {Object} package a JS Object containing the new details.
 */
function changeBoth(videoId, package) {
    changeTitle(videoId, package.title);
    changeThumbnail(videoId, package.thumbnail);
}

/**
 * @returns An Object representing the user's selected settings for the AB
 * test.
 */
function getAbTestSettings() {
    return {
        "doTitles": document.getElementById("titleCheckbox").checked,
        "doThumbnails": document.getElementById("thumbnailCheckbox").checked,
        "linkProperties": document.getElementById("linkProperties").checked,
        "interval": document.getElementById("swapInterval").value * MINUTES
    };
}

/**
 * Returns a List of all of the titles input by the user.
 */
function getTitles() {
    let titles = [];

    // Get the parent element for the titles and get an Array of the children.
    Array.from(document.getElementById("title-inputs").children)
        // Throw away the elements that aren't <input> tags.
        .filter((element) => element.tagName == "INPUT")
        // Add each remaining tag to the list of titles.
        .forEach((item) => titles.push(item.value));
    
    return titles;
}

/**
 * Adds the necessary DOM objects to have another title box.
 */
function addTitle() {
    // Make and fill a span to contain the label text of the new title box.
    let newTitleLabel = document.createElement("span");
    newTitleLabel.innerText = `Title ${Math.floor(document.getElementById("title-inputs").children.length / 3) + 1}: `;

    // Make an input that is the new title box.
    let newTitleInput = document.createElement("input");
    newTitleInput.type = "text";

    // Add the previous two elements and a line break to the title-inputs container.
    document.getElementById("title-inputs").appendChild(newTitleLabel);
    document.getElementById("title-inputs").appendChild(newTitleInput);
    document.getElementById("title-inputs").appendChild(document.createElement("br"));
}

function removeTitle() {
    for(let i = 0; i < 3; i++)
        document.getElementById("title-inputs").removeChild(document.getElementById("title-inputs").lastChild);
}

function getThumbnails() {
    //TODO: Implement an arbitrary number of thumbnails.
    return [document.getElementById("thumbnail1").files[0], document.getElementById("thumbnail2").files[0]];
}

/**
 * 
 * @param {function} handler 
 * @param {object} settings
 * @param {list} items 
 */
function executeTest(handler, settings, items) {
    let accumlatedTimeout = 0;
    for (let item of items) {
        setTimeout(() => {
            handler(videoAb.selected, item);
        }, accumlatedTimeout);
        accumlatedTimeout += settings.interval;
    }
}

/**
 * Runs when the button in the control panel is pressed. Performs the necessary
 * setup to run an AB Test.
 */
function beginABTest() {
    const settings = getAbTestSettings();
    if (settings.doTitles && settings.doThumbnails) {
        let items = [];
        if (settings.linkProperties) {
            // If we want to treat a thumbnail and title as pairs, then we
            // only have one level of loop to create the pairs.
            let titles = getTitles();
            let thumbnails = getThumbnails();

            for (let i = 0; i < titles.length; i++) {
                items.push({ "title": titles[i], "thumbnail": thumbnails[i] });
            }
        } else {
            // If we don't want to pair titles and thumbnails, we generate all
            // combinations using a nested loop.
            for (let thumbnail of getThumbnails())
                for (let title of getTitles())
                    items.push({ "title": title, "thumbnail": thumbnail });
        }
        executeTest(changeBoth, settings, items);
    } else if (settings.doTitles)
        executeTest(changeTitle, settings, getTitles());
    else if (settings.doThumbnails)
        executeTest(changeThumbnail, settings, getThumbnails());
}

function setupApp() {
    // Hide authentication, show the app.
    document.getElementById("google-auth").style.display = "none"
    document.getElementById("app").style.display = "block";
    // Request the channel's information to retrieve the uploads playlist id.
    gapi.client.youtube.channels.list({
        "part": ["contentDetails"],
        "mine": true
    }).then(handleChannelResponse, logError);
}