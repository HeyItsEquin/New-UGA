/*
https://cdn.jsdelivr.net/gh/ddddd-dbase/New-UGA@main/script.js
https://cdn.jsdelivr.net/gh/ddddd-dbase/uga@main/script.js
https://cdn.jsdelivr.net/gh/ddddd-dbase/potatopcs@main/script.js
*/

function selenite() {
    openIFrame("https://mail.adriapartners.net");
}
function prism() {
    openIFrame("https://schoolclassroomcanvacanvacodecom.7879.22web.org/");
}
function interstellar() {
    openIFrame("https://potato.wwe.ddnss.de");
}
function frogie() {
    openIFrame("https://mshjvxae.1vib36z.ddnss.de/");
}

const popup = document.getElementById("popup");

if (!(Date.now() > 1779177600000)) {
    popup.remove();
}

let displaydate = new Date().toLocaleString();
const timetext = document.getElementById("time");

timetext.innerText = displaydate;

setInterval(() => {
    displaydate = new Date().toLocaleString();
    timetext.innerText = displaydate;
}, 200);

function closepopup() {
    popup.remove();
}

let currenttab = "none";

function opentab(tab) {
    if (currenttab != "none") {
        closetab();
    }
    if (currenttab != tab) {
        currenttab = tab;
        const tabTemp = document.getElementById(currenttab);
        tabTemp.classList.add("open");
        const tabToOpen = document.getElementById(tab + "_b");
        tabToOpen.classList.add("open");
    } else {
        currenttab = "none";
    }
}

function closetab() {
    if (currenttab != "none") {
        const tabTemp = document.getElementById(currenttab);
        tabTemp.classList.remove("open");
        const tabtoclose = document.getElementById(currenttab + "_b");
        tabtoclose.classList.remove("open");
    }
}

const removeme = document.getElementById("removeme");
setTimeout(() => {
    removeme.remove();
}, 100);

const escbutton = document.getElementById("escbutton");
function opencloak(url) {
    if (URL.canParse(url) && url != "https://null") {
        let inFrame;
        try {
            inFrame = window !== top;
        } catch (e) {
            inFrame = true;
        }
        if (!localStorage.getItem("ab")) localStorage.setItem("ab", true);
        if (!inFrame && localStorage.getItem("ab") === "true") {
            const popup = open("about:blank", "_blank");
            setTimeout(() => {
                if (!popup || popup.closed) {
                    alert(
                        "Popups are required for UGA self-cloaking. Please enable them :)",
                    );
                } else {
                    const doc = popup.document;
                    const iframe = doc.createElement("iframe");
                    const style = iframe.style;
                    const link = doc.createElement("link");
                    doc.title = "My Drive - Google Drive";
                    link.rel = "icon";
                    link.href =
                        "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

                    //const urlParams = new URLSearchParams(window.location.search);
                    //const targetUrl = urlParams.get("url");

                    const siteToLoad = url ? decodeURIComponent(url) : location.href;

                    iframe.src = siteToLoad;
                    style.position = "fixed";
                    style.top = style.bottom = style.left = style.right = 0;
                    style.border = style.outline = "none";
                    style.width = style.height = "100%";
                    doc.head.appendChild(link);
                    doc.body.appendChild(iframe);

                    if (localStorage.getItem("replacecloak") == "true") {
                        location.replace("https://google.com");
                    }

                    const script = doc.createElement("script");
                    script.textContent = `
                window.onbeforeunload = function (event) {
                  const confirmationMessage = 'Leave Site?';
              (event || window.event).returnValue = confirmationMessage;
              return confirmationMessage;
            };
          `;
                    doc.head.appendChild(script);
                }
            }, 1000);
        } else {
            openIFrame(url);
        }
    } else {
        alert("Improper URL. (ex: example.com )");
    }
}

function openIFrame(url) {
    window.scrollTo(0, 0);
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.id = "delete";
    document.body.appendChild(iframe);
    escbutton.style.display = "block";
    const screen = document.createElement("div");
    const text = document.createElement("h2");
    text.textContent = "Loading...";
    screen.id = "error";
    screen.classList.add("error");
    console.log(screen);
    document.body.appendChild(screen);
    screen.appendChild(text);
}

const replacemain = document.getElementById("replacemain");
const selfcloak = document.getElementById("self-cloak");

if (localStorage.getItem("cloak") == "true") {
    let inFrame;
    try {
        inFrame = window !== top;
    } catch (e) {
        inFrame = true;
    }
    selfcloak.checked = true;
    if (!inFrame) {
        opencloak(window.location.href);
    }
}

const particletoggle = document.getElementById("particletoggle");
const particlesdiv = document.getElementById("particles-js");

particletoggle.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        particlesdiv.style.display = "block";
        localStorage.setItem("particles", "true");
    } else {
        particlesdiv.style.display = "none";
        localStorage.setItem("particles", "false");
    }
});

if (localStorage.getItem("particles") == "false") {
    particlesdiv.style.display = "none";
    particletoggle.checked = false;
}

if (localStorage.getItem("replacecloak") == "true") {
    replacemain.checked = true;
}

selfcloak.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        localStorage.setItem("cloak", "true");
    } else {
        localStorage.setItem("cloak", "false");
    }
});

replacemain.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        localStorage.setItem("replacecloak", "true");
    } else {
        localStorage.setItem("replacecloak", "false");
    }
});

escbutton.addEventListener("click", () => {
    const todelete = document.getElementById("delete");
    const screentodelete = document.getElementById("error");
    if (todelete) {
        screentodelete.remove();
        todelete.classList.add("hidden");
        setTimeout(() => {
            todelete.remove();
        }, 400);
    }
    escbutton.style.display = "none";
});

const esctoggle = document.getElementById("hometoggle");

esctoggle.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        escbutton.style.transform = "translate(-50%,0px)";
        localStorage.setItem("showesc", "true");
    } else {
        escbutton.style.transform = "translate(-50%,-70%)";
        localStorage.setItem("showesc", "false");
    }
});

if (localStorage.getItem("showesc") == "true") {
    escbutton.style.transform = "translate(-50%,0px)";
    esctoggle.checked = true;
}

window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "";
});

async function downloadfile(path, name) {
    const url =
        "https://cdn.jsdelivr.net/gh/ddddd-dbase/New-UGA@main/" + path;
    console.log(url);
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}