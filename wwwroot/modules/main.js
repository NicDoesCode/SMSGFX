import DataStore from "./dataStore.js";
import Palette from "./palette.js";
import TileSet from './tileSet.js'
import AssemblyUtility from "./assemblyUtility.js";
import TileCanvas from "./tileCanvas.js";
import Fill from "./fill.js";
import ColourPickerModalDialogue from "./ui/colourPickerModalDialogue.js";
import PaletteModalDialogue from "./ui/paletteModalDialogue.js";
import TileModalDialogue from "./ui/tileModalDialogue.js";
import ExportModalDialogue from "./ui/exportModalDialogue.js";
import PaletteToolbox from "./ui/paletteToolbox.js";
import TileEditor from "./ui/tileEditor.js";
import HeaderBar from "./ui/headerBar.js";
import ProjectFile from "./util/projectFile.js";
import ColourUtil from './util/colourUtil.js'
import TileSetList from "./tileSetList.js";
import PaletteList from "./paletteList.js";

const dataStore = new DataStore();
const tileCanvas = new TileCanvas();

const paletteDialogue = new PaletteModalDialogue(document.getElementById('tbPaletteDialogue'));
const tileDialogue = new TileModalDialogue(document.getElementById('tbTileDialogue'));
const exportDialogue = new ExportModalDialogue(document.getElementById('tbExportDialogue'));
const colourPickerDialogue = new ColourPickerModalDialogue(document.getElementById('tbColourPickerDialogue'));
const paletteToolbox = new PaletteToolbox(document.getElementById('tbPaletteToolbox'));
const tileEditor = new TileEditor(document.getElementById('tbTileEditor'));
const headerBar = new HeaderBar(document.getElementById('tbHeaderBar'));

/** @type {string} */
let selectedTool = null;

$(() => {

    dataStore.loadFromLocalStorage();

    createDefaultPalettesAndTileSetIfNoneExist();

    headerBar.onProjectLoad = handleHeaderBarProjectLoad;
    headerBar.onProjectSave = handleHeaderBarProjectSave;
    headerBar.onCodeExport = handleHeaderBarCodeExport;

    paletteDialogue.inputData = dataStore.appUI.lastPaletteInput;
    paletteDialogue.inputSystem = dataStore.appUI.lastPaletteInputSystem;
    paletteDialogue.onConfirm = handleImportPalette;

    tileDialogue.inputData = dataStore.appUI.lastTileInput;
    tileDialogue.onConfirm = handleImportTileSet;

    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    paletteToolbox.selectedPaletteIndex = dataStore.appUI.lastSelectedPaletteIndex;
    paletteToolbox.onAddPalette = (sender, e) => paletteDialogue.show();
    paletteToolbox.onColourEdit = handlePaletteColourEdit;
    paletteToolbox.onColourSelected = handlePaletteColourSelect;
    paletteToolbox.onDeleteSelectedPalette = handlePaletteDelete;
    paletteToolbox.onSelectedPaletteChanged = handlePaletteChanged;
    paletteToolbox.onSelectedPaletteSystemChanged = handlePaletteSystemChanged;

    colourPickerDialogue.onConfirm = handleColourPickerConfirm;

    tileEditor.onAddTileSet = (sender, e) => tileDialogue.show();
    tileEditor.onPixelMouseDown = handleTileEditorPixelMouseDown;
    tileEditor.onPixelMouseUp = handleTileEditorPixelMouseUp;
    tileEditor.onPixelOver = handleTileEditorPixelOver;
    tileEditor.onSelectedToolChanged = handleTileEditorSelectedToolChanged;
    tileEditor.onTileWidthChanged = handleTileEditorTileWidthChanged;
    tileEditor.onZoomChanged = handleTileEditorZoomChanged;

    const palette = getPalette();
    const tileSet = getTileSet();

    if (palette) {
        paletteToolbox.setPalette(getPalette());
        if (tileSet) {
            tileEditor.tileWidth = tileSet.tileWidth;
            tileEditor.zoomValue = dataStore.appUI.lastZoomValue;
            // Display the last used tile set.
            tileCanvas.scale = tileEditor.zoomValue;
            tileCanvas.palette = palette;
            tileCanvas.tileSet = tileSet;
            tileCanvas.drawUI(tileEditor.canvas);
        }
    }
});

