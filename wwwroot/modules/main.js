import State from "./state.js";
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
import UndoManager from "./components/undoManager.js";
import ProjectFactory from "./factory/projectFactory.js";
import PaletteListFactory from "./factory/paletteListFactory.js";


const undoManager = new UndoManager(50);

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

const state = State.instance;

const instanceState = {
    /** @type {string} */
    tool: null,
    /** @type {number} */
    colourIndex: 0,
    /** @type {boolean} */
    undoDisabled: false,
    lastTileMapPx: {
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
    paletteEditor.addHandlerRequestTitleChange(handlePaletteEditorRequestTitleChange);
    paletteEditor.addHandlerRequestSystemChange(handlePaletteEditorRequestSystemChange);
    paletteEditor.addHandlerRequestNativeChange(handlePaletteEditorRequestNativeChange);
    paletteEditor.addHandlerRequestColourIndexChange(handlePaletteEditorRequestColourIndexChange);
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
    addUndoState();
    state.project.title = args.projectTitle;
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
                addUndoState();

                state.setProject(project);

                headerBar.setState(project);

                // Refresh
                const tileSet = project.tileSet;
                const palette = project.paletteList.getPalette(0);

                // Set state
                headerBar.setState({
                    projectTitle: project.title
                });
                paletteEditor.setState({
                    paletteList: state.paletteList,
                    selectedPaletteIndex: 0,
                    selectedColourIndex: 0,
                    highlightedColourIndex: -1,
                    displayNative: getUIState().displayNativeColour
                });
                tileEditorToolbar.setState({
                    tileWidth: tileSet.tileWidth
                });
                tileEditor.setState({
                    palette: palette,
                    tileSet: tileSet,
                    displayNative: getUIState().displayNativeColour
                });
            });
        }
    }
    input.click();
}

/** @param {import('./ui/headerBar.js').HeaderBarCallback} args */
function handleHeaderBarRequestProjectSave(args) {
    ProjectUtil.saveToFile(state.project);
}

/** @param {import('./ui/headerBar.js').HeaderBarCallback} args */
function handleHeaderBarRequestCodeExport(args) {
    const code = ProjectAssemblySerialiser.serialise(state.project);
    exportDialogue.show(code);
}


/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestNewPalette(args) {
    addUndoState();

    const project = state.project;
    const paletteList = project.paletteList;
    const palette = PaletteFactory.createNewStandardColourPalette('New palette', 'ms');
    paletteList.addPalette(palette);
    state.setProject(project);

    const selectedPaletteIndex = state.paletteList.length - 1;

    // Update state
    state.persistentUIState.paletteIndex = selectedPaletteIndex;
    paletteEditor.setState({
        paletteList: state.project.paletteList,
        selectedPaletteIndex: selectedPaletteIndex
    });
    tileEditor.setState({
        palette: state.project.paletteList.getPalette(selectedPaletteIndex)
    });

    state.saveToLocalStorage();
}
/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestImportPaletteFromCode(args) {
    const lastSystem = state.persistentUIState.importPaletteSystem;
    const lastPaletteData = state.persistentUIState.importPaletteAssemblyCode;
    paletteDialogue.show(lastSystem, lastPaletteData);
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteChangeEventArgs} args */
function handlePaletteEditorRequestSelectedPaletteChange(args) {

    const palette = state.paletteList.getPalette(args.paletteIndex);
    paletteEditor.setState({
        paletteList: state.paletteList,
        selectedPaletteIndex: args.paletteIndex
    });
    tileEditor.setState({
        palette: palette
    });

    state.persistentUIState.paletteIndex = args.paletteIndex;
    state.saveToLocalStorage();
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteEventArgs} args */
function handlePaletteEditorRequestDeletePalette(args) {
    const paletteIndex = args.paletteIndex;
    if (paletteIndex >= 0 && paletteIndex < state.paletteList.length) {

        addUndoState();

        // Remove palette
        state.paletteList.removeAt(paletteIndex);
        const newSelectedIndex = Math.min(paletteIndex, state.paletteList.length - 1);
        if (state.paletteList.length > 0) {
            paletteEditor.setState({
                paletteList: state.paletteList,
                selectedPaletteIndex: newSelectedIndex
            });
            state.persistentUIState.paletteIndex = newSelectedIndex;
        } else {
            state.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('ms'));
            paletteEditor.setState({
                paletteList: state.paletteList,
                selectedPaletteIndex: 0
            });
            state.persistentUIState.paletteIndex = 0;
        }

        // Refresh image
        tileEditor.setState({
            palette: getPalette()
        });

        state.saveToLocalStorage();
    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorTitleEventArgs} args */
