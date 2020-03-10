const { desktopCapturer, remote } = require('electron');
const { Menu } = remote; // To make menu-popup

const videoElement = document.getElementById('preview-video');

const videoSelectionBtn = document.getElementById('video-selection-btn');
videoSelectionBtn.addEventListener('click', getVideoSources);

// Get all the available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    );

    videoOptionsMenu.popup();
}

// MediaRecorder instance to capture footage
let mediaRecorder;
const recordedChunks = [];

// Change the video source window to record
async function selectSource(source) {
    videoSelectionBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create a Stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the source in video element
    videoElement.srcObject = stream;
    videoElement.play();
};