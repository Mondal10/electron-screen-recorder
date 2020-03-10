const { desktopCapturer, remote } = require('electron');
const { Menu } = remote; // To make menu-popup

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