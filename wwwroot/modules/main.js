import DataStore from "./dataStore.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import TileSetColourFillUtil from "./util/tileSetColourFillUtil.js";
import ColourPickerDialogue from "./ui/colourPickerDialogue.js";
import PaletteModalDialogue from "./ui/paletteImportModalDialogue.js";
import TileSetImportModalDialogue from "./ui/tileSetImportModalDialogue.js";
import ExportModalDialogue from "./ui/exportModalDialogue.js";
import PaletteEditor from "./ui/paletteEditor.js";
import TileEditor from "./ui/tileEditor.js";
import TileEditorToolbar from "./ui/tileEditorToolbar.js";
import HeaderBar from "./ui/headerBar.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileSetBinarySerialiser from "./serialisers/tileSetBinarySerialiser.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import ProjectAssemblySerialiser from "./serialisers/projectAssemblySerialiser.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";
import Palette from "./models/palette.js";
import TileSet from "./models/tileSet.js";


const paletteDialogue = new PaletteModalDialogue(document.getElementById('tbPaletteDialogue'));
const tileDialogue = new TileSetImportModalDialogue(document.getElementById('tbTileDialogue'));
const exportDialogue = new ExportModalDialogue(document.getElementById('tbExportDialogue'));
const colourPickerDialogue = new ColourPickerDialogue(document.getElementById('tbColourPickerDialogue'));
const paletteEditor = new PaletteEditor(document.getElementById('tbPaletteEditor'));
const tileEditor = new TileEditor(document.getElementById('tbTileEditor'));
const tileEditorToolbar = new TileEditorToolbar(document.getElementById('tbTileEditorToolbar'));
const headerBar = new HeaderBar(document.getElementById('tbHeaderBar'));




/* ****************************************************************************************************
   State
*/

const dataStore = DataStore.instance;

const appState = {
    /** @type {string} */
    selectedTool: null,
    /** @type {number} */
    currentPaletteColourIndex: 0,
    /** @type {boolean} */
    bypassRecordUndoStates: false,
    lastModifiedPixel: {
        x: -1, y: -1
    }
};




/* ****************************************************************************************************
   Event handlers
*/

function wireUpEventHandlers() {

    headerBar.addHandlerRequestProjectTitleChange(handleHeaderBarRequestProjectTitleChange);
    headerBar.addHandlerRequestProjectLoad(handleHeaderBarRequestProjectLoad);
    headerBar.addHandlerRequestProjectSave(handleHeaderBarRequestProjectSave);
    headerBar.addHandlerRequestCodeExport(handleHeaderBarRequestCodeExport);

    paletteEditor.addHandlerRequestNewPalette(handlePaletteEditorRequestNewPalette);
    paletteEditor.addHandlerRequestImportPaletteFromCode(handlePaletteEditorRequestImportPaletteFromCode);
    paletteEditor.addHandlerRequestSelectedPaletteChange(handlePaletteEditorRequestSelectedPaletteChange);
    paletteEditor.addHandlerRequestDeletePalette(handlePaletteEditorRequestDeletePalette);
    paletteEditor.addHandlerRequestChangeSystem(handlePaletteEditorRequestChangeSystem);
    paletteEditor.addHandlerRequestChangeColourIndex(handlePaletteEditorRequestChangeColourIndex);
    paletteEditor.addHandlerRequestColourEdit(handlePaletteEditorRequestColourEdit);

    tileEditorToolbar.addHandlerRequestAddTile(handleTileEditorToolbarRequestAddTile);
    tileEditorToolbar.addHandlerRequestImportTileSetFromCode(handleTileEditorToolbarRequestImportTileSetFromCode);
    tileEditorToolbar.addHandlerRequestUndo(handleTileEditorToolbarRequestUndo);
    tileEditorToolbar.addHandlerRequestRedo(handleTileEditorToolbarRequestRedo);
    tileEditorToolbar.addHandlerRequestToolChange(handleTileEditorToolbarRequestToolChange);
    tileEditorToolbar.addHandlerRequestTileWidthChange(handleTileEditorToolbarRequestTileWidthChange);
    tileEditorToolbar.addHandlerRequestZoomChange(handleTileEditorToolbarRequestZoomChange);

    tileEditor.addHandlerPixelMouseOver(handleTileEditorPixelMouseOver);
    tileEditor.addHandlerPixelMouseDown(handleTileEditorPixelMouseDown);
    tileEditor.addHandlerPixelMouseUp(handleTileEditorPixelMouseUp);
    tileEditor.addHandlerRequestRemoveTile(handleTileEditorRequestRemoveTile);
    tileEditor.addHandlerRequestInsertTileBefore(handleTileEditorRequestInsertTileBefore);
    tileEditor.addHandlerRequestInsertTileAfter(handleTileEditorRequestInsertTileAfter);

    paletteDialogue.addHandlerOnConfirm(handleImportPaletteModalDialogueOnConfirm);

    colourPickerDialogue.addHandlerOnChange(handleColourPickerChange);
    colourPickerDialogue.addHandlerOnConfirm(handleColourPickerConfirm);
    colourPickerDialogue.addHandlerOnCancel(handleColourPickerCancel);

    tileDialogue.addHandlerOnConfirm(handleImportTileSet);

}


