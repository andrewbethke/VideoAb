videoAb.test = {};
videoAb.backend = {};

/**
 * Generates all the valid combinations of thumbnails and titles given the current settings.
 * 
 * Returns an array of objects of class "VideoInfo"
 */
videoAb.test.generateCombinations = function () {
    const settings = videoAb.ui.getAbTestSettings();
    let items = [];

    if (settings.doTitles && settings.doThumbnails) {
        if (settings.linkProperties) {
            // If we want to treat a thumbnail and title as pairs, then we
            // only have one level of loop to create the pairs.
            let titles = videoAb.ui.getTitles();
            let thumbnails = videoAb.ui.getThumbnails();

            for (let i = 0; i < titles.length; i++) {
                items.push(new VideoInfo(titles[i], thumbnails[i]));
            }
        } else {
            // If we don't want to pair titles and thumbnails, we generate all
            // combinations using a nested loop.
            for (let thumbnail of videoAb.ui.getThumbnails())
                for (let title of videoAb.ui.getTitles())
                    items.push(new VideoInfo(title, thumbnail));
        }
    } else if (settings.doTitles)
        for (let title of videoAb.ui.getTitles()) {
            items.push(new VideoInfo(title, null))
        }
    else if (settings.doThumbnails)
        for (let thumbnail of videoAb.ui.getThumbnails()) {
            items.push(new VideoInfo(null, thumbnail))
        }

    return items;
}

/**
 * Takes a response to a playlistItems.list request and sends a videos.list
 * request to get more information about the videos.
 */
videoAb.backend.requestVideos = function (response) {
    let parsedResponse = JSON.parse(response.body);

    videoAb.nextVideoPageToken = parsedResponse.nextPageToken;

    let videoIdList = "";
    for (let video of parsedResponse.items) {
        videoIdList = videoIdList + video.contentDetails.videoId + ",";
    }

    gapi.client.youtube.videos.list({
        "part": ["snippet,contentDetails,statistics"],
        "id": videoIdList
    }).then(videoAb.ui.populateVideos, console.log);
}

/**
 * Runs a playlistItems.list request and then passes the response to
 * requestVideos to retrieve even more information about the videos.
 * @param {*} playlistId The playlist ID to request items from.
 * @param {*} pageToken the page token to retrieve.
 */
videoAb.backend.requestPlaylistItems = function (playlistId, pageToken = null) {
    gapi.client.youtube.playlistItems.list({
        "playlistId": playlistId,
        "part": ["snippet,contentDetails"],
        "maxResults": 10,
        "pageToken": pageToken
    }).then(videoAb.backend.requestVideos, console.log);
}

/**
 * Changes the thumbnail of the given video to the given new thumbnail.
 * @param {*} videoId The ID of the video whose thumbnail we're changing.
 * @param {*} newThumbnail The new thumbnail for the video.
 */
videoAb.test.changeThumbnail = function(videoId, newThumbnail) {
    fetch(`https:/www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`, {
        "method": "POST",
        "headers": {
            "Authorization": `Bearer ${gapi.client.getToken().access_token}`,
            "Content-Type": newThumbnail.type
        },
        "body": newThumbnail
    }).then(console.log);
}

/**
 * Changes the title of the given video to the given new title.
 * @param {String} videoId The ID of the video whose title we're changing.
 * @param {String} newTitle The new title for the video.
 */
videoAb.test.changeTitle = function (videoId, newTitle) {
    let snippet = videoAb.fetchedVideos[videoId].snippet;
    snippet.title = newTitle;
    gapi.client.youtube.videos.update({
        "part": [
            "snippet"
        ],
        "resource": {
            "id": videoId,
            "snippet": snippet
        }
    }).then(function (response) { console.log(response) }, console.log);
}

/**
 * Changes both the title and the thumbnail of the given video.
 * @param {String} videoId the ID of the video whose details we're changing.
 * @param {Object} package a JS Object containing the new details.
 */
videoAb.test.changeInfo = function (videoId, package) {
    if(package.title != null)
        videoAb.test.changeTitle(videoId, package.title);
    if(package.thumbnail != null)
        videoAb.test.changeThumbnail(videoId, package.thumbnail);

    videoAb.ui.updateProgress();
}

/**
 * Runs when the button in the control panel is pressed. Performs the necessary
 * setup to run an AB Test.
 */
videoAb.test.run = function () {
    // Check to make sure a video is selected. If one isn't, tell the user and return.
    if (videoAb.selected === "") {
        alert("Whoopsies! You forgot to select a video to AB test on. You need to do that first.");
        return;
    }

    const settings = videoAb.ui.getAbTestSettings();
    let items = videoAb.test.generateCombinations();
    let accumulatedTimeout = 0;

    videoAb.testStages = items.length;
    videoAb.currentTestStage = 0;

    for (let item of items) {
        setTimeout(() => {
            videoAb.test.changeInfo(videoAb.selected, item);
        }, accumulatedTimeout);
        accumulatedTimeout += settings.interval;
    }

    videoAb.ui.startTest(accumulatedTimeout - settings.interval);
}