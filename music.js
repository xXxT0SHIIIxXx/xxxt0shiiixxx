const trackRoot = "Tracks/";
const placeholderSrc = trackRoot + "placeholder.png";
const soundcloudPlayer = "https://w.soundcloud.com/player/?color=%230088ff&auto_play=true&visual=true&hide_related=true&show_comments=false&show_teaser=false&url=";
const soundcloudInfo = "https://soundcloud.com/oembed?format=json&url=";
const trackGrid = document.querySelector(".trackGrid");
const trackTemplate = document.getElementById("trackTemplate");
const tracks = (window.trackList || []).filter(entry => entry && (entry.file || entry.soundcloud)).map(createTrack);
let isSeeking = false;

function createTrack(entry){
    return {
        title: entry.title || (entry.file || "").split("/").pop().replace(/\.[^.]+$/, ""),
        description: entry.description || "",
        audioSrc: entry.file ? trackRoot + entry.file : "",
        coverSrc: entry.cover ? trackRoot + entry.cover : placeholderSrc,
        soundcloud: entry.soundcloud || "",
        entry,
        card: null
    };
}

function formatTime(seconds){
    if (!isFinite(seconds) || seconds <= 0) return "--:--";
    const minutes = Math.floor(seconds / 60);
    return minutes + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
}

function getPart(track, name){
    return track.card.querySelector(".trackCard__" + name);
}

function setCover(track, src){
    const image = getPart(track, "img");
    image.onerror = () => {
        image.onerror = null;
        image.src = placeholderSrc;
    };
    image.src = src;
    image.alt = track.title + " cover art";
}

function fillSoundcloudInfo(track, entry){
    if (entry.title && entry.cover) return;
    fetch(soundcloudInfo + encodeURIComponent(track.soundcloud))
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(info => {
            if (!entry.title && info.title) getPart(track, "title").textContent = track.title = info.title;
            if (!entry.cover && info.thumbnail_url) setCover(track, info.thumbnail_url);
        })
        .catch(() => {});
}

function closeEmbeds(){
    trackGrid.querySelectorAll(".trackCard__embed").forEach(embed => embed.remove());
}

function openEmbed(track){
    musicPlayer.pause();
    closeEmbeds();
    const embed = document.createElement("iframe");
    embed.className = "trackCard__embed";
    embed.allow = "autoplay";
    embed.title = track.title + " on SoundCloud";
    embed.src = soundcloudPlayer + encodeURIComponent(track.soundcloud);
    getPart(track, "cover").appendChild(embed);
}

function onPlayClick(track){
    if (track.soundcloud) return openEmbed(track);
    closeEmbeds();
    musicPlayer.toggle(track);
}

function bindSeek(track){
    const seekBar = getPart(track, "seek");
    seekBar.addEventListener("input", () => {
        isSeeking = true;
        seekBar.style.setProperty("--progress", seekBar.value / 10 + "%");
    });
    seekBar.addEventListener("change", () => {
        isSeeking = false;
        musicPlayer.seek(track, seekBar.value / 1000);
    });
}

function buildCard(track){
    track.card = trackTemplate.content.firstElementChild.cloneNode(true);
    getPart(track, "title").textContent = track.title;
    getPart(track, "desc").textContent = track.description;
    getPart(track, "play").setAttribute("aria-label", "Play " + track.title);
    setCover(track, track.coverSrc);
    getPart(track, "play").addEventListener("click", () => onPlayClick(track));
    if (track.soundcloud || !visualizer.isSupported) getPart(track, "canvas").remove();
    if (track.soundcloud){
        track.card.classList.add("trackCard--soundcloud");
        fillSoundcloudInfo(track, track.entry);
    } else {
        bindSeek(track);
    }
    return track.card;
}

function showState({ track, state }){
    tracks.forEach(other => {
        if (other === track || other.soundcloud) return;
        other.card.classList.remove("trackCard--playing", "trackCard--loading");
        getPart(other, "play").setAttribute("aria-label", "Play " + other.title);
    });
    if (!track) return;
    const isActive = state === "playing" || state === "loading";
    track.card.classList.toggle("trackCard--playing", isActive);
    track.card.classList.toggle("trackCard--loading", state === "loading");
    getPart(track, "play").setAttribute("aria-label", (isActive ? "Pause " : "Play ") + track.title);
    if (state === "playing") visualizer.start(getPart(track, "canvas"));
    if (state === "paused" || state === "error") visualizer.stop();
    if (state === "error") getPart(track, "time").textContent = "Could not load";
}

function showProgress({ track, time, duration }){
    if (!track || isSeeking) return;
    const fraction = duration ? time / duration : 0;
    const seekBar = getPart(track, "seek");
    seekBar.value = Math.round(fraction * 1000);
    seekBar.style.setProperty("--progress", fraction * 100 + "%");
    getPart(track, "time").textContent = formatTime(time).replace("--:--", "0:00") + " / " + formatTime(duration);
}

function playNext(track){
    const localTracks = tracks.filter(item => !item.soundcloud);
    const next = localTracks[localTracks.indexOf(track) + 1];
    if (next) musicPlayer.play(next);
    else showState({ track, state: "paused" });
}

function renderTracks(){
    if (tracks.length === 0){
        document.querySelector(".musicEmpty").hidden = false;
        return;
    }
    const fragment = document.createDocumentFragment();
    tracks.forEach(track => fragment.appendChild(buildCard(track)));
    trackGrid.appendChild(fragment);
    observeAnimated(trackGrid);
}

trackGrid.addEventListener("contextmenu", event => {
    if (event.target.closest(".trackCard__cover")) event.preventDefault();
});
musicPlayer.on("change", showState);
musicPlayer.on("progress", showProgress);
musicPlayer.on("ended", playNext);
renderTracks();