function createDefaultPalettesAndTileSetIfNoneExist() {
    if (dataStore.tileSetList.length === 0) {
        const dummyArray = new Uint8ClampedArray(64 * 8 * 8);
        dummyArray.fill(15, 0, dummyArray.length);
        const tileSet = new TileSet(dummyArray);
        tileSet.tileWidth = 8;
        dataStore.tileSetList.addTileSet(tileSet);
    };
    if (dataStore.paletteList.length === 0) {
        /** @type string[] */
        const colours = ['#000000', '#000000', '#00AA00', '#00FF00', '#000055', '#0000FF', '#550000', '#00FFFF', '#AA0000', '#FF0000', '#555500', '#FFFF00', '#005500', '#FF00FF', '#555555', '#FFFFFF'];
        for (let i = 0; i < 2; i++) {
            const system = i % 2 === 0 ? 'ms' : 'gg';
            const palette = new Palette(system, 0);
            for (let c = 0; c < 16; c++) {
                palette.setColour(c, ColourUtil.paletteColourFromHex(c, system, colours[c]));
            }
            dataStore.paletteList.addPalette(palette);
        }
    }
}

function getTileSet() {
    if (dataStore.tileSetList.length > 0) {
        return dataStore.tileSetList.getTileSet(0);
    } else return null;
}

function getPalette() {
    if (dataStore.paletteList.length > 0) {
        const paletteIndex = paletteToolbox.selectedPaletteIndex;
        let palette = dataStore.paletteList.getPalette(paletteIndex);
        if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {
            palette = dataStore.paletteList.getPalette(paletteIndex);
        }
        return palette;
    } else return null;
}


/**
 * @param {HeaderBar} sender Palette dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleHeaderBarProjectLoad(sender, e) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        if (input.files.length > 0) {
            ProjectFile.loadFromFile(input.files[0]).then(data => {
                // Add loaded tiles
                const t = TileSetList.deserialise(data.tiles);
                dataStore.tileSetList.clear();
                for (let i = 0; i < t.length; i++) {
                    dataStore.tileSetList.addTileSet(t.getTileSet(i));
                }
                // Add loaded palettes
                const p = PaletteList.deserialise(data.palettes);
                dataStore.paletteList.clear();
                for (let i = 0; i < p.length; i++) {
                    dataStore.paletteList.addPalette(p.getPalette(i));
                }
                // Refresh
                const palette = p.getPalette(0);
                paletteToolbox.setPalette(dataStore.paletteList.getPalette(0));
                const tileSet = t.getTileSet(0);
                tileEditor.tileWidth = tileSet.tileWidth;
                // Display the last used tile set.
                tileCanvas.palette = palette;
                tileCanvas.tileSet = tileSet;
                tileCanvas.drawUI(tileEditor.canvas);
            });
        }
    }
    input.click();
    return false;    
}

/**
 * @param {HeaderBar} sender Palette dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleHeaderBarProjectSave(sender, e) {
    const tileSetList = dataStore.tileSetList;
    const paletteList = dataStore.paletteList;
    ProjectFile.saveToFile(tileSetList, paletteList);
    return false;    
}

/**
 * @param {HeaderBar} sender Palette dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleHeaderBarCodeExport(sender, e) {
    const tileSetList = dataStore.tileSetList.getTileSet(0);
    const paletteList = dataStore.paletteList;
    exportDialogue.generateExportData(tileSetList, paletteList);
    exportDialogue.show();
    return false;    
}


/**
 * User tries to import a palette.
 * @param {PaletteModalDialogue} sender Palette dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleImportPalette(sender, e) {
    if (!['gg', 'ms'].includes(sender.inputSystem)) throw new Error('System must be either ""ms" or "gg".');

    const system = sender.inputSystem;
    const paletteData = sender.inputData;
    const palette = new Palette(system, 0);
    if (system === 'gg') {
        const array = AssemblyUtility.readAsUint16Array(paletteData);
        palette.loadGameGearPalette(array);
    } else if (system === 'ms') {
        const array = AssemblyUtility.readAsUint8ClampedArray(paletteData);
        palette.loadMasterSystemPalette(array);
    }

    dataStore.paletteList.addPalette(palette);
    dataStore.appUI.lastPaletteInput = sender.inputData;
    dataStore.appUI.lastPaletteInputSystem = sender.inputSystem;
    dataStore.saveToLocalStorage();

    paletteToolbox.setPalette(palette);
}

/**
 * User tries to import a tile set.
 * @param {TileModalDialogue} sender Tile dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleImportTileSet(sender, e) {
    const tileData = sender.inputData;
    const array = AssemblyUtility.readAsUint8ClampedArray(tileData);
    const tileSet = TileSet.parsePlanarFormat(array);

    dataStore.tileSetList.addTileSet(tileSet);
    dataStore.appUI.lastTileInput = sender.inputData;
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {import("./ui/tileEditor.js").TileEditorTileWidthChangedEventData} e 
 */
