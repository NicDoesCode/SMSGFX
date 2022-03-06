import DataStore from "./dataStore.js";
import UI from "./ui.js";
import Palette from "./palette.js";
import TileSet from './tileSet.js'
import AssemblyUtility from "./assemblyUtility.js";

const dataStore = new DataStore();
const ui = new UI();

$(() => {

    dataStore.loadFromLocalStorage();

    ui.init();

    ui.paletteInput = dataStore.appUI.lastPaletteInput;
    ui.paletteInputSystem = dataStore.appUI.lastPaletteInputSystem;
    ui.tileInput = dataStore.appUI.lastTileInput;

    ui.onImportPalette(eventData => handleImportPalette(eventData));
    ui.onImportTileSet(eventData => handleImportTileSet(eventData));

    if (dataStore.paletteList.length > 0) {
        const paletteIndex = dataStore.appUI.lastSelectedPaletteIndex;
        let palette = dataStore.paletteList.getPalette(paletteIndex);
        if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {
            palette = dataStore.paletteList.getPalette(paletteIndex);
        }
        ui.displayPalette(palette);
    }

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


/**
 * @param {import("./ui.js").ImportPaletteEventData} eventData 
 */
function handleImportPalette(eventData) {
    const system = eventData.system;
    const paletteData = eventData.value;
    const palette = new Palette(system, 0);
    if (system === 'gg') {
        const array = AssemblyUtility.readAsUint16Array(paletteData);
        palette.loadGameGearPalette(array);
    } else if (system === 'ms') {
        const array = AssemblyUtility.readAsUint8ClampedArray(paletteData);
        palette.loadMasterSystemPalette(array);
    } else throw new Error('System must be either ""ms" or "gg".');

    dataStore.paletteList.addPalette(palette);
    ui.displayPalette(palette);

    dataStore.appUI.lastPaletteInput = eventData.value;
    dataStore.appUI.lastPaletteInputSystem = eventData.system;
    dataStore.saveToLocalStorage();
}

/**
 * @param {import("./ui.js").ImportTileSetEventData} eventData 
 */
 function handleImportTileSet(eventData) {
    console.log('handleImportTileSet', eventData);
    const tileData = eventData.value;
    const array = AssemblyUtility.readAsUint8ClampedArray(tileData);
    const tileSet = TileSet.parsePlanarFormat(array);
    console.log('tileSet', tileSet);
    dataStore.tileSetList.addTileSet(tileSet);
    console.log('dataStore.getTileSets', dataStore.tileSetList.getTileSets());

    dataStore.appUI.lastTileInput = eventData.value;
    dataStore.saveToLocalStorage();
}
