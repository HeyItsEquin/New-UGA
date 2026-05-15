function updateTimeDisplay() {
    const timeDisplay = document.getElementById("current-time");
    if (!timeDisplay) return;

    let currentTime = new Date().toLocaleString();

    timeDisplay.textContent = currentTime;
}

(() => {
    setInterval(updateTimeDisplay, 100);
})();