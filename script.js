const characterFrame = document.querySelector(".character-frame");

document.addEventListener("mousemove", (event) => {
    if (!characterFrame || !characterFrame.contentWindow) return;

    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    characterFrame.contentWindow.postMessage({
        type: "mouse-position",
        x: x,
        y: y
    }, "*");
});

window.addEventListener("mouseout", (event) => {
    if (event.relatedTarget === null) {
        if (!characterFrame || !characterFrame.contentWindow) return;

        characterFrame.contentWindow.postMessage({
            type: "mouse-leave"
        }, "*");
    }
});

window.addEventListener("blur", () => {
    if (!characterFrame || !characterFrame.contentWindow) return;

    characterFrame.contentWindow.postMessage({
        type: "mouse-leave"
    }, "*");
});