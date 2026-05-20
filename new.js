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

let _settings = {
    "auto_cloak": false,
    "replace_original": false,
    "show_home": false,
    "show_particles": true
};

function getSettings() {
    let settings = JSON.parse(localStorage.getItem("settings"));
    if (settings == undefined) {
        settings = _settings;
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    return settings;
}

function updateSetting(k,v) {
    if (!Object.hasOwn(_settings, k)) {
        console.warn(`Failed to apply setting {${k} = ${v}}. ${k} not found`);
        return;
    }

    _settings[k] = v;
    localStorage.setItem("settings", JSON.stringify(_settings));

    applySettings();
}

function updateOptionElements() {
    let opts = document.getElementById("opts-stack");
    if (!opts) return;

    let settings = getSettings();
    for (let opt of opts.children) {
        if (!opt.classList.contains("option")) return;

        let check = opt.querySelector("input");
        let option = opt.id.slice(4, opt.id.length).replaceAll("-", "_");

        if (!Object.hasOwn(settings, option)) return;

        // All settings are boolean options for now so this is fine
        check.checked = settings[option];
    }
}

function updateOption(opt) {
    let elementId = `opt-${opt.replaceAll("_", "-")}`;
    let element = document.getElementById(elementId);
    if (!element) return;

    let check = element.querySelector("input");
    if (!check) return;
    updateSetting(opt, check.checked);
}

function applySettings() {
    updateOptionElements();
    let settings = getSettings();

    if (settings.auto_cloak == true) cloakSelf();
    if (settings.show_home == true) {
        let region = document.getElementById("esc-region");
        if (!region) return;
        region.classList.add("show-always");
    } else {
        let region = document.getElementById("esc-region");
        if (!region) return;
        region.classList.remove("show-always");
    }
    if (settings.show_particles == false) {
        let particles = document.getElementById("particles-js");
        if (!particles) return;
        particles.classList.add("hide");
    } else {
        let particles = document.getElementById("particles-js");
        if (!particles) return;
        particles.classList.remove("hide");
    }
}

function openUrl(id) {
    if (!Object.hasOwn(urls, id))
        return;
    
    openIframe(urls[id]);
}

function openIframe(url) {
    let presenter = document.getElementById("content-presenter");
    if (!presenter) return;
    presenter.classList.remove("hidden");

    let iframe = presenter.querySelector("iframe");
    if (!iframe) return;
    iframe.src = url;

    let home = document.getElementById("esc-wrapper");
    if (!home) return;
    home.classList.remove("hide");

    return;
}

function closeIframe() {
    let presenter = document.getElementById("content-presenter");
    if (!presenter) return;
    presenter.classList.add("hidden");

    let iframe = presenter.querySelector("iframe");
    if (!iframe) return;
    iframe.src = "";

    let home = document.getElementById("esc-wrapper");
    if (!home) return;
    home.classList.add("hide");
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

function cloakSelf() {
    // TODO: Implement
}

function openCloaked(url) {
    if (!URL.canParse(url) || url == "https://null") return;

    // Whether we're currently in an iframe
    let inFrame = false;
    try {
        inFrame = (window !== top);
    } catch {
        inFrame = true;
    }

    let ab = localStorage.getItem("ab") || true;
    localStorage.setItem("ab", ab);

    if (inFrame || !ab) return;

    let popup = open("about:blank", "_blank");
    setTimeout(() => {
        if (!popup || popup.closed) {
            alert("Popups are required for UGA self-cloaking. Please enable them :)");
            return;
        }

        let doc = popup.document;
        let iframe = doc.createElement("iframe");
        let link = doc.createElement("link");
        doc.title = "My Drive - Google Drive";
        link.rel = "icon";
        link.href = "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

        let toLoad = url ? decodeURIComponent(url) : location.href;

        iframe.src = toLoad;
        iframe.style = `
            position: absolute;
            top: 0px;
            left: 0px;
            width: 100vw;
            height: 100vh;
            border: none;
            padding: 0px;
            margin: 0px;
        `;

        doc.head.appendChild(link);
        doc.body.appendChild(iframe);
    }, 500);
}

(() => {
    setInterval(updateTimeDisplay, 100);
    _activeWindow = getActiveWindow();
    updateWindows();
    applySettings();
})();