/** @param {import('./ui/headerBar.js').HeaderBarProjectTitleChangeEventArgs} args */
function handleHeaderBarRequestProjectTitleChange(args) {
    dataStore.recordUndoState();
    dataStore.project.title = args.projectTitle;
}

/** @param {import('./ui/headerBar.js').HeaderBarCallback} args */
function handleHeaderBarRequestProjectLoad(args) {
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

                paletteEditor.setState(dataStore.project, {});
                tileEditorToolbar.setState({ tileWidth: tileSet.tileWidth });
                tileEditor.setState({ palette: palette, tileSet: tileSet });
            });
        }
    }
    input.click();
}

/** @param {import('./ui/headerBar.js').HeaderBarCallback} args */
function handleHeaderBarRequestProjectSave(args) {
    ProjectUtil.saveToFile(dataStore.project);
}

/** @param {import('./ui/headerBar.js').HeaderBarCallback} args */
function handleHeaderBarRequestCodeExport(args) {
    const code = ProjectAssemblySerialiser.serialise(dataStore.project);
    exportDialogue.show(code);
}


/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestNewPalette(args) {
    dataStore.recordUndoState();

    const palette = PaletteFactory.createNewStandardColourPalette('New palette', 'ms');
    dataStore.paletteList.addPalette(palette);

    const selectedPaletteIndex = dataStore.paletteList.length - 1;
    paletteEditor.setState(dataStore.project, { selectedPaletteIndex });

    tileEditor.setState({ palette: getPalette() });

    dataStore.appUIState.lastSelectedPaletteIndex = selectedPaletteIndex;
    dataStore.saveToLocalStorage();
}
/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestImportPaletteFromCode(args) {
    const lastSystem = dataStore.appUIState.lastPaletteInputSystem;
    const lastPaletteData = dataStore.appUIState.lastPaletteInput;
    paletteDialogue.show(lastSystem, lastPaletteData);
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteChangeEventArgs} args */
function handlePaletteEditorRequestSelectedPaletteChange(args) {

    // Swap palette
    const palette = dataStore.paletteList.getPalette(args.paletteIndex);
    paletteEditor.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex });

    // Refresh image
    tileEditor.setState({ palette: palette });

    // Store palette index to local storage
    dataStore.appUIState.lastSelectedPaletteIndex = args.paletteIndex;
    dataStore.saveToLocalStorage();
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteEventArgs} args */
function handlePaletteEditorRequestDeletePalette(args) {
    const paletteIndex = args.paletteIndex;
    if (paletteIndex >= 0 && paletteIndex < dataStore.paletteList.length) {

        dataStore.recordUndoState();

        // Remove palette
        dataStore.paletteList.removeAt(paletteIndex);
        const newSelectedIndex = Math.min(paletteIndex, dataStore.paletteList.length - 1);
        if (dataStore.paletteList.length > 0) {
            paletteEditor.setState(dataStore.project, { selectedPaletteIndex: newSelectedIndex });
            dataStore.appUIState.lastSelectedPaletteIndex = newSelectedIndex;
        } else {
            dataStore.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('ms'));
            paletteEditor.setState(dataStore.project, { selectedPaletteIndex: 0 });
            dataStore.appUIState.lastSelectedPaletteIndex = 0;
        }

        // Refresh image
        tileEditor.setState({ palette: getPalette() });

        dataStore.saveToLocalStorage();
    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorSystemChangedEventArgs} args */
