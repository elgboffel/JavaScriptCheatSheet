/*global YT */

/**
 * Created by nni on 09-03-2017.
 */

import {addEvent, removeEvent} from "../utils/events/events";
import elementInViewport from "../utils/dom/elementInViewport";
import onScroll from "../utils/events/onScroll";
import classList from "../utils/dom/classList";

const playingVideos = [],
    videoPlayers = {},
    youtubesNotLoaded = [],
    iFrameScriptIsReadyCallbacks = [];

let youtubeContainers,
    iFrameScriptInjected = false,
    iFrameScriptIsReady = false,
    showPlayIcon = true,
    activateOnScroll = false;

const containerClassName = "youtube-embed";
const iconClassName = `${containerClassName}__play-icon`;
const loadedClassName = `${containerClassName}--loaded`;
const playingClassName = `${containerClassName}--playing`;
const pausedClassName = `${containerClassName}--paused`;
const endedClassName = `${containerClassName}--ended`;


/**
 * The data attribute to use when getting the needed video ID from a DOM element.
 *
 * @type {string}
 */
const videoDataAttribute = "data-youtube-id";


/**
 * Set activate on scroll to true or false
 *
 * @param {boolean} state
 */
export function setActivateOnScroll(state) {
    activateOnScroll = state;
}


/**
 * Show YouTube's play icon - true or false
 *
 * @param {boolean} state
 */
export function setShowPlayIcon(state) {
    showPlayIcon = state;
}


/**
 * Get the ID-property of a given element. If no ID exists, generate a random one and set that immediately.
 *
 * @param {HTMLElement|Element} htmlElement
 * @returns {string}
 */
function getDOMID(htmlElement) {

    let domID = htmlElement.id;

    if (!domID) {
        domID = `ytvid_${Math.round(Math.random() * 123789745)}-${new Date().getTime()}`;
        htmlElement.id = domID;
    }

    return domID;

}


/**
 * onPlayerReady.
 * This function runs once a youTube Player is ready
 * If activateOnScroll is true it mutes the video and then removes the video from youtubeNotLoaded
 *
 * @param {object} e - Object from YouTube API
 */
function onPlayerReady(e) {

    const player = e.target;
    const container = player.getIframe().parentNode;

    // Add class to wrapper, in case styling should be different on a loaded video
    classList.add(container, loadedClassName);

    if (activateOnScroll) {
        player.mute();
    }

}


/**
 * playerStopped
 * Run this when a video is stopped or paused to remove it from the array of playing videos
 *
 * @param {object} player
 */
function playerStopped(player) {

    const iframe = player.getIframe();
    const playerArrayIndex = playingVideos.indexOf(iframe);

    if (playerArrayIndex > -1) {
        playingVideos.splice(playerArrayIndex, 1);
    }

}


/**
 * onPlayerStateChange.
 * This function runs when a youTube Player starts playing, is paused or has ended
 *
 * @param {object} e - Object from YouTube API
 */
function onPlayerStateChange(e) {

    const player = e.target;
    const iframe = player.getIframe();
    const container = iframe.parentNode;

    if (e.data === YT.PlayerState.PLAYING) {

        // Video playing
        // -------------

        // Add class to wrapper, telling the video is playing
        classList.remove(container, pausedClassName);
        classList.remove(container, endedClassName);
        classList.add(container, playingClassName);

        // Add player to array of playing videos
        playingVideos.push(iframe);

        playingVideos.forEach(playingVideo => {
            if (playingVideo !== iframe) {
                const videoId = getDOMID(playingVideo.parentNode);
                if (videoPlayers[videoId]) {
                    videoPlayers[videoId].pauseVideo();
                }
            }
        });

    } else if (e.data === YT.PlayerState.PAUSED) {

        // Video paused
        // ------------

        // Add class to wrapper, telling the video is paused
        classList.remove(container, playingClassName);
        classList.add(container, pausedClassName);

        // Remove player from array of playing videos
        playerStopped(player);

    } else if (e.data === YT.PlayerState.ENDED) {

        // Video ended
        // -----------

        // Add class to wrapper, telling the video has ended
        classList.remove(container, playingClassName);
        classList.add(container, endedClassName);

        // Remove player from array of playing videos
        playerStopped(player);

    }

}


