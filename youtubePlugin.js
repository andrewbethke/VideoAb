/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */
API_KEY = "";

async function loadApiKey(){
    let keyFile = await fetch("/apikey.txt")
        .then(response => response.text())
        .then(key => API_KEY = key);
}

function loadGoogleApis() {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
        'apiKey': API_KEY,
        // Your API key will be automatically added to the Discovery Document URLs.
        'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
        // clientId and scope are optional if auth is not required.
        'clientId': 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        'scope': 'profile',
    }).then(function () {
        // 3. Initialize and make the API request.
        return gapi.client.people.people.get({
            'resourceName': 'people/me',
            'requestMask.includeField': 'person.names'
        });
    }).then(function (response) {
        console.log(response.result);
    }, function (reason) {
        console.log('Error: ' + reason.result.error.message);
    });
};

function setupApi() {
    loadApiKey().then(function(){
        gapi.load('client', loadGoogleApis);
    }, function(err){
        console.log(err);
    });
}