const windowIds = [
    "ga-prox", "downloads", "tools", "info", "settings"
];

const urls = {
    "selenite": "https://mail.adriapartners.net",
    "prism": "https://schoolclassroomcanvacanvacodecom.7879.22web.org/",
    "interstellar": "https://potato.wwe.ddnss.de",
    "frogie": "https://mshjvxae.1vib36z.ddnss.de/"
}

let _activeWindow = "";

function openUrl(id) {
    if (!(id in urls))
        return;
    
    openIframe(urls[id]);
}

function openIframe(url) {
    return;
}

function setActiveWindow(winId) {
    _activeWindow = winId;
    localStorage.setItem("activeWindow", winId);
}

function getActiveWindow() {
    let active = localStorage.getItem("activeWindow");
    if (active == undefined) {
        active = "";
        localStorage.setItem("activeWindow", "");
    }

    return active;
}

function updateWindows() {
    let active = getActiveWindow();
    for (const win of windowIds) {
        if (active == win) {
            toggleWindow(win, true);
        } else {
            toggleWindow(win, false);
        }
    }
}

function toggleWindow(id, state) {
    let winId = `window-${id}`;
    let tabId = `tab-${id}`;

    let win = document.getElementById(winId);
    let tab = document.getElementById(tabId);

    if (!win || !tab) return;

    if (state == true) {
        win.classList.remove("inactive");
        tab.classList.add("active");
    } else {
        win.classList.add("inactive");
        tab.classList.remove("active");
    }
}

function updateTimeDisplay() {
    const timeDisplay = document.getElementById("current-time");
    if (!timeDisplay) return;

    let currentTime = new Date().toLocaleString();

    timeDisplay.textContent = currentTime;
}

function makeActive(winId) {
    let win = getActiveWindow();
    if (win == winId) {
        setActiveWindow("");
    } else {
        setActiveWindow(winId);
    }
    updateWindows();
}

(() => {
    setInterval(updateTimeDisplay, 100);
    _activeWindow = getActiveWindow();
    updateWindows();
})();