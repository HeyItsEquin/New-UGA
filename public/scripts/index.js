const windowIds = [
    "ga-prox", "downloads", "tools", "info", "settings"
];

const urls = {
    "selenite": "https://mail.adriapartners.net",
    "prism": "https://schoolclassroomcanvacanvacodecom.7879.22web.org/",
    "interstellar": "https://potato.wwe.ddnss.de",
    "frogie": "https://mshjvxae.1vib36z.ddnss.de/",
    
    "suggestions": "https://forms.office.com/r/Q1b91AwsJ1"
}

let _activeWindow = "";

let _settings = {
    "auto_cloak": false,
    "replace_original": false,
    "show_home": false,
    "show_particles": true
};

let initSettingsApplied = false;

const LogLevel = {
    Info: 0,
    Warn: 1,
    Error: 2
};
function log(msg, lvl = 0, display = false) {
    switch (lvl) {
        case 0:
            console.log(msg);
            break;
        case 1:
            console.warn(msg);
            break;
        case 2:
            console.error(msg);
            break;
    }

    if (display) alert(msg);
}

const _downloadDir = "downloads/";
const GithubUrl = "HeyItsEquin/New-UGA";

// Small helper fn
String.prototype.removePrefix = function (s) {
    let pre = this.slice(0, s.length);
    if (pre === s)
        return this.slice(s.length, this.length);
    return this;
}

function joinPath(p1, p2) {
    if (p1.endsWith("/")) {
        return p1 + p2;
    } else {
        return p1 + "/" + p2;
    }
}

function getFilename(fp) {
    return fp.replace(/^.*[\\/]/, '');
}

function getStorageContext() {
    return window.opener ? window.opener.localStorage : localStorage;
}

function getSettings() {
    let storageSource = getStorageContext();

    let settings = JSON.parse(storageSource.getItem("settings"));
    if (settings == undefined) {
        settings = _settings;
        storageSource.setItem("settings", JSON.stringify(settings));
    }

    return settings;
}

function getSetting(k) {
    if (!Object.hasOwn(_settings, k)) return undefined;

    return _settings[k];
}

function updateSetting(k, v) {
    if (!Object.hasOwn(_settings, k)) {
        console.warn(`Failed to apply setting {${k} = ${v}}. ${k} not found`);
        return;
    }

    let storageSource = getStorageContext();

    let currentSettings = JSON.parse(storageSource.getItem("settings")) || _settings;
    currentSettings[k] = v;
    _settings[k] = v;

    storageSource.setItem("settings", JSON.stringify(currentSettings));

    applySettings();
}

function updateOptionElements() {
    let opts = document.getElementById("opts-stack");
    if (!opts) return;

    let settings = getSettings();
    for (let opt of opts.children) {
        if (!opt.classList.contains("option")) continue;

        let check = opt.querySelector("input");
        let option = opt.id.slice(4, opt.id.length).replaceAll("-", "_");

        if (!Object.hasOwn(settings, option)) continue;

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
    applySettingsVisuals();
}

function applySettingsVisuals() {
    let settings = getSettings();

    if (settings.auto_cloak == true && initSettingsApplied == false) cloakSelf();
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
    let storageSource = getStorageContext();
    _activeWindow = winId;
    storageSource.setItem("activeWindow", winId);
}

function getActiveWindow() {
    let storageSource = getStorageContext();
    let active = storageSource.getItem("activeWindow");
    if (active == undefined) {
        active = "";
        storageSource.setItem("activeWindow", "");
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
        win.classList.add("active");
        tab.classList.add("active");
    } else {
        win.classList.add("inactive");
        win.classList.remove("active");
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

function cloaxerPrompt() {
    let url = prompt("Enter URL to be cloaxed");
    openCloaked(url);
}

function cloakSelf() {
    let inFrame;
    try {
        inFrame = (window !== top);
    } catch {
        inFrame = true;
    }
    if (!inFrame) openCloaked(window.location.href);
}

function openCloaked(url) {
    if (!URL.canParse(url) || url == "https://null") {
        log(
            "Improper URL. (ex: https://example.com, example.com)",
            LogLevel.Error, true
        );
    }

    // Whether we're currently in an iframe
    let inFrame = false;
    try {
        inFrame = (window !== top);
    } catch {
        inFrame = true;
    }

    let storageSource = getStorageContext();
    let ab = storageSource.getItem("ab") || true;
    storageSource.setItem("ab", ab);

    if (inFrame || !ab) {
        openIframe(url);
        return;
    }

    let popup = open("about:blank", "_blank");
    if (!popup || popup.closed) {
        log("Popups are required for UGA self-cloaking. Please enable them :)",
            LogLevel.Warn, true
        )
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

    let settings = getSettings();
    if (settings.replace_original == true)
        location.replace("https://google.com/");

    let script = document.createElement("script");
    script.textContent = `
        window.onbeforeunload = (ev) => {
            let conf = "Leave Site?";
            (event || window.event).returnValue = conf;
            return conf;
        }
    `;

    // doc.body.appendChild(script);
}

async function downloadFile(rp, use_direct = false) {
    let fp = _downloadDir + rp;
    let downloadUrl = "";
    let fullPath = joinPath(GithubUrl, fp);

    if (use_direct)
        downloadUrl = `https://github.com/${fullPath}`;
    else
        downloadUrl = `https://cdn.jsdelivr.net/gh/${fullPath}`;

    let name = getFilename(rp);

    let res = await fetch(downloadUrl);
    let blob = await res.blob();
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

(() => {
    setInterval(updateTimeDisplay, 100);
    _activeWindow = getActiveWindow();
    updateWindows();
    applySettings();
    initSettingsApplied = true;
})();