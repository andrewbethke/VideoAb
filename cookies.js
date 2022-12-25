function saveCookiePreferences(){
    document.cookie = "functionality-cookies-enabled=" + functionalityCookieBox.checked;
    unloadCookieConsent();
}

function disableAllCookies(){
    functionalityCookieBox.checked = false;
    saveCookiePreferences();
}

function unloadCookieConsent(){
    document.getElementById("cookie-consent").style.display = "none";
    document.getElementById("google-auth").style.display = "block";
    // TODO: Execute the disabled scripts.
}

if(document.cookie.includes("functionality-cookies-enabled")){
    unloadCookieConsent();
}

var functionalityCookieBox = document.getElementById("functionality-cookie-checkbox");