function handleTileEditorTileWidthChanged(sender, e) {
    tileCanvas.tileSet.tileWidth = e.tileWidth;
    tileCanvas.drawUI(tileEditor.canvas, 0, 0);
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {import("./ui/tileEditor.js").TileEditorZoomChangedEventData} e 
 */
function handleTileEditorZoomChanged(sender, e) {
    tileCanvas.scale = e.zoom;
    tileCanvas.drawUI(tileEditor.canvas, 0, 0);
    dataStore.appUI.lastZoomValue = e.zoom;
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {import("./ui/tileEditor.js").TileEditorToolEventData} e 
 */
function handleTileEditorSelectedToolChanged(sender, e) {
    selectedTool = e.tool;
    tileEditor.highlightTool(selectedTool);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorPixelOver(sender, e) {
    const colourIndex = paletteToolbox.selectedPaletteColourIndex;
    const tileSet = getTileSet();

    if (tileEditor.canvasMouseIsDown) {
        takeToolAction(selectedTool, colourIndex, e.imageX, e.imageY);
    }

    // Update the UI
    tileCanvas.drawUI(tileEditor.canvas, e.imageX, e.imageY);

    // Show the palette colour
    const pixel = tileSet.getPixelAt(e.imageX, e.imageY);
    paletteToolbox.highlightPaletteItem(pixel);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorPixelMouseDown(sender, e) {
    const colourIndex = paletteToolbox.selectedPaletteColourIndex;
    takeToolAction(selectedTool, colourIndex, e.imageX, e.imageY);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorPixelMouseUp(eventData) {
}

const lastPencilPixel = { x: -1, y: -1 };

function takeToolAction(tool, colourIndex, imageX, imageY) {

    console.log('Pixel tile click', { tool, colourIndex, imageX, imageY });

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
                tileCanvas.drawUI(tileEditor.canvas, imageX, imageY);
            }
        } else if (tool === 'bucket') {
            const filler = new Fill(tileCanvas);
            filler.fill(imageX, imageY, colourIndex)

            // Update the UI
            tileCanvas.invalidateImage();
            tileCanvas.drawUI(tileEditor.canvas, imageX, imageY);
        }

    }

}

function handlePaletteChanged(sender, e) {

    // Swap palette
    const palette = dataStore.paletteList.getPalette(paletteToolbox.selectedPaletteIndex);
    paletteToolbox.setPalette(palette);

    // Refresh image
    tileCanvas.palette = palette;
    tileCanvas.drawUI(tileEditor.canvas, 0, 0);

    // Store palette index to local storage
    dataStore.appUI.lastSelectedPaletteIndex = paletteToolbox.selectedPaletteIndex;
    dataStore.saveToLocalStorage();
}

function handlePaletteDelete(sender, e) {
    const paletteIndex = paletteToolbox.selectedPaletteIndex;
    if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {

        // Remove palette
        dataStore.paletteList.removeAt(paletteIndex);
        paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
        const newSelectedIndex = Math.min(paletteIndex, dataStore.paletteList.length - 1);
        if (dataStore.paletteList.length > 0) {
            paletteToolbox.selectedPaletteIndex = newSelectedIndex;
            dataStore.appUI.lastSelectedPaletteIndex = newSelectedIndex;
        } else {
            paletteToolbox.setPalette(new Palette());
            dataStore.appUI.lastSelectedPaletteIndex = -1;
        }
        dataStore.saveToLocalStorage();

        // Refresh image
        tileCanvas.palette = getPalette();
        tileCanvas.drawUI(tileEditor.canvas, 0, 0);
    }
}

/**
 * @param {PaletteToolbox} sender The palette toolbox.
 * @param {import("./ui/paletteToolbox.js").PaletteToolboxColourEventData} e Event data.
 */
function handlePaletteColourSelect(sender, e) {
    if (e.index >= -1 && e.index < 16) {
        paletteToolbox.selectedPaletteColourIndex = e.index;
    }
}

/**
 * @param {PaletteToolbox} sender The palette toolbox.
 * @param {import("./ui/paletteToolbox.js").PaletteToolboxColourEventData} e Event data.
 */
function handlePaletteColourEdit(sender, e) {
    colourPickerDialogue.show(getPalette(), e.index);
}

/**
 * @param {PaletteToolbox} sender The palette toolbox.
 * @param {import("./ui/paletteToolbox.js").PaletteToolboxSystemEventData} e Event data.
 */
function handlePaletteSystemChanged(sender, e) {
    const palette = getPalette();
    palette.system = e.system;
    dataStore.saveToLocalStorage();
    paletteToolbox.setPalette(palette);
    tileCanvas.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * User tries to set a colour.
 * @param {ColourPickerModalDialogue} sender Colour picker dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleColourPickerConfirm(sender, e) {
    const palette = sender.palette;
    const paletteIndex = sender.paletteIndex;
    const paletteColour = sender.toPaletteColour();
    palette.colours[paletteIndex] = paletteColour;

    dataStore.saveToLocalStorage();

    paletteToolbox.setPalette(palette);
    paletteDialogue.hide();
    tileCanvas.drawUI(tileEditor.canvas, 0, 0);
}
