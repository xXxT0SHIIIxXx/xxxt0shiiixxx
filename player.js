const musicPlayer = (() => {
    const audio = new Audio();
    const listeners = { change: [], progress: [], ended: [] };
    let current = null;
    let isSwitching = false;

    audio.preload = "none";

    function emit(name, data){
        listeners[name].forEach(callback => callback(data));
    }

    function on(name, callback){
        listeners[name].push(callback);
    }

    function setMediaSession(track){
        if (!("mediaSession" in navigator)) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artwork: [{ src: new URL(track.coverSrc, location.href).href, sizes: "512x512" }]
        });
    }

    function load(track){
        current = track;
        isSwitching = !audio.paused;
        audio.src = track.audioSrc;
        audio.load();
        setMediaSession(track);
    }

    function play(track){
        visualizer.connect(audio);
        if (current !== track) load(track);
        emit("change", { track, state: "loading" });
        audio.play().catch(() => emit("change", { track, state: "paused" }));
    }

    function pause(){
        audio.pause();
    }

    function toggle(track){
        if (current === track && !audio.paused) pause();
        else play(track);
    }

    function seek(track, fraction){
        if (current !== track || !audio.duration) return;
        audio.currentTime = fraction * audio.duration;
    }

    function getProgress(){
        return { track: current, time: audio.currentTime, duration: audio.duration || 0 };
    }

    audio.addEventListener("playing", () => emit("change", { track: current, state: "playing" }));
    audio.addEventListener("waiting", () => emit("change", { track: current, state: "loading" }));
    audio.addEventListener("loadstart", () => { isSwitching = false; });
    audio.addEventListener("pause", () => {
        if (!isSwitching) emit("change", { track: current, state: "paused" });
    });
    audio.addEventListener("timeupdate", () => emit("progress", getProgress()));
    audio.addEventListener("loadedmetadata", () => emit("progress", getProgress()));
    audio.addEventListener("ended", () => emit("ended", current));
    audio.addEventListener("error", () => emit("change", { track: current, state: "error" }));

    if ("mediaSession" in navigator){
        navigator.mediaSession.setActionHandler("play", () => current && play(current));
        navigator.mediaSession.setActionHandler("pause", pause);
    }

    return { on, play, pause, toggle, seek };
})();