function handlePaletteEditorRequestChangeSystem(args) {
    dataStore.recordUndoState();

    const oldPalette = dataStore.project.paletteList.getPalette(args.paletteIndex);
    const newPalette = PaletteFactory.clone(oldPalette);
    newPalette.system = args.system;
    dataStore.project.paletteList.setPalette(args.paletteIndex, newPalette);

    paletteEditor.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex, selectedSystem: args.system });
    tileEditor.setState({ palette: newPalette });

    dataStore.saveToLocalStorage();
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourIndexEventArgs} args */
function handlePaletteEditorRequestChangeColourIndex(args) {
    if (args.colourIndex >= 0 && args.colourIndex < 16) {
        paletteEditor.setState(dataStore.project, { selectedPaletteIndex: args.paletteIndex, selectedColourIndex: args.colourIndex });
        appState.currentPaletteColourIndex = args.colourIndex;
    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourIndexEventArgs} args */
function handlePaletteEditorRequestColourEdit(args) {
    const palette = dataStore.project.paletteList.getPalette(args.paletteIndex);
    colourPickerDialogue.show(palette, args.colourIndex);
}


/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestAddTile(args) {
    const tileSet = getTileSet();
    if (tileSet) {
        dataStore.recordUndoState();

        const tileDataArray = new Uint8ClampedArray(64);
        tileDataArray.fill(15, 0, tileDataArray.length);
        tileSet.addTile(TileFactory.fromArray(tileDataArray));

        dataStore.saveToLocalStorage();
        tileEditor.setState({ tileSet: tileSet, palette: getPalette() });
    }
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestImportTileSetFromCode(args) {
    tileDialogue.show(dataStore.appUIState.lastTileInput);
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestUndo(args) {
    dataStore.undo();
    tileEditor.setState({ tileSet: getTileSet(), palette: getPalette() });
    paletteEditor.setState(dataStore.project, {});
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestRedo(args) {
    dataStore.redo();
    tileEditor.setState({ tileSet: getTileSet(), palette: getPalette() });
    paletteEditor.setState(dataStore.project, {});
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestToolChange(args) {
    appState.selectedTool = args.tool;
    tileEditorToolbar.setState({ selectedTool: args.tool });
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestTileWidthChange(args) {
    getTileSet().tileWidth = args.tileWidth;
    tileEditor.setState({ tileSet: getTileSet() });
    dataStore.saveToLocalStorage();
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestZoomChange(args) {
    tileEditor.setState({ scale: args.zoom });
    dataStore.appUIState.lastZoomValue = args.zoom;
    dataStore.saveToLocalStorage();
}


/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseOver(args) {
    const tileSet = getTileSet();

    if (args.mouseIsDown) {
        takeToolAction(appState.selectedTool, appState.currentPaletteColourIndex, args.x, args.y);
    }

    // Show the palette colour
    const pixel = tileSet.getPixelAt(args.x, args.y);
    paletteEditor.setState(dataStore.project, { highlightedColourIndex: pixel });
}

/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseDown(args) {
    takeToolAction(appState.selectedTool, appState.currentPaletteColourIndex, args.x, args.y);
}

/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseUp(args) {
    dataStore.saveToLocalStorage();
    appState.bypassRecordUndoStates = false;
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestRemoveTile(args) { // TODO - Tile context menu 
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    tileSet.removeTile(args.tileIndex);

    tileEditor.setState({ tileSet: tileSet });
    dataStore.saveToLocalStorage();
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileBefore(args) {
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, args.tileIndex);

    tileEditor.setState({ tileSet: tileSet });
    dataStore.saveToLocalStorage();
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileAfter(args) {
    dataStore.recordUndoState();

    const tileSet = getTileSet();
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, args.tileIndex + 1);

    tileEditor.setState({ tileSet: tileSet });
    dataStore.saveToLocalStorage();
}


/** @param {import('./ui/paletteImportModalDialogue').PaletteImportModalDialogueConfirmEventArgs} args */
function handleImportPaletteModalDialogueOnConfirm(args) {
    if (!['gg', 'ms'].includes(args.system)) throw new Error('System must be either ""ms" or "gg".');

    dataStore.recordUndoState();

    const system = args.system;
    const paletteData = args.paletteData;
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
    paletteEditor.setState(dataStore.project, { selectedPaletteIndex: selectedPaletteIndex });
    tileEditor.setState({ palette: getPalette() });

    dataStore.appUIState.lastSelectedPaletteIndex = selectedPaletteIndex;
    dataStore.appUIState.lastPaletteInputSystem = args.system;
    dataStore.appUIState.lastPaletteInput = args.paletteData;
    dataStore.saveToLocalStorage();
}

/**
 * Colour picker is changed.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerChange(args) {
    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {
        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteEditor.setState(dataStore.project, {});
        tileEditor.setState({ palette: palette });
    }
}

/**
 * Colour picker is confirmed.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerConfirm(args) {
    dataStore.recordUndoState();

    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {
        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteEditor.setState(dataStore.project, {});
        tileEditor.setState({ palette: palette });

        dataStore.saveToLocalStorage();
    }
    colourPickerDialogue.hide();
}

/**
 * Colour picker is hidden without confirmation, so restore the colour.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {
    const palette = getPalette();
    const currentColour = palette.getColour(args.index);
    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {
        const restoreColour = PaletteColourFactory.create(args.originalR, args.originalG, args.originalB);
        palette.setColour(args.index, restoreColour);

        paletteEditor.setState(dataStore.project, {});
        tileEditor.setState({ palette: palette });
    }
    colourPickerDialogue.hide();
}


/**
 * Import tile set from assembly dialogue is confirmed.
 * @param {import('./ui/tileSetImportModalDialogue.js').TileSetImportModalDialogueConfirmEventArgs} args - Arguments.
 */
function handleImportTileSet(args) {
    dataStore.recordUndoState();

    const tileSetData = args.tileSetData;
    const tileSetDataArray = AssemblyUtil.readAsUint8ClampedArray(tileSetData);
    const tileSet = TileSetBinarySerialiser.deserialise(tileSetDataArray);

    dataStore.tileSet = tileSet;
    dataStore.appUIState.lastTileInput = tileSetData;
    dataStore.saveToLocalStorage();
}


/**
 * Creates a default tile set and palettes when the data store doesn't contain any.
 */
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




/* ****************************************************************************************************
   Helpers and general methods
*/

/**
 * Gets the current tile set from the data store.
 * @returns {TileSet}
 */
 function getTileSet() {
    return dataStore.tileSet;
}

/**
 * Gets the currently selected palette from the data store.
 * @returns {Palette?}
 */
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

function takeToolAction(tool, colourIndex, imageX, imageY) {

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === 'pencil') {
            const lastPx = appState.lastModifiedPixel;
            if (imageX !== lastPx.x || imageY !== lastPx.y) {
                if (!appState.bypassRecordUndoStates) {
                    dataStore.recordUndoState();
                    appState.bypassRecordUndoStates = true;
                }

                appState.lastModifiedPixel.x = imageX;
                appState.lastModifiedPixel.y = imageY;

                // Show the palette colour
                const tileSet = getTileSet();
                tileSet.setPixelAt(imageX, imageY, colourIndex);

                // Update the UI
                tileEditor.setState({ tileSet: tileSet });
            }
        } else if (tool === 'bucket') {
            dataStore.recordUndoState();

            TileSetColourFillUtil.fill(getTileSet(), imageX, imageY, colourIndex)

            // Update the UI
            tileEditor.setState({ tileSet: getTileSet() });
        }

    }

}




/* ****************************************************************************************************
   Initilisation
*/

$(async () => {

    wireUpEventHandlers();

    // Load and set state
    dataStore.loadFromLocalStorage();
    createDefaultPalettesAndTileSetIfNoneExist();

    paletteEditor.setState({
        paletteList: dataStore.project.paletteList,
        selectedPaletteIndex: dataStore.appUIState.lastSelectedPaletteIndex,
        lastPaletteInputSystem: dataStore.appUIState.lastPaletteInputSystem
    });

    const palette = getPalette();
    const tileSet = getTileSet();

    if (palette) {
        headerBar.setState(dataStore.project);
        paletteEditor.setState(dataStore.project, {});
        if (tileSet) {
            const zoom = dataStore.appUIState.lastZoomValue;
            tileEditorToolbar.setState({ tileWidth: tileSet.tileWidth, zoom: zoom });
            tileEditor.setState({ palette: palette, tileSet: tileSet, scale: zoom });
        }
    }

    // Set default colour and tool selection so that the tools work straight away
    setTimeout(() => {
        appState.selectedTool = 'pencil';
        tileEditorToolbar.setState({ selectedTool: appState.selectedTool });
        paletteEditor.setState(dataStore.project, { selectedColourIndex: 0 });
    }, 250);

});