/**
 * loadVideos.
 * This function sets up a youTube Player in a given videoContainer
 * and sets an onReady event to run once the player fully loaded.
 *
 * @param {HTMLElement} video - videoContainer with a youTube-video-id set as data-youtube-id
 * @param {string} youtubeId - youtubeId of the video to load
 */
function loadVideo(video, youtubeId) {

    removeEvent(video, "click");

    const wrapper = document.createElement("div");
    video.appendChild(wrapper);

    const videoID = getDOMID(video);

    videoPlayers[videoID] = new YT.Player(wrapper, {
        videoId: youtubeId,
        playerVars: {
            autoplay: 1,
            controls: 2,
            showinfo: 0,
            autohide: 1,
            rel: 0
        },
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    });

    // Remove player from array of players that are not loaded
    const playerArrayIndex = youtubesNotLoaded.indexOf(video);
    if (playerArrayIndex > -1) {
        youtubesNotLoaded.splice(playerArrayIndex, 1);
    }

}


/**
 * Simple function loading the YouTube iframe API by inserting an async script-tag. Will return a promise that will
 * resolve once the API is ready.
 *
 * @returns {Promise}
 */
export function loadYouTubeAPI() {

    return new Promise(scriptReady => {
        if (!iFrameScriptIsReady) {
            if (!iFrameScriptInjected) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                tag.setAttribute("async", "true");

                const firstScriptTag = document.getElementsByTagName("script")[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                iFrameScriptInjected = true;
            }

            iFrameScriptIsReadyCallbacks.push(scriptReady);
        } else {
            scriptReady();
        }

    });

}


/**
 * Add a new video dynamically
 *
 * @param {HTMLElement} videoContainer - videoContainer with a youTube-video-id set as data-youtube-id
 */
export function addNewVideo(videoContainer) {

    const videoID = videoContainer.getAttribute(videoDataAttribute);

    if (!classList.contains(videoContainer, loadedClassName)) {
        youtubesNotLoaded.push(videoContainer);
    }

    if (showPlayIcon) {
        videoContainer.innerHTML += `<svg class="${iconClassName}" viewBox="0 0 68 48"><path class="ytp-large-play-button-bg" d="m .66,37.62 c 0,0 .66,4.70 2.70,6.77 2.58,2.71 5.98,2.63 7.49,2.91 5.43,.52 23.10,.68 23.12,.68 .00,-1.3e-5 14.29,-0.02 23.81,-0.71 1.32,-0.15 4.22,-0.17 6.81,-2.89 2.03,-2.07 2.70,-6.77 2.70,-6.77 0,0 .67,-5.52 .67,-11.04 l 0,-5.17 c 0,-5.52 -0.67,-11.04 -0.67,-11.04 0,0 -0.66,-4.70 -2.70,-6.77 C 62.03,.86 59.13,.84 57.80,.69 48.28,0 34.00,0 34.00,0 33.97,0 19.69,0 10.18,.69 8.85,.84 5.95,.86 3.36,3.58 1.32,5.65 .66,10.35 .66,10.35 c 0,0 -0.55,4.50 -0.66,9.45 l 0,8.36 c .10,4.94 .66,9.45 .66,9.45 z"></path><path d="m 26.96,13.67 18.37,9.62 -18.37,9.55 -0.00,-19.17 z" fill="#fff"></path><path d="M 45.02,23.46 45.32,23.28 26.96,13.67 43.32,24.34 45.02,23.46 z" fill="#ccc"></path></svg>`;
    }

    if (typeof(YT) !== "undefined") {
        loadVideo(videoContainer, videoID);
    } else {
        // Load youtube API Light
        loadYouTubeAPI();
    }

}


