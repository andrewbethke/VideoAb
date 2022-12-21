/**
 * This file handles everything related to communicating with
 * the YouTube APIs. Or it will, anyway.
 */

var API_KEY = "";

async function loadApiKey(){
    let keyFile = await fetch("/apikey.txt")
        .then(response => response.text())
        .then(key => API_KEY = key);
}

function loadGoogleApis() {
    // TODO: Reimplement to use CORS
};

export function setupApi() {
    loadApiKey().then(function(){
        gapi.load('client', loadGoogleApis);
    }, function(err){
        console.log(err);
    });
}