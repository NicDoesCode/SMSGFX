import DataStore from "./dataStore.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import CanvasManager from "./canvasManager.js";
import TileSetColourFillUtil from "./util/tileSetColourFillUtil.js";
import ColourPickerModalDialogue from "./ui/colourPickerModalDialogue.js";
import PaletteModalDialogue from "./ui/paletteModalDialogue.js";
import TileModalDialogue from "./ui/tileModalDialogue.js";
import ExportModalDialogue from "./ui/exportModalDialogue.js";
import PaletteToolbox from "./ui/paletteToolbox.js";
import TileEditor from "./ui/tileEditor.js";
import HeaderBar from "./ui/headerBar.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileSetBinarySerialiser from "./serialisers/tileSetBinarySerialiser.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import ProjectFactory from "./factory/projectFactory.js";


const paletteDialogue = new PaletteModalDialogue(document.getElementById('tbPaletteDialogue'));
const tileDialogue = new TileModalDialogue(document.getElementById('tbTileDialogue'));
const exportDialogue = new ExportModalDialogue(document.getElementById('tbExportDialogue'));
const colourPickerDialogue = new ColourPickerModalDialogue(document.getElementById('tbColourPickerDialogue'));
const paletteToolbox = new PaletteToolbox(document.getElementById('tbPaletteToolbox'));
const tileEditor = new TileEditor(document.getElementById('tbTileEditor'));
const headerBar = new HeaderBar(document.getElementById('tbHeaderBar'));

const dataStore = DataStore.instance;
const canvasManager = new CanvasManager();


/** @type {string} */
let selectedTool = null;

$(async () => {

    // Get any saved data from local storage
    dataStore.loadFromLocalStorage();

    createDefaultPalettesAndTileSetIfNoneExist();

    headerBar.onProjectTitleChanged = handleHeaderBarProjectTitleChanged;
    headerBar.onProjectLoad = handleHeaderBarProjectLoad;
    headerBar.onProjectSave = handleHeaderBarProjectSave;
    headerBar.onCodeExport = handleHeaderBarCodeExport;

    paletteDialogue.inputData = dataStore.appUIState.lastPaletteInput;
    paletteDialogue.inputSystem = dataStore.appUIState.lastPaletteInputSystem;
    paletteDialogue.onConfirm = handleImportPalette;

    tileDialogue.inputData = dataStore.appUIState.lastTileInput;
    tileDialogue.onConfirm = handleImportTileSet;

    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    paletteToolbox.selectedPaletteIndex = dataStore.appUIState.lastSelectedPaletteIndex;
    paletteToolbox.onNewPalette = (sender, e) => handleNewPalette();
    paletteToolbox.onAddPalette = (sender, e) => paletteDialogue.show();
    paletteToolbox.onColourEdit = handlePaletteColourEdit;
    paletteToolbox.onColourSelected = handlePaletteColourSelect;
    paletteToolbox.onDeleteSelectedPalette = handlePaletteDelete;
    paletteToolbox.onSelectedPaletteChanged = handlePaletteChanged;
    paletteToolbox.onSelectedPaletteSystemChanged = handlePaletteSystemChanged;

    colourPickerDialogue.onConfirm = handleColourPickerConfirm;

    tileEditor.onAddTile = handleTileEditorAddTile;
    tileEditor.onImportTileSet = (sender, e) => tileDialogue.show();
    tileEditor.onRemoveTile = handleTileEditorRemoveTile;
    tileEditor.onInsertTileBefore = handleTileEditorInsertTileBefore;
    tileEditor.onInsertTileAfter = handleTileEditorInsertTileAfter;
    tileEditor.onPixelMouseDown = handleTileEditorPixelMouseDown;
    tileEditor.onPixelMouseUp = handleTileEditorPixelMouseUp;
    tileEditor.onPixelOver = handleTileEditorPixelOver;
    tileEditor.onSelectedToolChanged = handleTileEditorSelectedToolChanged;
    tileEditor.onTileWidthChanged = handleTileEditorTileWidthChanged;
    tileEditor.onZoomChanged = handleTileEditorZoomChanged;
    tileEditor.onUndo = handleTileEditorUndo;
    tileEditor.onRedo = handleTileEditorRedo;

    const palette = getPalette();
    const tileSet = getTileSet();

    if (palette) {
        paletteToolbox.setPalette(getPalette());
        if (tileSet) {
            tileEditor.tileWidth = tileSet.tileWidth;
            tileEditor.zoomValue = dataStore.appUIState.lastZoomValue;
            // Display the last used tile set.
            canvasManager.scale = tileEditor.zoomValue;
            canvasManager.palette = palette;
            canvasManager.tileSet = tileSet;
            canvasManager.drawUI(tileEditor.canvas);
        }
    }

    // Set default colour and tool selection so that the tools work straight away
    setTimeout(() => {
        selectedTool = 'pencil';
        tileEditor.highlightTool(selectedTool);
        paletteToolbox.highlightPaletteItem(0);
    }, 250);
});

