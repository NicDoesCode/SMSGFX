import DataStore from "./dataStore.js";
import UI from "./ui.js";

const dataStore = new DataStore();
const ui = new UI();

$(() => {

    dataStore.loadPalettesFromLocalStorage();
    dataStore.loadTileSetsFromLocalStorage();

    ui.init();

    ui.paletteInput = dataStore.getLastRawPalette();
    UI.setLastUsedPaletteText(dataStore.getLastRawPalette());
    UI.setLastUsedTilesText(dataStore.getLastRawTiles());

    UI.createPaletteButtons();
    UI.displayPalette(dataStore.getPalettes()[0]);

});

function setNewPalette() {
    console.log('setNewPalette');
}

function setTiles() {
    console.log('setTiles');
}

export default {
    dataStore,
    setNewPalette,
    setTiles
}