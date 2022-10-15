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
import ProjectFactory from "./factory/projectFactory.js";
import ProjectAssemblySerialiser from "./serialisers/projectAssemblySerialiser.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";


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
/** @type {number} */
let selectedColourIndex = 0;

$(async () => {

    // Get any saved data from local storage
    dataStore.loadFromLocalStorage();

    createDefaultPalettesAndTileSetIfNoneExist();

    headerBar.addHandlerProjectTitleChanged(handleHeaderBarProjectTitleChanged);
    headerBar.addHandlerProjectLoad(handleHeaderBarProjectLoad);
    headerBar.addHandlerProjectSave(handleHeaderBarProjectSave);
    headerBar.addHandlerCodeExport(handleHeaderBarCodeExport);

    paletteDialogue.addHandlerOnConfirm(handleImportPalette);

    tileDialogue.inputData = dataStore.appUIState.lastTileInput;
    tileDialogue.onConfirm = handleImportTileSet; // TODO

    paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: dataStore.appUIState.lastSelectedPaletteIndex, lastPaletteInputSystem: dataStore.appUIState.lastPaletteInputSystem });
    paletteToolbox.addHandlerNewPalette(handlePaletteToolboxNewPalette);
    paletteToolbox.addHandlerImportPaletteFromCode(handlePaletteToolboxImportPaletteFromCode);
    paletteToolbox.addHandlerSelectedPaletteChanged(handlePaletteToolboxSelectedPaletteChanged);
    paletteToolbox.addHandlerPaletteDelete(handlePaletteToolboxPaletteDelete);
    paletteToolbox.addHandlerSystemChanged(handlePaletteToolboxSystemChanged);
    paletteToolbox.addHandlerColourSelected(handlePaletteToolboxColourSelected);
    paletteToolbox.addHandlerColourEdit(handlePaletteToolboxColourEdit);

    colourPickerDialogue.addHandlerOnChange(handleColourPickerChange);
    colourPickerDialogue.addHandlerOnConfirm(handleColourPickerConfirm);
    colourPickerDialogue.addHandlerOnCancel(handleColourPickerCancel);

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
        headerBar.setState(dataStore.project);
        paletteToolbox.setState(dataStore.project, {});
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
        paletteToolbox.setState(dataStore.project, { selectedColourIndex: 0 });
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
        const paletteIndex = dataStore.appUIState.lastSelectedPaletteIndex;
        if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {
            return dataStore.paletteList.getPalette(paletteIndex);
        } else {
            dataStore.appUIState.lastSelectedPaletteIndex = 0;
            return dataStore.paletteList.getPalette(0);
        }
    } else return null;
}


/**
 * @param {import('./ui/headerBar').HeaderBarTitleChangeEventArgs} data - Event data.
 */
function handleHeaderBarProjectTitleChanged(data) {
    dataStore.recordUndoState();
    dataStore.project.title = data.newTitle;
}

function handleHeaderBarProjectLoad() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        if (input.files.length > 0) {
            // Load the project from the file
            ProjectUtil.loadFromBlob(input.files[0]).then(project => {
                dataStore.recordUndoState();

                dataStore.project = project;

                headerBar.setState(project);

                // Refresh
                const tileSet = project.tileSet;
                const palette = project.paletteList.getPalette(0);

                paletteToolbox.setState(dataStore.project, {});
                tileEditor.tileWidth = tileSet.tileWidth;

                // Display the last used tile set.
                canvasManager.palette = palette;
                canvasManager.tileSet = tileSet;
                canvasManager.drawUI(tileEditor.canvas);
            });
        }
    }
    input.click();
}

function handleHeaderBarProjectSave() {
    ProjectUtil.saveToFile(dataStore.project);
}

function handleHeaderBarCodeExport() {
    const code = ProjectAssemblySerialiser.serialise(dataStore.project);
    exportDialogue.show(code);
}


/**
 * User tries to import a palette.
 * @param {import('./ui/paletteModalDialogue').PaletteConfirmDialogueEventArgs} data - Event args.
 */
function handleImportPalette(data) {
    if (!['gg', 'ms'].includes(data.system)) throw new Error('System must be either ""ms" or "gg".');

    dataStore.recordUndoState();

    const system = data.system;
    const paletteData = data.paletteData;
    if (system === 'gg') {
        const array = AssemblyUtil.readAsUint16Array(paletteData);
        const palette = PaletteFactory.createFromGameGearPalette(array);
        dataStore.paletteList.addPalette(palette);
    } else if (system === 'ms') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromMasterSystemPalette(array);
        dataStore.paletteList.addPalette(palette);
    }

    const selectedPaletteIndex = dataStore.paletteList.length - 1;
    paletteToolbox.setState(dataStore.project, {selectedPaletteIndex: selectedPaletteIndex});

    canvasManager.palette = getPalette();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    dataStore.appUIState.lastSelectedPaletteIndex = selectedPaletteIndex;
    dataStore.appUIState.lastPaletteInputSystem = data.system;
    dataStore.appUIState.lastPaletteInput = data.paletteData;
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
    paletteToolbox.setState(dataStore.project, {});
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
    paletteToolbox.setState(dataStore.project, {});
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
    const tileSet = getTileSet();

    if (tileEditor.canvasMouseIsDown) {
        takeToolAction(selectedTool, selectedColourIndex, e.imageX, e.imageY);
    }

    // Update the UI
    canvasManager.drawUI(tileEditor.canvas, e.imageX, e.imageY);

    // Show the palette colour
    const pixel = tileSet.getPixelAt(e.imageX, e.imageY);
    paletteToolbox.setState(dataStore.project, { highlightedColourIndex: pixel });
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
    takeToolAction(selectedTool, selectedColourIndex, e.imageX, e.imageY);
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