function createDefaultPalettesAndTileSetIfNoneExist() {
    // Create a default tile set
    if (dataStore.tileSet.length === 0) {
        const dummyArray = new Uint8ClampedArray(64 * 8 * 8);
        dummyArray.fill(15, 0, dummyArray.length);
        const tileSet = TileSetFactory.fromArray(dummyArray);
        tileSet.tileWidth = 8;
        dataStore.tileSet = tileSet;
    };
    // Create a default palette for Game Gear and Master System
    if (dataStore.paletteList.length === 0) {
        dataStore.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Master System', 'ms'));
        dataStore.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Game Gear', 'gg'));
    }
}

function getTileSet() {
    return dataStore.tileSet;
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
function handleHeaderBarProjectTitleChanged(sender, e) {
    dataStore.recordUndoState();
    dataStore.project.title = sender.projectTitle;
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
            // Load the project from the file
            ProjectUtil.loadFromBlob(input.files[0]).then(project => {
                dataStore.recordUndoState();

                dataStore.project = project;

                // Refresh
                const tileSet = project.tileSet;
                const palette = project.paletteList.getPalette(0);
                paletteToolbox.setPalette(palette);
                tileEditor.tileWidth = tileSet.tileWidth;

                // Display the last used tile set.
                canvasManager.palette = palette;
                canvasManager.tileSet = tileSet;
                canvasManager.drawUI(tileEditor.canvas);
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
    ProjectUtil.saveToFile(dataStore.project);
    return false;
}

/**
 * @param {HeaderBar} sender Palette dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleHeaderBarCodeExport(sender, e) {
    const tileSet = dataStore.tileSet;
    const paletteList = dataStore.paletteList;
    const project = ProjectFactory.create(sender.projectTitle, tileSet, paletteList);
    exportDialogue.value = ProjectAssemblySerialiser.serialise(project);
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

    dataStore.recordUndoState();

    const system = sender.inputSystem;
    const paletteData = sender.inputData;
    if (system === 'gg') {
        const array = AssemblyUtil.readAsUint16Array(paletteData);
        const palette = PaletteFactory.createFromGameGearPalette(array);
        dataStore.paletteList.addPalette(palette);
    } else if (system === 'ms') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromMasterSystemPalette(array);
        dataStore.paletteList.addPalette(palette);
    }

    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    paletteToolbox.selectedPaletteIndex = dataStore.paletteList.length - 1;
    paletteToolbox.setPalette(getPalette());

    canvasManager.palette = getPalette();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    dataStore.appUIState.lastSelectedPaletteIndex = paletteToolbox.selectedPaletteIndex;
    dataStore.appUIState.lastPaletteInput = sender.inputData;
    dataStore.appUIState.lastPaletteInputSystem = sender.inputSystem;
    dataStore.saveToLocalStorage();
}

/**
 * User tries to import a tile set.
 * @param {TileModalDialogue} sender Tile dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleImportTileSet(sender, e) {
    dataStore.recordUndoState();

    const tileData = sender.inputData;
    const array = AssemblyUtil.readAsUint8ClampedArray(tileData);
    const tileSet = TileSetBinarySerialiser.deserialise(array);

    dataStore.tileSet = tileSet;
    dataStore.appUIState.lastTileInput = sender.inputData;
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {import("./ui/tileEditor.js").TileEditorTileWidthChangedEventData} e 
 */
function handleTileEditorTileWidthChanged(sender, e) {
    canvasManager.tileSet.tileWidth = e.tileWidth;
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {import("./ui/tileEditor.js").TileEditorZoomChangedEventData} e 
 */
function handleTileEditorZoomChanged(sender, e) {
    canvasManager.scale = e.zoom;
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
    dataStore.appUIState.lastZoomValue = e.zoom;
    dataStore.saveToLocalStorage();
}

/**
 * @param {TileEditor} sender 
 * @param {object} e 
 */
function handleTileEditorUndo(sender, e) {
    dataStore.undo();
    canvasManager.palette = getPalette();
    canvasManager.tileSet = getTileSet();
    paletteToolbox.setPalette(getPalette());
    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * @param {TileEditor} sender 
 * @param {object} e 
 */
function handleTileEditorRedo(sender, e) {
    dataStore.redo();
    canvasManager.palette = getPalette();
    canvasManager.tileSet = getTileSet();
    paletteToolbox.setPalette(getPalette());
    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
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
    canvasManager.drawUI(tileEditor.canvas, e.imageX, e.imageY);

    // Show the palette colour
    const pixel = tileSet.getPixelAt(e.imageX, e.imageY);
    paletteToolbox.highlightPaletteItem(pixel);
}

/**
 * @param {TileEditor} sender Tile editor that triggered the event.
 * @param {import("./ui/tileEditor.js").TileEditorCallback} e Event args.
 */
function handleTileEditorAddTile(sender, e) {
    const tileSet = getTileSet();
    if (tileSet) {
        dataStore.recordUndoState();

        const tileDataArray = new Uint8ClampedArray(64);
        tileDataArray.fill(15, 0, tileDataArray.length);
        tileSet.addTile(TileFactory.fromArray(tileDataArray));

        dataStore.saveToLocalStorage();
        canvasManager.invalidateImage();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);
    }
    return false;
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
function handleTileEditorRemoveTile(sender, e) {
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    const tile = tileSet.getTileByCoordinate(e.imageX, e.imageY);
    const tileIndex = tileSet.getTileIndex(tile);
    tileSet.removeTile(tileIndex);

    dataStore.saveToLocalStorage();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorInsertTileBefore(sender, e) {
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    const tile = tileSet.getTileByCoordinate(e.imageX, e.imageY);
    const tileIndex = tileSet.getTileIndex(tile);
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, tileIndex);

    dataStore.saveToLocalStorage();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorInsertTileAfter(sender, e) {
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    const tile = tileSet.getTileByCoordinate(e.imageX, e.imageY);
    const tileIndex = tileSet.getTileIndex(tile);
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, tileIndex + 1);

    dataStore.saveToLocalStorage();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * @param {TileEditor} sender Tile dialogue that sent the confirmation.
 * @param {import("./ui/tileEditor.js").TileEditorPixelEventData} e Event args.
 */
function handleTileEditorPixelMouseUp(eventData) {
    dataStore.saveToLocalStorage();
    undoRecorded = false;
}

const lastPencilPixel = { x: -1, y: -1 };
let undoRecorded = false;

function takeToolAction(tool, colourIndex, imageX, imageY) {

    console.log('Pixel tile click', { tool, colourIndex, imageX, imageY });

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === 'pencil') {
            if (imageX !== lastPencilPixel.x || imageY !== lastPencilPixel.y) {
                if (!undoRecorded) {
                    dataStore.recordUndoState();
                    undoRecorded = true;
                }

                lastPencilPixel.x = imageX;
                lastPencilPixel.y = imageY;

                // Show the palette colour
                const tileSet = getTileSet();
                tileSet.setPixelAt(imageX, imageY, colourIndex);

                // Update the UI
                canvasManager.invalidateImage();
                canvasManager.drawUI(tileEditor.canvas, imageX, imageY);
            }
        } else if (tool === 'bucket') {
            dataStore.recordUndoState();

            TileSetColourFillUtil.fill(getTileSet(), imageX, imageY, colourIndex)

            // Update the UI
            canvasManager.invalidateImage();
            canvasManager.drawUI(tileEditor.canvas, imageX, imageY);
        }

    }

}

function handlePaletteChanged(sender, e) {

    // Swap palette
    const palette = dataStore.paletteList.getPalette(paletteToolbox.selectedPaletteIndex);
    paletteToolbox.setPalette(palette);

    // Refresh image
    canvasManager.palette = palette;
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    // Store palette index to local storage
    dataStore.appUIState.lastSelectedPaletteIndex = paletteToolbox.selectedPaletteIndex;
    dataStore.saveToLocalStorage();
}

function handlePaletteDelete(sender, e) {
    const paletteIndex = paletteToolbox.selectedPaletteIndex;
    if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {

        dataStore.recordUndoState();

        // Remove palette
        dataStore.paletteList.removeAt(paletteIndex);
        const newSelectedIndex = Math.min(paletteIndex, dataStore.paletteList.length - 1);
        if (dataStore.paletteList.length > 0) {
            paletteToolbox.selectedPaletteIndex = newSelectedIndex;
            dataStore.appUIState.lastSelectedPaletteIndex = newSelectedIndex;
        } else {
            paletteToolbox.setPalette(PaletteFactory.create());
            dataStore.appUIState.lastSelectedPaletteIndex = -1;
        }
        paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
        paletteToolbox.setPalette(getPalette());

        // Refresh image
        canvasManager.palette = getPalette();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);

        dataStore.saveToLocalStorage();
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
 * @param {object} e Event data.
 */
function handleNewPalette(sender, e) {
    dataStore.recordUndoState();

    const palette = PaletteFactory.createNewStandardColourPalette('New palette', 'ms');
    dataStore.paletteList.addPalette(palette);

    paletteToolbox.refreshPalettes(dataStore.paletteList.getPalettes());
    paletteToolbox.selectedPaletteIndex = dataStore.paletteList.length - 1;
    paletteToolbox.setPalette(palette);

    canvasManager.palette = getPalette();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    dataStore.appUIState.lastSelectedPaletteIndex = paletteToolbox.selectedPaletteIndex;
    dataStore.saveToLocalStorage();
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
    dataStore.recordUndoState();

    const palette = getPalette();
    palette.system = e.system;

    dataStore.saveToLocalStorage();
    paletteToolbox.setPalette(palette);
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * User tries to set a colour.
 * @param {ColourPickerModalDialogue} sender Colour picker dialogue that sent the confirmation.
 * @param {object} e Event args.
 */
function handleColourPickerConfirm(sender, e) {
    dataStore.recordUndoState();

    const palette = sender.palette;
    const paletteIndex = sender.paletteIndex;
    const paletteColour = sender.toPaletteColour();
    palette.setColour(paletteIndex, paletteColour);
    dataStore.saveToLocalStorage();

    paletteToolbox.setPalette(palette);
    paletteDialogue.hide();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}