function handlePaletteEditorRequestTitleChange(args) {
    addUndoState();

    const project = state.project;
    const paletteList = project.paletteList;
    const palette = paletteList.getPalette(state.persistentUIState.paletteIndex);
    palette.title = args.title;

    state.setProject(project);

    paletteEditor.setState({
        paletteList: paletteList
    });

    state.saveToLocalStorage();
}

/** @param {import('./ui/paletteEditor').PaletteEditorSystemChangedEventArgs} args */
function handlePaletteEditorRequestSystemChange(args) {
    addUndoState();

    const project = state.project;
    const paletteList = getPaletteList();
    const oldPalette = paletteList.getPalette(args.paletteIndex);
    const newPalette = PaletteFactory.clone(oldPalette);
    newPalette.system = args.system;
    paletteList.setPalette(args.paletteIndex, newPalette);

    state.setProject(project);

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedSystem: args.system,
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        palette: getPalette(),
        displayNative: getUIState().displayNativeColour
    });

    state.saveToLocalStorage();
}

/** @param {import('./ui/paletteEditor').PaletteEditorDisplayNativeEventArgs} args */
function handlePaletteEditorRequestNativeChange(args) {

    state.persistentUIState.displayNativeColour = args.displayNativeEnabled;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        tileSet: getTileSet(),
        palette: getPalette(),
        displayNative: getUIState().displayNativeColour
    });
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourIndexEventArgs} args */
function handlePaletteEditorRequestColourIndexChange(args) {
    if (args.colourIndex >= 0 && args.colourIndex < 16) {
        paletteEditor.setState({
            selectedColourIndex: args.colourIndex
        });
        instanceState.colourIndex = args.colourIndex;
    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourIndexEventArgs} args */
function handlePaletteEditorRequestColourEdit(args) {
    const palette = state.project.paletteList.getPalette(args.paletteIndex);
    colourPickerDialogue.show(palette, args.colourIndex);
}


/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestAddTile(args) {
    const tileSet = getTileSet();
    if (tileSet) {
        addUndoState();

        const tileDataArray = new Uint8ClampedArray(64);
        tileDataArray.fill(15, 0, tileDataArray.length);
        tileSet.addTile(TileFactory.fromArray(tileDataArray));

        state.saveToLocalStorage();
        tileEditor.setState({
            tileSet: tileSet,
            palette: getPalette()
        });
    }
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestImportTileSetFromCode(args) {
    tileDialogue.show(state.persistentUIState.importTileAssemblyCode);
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestUndo(args) {
    if (undoManager.canUndo) {
        // Set project state
        const currentProject = state.project;
        const undoneProject = undoManager.undo(currentProject);
        state.setProject(undoneProject);

        // Set UI state
        headerBar.setState({
            projectTitle: state.project.title
        });
        tileEditorToolbar.setState({
            undoEnabled: undoManager.canUndo,
            redoEnabled: undoManager.canRedo
        });
        tileEditor.setState({
            tileSet: getTileSet(),
            palette: getPalette()
        });
        paletteEditor.setState({
            paletteList: state.paletteList
        });
    }
    tileEditorToolbar.setState({
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
}

/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCallback} args */
function handleTileEditorToolbarRequestRedo(args) {
    if (undoManager.canRedo) {
        // Set project state
        const currentProject = state.project;
        const redoneProject = undoManager.redo(currentProject);
        state.setProject(redoneProject);

        // Set UI state
        headerBar.setState({
            projectTitle: state.project.title
        });
        tileEditorToolbar.setState({
            tileWidth: getTileSet().tileWidth,
            undoEnabled: undoManager.canUndo,
            redoEnabled: undoManager.canRedo
        });
        tileEditor.setState({
            tileSet: getTileSet(),
            palette: getPalette()
        });
        paletteEditor.setState({
            paletteList: state.paletteList
        });
    }
    tileEditorToolbar.setState({
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestToolChange(args) {
    instanceState.tool = args.tool;
    tileEditorToolbar.setState({
        selectedTool: args.tool
    });
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestTileWidthChange(args) {
    getTileSet().tileWidth = args.tileWidth;
    tileEditor.setState({
        tileSet: getTileSet()
    });
    state.saveToLocalStorage();
}

/** @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarUIEventArgs} args */
function handleTileEditorToolbarRequestZoomChange(args) {
    tileEditor.setState({
        scale: args.zoom
    });
    state.persistentUIState.scale = args.zoom;
    state.saveToLocalStorage();
}


/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseOver(args) {
    const tileSet = getTileSet();

    if (args.mouseIsDown) {
        takeToolAction(instanceState.tool, instanceState.colourIndex, args.x, args.y);
    }

    // Show the palette colour
    const pixel = tileSet.getPixelAt(args.x, args.y);
    paletteEditor.setState({
        highlightedColourIndex: pixel
    });
}

/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseDown(args) {
    takeToolAction(instanceState.tool, instanceState.colourIndex, args.x, args.y);
}

/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseUp(args) {
    state.saveToLocalStorage();
    instanceState.undoDisabled = false;
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestRemoveTile(args) {
    addUndoState();

    const project = state.project;
    const tileSet = project.tileSet;
    tileSet.removeTile(args.tileIndex);

    state.setProject(project);
    state.saveToLocalStorage();

    tileEditor.setState({
        tileSet: tileSet
    });
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileBefore(args) {
    addUndoState();

    const project = state.project;
    const tileSet = project.tileSet;
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, args.tileIndex);

    state.setProject(project);
    state.saveToLocalStorage();

    tileEditor.setState({
        tileSet: tileSet
    });
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileAfter(args) {
    addUndoState();

    const project = state.project;
    const tileSet = getTileSet();
    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    tileSet.insertTileAt(newTile, args.tileIndex + 1);

    state.setProject(project);
    state.saveToLocalStorage();

    tileEditor.setState({
        tileSet: tileSet
    });
}


/** @param {import('./ui/paletteImportModalDialogue').PaletteImportModalDialogueConfirmEventArgs} args */
function handleImportPaletteModalDialogueOnConfirm(args) {
    if (!['gg', 'ms'].includes(args.system)) throw new Error('System must be either ""ms" or "gg".');

    addUndoState();

    const system = args.system;
    const paletteData = args.paletteData;
    if (system === 'gg') {
        const array = AssemblyUtil.readAsUint16Array(paletteData);
        const palette = PaletteFactory.createFromGameGearPalette(array);
        state.paletteList.addPalette(palette);
    } else if (system === 'ms') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromMasterSystemPalette(array);
        state.paletteList.addPalette(palette);
    }

    const selectedPaletteIndex = state.paletteList.length - 1;
    paletteEditor.setState({
        paletteList: state.paletteList,
        selectedPaletteIndex: selectedPaletteIndex
    });
    tileEditor.setState({
        palette: getPalette()
    });

    state.persistentUIState.paletteIndex = selectedPaletteIndex;
    state.persistentUIState.importPaletteSystem = args.system;
    state.persistentUIState.importPaletteAssemblyCode = args.paletteData;
    state.saveToLocalStorage();
}

/**
 * User is playing with the colour picker, provide a live preview.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerChange(args) {

    const project = state.project;
    const paletteList = project.paletteList;
    const palette = paletteList.getPalette(state.persistentUIState.paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {

        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteEditor.setState({
            paletteList: state.paletteList
        });
        tileEditor.setState({
            palette: palette
        });

    }

}

/**
 * User has confirmed their colour choice, finalise the colour selection and save.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerConfirm(args) {
    addUndoState();

    const project = state.project;
    const paletteList = project.paletteList;
    const palette = paletteList.getPalette(state.persistentUIState.paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {

        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        state.setProject(project);
        state.saveToLocalStorage();

        paletteEditor.setState({
            paletteList: state.paletteList
        });
        tileEditor.setState({
            palette: palette
        });

    }
    colourPickerDialogue.hide();
}

/**
 * User has cancelled the colour picker, restore the original colour.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {

    const project = state.project;
    const paletteList = project.paletteList;
    const palette = paletteList.getPalette(state.persistentUIState.paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {

        const restoreColour = PaletteColourFactory.create(args.originalR, args.originalG, args.originalB);
        palette.setColour(args.index, restoreColour);

        paletteEditor.setState({
            paletteList: state.paletteList
        });
        tileEditor.setState({
            palette: palette
        });

    }
    colourPickerDialogue.hide();
}


/**
 * Import tile set from assembly dialogue is confirmed.
 * @param {import('./ui/tileSetImportModalDialogue.js').TileSetImportModalDialogueConfirmEventArgs} args - Arguments.
 */
function handleImportTileSet(args) {
    addUndoState();

    const tileSetData = args.tileSetData;
    const tileSetDataArray = AssemblyUtil.readAsUint8ClampedArray(tileSetData);
    const tileSet = TileSetBinarySerialiser.deserialise(tileSetDataArray);

    const project = state.project;
    project.tileSet = tileSet;
    state.setProject(project);

    state.persistentUIState.importTileAssemblyCode = tileSetData;
    state.saveToLocalStorage();

    tileEditorToolbar.setState({
        tileWidth: tileSet.tileWidth
    });
    tileEditor.setState({
        tileSet: tileSet
    });
}


/**
 * Creates a default tile set and palettes when the data store doesn't contain any.
 */
function createDefaultProjectIfNoneExists() {
    if (!state.project || !state.project.tileSet || state.project.tileSet.length === 0 || !state.project.paletteList || state.project.paletteList.length === 0) {

        const project = !state.project ? ProjectFactory.create() : state.project;

        if (!project.title) {
            project.title = 'New project';
        }

        // Create a default tile set
        if (!project.tileSet || project.tileSet.length === 0) {
            const dummyArray = new Uint8ClampedArray(64 * 8 * 8);
            dummyArray.fill(15, 0, dummyArray.length);
            const tileSet = TileSetFactory.fromArray(dummyArray);
            tileSet.tileWidth = 8;

            project.tileSet = tileSet;
        }

        // Create a default palette for Game Gear and Master System
        if (!project.paletteList || project.paletteList.length === 0) {
            if (!project.paletteList) project.paletteList = PaletteListFactory.create();
            state.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Master System', 'ms'));
            state.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Game Gear', 'gg'));
        }

        state.setProject(project);
        state.saveToLocalStorage();
    }
}

function checkPersistentUIValues() {
    let dirty = false;
    if (state.persistentUIState.paletteIndex < 0 || state.persistentUIState.paletteIndex >= state.project.paletteList.length) {
        state.persistentUIState.paletteIndex = 0;
        dirty = true;
    }
    if (state.persistentUIState.scale < 1 || state.persistentUIState.scale > 50) {
        state.persistentUIState.scale = 10;
        dirty = true;
    }
    if (!state.persistentUIState.importPaletteSystem) {
        state.persistentUIState.importPaletteSystem = '';
        dirty = true;
    }
    if (!state.persistentUIState.importPaletteAssemblyCode) {
        state.persistentUIState.importPaletteAssemblyCode = '';
        dirty = true;
    }
    if (!state.persistentUIState.importTileAssemblyCode) {
        state.persistentUIState.importTileAssemblyCode = '';
        dirty = true;
    }
    if (dirty) {
        state.saveToLocalStorage();
    }
}




/* ****************************************************************************************************
   Helpers and general methods
*/

function getTileSet() {
    return state.tileSet
};
function getPalette() {
    if (state.paletteList.length > 0) {
        const paletteIndex = state.persistentUIState.paletteIndex;
        if (paletteIndex >= 0 && paletteIndex < state.paletteList.length) {
            return state.paletteList.getPalette(paletteIndex);
        } else {
            state.persistentUIState.paletteIndex = 0;
            return state.paletteList.getPalette(0);
        }
    } else return null;
}
function getPaletteList() {
    return state.paletteList;
}
function getUIState() {
    return state.persistentUIState;
}

function takeToolAction(tool, colourIndex, imageX, imageY) {

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === 'pencil') {
            const lastPx = instanceState.lastTileMapPx;
            if (imageX !== lastPx.x || imageY !== lastPx.y) {
                addUndoState();
                if (!instanceState.undoDisabled) {
                    instanceState.undoDisabled = true;
                }

                instanceState.lastTileMapPx.x = imageX;
                instanceState.lastTileMapPx.y = imageY;

                // Show the palette colour
                const tileSet = getTileSet();
                tileSet.setPixelAt(imageX, imageY, colourIndex);

                // Update the UI
                tileEditor.setState({ tileSet: tileSet });
            }
        } else if (tool === 'bucket') {
            addUndoState();

            TileSetColourFillUtil.fill(getTileSet(), imageX, imageY, colourIndex)

            // Update the UI
            tileEditor.setState({ tileSet: getTileSet() });
        }

    }

}

function addUndoState() {
    if (!instanceState.undoDisabled) {
        undoManager.addUndoState(state.project);
        tileEditorToolbar.setState({ undoEnabled: undoManager.canUndo, redoEnabled: undoManager.canRedo });
    }
}




/* ****************************************************************************************************
   Initilisation
*/

$(async () => {

    instanceState.tool = 'pencil';

    wireUpEventHandlers();

    // Load and set state
    state.loadFromLocalStorage();

    createDefaultProjectIfNoneExists();
    checkPersistentUIValues();

    const palette = state.project.paletteList.getPalette(state.persistentUIState.paletteIndex);
    const tileSet = state.tileSet;

    headerBar.setState({
        projectTitle: state.project.title
    });
    paletteEditor.setState({
        paletteList: state.project.paletteList,
        selectedPaletteIndex: state.persistentUIState.paletteIndex,
        lastPaletteInputSystem: state.persistentUIState.importPaletteSystem,
        selectedColourIndex: 0,
        displayNative: getUIState().displayNativeColour
    });
    tileEditorToolbar.setState({
        tileWidth: tileSet.tileWidth,
        selectedTool: instanceState.tool,
        scale: state.persistentUIState.scale,
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
    tileEditor.setState({
        palette: palette,
        tileSet: tileSet,
        scale: state.persistentUIState.scale,
        displayNative: getUIState().displayNativeColour
    });

});