function handlePaletteToolboxNewPalette(args) {
    dataStore.recordUndoState();

    const palette = PaletteFactory.createNewStandardColourPalette('New palette', 'ms');
    dataStore.paletteList.addPalette(palette);

    const selectedPaletteIndex = dataStore.paletteList.length - 1;
    paletteToolbox.setState(dataStore.project, { selectedPaletteIndex });

    canvasManager.palette = getPalette();
    canvasManager.invalidateImage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    dataStore.appUIState.lastSelectedPaletteIndex = selectedPaletteIndex;
    dataStore.saveToLocalStorage();
}

function handlePaletteToolboxImportPaletteFromCode(args) {
    const lastSystem = dataStore.appUIState.lastPaletteInputSystem;
    const lastPaletteData = dataStore.appUIState.lastPaletteInput;
    paletteDialogue.show(lastSystem, lastPaletteData);
}

/**
 * @param {import('./ui/paletteToolbox').PaletteToolboxSelectedPaletteEventArgs} args 
 */
function handlePaletteToolboxPaletteDelete(args) {
    const paletteIndex = args.paletteIndex;
    if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {

        dataStore.recordUndoState();

        // Remove palette
        dataStore.paletteList.removeAt(paletteIndex);
        const newSelectedIndex = Math.min(paletteIndex, dataStore.paletteList.length - 1);
        if (dataStore.paletteList.length > 0) {
            paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: newSelectedIndex });
            dataStore.appUIState.lastSelectedPaletteIndex = newSelectedIndex;
        } else {
            dataStore.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('ms'));
            paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: 0 });
            dataStore.appUIState.lastSelectedPaletteIndex = 0;
        }

        // Refresh image
        canvasManager.palette = getPalette();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);

        dataStore.saveToLocalStorage();
    }
}

/**
 * @param {import('./ui/paletteToolbox').PaletteToolboxPaletteChangedEventArgs} args 
 */
function handlePaletteToolboxSelectedPaletteChanged(args) {

    // Swap palette
    const palette = dataStore.paletteList.getPalette(args.paletteIndex);
    paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex });

    // Refresh image
    canvasManager.palette = palette;
    canvasManager.drawUI(tileEditor.canvas, 0, 0);

    // Store palette index to local storage
    dataStore.appUIState.lastSelectedPaletteIndex = args.paletteIndex;
    dataStore.saveToLocalStorage();
}

/**
 * @param {import('./ui/paletteToolbox').PaletteToolboxSystemChangedEventArgs} args 
 */
function handlePaletteToolboxSystemChanged(args) {
    dataStore.recordUndoState();

    const oldPalette = dataStore.project.paletteList.getPalette(args.paletteIndex);
    const newPalette = PaletteFactory.clone(oldPalette);
    newPalette.system = args.system;
    dataStore.project.paletteList.setPalette(args.paletteIndex, newPalette);

    paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex, selectedSystem: args.system });

    dataStore.saveToLocalStorage();
    canvasManager.drawUI(tileEditor.canvas, 0, 0);
}

/**
 * @param {import('./ui/paletteToolbox').PaletteToolboxColourEventArgs} args 
 */
function handlePaletteToolboxColourSelected(args) {
    if (args.colourIndex >= 0 && args.colourIndex < 16) {
        paletteToolbox.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex, selectedColourIndex: args.colourIndex });
        selectedColourIndex = args.colourIndex;
    }
}

/**
 * @param {import('./ui/paletteToolbox').PaletteToolboxColourEventArgs} args 
 */
function handlePaletteToolboxColourEdit(args) {
    const palette = dataStore.project.paletteList.getPalette(args.paletteIndex);
    colourPickerDialogue.show(palette, args.colourIndex);
}

/**
 * Colour picker is changed.
 * @param {import('./ui/colourPickerModalDialogue').ColourModalDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerChange(args) {
    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {
        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteToolbox.setState(dataStore.project, {});

        canvasManager.invalidateImage();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);
    }
}

/**
 * Colour picker is confirmed.
 * @param {import('./ui/colourPickerModalDialogue').ColourModalDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerConfirm(args) {
    dataStore.recordUndoState();

    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {
        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteToolbox.setState(dataStore.project, {});

        canvasManager.invalidateImage();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);

        dataStore.saveToLocalStorage();
    }
    colourPickerDialogue.hide();
}

/**
 * Colour picker is hidden without confirmation, so restore the colour.
 * @param {import('./ui/colourPickerModalDialogue').ColourModalDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {
    console.log('cancel', args);
    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {
        const restoreColour = PaletteColourFactory.create(args.originalR, args.originalG, args.originalB);
        palette.setColour(args.index, restoreColour);

        paletteToolbox.setState(dataStore.project, {});

        canvasManager.invalidateImage();
        canvasManager.drawUI(tileEditor.canvas, 0, 0);
    }
    colourPickerDialogue.hide();
}
