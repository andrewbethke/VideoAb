/**
 * Takes any script with the type "javascript/blocked" and deletes it,
 * recreating it with the type "application/javascript."
 */
function enableBlockedScripts() {
    let scripts = Array.from(document.getElementsByTagName("script"));

    for (let script of scripts) {
        // If the script wasn't blocked, don't touch it and just move on.
        if (script.getAttribute("type") !== "javascript/blocked")
            continue;
        // Otherwise:
        // Remove the script.
        script.remove();
        // Change its type to allow javascript.
        script.setAttribute("type", "application/javascript");
        // Add the script back.
        document.head.appendChild(script);
    }
}

/**
 * Hides the cookie consent form and enables scripts so the application
 * can move on in its execution.
 */
function unloadCookieConsent() {
    // Hide the cookie consent form and show the sign in form.
    document.getElementById("cookie-consent").style.display = "none";
    document.getElementById("google-auth").style.display = "block";
    // Enable all of the blocked scripts.
    enableBlockedScripts();
}

/**
 * Runs when the "save" button is pressed in the cookie consent form.
 * Saves preferences and then handles unloading the form.
 */
function saveCookiePreferences() {
    document.cookie = "functionality-cookies-enabled=" + functionalityCookieBox.checked;
    unloadCookieConsent();
}

/**
 * Runs when the "disallow all" button is pressed in the cookie consent form.
 * Changes the form to reflect this preference, and then acts as if the user
 * saved their preferences.
 */
 function disableAllCookies() {
    functionalityCookieBox.checked = false;
    saveCookiePreferences();
}

if (document.cookie.includes("functionality-cookies-enabled")) {
    unloadCookieConsent();
}

var functionalityCookieBox = document.getElementById("functionality-cookie-checkbox");