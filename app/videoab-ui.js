videoAb.ui = {};

/**
 * Runs whenever the video list is scrolled, and loads more videos if scrolled
 * to the bottom.
 */
videoAb.ui.infiniteScrollHandler = function (entries) {
    if (videoAb.nextVideoPageToken == undefined)
        return;

    if (entries[0].isIntersecting) {
        videoAb.backend.requestPlaylistItems(videoAb.playlistId, videoAb.nextVideoPageToken);
    }
}

let scrollObserver = new IntersectionObserver(videoAb.ui.infiniteScrollHandler);
scrollObserver.observe(document.getElementById("loading-box"));

/**
 * Takes a video from videos.list, creates a list entry for it, and adds it to
 * the end of the list in the HTML.
 * @param video 
 */
videoAb.ui.createVideoNode = function (video) {
    // Creates the parent block for the whole list entry.
    let div = document.createElement("div");
    div.classList.add("videolistitem");
    div.id = video.id;

    // Adds the link the user clicks to select the video. 
    let selectorLink = document.createElement("a");
    selectorLink.onclick = function () { videoAb.ui.selectVideo(video.id) };
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

    videoAb.videoList.appendChild(div);
}

/**
 * Takes an API response and populates the video list with them.
 */
videoAb.ui.populateVideos = function (response) {
    let loadingBox = videoAb.videoList.removeChild(document.getElementById("loading-box"));

    let parsedResponse = JSON.parse(response.body);
    for (let video of parsedResponse.items) {
        // Adds the video's response object to an object so it can be retrieved later.
        videoAb.fetchedVideos[video.id] = video;
        // Creates the list entry on the webpage.
        videoAb.ui.createVideoNode(video);
    }

    if (videoAb.nextVideoPageToken != undefined)
        videoAb.videoList.appendChild(loadingBox);
}

/**
 * Increment the stage of the test we're on by one and then update progress info to match.
 */
videoAb.ui.updateProgress = function () {
    videoAb.currentTestStage++;
    document.getElementById("progress-text").innerText = videoAb.currentTestStage + "/" + videoAb.testStages + " Stages Completed";
    document.getElementById("progress-bar").style.width = ((videoAb.currentTestStage / videoAb.testStages) * 100) + "%";
}

videoAb.ui.generatePreviewDOM = function (package){
    let wrapper = document.createElement("div");
    wrapper.classList.add("preview");
    
    let thumbnail = document.createElement("img");
    thumbnail.src = URL.createObjectURL(package.thumbnail);
    thumbnail.classList.add("preview-thumbnail")
    wrapper.append(thumbnail);

    let title = document.createElement("span");
    title.innerText = package.title;
    title.classList.add("preview-title");
    wrapper.append(title);

    return wrapper;
}

videoAb.ui.generatePreviews = function(){
    document.getElementById("preview-list").innerHTML = "";
    for(let combination of generateCombinations()){
        document.getElementById("preview-list").appendChild(generatePreviewDOM(combination));
    }
}

videoAb.ui.addInput = function (parentElement, inputElement) {
    // Make a new container for the new title input.
    let newInputBox = document.createElement("div");
    newInputBox.classList.add("input-box");

    // Make and fill a label for the new input box.
    let newInputLabel = document.createElement("label");
    newInputLabel.innerText = `${parentElement.children.length + 1}.`;

    // Add children to the container box and add the box to the parent.
    newInputBox.appendChild(newInputLabel);
    newInputBox.appendChild(inputElement);
    parentElement.appendChild(newInputBox);
}

/**
 * Adds the necessary DOM objects to have another title box.
 */
videoAb.ui.addTitle = function () {
    // Make an input that is the new title box.
    let newTitleInput = document.createElement("input");
    newTitleInput.type = "text";
    newTitleInput.maxLength = 100;

    videoAb.ui.addInput(document.getElementById("title-inputs"), newTitleInput);
}

videoAb.ui.removeTitle = function () {
    document.getElementById("title-inputs").removeChild(document.getElementById("title-inputs").lastChild);
}

videoAb.ui.addThumbnail = function () {
    // Make an input that is the new thumbnail box.
    let newThumbnailInput = document.createElement("input");
    newThumbnailInput.type = "file";
    newThumbnailInput.accept = "image/jpeg,image/png";

    videoAb.ui.addInput(document.getElementById("thumbnail-inputs"), newThumbnailInput);
}

videoAb.ui.removeThumbnail = function () {
    for (let i = 0; i < 3; i++)
        document.getElementById("thumbnail-inputs").removeChild(document.getElementById("thumbnail-inputs").lastChild);
}

/**
 * @returns An Object representing the user's selected settings for the AB
 * test.
 */
videoAb.ui.getAbTestSettings = function () {
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
videoAb.ui.getTitles = function () {
    let titles = [];

    // Get the parent element for the titles and get an Array of the children.
    Array.from(document.getElementById("title-inputs").children)
        // Add the input tag from each child to the list of titles.
        .forEach((item) => titles.push(item.getElementsByTagName("input")[0].value));

    return titles;
}

videoAb.ui.getThumbnails = function () {
    let thumbnails = [];

    // Get the parent element for the titles and get an Array of the children.
    Array.from(document.getElementById("thumbnail-inputs").children)
        // Add each remaining tag to the list of titles.
        .forEach((item) => thumbnails.push(item.getElementsByTagName("input")[0].files[0]));

    return thumbnails;
}

/**
 * Runs when a video in the video list is clicked. Adds indicators in the list
 * and sets the program's selected video ID.
 * @param {String} videoId 
 */
videoAb.ui.selectVideo = function (videoId) {
    // Clear visual selection of old video.
    if (videoAb.selected != "")
        document.getElementById(videoAb.selected).removeAttribute("style");

    // Select new video.
    videoAb.selected = videoId;
    document.getElementById(videoAb.selected).style.backgroundColor = "#CCFFCC";
}

videoAb.ui.startTest = function (testLength) {
    document.getElementById("progress-bar-marquee").style.display = "block";
    setTimeout(() => {
        document.getElementById("progress-bar-marquee").style.display = "none";
    }, testLength);
}