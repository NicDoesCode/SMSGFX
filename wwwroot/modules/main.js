import DataStore from "./dataStore.js";
import UI from "./ui.js";
import Palette from "./palette.js";
import TileSet from './tileSet.js'
import AssemblyUtility from "./assemblyUtility.js";
import TileCanvas from "./tileCanvas.js";

const dataStore = new DataStore();
const ui = new UI();
const tileCanvas = new TileCanvas();

/** @type {string} */
let selectedTool = null;

$(() => {

    dataStore.loadFromLocalStorage();

    ui.init();

    ui.paletteInput = dataStore.appUI.lastPaletteInput;
    ui.paletteInputSystem = dataStore.appUI.lastPaletteInputSystem;
    ui.tileInput = dataStore.appUI.lastTileInput;

    ui.populatePaletteSelector(dataStore.paletteList.getPalettes());
    ui.selectedPaletteIndex = dataStore.appUI.lastSelectedPaletteIndex;

    ui.onImportPalette(eventData => handleImportPalette(eventData));
    ui.onImportTileSet(eventData => handleImportTileSet(eventData));
    ui.onPaletteChange(eventData => handleOnPaletteChange(eventData));
    ui.onRemovePalette(eventData => handleRemovePalette(eventData));
    ui.onPaletteColourSelect(eventData => handlePaletteColourSelect(eventData));
    ui.onSelectedToolChanged(eventData => handleSelectedToolChanged(eventData));

    ui.onCanvasMouseMove(eventData => handleCanvasMouseMove(eventData));
    ui.onCanvasMouseDown(eventData => handleCanvasMouseDown(eventData));

    const palette = getPalette();
    const tileSet = getTileSet();

    if (palette) {
        ui.displayPalette(getPalette());
        if (tileSet) {
            // Display the last used tile set.
            tileCanvas.palette = palette;
            tileCanvas.tileSet = tileSet;
            tileCanvas.drawUI(ui.canvas);
        }
    }
});

function getTileSet() {
    if (dataStore.tileSetList.length > 0) {
        return dataStore.tileSetList.getTileSet(0);
    } else return null;
}

function getPalette() {
    if (dataStore.paletteList.length > 0) {
        const paletteIndex = ui.selectedPaletteIndex;
        let palette = dataStore.paletteList.getPalette(paletteIndex);
        if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {
            palette = dataStore.paletteList.getPalette(paletteIndex);
        }
        return palette;
    } else return null;
}

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
    const tileData = eventData.value;
    const array = AssemblyUtility.readAsUint8ClampedArray(tileData);
    const tileSet = TileSet.parsePlanarFormat(array);
    dataStore.tileSetList.addTileSet(tileSet);

    dataStore.appUI.lastTileInput = eventData.value;
    dataStore.saveToLocalStorage();
}

/**
 * @param {import("./ui.js").CanvasMouseEventData} eventData 
 */
function handleCanvasMouseMove(eventData) {

    const colourIndex = ui.selectedPaletteColourIndex;
    const tileSet = getTileSet();
    const palette = getPalette();
    const canvas = eventData.canvas;
    const mouse = eventData.mouseEvent;
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouse.clientX - rect.left;
    const canvasY = mouse.clientY - rect.top;
    const imageX = Math.floor(canvasX / 10);
    const imageY = Math.floor(canvasY / 10);

    if (ui.canvasMouseIsDown) {
        takeToolAction(selectedTool, colourIndex, imageX, imageY);
    }

    // Update the UI
    tileCanvas.drawUI(ui.canvas, canvasX, canvasY);

    // Show the palette colour
    const pixel = tileSet.getPixelAt(imageX, imageY);
    ui.highlightPaletteItem(pixel);

}

/**
 * @param {import("./ui.js").CanvasMouseEventData} eventData 
 */
function handleCanvasMouseDown(eventData) {
    const colourIndex = ui.selectedPaletteColourIndex;
    const canvas = eventData.canvas;
    const mouse = eventData.mouseEvent;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((mouse.clientX - rect.left) / 10);
    const y = Math.floor((mouse.clientY - rect.top) / 10);

    takeToolAction(selectedTool, colourIndex, x, y);
}

const lastPencilPixel = { x: -1, y: -1 };

function takeToolAction(tool, colourIndex, imageX, imageY) {
    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === 'pencil') {
            if (imageX !== lastPencilPixel.x || imageY !== lastPencilPixel.y) {

                lastPencilPixel.x = imageX;
                lastPencilPixel.y = imageY;

                // Show the palette colour
                const tileSet = getTileSet();
                tileSet.setPixelAt(imageX, imageY, colourIndex);

                // Update the UI
                tileCanvas.invalidateImage();
                tileCanvas.drawUI(ui.canvas, imageX, imageY);

            }
        }

    }

}

/**
 * @param {import("./ui.js").PaletteChangeEventData} eventData 
 */
function handleOnPaletteChange(eventData) {
    if (eventData.newIndex !== eventData.oldIndex) {

        // Swap palette
        const palette = dataStore.paletteList.getPalette(eventData.newIndex);
        ui.displayPalette(palette);

        // Refresh image
        tileCanvas.palette = palette;
        tileCanvas.drawUI(ui.canvas, 0, 0);

        // Store palette index to local storage
        dataStore.appUI.lastSelectedPaletteIndex = eventData.newIndex;
        dataStore.saveToLocalStorage();
    }
}

/**
 * @param {import("./ui.js").RemovePaletteEventData} eventData 
 */
function handleRemovePalette(eventData) {
    if (eventData.index >= 0 && eventData.index < dataStore.paletteList.length) {

        // Remove palette
        dataStore.paletteList.removeAt(eventData.index);
        ui.populatePaletteSelector(dataStore.paletteList.getPalettes());
        const newSelectedIndex = Math.min(eventData.index, dataStore.paletteList.length - 1);
        if (dataStore.paletteList.length > 0) {
            ui.selectedPaletteIndex = newSelectedIndex;
            dataStore.appUI.lastSelectedPaletteIndex = newSelectedIndex;
        } else {
            ui.displayPalette(new Palette());
            dataStore.appUI.lastSelectedPaletteIndex = -1;
        }
        dataStore.saveToLocalStorage();

        // Refresh image
        tileCanvas.palette = getPalette();
        tileCanvas.drawUI(ui.canvas, 0, 0);
    }
}

/**
 * @param {import("./ui.js").PaletteColourSelectEventData} eventData 
 */
function handlePaletteColourSelect(eventData) {
    if (eventData.index >= -1 && eventData.index < 16) {
        ui.selectedPaletteColourIndex = eventData.index;
    }
}

/**
 * @param {import("./ui.js").SelectedToolChangedEventData} eventData 
 */
function handleSelectedToolChanged(eventData) {
    selectedTool = eventData.tool;
    ui.highlightTool(eventData.tool);
}