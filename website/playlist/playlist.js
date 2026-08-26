const playlist = document.getElementById("playlist");

let currentAudio = null;
let currentCard = null;


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


/* =========================================================
   CREATE SONG CARD
   ========================================================= */

function createSongCard(song) {

    const card = document.createElement("article");

    card.className = "song-card";

    card.innerHTML = `

        <img
            class="song-cover"
            src="${song.cover}"
            alt="${song.title}">

        <div class="song-info">

            <h2>${song.title}</h2>

            <p>${song.artist}</p>

            <div class="player-row">

                <button
                    class="play-button"
                    aria-label="Play">

                    <svg
                        class="play-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none">

                        <path
                            d="M8 5L19 12L8 19V5Z"
                            fill="currentColor"/>

                    </svg>


                    <svg
                        class="pause-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none">

                        <rect
                            x="7"
                            y="5"
                            width="4"
                            height="14"
                            rx="1"
                            fill="currentColor"/>

                        <rect
                            x="13"
                            y="5"
                            width="4"
                            height="14"
                            rx="1"
                            fill="currentColor"/>

                    </svg>

                </button>


                <div class="progress-area">

                    <div class="progress-bar">

                        <div class="progress-fill"></div>

                    </div>


                    <div class="time">

                        <span class="current-time">
                            0:00
                        </span>

                        <span class="duration">
                            0:00
                        </span>

                    </div>

                </div>


                <a
                    class="download-button"
                    href="${song.audio}"
                    download
                    aria-label="Download">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none">

                        <path
                            d="M12 3V15"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>

                        <path
                            d="M7 11L12 16L17 11"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>

                        <path
                            d="M5 21H19"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"/>

                    </svg>

                </a>

            </div>

        </div>
    `;


    setupPlayer(card, song.audio);

    return card;
}


/* =========================================================
   SETUP PLAYER
   ========================================================= */

function setupPlayer(card, audioSource) {

    const playButton =
        card.querySelector(".play-button");

    const progressBar =
        card.querySelector(".progress-bar");

    const progressFill =
        card.querySelector(".progress-fill");

    const currentTime =
        card.querySelector(".current-time");

    const duration =
        card.querySelector(".duration");


    const audio =
        new Audio(audioSource);


    /* ---------------------------------------------------------
       METADATA
       --------------------------------------------------------- */

    audio.addEventListener("loadedmetadata", () => {

        duration.textContent =
            formatTime(audio.duration);

    });


    /* ---------------------------------------------------------
       PLAY / PAUSE
       --------------------------------------------------------- */

    playButton.addEventListener("click", async () => {

        /*
         * If another song is playing,
         * stop it first.
         */

        if (
            currentAudio &&
            currentAudio !== audio
        ) {

            stopCurrentSong();

        }


        /*
         * Pause
         */

        if (!audio.paused) {

            audio.pause();

            card.classList.remove("playing");

            return;
        }


        /*
         * Play
         */

        try {

            await audio.play();

            currentAudio = audio;
            currentCard = card;

            card.classList.add("playing");

        } catch (error) {

            console.error(
                "Unable to play audio:",
                error
            );

        }

    });


    /* ---------------------------------------------------------
       UPDATE PROGRESS
       --------------------------------------------------------- */

    audio.addEventListener("timeupdate", () => {

        if (!audio.duration) {
            return;
        }


        const percentage =
            (audio.currentTime / audio.duration) * 100;


        progressFill.style.width =
            `${percentage}%`;


        currentTime.textContent =
            formatTime(audio.currentTime);

    });


    /* ---------------------------------------------------------
       PROGRESS CLICK
       --------------------------------------------------------- */

    progressBar.addEventListener("click", (event) => {

        if (!audio.duration) {
            return;
        }


        const rect =
            progressBar.getBoundingClientRect();


        const clickPosition =
            event.clientX - rect.left;


        const percentage =
            Math.max(
                0,
                Math.min(
                    1,
                    clickPosition / rect.width
                )
            );


        audio.currentTime =
            percentage * audio.duration;

    });


    /* ---------------------------------------------------------
       SONG ENDED
       --------------------------------------------------------- */

    audio.addEventListener("ended", () => {

        resetSong(card);

        currentAudio = null;
        currentCard = null;

    });

}


/* =========================================================
   RESET SONG
   ========================================================= */

function resetSong(card) {

    if (!card) {
        return;
    }


    card.classList.remove("playing");


    const progressFill =
        card.querySelector(".progress-fill");

    const currentTime =
        card.querySelector(".current-time");


    if (progressFill) {
        progressFill.style.width = "0%";
    }


    if (currentTime) {
        currentTime.textContent = "0:00";
    }

}


/* =========================================================
   STOP CURRENT SONG
   ========================================================= */

function stopCurrentSong() {

    if (
        !currentAudio ||
        !currentCard
    ) {
        return;
    }


    currentAudio.pause();

    currentAudio.currentTime = 0;


    resetSong(currentCard);


    currentAudio = null;

    currentCard = null;

}


/* =========================================================
   LOAD PLAYLIST
   ========================================================= */

async function loadPlaylist() {

    try {

        const response =
            await fetch("songs.json");


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );

        }


        const songs =
            await response.json();


        if (!Array.isArray(songs)) {

            throw new Error(
                "songs.json must contain an array."
            );

        }


        playlist.innerHTML = "";


        if (songs.length === 0) {

            playlist.innerHTML = `

                <div class="empty-playlist">

                    <h2>No Music Available</h2>

                    <p>
                        Add songs to songs.json
                    </p>

                </div>

            `;

            return;

        }


        songs.forEach((song) => {

            const card =
                createSongCard(song);

            playlist.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Failed to load playlist:",
            error
        );


        playlist.innerHTML = `

            <div class="empty-playlist">

                <h2>Unable to Load Playlist</h2>

                <p>
                    Check your songs.json file.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   START
   ========================================================= */

loadPlaylist();