/**
 * Initialize the YouTube Embedder
 *
 * @param {string|NodeList} youtubeEmbeds - A list of or a selector for the elements we want to embed videos into
 */
export function youtubeEmbedder(youtubeEmbeds) {

    if (typeof youtubeEmbeds === "string") {
        youtubeContainers = document.querySelectorAll(youtubeEmbeds);
    } else if (typeof youtubeEmbeds === "object" && youtubeEmbeds.length) {
        youtubeContainers = youtubeEmbeds;
    } else {
        throw "youtubeContainer not given as string or nodeList";
    }

    // Save the NodeList of youtubeContainers into an Array
    const totalImages = youtubeContainers.length;
    if (totalImages) {
        for (let i = 0; i < totalImages; i += 1) {
            addNewVideo(youtubeContainers[i]);
        }
    }

}


/**
 * detectViewableVideo
 * This function runs on the onScroll-event (if activateOnScroll is true)
 * calling the loadVideo function when a video shows up in the viewport
 * Also pauses playingVideos when scrolled out of view.
 */
function detectViewableVideo() {

    youtubesNotLoaded.forEach(videoDOM => {

        if (elementInViewport(videoDOM)) {
            const videoId = getDOMID(videoDOM);

            if (!videoPlayers[videoId]) {
                const youtubeId = videoDOM.getAttribute(videoDataAttribute);
                loadVideo(videoDOM, youtubeId);
            }
        }

    });

    if (playingVideos.length) {

        const pausedVideos = [];
        for (let i = playingVideos.length - 1; i >= 0; i -= 1) {
            const playingVideo = playingVideos[i];
            if (!elementInViewport(playingVideo)) {
                const videoId = getDOMID(playingVideo.parentNode);
                videoPlayers[videoId].pauseVideo();
                pausedVideos.push(playingVideo);
            }
        }

        for (let i = pausedVideos.length - 1; i >= 0; i -= 1) {
            playingVideos.splice(pausedVideos[i], 1);
        }

    }

}


/**
 * onYouTubeIframeAPIReady
 * This function runs once the youTubeAPI is loaded
 * Then it preloads lowquality thumbnails for video-containers (optional
 * and sets up event to replace them with iframe-video
 * The event is either onclick or when scrolled into view depending on the activateOnScroll setting.
 *
 * This function-name is predefined, inside YouTube's API, to be called once it is ready.
 * So we are attaching our own function to this function-name, to be run once the Youtube API has loaded.
 *
 * Based on the YouTube ID, we can find the video-poster-image in various formats.
 * Change the value of posterImgFormat to any of the following:
 * "default.jpg" = 120px X 90px (16:9)
 * "mqdefault.jpg" = 320px X 180px (16:9)
 * "hqdefault.jpg" = 480px X 360px (4:3)
 * "sddefault.jpg" = 640px X 480px (4:3)
 * "maxresdefault.jpg" = 1280px X 720px (16:9)
 *
 * Note: Some old videos don't have poster-images in all formats
 */
window.onYouTubeIframeAPIReady = () => {

    iFrameScriptIsReady = true;

    youtubesNotLoaded.forEach(videoDOM => {

        const youtubeId = videoDOM.getAttribute(videoDataAttribute);
        const posterImgFormat = "mqdefault.jpg";

        // Set video poster image
        videoDOM.style.backgroundImage = `url(https://img.youtube.com/vi/${youtubeId}/${posterImgFormat})`;

        addEvent(videoDOM, "click", () => {
            if (playingVideos.length) {
                const videoId = getDOMID(playingVideos[0].parentNode);
                videoPlayers[videoId].pauseVideo();
            }

            loadVideo(videoDOM, youtubeId);
        });

    });

    iFrameScriptIsReadyCallbacks.forEach(callback => callback());

    if (activateOnScroll) {
        onScroll(window, detectViewableVideo, 250);
    }

};


export default youtubeEmbedder;
