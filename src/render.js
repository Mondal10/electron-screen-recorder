const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const { Menu, dialog } = remote; // To make menu-popup

const videoElement = document.getElementById('preview-video');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

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

    // Initiate the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Registering event handler for start and stop recording
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
};

// Record and Save a Video File
startBtn.addEventListener('click', e => {
    mediaRecorder.start();
    startBtn.classList.add('is-warning');
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startBtn.innerText = 'Recording';
});

stopBtn.addEventListener('click', e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-warning');
    startBtn.disabled = false;
    stopBtn.disabled = true;
    startBtn.innerText = 'Start';
});

// Capture all recorder chunks
function handleDataAvailable(e) {
    console.log('Video data available');
    recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save Video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}
