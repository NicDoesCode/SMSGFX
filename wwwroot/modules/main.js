import State from "./state.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import TileSetColourFillUtil from "./util/tileSetColourFillUtil.js";
import ColourPickerDialogue from "./ui/colourPickerDialogue.js";
import ColourPickerToolbox from "./ui/colourPickerToolbox.js";
import PaletteModalDialogue from "./ui/paletteImportModalDialogue.js";
import TileSetImportModalDialogue from "./ui/tileSetImportModalDialogue.js";
import ExportModalDialogue from "./ui/exportModalDialogue.js";
import PaletteEditor from "./ui/paletteEditor.js";
import TileEditor from "./ui/tileEditor.js";
import TileEditorToolbar from "./ui/tileEditorToolbar.js";
import TileContextToolbar from "./ui/tileContextToolbar.js";
import HeaderBar from "./ui/headerBar.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileSetBinarySerialiser from "./serialisers/tileSetBinarySerialiser.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import ProjectAssemblySerialiser from "./serialisers/projectAssemblySerialiser.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";
import UndoManager from "./components/undoManager.js";
import ProjectFactory from "./factory/projectFactory.js";
import PaletteListFactory from "./factory/paletteListFactory.js";
import TileUtil from "./util/tileUtil.js";
import ImportImageModalDialogue from "./ui/importImageModalDialogue.js";
import PencilContextToolbar from "./ui/pencilContextToolbar.js";
import FileUtil from "./util/fileUtil.js";


const undoManager = new UndoManager(50);

const exportDialogue = new ExportModalDialogue(document.getElementById('tbExportDialogue'));
const colourPickerDialogue = new ColourPickerDialogue(document.getElementById('tbColourPickerDialogue'));
const colourPickerToolbox = new ColourPickerToolbox(document.getElementById('tbColourToolbox'));
const paletteEditor = new PaletteEditor(document.getElementById('tbPaletteEditor'));
const paletteImportDialogue = new PaletteModalDialogue(document.querySelector('[data-smsgfx-component-id=palette-import-dialogue]'));
const tileEditor = new TileEditor(document.getElementById('tbTileEditor'));
const tileEditorToolbar = new TileEditorToolbar(document.querySelector('[data-smsgfx-component-id=tile-editor-toolbar]'));
const tileImportDialogue = new TileSetImportModalDialogue(document.querySelector('[data-smsgfx-component-id=tile-import-dialogue]'));
const tileContextToolbar = new TileContextToolbar(document.getElementById('tbTileContextToolbar'));
const importImageModalDialogue = new ImportImageModalDialogue(document.querySelector('[data-smsgfx-component-id=import-image-modal]'));
const pencilContextToolbar = new PencilContextToolbar(document.querySelector('[data-smsgfx-component-id=pencil-tool-context-toolbar]'));
const headerBar = new HeaderBar(document.querySelector('[data-smsgfx-component-id=header-bar]'));




/* ****************************************************************************************************
   State
*/

const state = State.instance;

const instanceState = {
    /** @type {string} */
    tool: null,
    /** @type {number} */
    colourIndex: 0,
    /** @type {number} */
    tileIndex: -1,
    /** @type {string} */
    tileClipboard: null,
    /** @type {string} */
    colourToolboxTab: null,
    /** @type {boolean} */
    undoDisabled: false,
    lastTileMapPx: {
        x: -1, y: -1
    },
    /** @type {number} */
    pencilSize: 1,
    ctrlIsDown: false,
    shiftIsDown: false,
    altIsDown: false
};




/* ****************************************************************************************************
   Event handlers
*/

function wireUpEventHandlers() {

    headerBar.addHandlerOnCommand(handleHeaderBarOnCommand);

    paletteEditor.addHandlerRequestNewPalette(handlePaletteEditorRequestNewPalette);
    paletteEditor.addHandlerRequestImportPaletteFromCode(handlePaletteEditorRequestImportPaletteFromCode);
    paletteEditor.addHandlerRequestSelectedPaletteChange(handlePaletteEditorRequestSelectedPaletteChange);
    paletteEditor.addHandlerRequestClonePalette(handlePaletteEditorRequestClonePalette);
    paletteEditor.addHandlerRequestDeletePalette(handlePaletteEditorRequestDeletePalette);
    paletteEditor.addHandlerRequestTitleChange(handlePaletteEditorRequestTitleChange);
    paletteEditor.addHandlerRequestSystemChange(handlePaletteEditorRequestSystemChange);
    paletteEditor.addHandlerRequestNativeChange(handlePaletteEditorRequestNativeChange);
    paletteEditor.addHandlerRequestColourIndexChange(handlePaletteEditorRequestColourIndexChange);
    paletteEditor.addHandlerRequestColourIndexEdit(handlePaletteEditorRequestColourIndexEdit);
    paletteEditor.addHandlerRequestColourIndexSwap(handlePaletteEditorRequestColourIndexSwap);
    paletteEditor.addHandlerRequestColourIndexReplace(handlePaletteEditorRequestColourIndexReplace);

    tileEditor.addHandlerPixelMouseOver(handleTileEditorPixelMouseOver);
    tileEditor.addHandlerPixelMouseDown(handleTileEditorPixelMouseDown);
    tileEditor.addHandlerPixelMouseUp(handleTileEditorPixelMouseUp);
    tileEditor.addHandlerRequestSelectTile(handleTileEditorRequestSelectTile);
    tileEditor.addHandlerRequestRemoveTile(handleTileEditorRequestRemoveTile);
    tileEditor.addHandlerRequestInsertTileBefore(handleTileEditorRequestInsertTileBefore);
    tileEditor.addHandlerRequestInsertTileAfter(handleTileEditorRequestInsertTileAfter);
    tileEditor.addHandlerRequestCloneTile(handleTileEditorRequestCloneTile);
    tileEditor.addHandlerRequestMoveTileLeft(handleTileEditorMoveTileLeft);
    tileEditor.addHandlerRequestMoveTileRight(handleTileEditorMoveTileRight);
    tileEditor.addHandlerRequestMirrorTileHorizontal(handleTileEditorMirrorTileHorizontal);
    tileEditor.addHandlerRequestMirrorTileVertical(handleTileEditorMirrorTileVertical);

    tileEditorToolbar.addHandlerOnCommand(handleTileEditorToolbarOnCommand);

    tileContextToolbar.addHandlerOnButtonCommand(handleTileContextToolbarOnButtonCommand);

    pencilContextToolbar.addHandlerOnButtonCommand(handlePencilContextToolbarOnButtonCommand);

    paletteImportDialogue.addHandlerOnConfirm(handleImportPaletteModalDialogueOnConfirm);

    colourPickerDialogue.addHandlerOnChange(handleColourPickerChange);
    colourPickerDialogue.addHandlerOnConfirm(handleColourPickerConfirm);
    colourPickerDialogue.addHandlerOnCancel(handleColourPickerCancel);

    colourPickerToolbox.addHandlerRequestTabChange(handleColourPickerToolboxTabChange);
    colourPickerToolbox.addHandlerRequestColourChange(handleColourPickerToolboxColourChange);

    tileImportDialogue.addHandlerOnConfirm(handleImportTileSet);

    importImageModalDialogue.addHandlerOnConfirm(handleImageImportModalOnConfirm)
}

function createEventListeners() {

    document.addEventListener('paste', (clipboardEvent) => {
        if (clipboardEvent.clipboardData?.files?.length > 0) {
            const targetTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
            const file = clipboardEvent.clipboardData.files[0];
            if (targetTypes.includes(file.type)) {
                tileImportImage(file);
            }
        } else {
            /** @type {string} */
            let pasteData = (clipboardEvent.clipboardData || window.clipboardData).getData('text');
            if (typeof pasteData === 'string' && pasteData.length === 128 && /^[0-9a-f]+$/i.test(pasteData)) {
                if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileSet().length) {
                    instanceState.tileIndex = getTileSet().length;
                }
                instanceState.tileClipboard = pasteData;
                pasteTileAt(instanceState.tileIndex);
            }
        }
    });

    document.addEventListener('keydown', (keyEvent) => {
        // console.log('keydown', keyEvent);

        // instanceState.ctrlIsDown = keyEvent.ctrlKey;
        // instanceState.altIsDown = keyEvent.altKey;
        // instanceState.shiftIsDown = keyEvent.shiftKey;

        if (keyEvent.target === document.body) {
            let handled = false;
            if (keyEvent.ctrlKey && keyEvent.shiftKey) {
                // Ctrl + Shift

                if (keyEvent.code === 'KeyE') { // Plus shift (capital letter)
                    // Export
                    exportProjectToAssembly();
                    handled = true;
                }

            } else if (keyEvent.ctrlKey) {
                // Ctrl

                if (keyEvent.code === 'KeyO') {
                    // Import project
                    importProjectFromJson();
                    handled = true;
                } else if (keyEvent.code === 'KeyS') {
                    // Export project
                    exportProjectToJson();
                    handled = true;
                }

            }
            if (handled) {
                keyEvent.preventDefault();
                keyEvent.stopImmediatePropagation();
            }
        }
    });

    document.addEventListener('keyup', (keyEvent) => {
        // console.log('keyup', keyEvent);

        // instanceState.ctrlIsDown = keyEvent.ctrlKey;
        // instanceState.altIsDown = keyEvent.altKey;
        // instanceState.shiftIsDown = keyEvent.shiftKey;

        if (keyEvent.target === document.body) {
            let handled = false;
            if (keyEvent.ctrlKey && keyEvent.altKey) {
                // Ctrl + alt

                if (keyEvent.code === 'KeyP') {
                    // New palette
                    newPalette();
                    handled = true;
                } else if (keyEvent.code === 'KeyE') {
                    // New tile
                    tileNew();
                    handled = true;
                }

            } else if (keyEvent.altKey) {
                // Alt key only

                if (keyEvent.code === 'Equal' || keyEvent.code === 'NumpadAdd') {
                    // Increase viewport scale
                    increaseScale();
                    handled = true;
                } else if (keyEvent.code === 'Minus' || keyEvent.code === 'NumpadSubtract') {
                    // Decrease viewport scale
                    decreaseScale();
                    handled = true;
                } else if (keyEvent.code === 'ArrowDown') {
                    // Lower palette
                    selectPaletteIndex(getUIState().paletteIndex + 1);
                    handled = true;
                } else if (keyEvent.code === 'ArrowUp') {
                    // Higher palette
                    selectPaletteIndex(getUIState().paletteIndex - 1);
                    handled = true;
                } else if (keyEvent.code === 'ArrowLeft') {
                    // Lower palette
                    selectColourIndex(instanceState.colourIndex - 1);
                    handled = true;
                } else if (keyEvent.code === 'ArrowRight') {
                    // Higher palette
                    selectColourIndex(instanceState.colourIndex + 1);
                    handled = true;
                }

            } else if (keyEvent.ctrlKey) {
                // Ctrl key only

                if (keyEvent.code === 'KeyN') {
                    // Export
                    newProject();
                    handled = true;
                } else if (keyEvent.code === 'KeyX') {
                    // Cut tile
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        cutTileToClipboardAt(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'KeyC') {
                    // Copy tile
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        copyTileToClipboardAt(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'KeyV') {
                    // Paste tile
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        pasteTileAt(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'KeyD') {
                    // Clone tile
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        cloneTileAt(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'KeyZ') {
                    // Undo
                    undoOrRedo('u');
                    handled = true;
                } else if (keyEvent.code === 'KeyY') {
                    // Redo
                    undoOrRedo('r');
                    handled = true;
                } else if (/^Digit([0-9])$/.test(keyEvent.code)) {
                    // Brush size
                    let size = parseInt(/^Digit([0-9])$/.exec(keyEvent.code)[1]);
                    if (size === 0) size = 10;
                    if (keyEvent.shiftKey) size += 10;
                    setPencilSize(size);
                    handled = true;
                } else if (keyEvent.code === 'BracketLeft') {
                    // Mirror horizontal
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        mirrorHorizontal(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'BracketRight') {
                    // Mirror Vertical
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        mirrorVertical(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowLeft') {
                    // Move tile left
                    if (instanceState.tileIndex > 0 && instanceState.tileIndex < getTileSet().length) {
                        swapTilesAt(instanceState.tileIndex - 1, instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowRight') {
                    // Move tile right
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length - 1) {
                        swapTilesAt(instanceState.tileIndex, instanceState.tileIndex + 1);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowUp') {
                    // Move tile up
                    const proposedIndex = instanceState.tileIndex - getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        swapTilesAt(proposedIndex, instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowDown') {
                    // Move tile down
                    const proposedIndex = instanceState.tileIndex + getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        swapTilesAt(instanceState.tileIndex, proposedIndex);
                        handled = true;
                    }
                }

            } else {
                // No modifier key

                if (keyEvent.code === 'KeyF' || keyEvent.code === 'KeyB') {
                    // Select fill tool
                    selectTileEditorToolbarTool(TileEditorToolbar.Tools.bucket);
                    handled = true;
                } else if (keyEvent.code === 'KeyS') {
                    // Select selection tool
                    selectTileEditorToolbarTool(TileEditorToolbar.Tools.select);
                    handled = true;
                } else if (keyEvent.code === 'KeyP') {
                    // Select pencil tool
                    selectTileEditorToolbarTool(TileEditorToolbar.Tools.pencil);
                    handled = true;
                } else if (keyEvent.code === 'KeyI') {
                    // Select eyedropper tool
                    selectTileEditorToolbarTool(TileEditorToolbar.Tools.eyedropper);
                    handled = true;
                } else if (keyEvent.code === 'Delete') {
                    // Delete any selected tile
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        removeTileAt(instanceState.tileIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowLeft') {
                    // Move selection tile left
                    if (instanceState.tileIndex > 0 && instanceState.tileIndex < getTileSet().length) {
                        selectTile(instanceState.tileIndex - 1);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowRight') {
                    // Move selection tile right
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length - 1) {
                        selectTile(instanceState.tileIndex + 1);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowUp') {
                    // Move selection tile up
                    const proposedIndex = instanceState.tileIndex - getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        selectTile(proposedIndex);
                        handled = true;
                    }
                } else if (keyEvent.code === 'ArrowDown') {
                    // Move selection tile down
                    const proposedIndex = instanceState.tileIndex + getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        selectTile(proposedIndex);
                        handled = true;
                    }
                }
                else if (keyEvent.code === 'NumpadAdd') {
                    // Increase viewport scale
                    increaseScale();
                    handled = true;
                } else if (keyEvent.code === 'NumpadSubtract') {
                    // Decrease viewport scale
                    decreaseScale();
                    handled = true;
                }

            }
            if (handled) {
                keyEvent.preventDefault();
                keyEvent.stopImmediatePropagation();
            }
        }
    });
}


/** @param {import('./ui/headerBar.js').HeaderBarCommandEventArgs} args */
function handleHeaderBarOnCommand(args) {
    if (args.command === HeaderBar.Commands.title && args.title) {
        setProjectTitle(args.title);
    } else if (args.command === HeaderBar.Commands.projectNew) {
        newProject();
    } else if (args.command === HeaderBar.Commands.projectLoad) {
        importProjectFromJson();
    } else if (args.command === HeaderBar.Commands.projectSave) {
        exportProjectToJson();
    } else if (args.command === HeaderBar.Commands.exportCode) {
        exportProjectToAssembly();
    } else if (args.command === HeaderBar.Commands.exportImage) {
        exportImage();
    }
}


/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestNewPalette(args) {
    newPalette();
}
/** @param {import('./ui/paletteEditor').PaletteEditorCallback} args */
function handlePaletteEditorRequestImportPaletteFromCode(args) {
    paletteImportDialogue.setState({
        paletteData: getUIState().importPaletteAssemblyCode,
        system: getUIState().importPaletteSystem
    });
    paletteImportDialogue.show();
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteChangeEventArgs} args */
function handlePaletteEditorRequestSelectedPaletteChange(args) {
    selectPaletteIndex(args.paletteIndex);
}

/** @param {import('./ui/paletteEditor').PaletteEditorPaletteEventArgs} args */
function handlePaletteEditorRequestClonePalette(args) {
    const paletteIndex = args.paletteIndex;
    if (paletteIndex >= 0 && paletteIndex < state.paletteList.length) {

        addUndoState();

        const newPalette = PaletteFactory.clone(getPalette());
        newPalette.title += ' (copy)';

        getPaletteList().addPalette(newPalette);

        const newPaletteIndex = getPaletteList().length - 1;

        paletteEditor.setState({
            paletteList: state.paletteList,
            selectedPaletteIndex: newPaletteIndex
        });
        tileEditor.setState({
            palette: getPalette()
        });

        getUIState().paletteIndex = newPaletteIndex;
        state.saveToLocalStorage();
    }
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
        const colour = getPalette().getColour(instanceState.colourIndex);
        colourPickerToolbox.setState({
            r: colour.r,
            g: colour.g,
            b: colour.b
        });
    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourIndexEventArgs} args */
function handlePaletteEditorRequestColourIndexEdit(args) {
    const palette = state.project.paletteList.getPalette(args.paletteIndex);
    colourPickerDialogue.show(palette, args.colourIndex);
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourCommandEventArgs} args */
function handlePaletteEditorRequestColourIndexSwap(args) {
    addUndoState();

    getTileSet().swapColourIndex(args.sourceColourIndex, args.targetColourIndex);

    const sourceColour = getPalette().getColour(args.sourceColourIndex);
    const targetColour = getPalette().getColour(args.targetColourIndex);

    getPalette().setColour(args.sourceColourIndex, targetColour);
    getPalette().setColour(args.targetColourIndex, sourceColour);

    state.saveToLocalStorage();

    tileEditor.setState({
        palette: getPalette(),
        tileSet: getTileSet()
    });

    paletteEditor.setState({
        paletteList: getPaletteList()
    });
}

/** @param {import('./ui/paletteEditor').PaletteEditorColourCommandEventArgs} args */
function handlePaletteEditorRequestColourIndexReplace(args) {
    addUndoState();

    getTileSet().replaceColourIndex(args.sourceColourIndex, args.targetColourIndex);

    state.saveToLocalStorage();

    tileEditor.setState({
        tileSet: getTileSet()
    });
}


/** @param {import('./ui/tileEditorToolbar').TileEditorToolbarCommandEventArgs} args */
function handleTileEditorToolbarOnCommand(args) {
    switch (args.command) {
        case TileEditorToolbar.Commands.tileAdd:
            tileNew();
            break;
        case TileEditorToolbar.Commands.tileImageImport:
            tileImportImage();
            break;
        case TileEditorToolbar.Commands.tileCodeImport:
            tileImportCode();
            break;
        case TileEditorToolbar.Commands.undo:
            undoOrRedo('u');
            break;
        case TileEditorToolbar.Commands.redo:
            undoOrRedo('r');
            break;
        case TileEditorToolbar.Commands.toolChange:
            selectTileEditorToolbarTool(args.tool);
            break;
        case TileEditorToolbar.Commands.tileWidth:
            tileWidthSet(args.tileWidth);
            break;
        case TileEditorToolbar.Commands.scale:
            setScale(args.scale);
            break;
    }
}


/** @param {import('./ui/tileContextToolbar.js').TileContextToolbarCommandEventArgs} args */
function handleTileContextToolbarOnButtonCommand(args) {
    if (instanceState.tileIndex > -1 && instanceState.tileIndex < getTileSet().length) {
        if (args.command === TileContextToolbar.ToolbarButtons.cut) {
            // Cut
            cutTileToClipboardAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.copy) {
            // Copy
            copyTileToClipboardAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.paste) {
            // Paste
            pasteTileAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.clone) {
            // Clone
            cloneTileAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.remove) {
            // Remove
            removeTileAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.moveLeft) {
            // Move left 
            if (instanceState.tileIndex > 0) {
                swapTilesAt(instanceState.tileIndex - 1, instanceState.tileIndex);
            }
        } else if (args.command === TileContextToolbar.ToolbarButtons.moveRight) {
            // Move right 
            if (instanceState.tileIndex < getTile().length - 1) {
                swapTilesAt(instanceState.tileIndex, instanceState.tileIndex + 1);
            }
        } else if (args.command === TileContextToolbar.ToolbarButtons.mirrorHorizontal) {
            // Mirror horizontal 
            mirrorTileAt('h', instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.mirrorVertical) {
            // Mirror vertical 
            mirrorTileAt('v', instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.insertBefore) {
            // Insert before 
            insertTileAt(instanceState.tileIndex);
        } else if (args.command === TileContextToolbar.ToolbarButtons.insertAfter) {
            // Insert after 
            insertTileAt(instanceState.tileIndex + 1);
        }
    }
}

/** @param {import('./ui/pencilContextToolbar').PencilContextToolbarEventArgs} args */
function handlePencilContextToolbarOnButtonCommand(args) {
    if (args?.command === PencilContextToolbar.Commands.brushSize) {
        if (args.brushSize && args.brushSize >= 1 && args.brushSize <= 5) {
            setPencilSize(args.brushSize);
        }
    }
}

/** @param {import("./ui/tileEditor.js").TileEditorPixelEventArgs} args */
function handleTileEditorPixelMouseOver(args) {
    const tileSet = getTileSet();

    if (args.mouseIsDown) {
        takeToolAction(instanceState.tool, instanceState.colourIndex, args.x, args.y);
    }

    // Show the palette colour
    const pixel = tileSet.getPixelAt(args.x, args.y);
    if (pixel !== null) {
        paletteEditor.setState({
            highlightedColourIndex: pixel
        });
    }
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
function handleTileEditorRequestSelectTile(args) {
    selectTile(args.tileIndex);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestRemoveTile(args) {
    removeTileAt(args.tileIndex);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileBefore(args) {
    insertTileAt(args.tileIndex);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestInsertTileAfter(args) {
    insertTileAt(args.tileIndex + 1);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorRequestCloneTile(args) {
    cloneTileAt(args.tileIndex);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorMoveTileLeft(args) {
    if (!args || typeof args.tileIndex !== 'number') return;
    if (args.tileIndex > 0 && args.tileIndex < getTileSet().length) {
        swapTilesAt(args.tileIndex - 1, args.tileIndex);
    }
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorMoveTileRight(args) {
    if (!args || typeof args.tileIndex !== 'number') return;
    if (args.tileIndex >= 0 && args.tileIndex < getTileSet().length - 1) {
        swapTilesAt(args.tileIndex, args.tileIndex + 1);
    }
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorMirrorTileHorizontal(args) {
    mirrorTileAt('h', args.tileIndex);
}

/** @param {import("./ui/tileEditor.js").TileEditorTileEventArgs} args */
function handleTileEditorMirrorTileVertical(args) {
    mirrorTileAt('v', args.tileIndex);
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
        getPaletteList().addPalette(palette);
    } else if (system === 'ms') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromMasterSystemPalette(array);
        getPaletteList().addPalette(palette);
    }

    getUIState().paletteIndex = getPaletteList().length - 1;
    getUIState().importPaletteSystem = args.system;
    getUIState().importPaletteAssemblyCode = args.paletteData;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getUIState().paletteIndex
    });
    tileEditor.setState({
        palette: getPalette()
    });

    paletteImportDialogue.hide();
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
 * New tab selected values from the colour toolbox.
 * @param {import('./colourPickerToolbox.js').ColourPickerToolboxTabEventArgs} args - Event args.
 */
function handleColourPickerToolboxTabChange(args) {
    colourPickerToolbox.setState({
        showTab: args.tab
    });
}


/**
 * New RGB values from the colour toolbox received, bubble them up.
 * @param {import('./colourPickerToolbox.js').ColourPickerToolboxColourEventArgs} args - Event args.
 */
function handleColourPickerToolboxColourChange(args) {
    addUndoState();

    const project = state.project;
    const palette = getPalette();

    const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
    palette.setColour(instanceState.colourIndex, newColour);

    state.setProject(project);
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: state.paletteList
    });
    tileEditor.setState({
        palette: palette
    });
}


/**
 * Import tile set from assembly dialogue is confirmed.
 * @param {import('./ui/tileSetImportModalDialogue.js').TileSetImportModalDialogueConfirmEventArgs} args - Arguments.
 */
function handleImportTileSet(args) {
    addUndoState();

    const tileSetData = args.tileSetData;
    const tileSetDataArray = AssemblyUtil.readAsUint8ClampedArray(tileSetData);
    const importedTileSet = TileSetBinarySerialiser.deserialise(tileSetDataArray);

    if (args.replace) {
        getProject().tileSet = importedTileSet;
    } else {
        importedTileSet.getTiles().forEach(importedTile => {
            getTileSet().addTile(importedTile);
        });
    }

    getUIState().importTileAssemblyCode = args.tileSetData;
    getUIState().importTileReplace = args.replace;
    state.saveToLocalStorage();

    tileEditorToolbar.setState({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        tileSet: getTileSet()
    });

    tileImportDialogue.hide();
}


/**
 * Import image dialogue is confirmed.
 * @param {import('./ui/importImageModalDialogue').ImportProjectModelConfirmEventArgs} args - Arguments.
 */
function handleImageImportModalOnConfirm(args) {
    addUndoState();

    if (args.createNew) {
        const paletteList = PaletteListFactory.create([args.palette]);
        const project = ProjectFactory.create(args.title, args.tileSet, paletteList);
        state.setProject(project);
        state.saveToLocalStorage();
    } else {
        const paletteList = getPaletteList();
        paletteList.addPalette(args.palette);
        const tileSet = getTileSet();
        args.tileSet.getTiles().forEach(tile => {
            tileSet.addTile(tile);
        });
    }

    getUIState().paletteIndex = getPaletteList().length - 1;

    state.setProject(getProject());
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getPaletteList().length - 1
    });
    tileEditorToolbar.setState({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        palette: getPalette(),
        tileSet: getTileSet()
    });
    headerBar.setState({
        projectTitle: getProject().title
    });

    importImageModalDialogue.hide();
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

/**
 * Creates a default project file.
 * @returns {Project}
 */
function createEmptyProject() {
    const project = ProjectFactory.create('New project');

    // Create a default tile set
    project.tileSet = TileSetFactory.create();
    project.tileSet.tileWidth = 8;
    for (let i = 0; i < 64; i++) {
        project.tileSet.addTile(TileFactory.create());
    }

    // Create a default palette for Game Gear and Master System
    project.paletteList = PaletteListFactory.create();
    project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Master System', 'ms'));
    project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Game Gear', 'gg'));

    return project;
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

function getProject() {
    return state.project
};
function getTileSet() {
    return state.tileSet
};
function getTile() {
    if (instanceState.tileIndex > -1 && instanceState.tileIndex < getTileSet().length) {
        return getTileSet().getTile(instanceState.tileIndex);
    } else {
        return null;
    }
};
function getPaletteList() {
    return state.paletteList;
}
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
function getUIState() {
    return state.persistentUIState;
}

function takeToolAction(tool, colourIndex, imageX, imageY) {

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === TileEditorToolbar.Tools.select) {

            const tileIndex = getTileSet().getTileIndexByCoordinate(imageX, imageY);
            selectTile(tileIndex);

        } else if (tool === TileEditorToolbar.Tools.pencil) {
            if (instanceState.ctrlIsDown) {

                // CTRL down, set colour
                const colourIndex = getTileSet().getPixelAt(imageX, imageY);
                if (typeof colourIndex === 'number') {
                    selectColourIndex(colourIndex);
                }

            } else {

                // CTRL not down, so draw pixel
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

                    const size = instanceState.pencilSize;
                    if (size > 0) {
                        const startX = imageX - Math.floor(size / 2);
                        const startY = imageY - Math.floor(size / 2);
                        const endX = imageX + Math.ceil(size / 2);
                        const endY = imageY + Math.ceil(size / 2);
                        for (let yPx = startY; yPx < endY; yPx++) {
                            const xLeft = (size > 3 && (yPx === startY || yPx === endY - 1)) ? startX + 1 : startX;
                            const xRight = (size > 3 && (yPx === startY || yPx === endY - 1)) ? endX - 1 : endX;
                            for (let xPx = xLeft; xPx < xRight; xPx++) {
                                tileSet.setPixelAt(xPx, yPx, colourIndex);
                            }
                        }
                    } else {
                        tileSet.setPixelAt(imageX, imageY, colourIndex);
                    }

                    // Update the UI
                    tileEditor.setState({ tileSet: tileSet });
                }

            }

        } else if (tool === TileEditorToolbar.Tools.bucket) {

            addUndoState();
            TileSetColourFillUtil.fill(getTileSet(), imageX, imageY, colourIndex)
            tileEditor.setState({ tileSet: getTileSet() });

        } else if (tool === TileEditorToolbar.Tools.eyedropper) {

            const colourIndex = getTileSet().getPixelAt(imageX, imageY);
            if (colourIndex !== null) {
                selectColourIndex(colourIndex);
            }

        }

    }

}

/**
 * Sets the pencil size.
 * @param {number} brushSize - Pencil size, 1 to 5.
 */
function setPencilSize(brushSize) {
    if (brushSize && brushSize >= 1 && brushSize <= 50) {
        instanceState.pencilSize = brushSize;
        pencilContextToolbar.setState({
            brushSize: instanceState.pencilSize
        });
        tileEditor.setState({
            cursorSize: instanceState.pencilSize
        });
    }
}

/**
 * Selects a tile at a given index.
 * @param {number} index - Tile index to insert.
 */
function selectTile(index) {
    if (index < 0 || index > getTileSet().length) return;

    if (index !== instanceState.tileIndex) {
        instanceState.tileIndex = index;
    } else {
        instanceState.tileIndex = -1;
    }
    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex
    });
}

/**
 * Creates a new palette.
 */
function newPalette() {
    addUndoState();

    const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', 'ms');
    getPaletteList().addPalette(newPalette);

    state.setProject(getProject());
    state.saveToLocalStorage();

    const selectedPaletteIndex = getPaletteList().length - 1;

    // Update state
    state.persistentUIState.paletteIndex = selectedPaletteIndex;
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: selectedPaletteIndex
    });
    tileEditor.setState({
        palette: getPaletteList().getPalette(selectedPaletteIndex)
    });
}

function tileNew() {
    if (getTileSet()) {
        addUndoState();

        const newTile = TileFactory.create();
        getTileSet().addTile(newTile);

        state.setProject(getProject());
        state.saveToLocalStorage();

        tileEditor.setState({
            tileSet: getTileSet(),
            palette: getPalette()
        });
    }
}

/**
 * @param {File|null} file 
 */
function tileImportImage(file) {
    importImageModalDialogue.setState({
        paletteList: getPaletteList(),
        file: file ?? null
    });
    importImageModalDialogue.show();
}

function tileImportCode() {
    tileImportDialogue.setState({
        tileSetData: getUIState().importTileAssemblyCode,
        replace: getUIState().importTileReplace
    });
    tileImportDialogue.show();
}

/**
 * @param {number} tileWidth 
 */
function tileWidthSet(tileWidth) {
    getTileSet().tileWidth = tileWidth;
    tileEditor.setState({
        tileSet: getTileSet()
    });
    state.saveToLocalStorage();
}

/**
 * Sets the project title.
 * @argument {string} title - Project title.
 */
function setProjectTitle(title) {
    addUndoState();

    getProject().title = title;
    state.saveToLocalStorage();
}

/**
 * Imports the project from a JSON file.
 */
function newProject() {
    addUndoState();

    state.setProject(createEmptyProject());
    getUIState().paletteIndex = 0;
    state.saveToLocalStorage();

    instanceState.tileIndex = -1;
    instanceState.colourIndex = 0;

    headerBar.setState({
        projectTitle: getProject().title
    });
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedColourIndex: instanceState.colourIndex,
        selectedPaletteIndex: getUIState().paletteIndex
    });
    tileEditorToolbar.setState({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        palette: getPalette(),
        tileSet: getTileSet(),
        selectedTileIndex: instanceState.tileIndex
    });
}

/**
 * Imports the project from a JSON file.
 */
function importProjectFromJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        if (input.files.length > 0) {
            // Load the project from the file
            ProjectUtil.loadFromBlob(input.files[0]).then(project => {
                addUndoState();

                state.setProject(project);
                state.persistentUIState.paletteIndex = 0;

                // Set state
                headerBar.setState({
                    projectTitle: project.title
                });
                paletteEditor.setState({
                    paletteList: getPaletteList(),
                    selectedPaletteIndex: getUIState().paletteIndex,
                    selectedColourIndex: 0,
                    highlightedColourIndex: -1,
                    displayNative: getUIState().displayNativeColour
                });
                tileEditorToolbar.setState({
                    tileWidth: getTileSet().tileWidth
                });
                tileEditor.setState({
                    palette: getPalette(),
                    tileSet: getTileSet(),
                    displayNative: getUIState().displayNativeColour
                });
            });
        }
    }
    input.click();
}

/**
 * Exports the project to a JSON file.
 */
function exportProjectToJson() {
    ProjectUtil.saveToFile(state.project);
}

/**
 * Shows the export to assembly dialogue.
 */
function exportProjectToAssembly() {
    const code = ProjectAssemblySerialiser.serialise(getProject());
    exportDialogue.show(code);
}

/**
 * Exports tileset to an image.
 */
function exportImage() {
    const fileName = getProject().title && getProject().title.length > 0 ? getProject().title : 'image';
    const fileNameClean = FileUtil.getCleanFileName(fileName);
    const fullFileName = `${fileNameClean}.png`;
    const dataUrl = tileEditor.toDataUrl();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fullFileName;
    a.click();
    a.remove();
}

/**
 * Performs an undo or redo operation.
 * @param {string} undoOrRedo - Either 'u' for undo or 'r' for redo.
 */
function undoOrRedo(undoOrRedo) {
    if (typeof undoOrRedo !== 'string' || !['u', 'r'].includes(undoOrRedo)) return;

    const sanityCheck = undoOrRedo === 'u' ? undoManager.canUndo : undoManager.canRedo;
    if (sanityCheck) {
        // Set project state
        if (undoOrRedo === 'u') {
            const retrievedProjectState = undoManager.undo(getProject());
            state.setProject(retrievedProjectState);
        } else {
            const retrievedProjectState = undoManager.redo(getProject());
            state.setProject(retrievedProjectState);
        }

        // Set UI state
        headerBar.setState({
            projectTitle: getProject().title
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
            paletteList: getPaletteList()
        });
    }
    tileEditorToolbar.setState({
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
}

function addUndoState() {
    if (!instanceState.undoDisabled) {
        undoManager.addUndoState(state.project);
        tileEditorToolbar.setState({ undoEnabled: undoManager.canUndo, redoEnabled: undoManager.canRedo });
    }
}

/**
 * Mirror a tile at a given index.
 * @param {string} way - Either 'h' or 'v'.
 * @param {number} index - Tile index.
 */
function mirrorTileAt(way, index) {
    if (index < 0 || index > getTileSet().length) return;
    if (!way || !['h', 'v'].includes(way)) throw new Error('Please specify horizontal "h" or vertical "v".');

    addUndoState();

    const tile = getTileSet().getTile(index);

    /** @type {Tile} */
    let mirroredTile;
    if (way === 'h') {
        mirroredTile = TileUtil.mirrorHorizontal(tile);
    } else {
        mirroredTile = TileUtil.mirrorVertical(tile);
    }

    getTileSet().removeTile(index);
    getTileSet().insertTileAt(mirroredTile, index);

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        selectedTileIndex: instanceState.selectedColourIndex,
        tileSet: getTileSet()
    });
}

/**
 * Inserts a tile at a given index.
 * @param {number} index - Tile index to insert.
 */
function insertTileAt(index) {
    if (index < 0 || index > getTileSet().length) return;

    addUndoState();

    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(15, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    if (index < getTileSet().length) {
        getTileSet().insertTileAt(newTile, index);
    } else if (index >= getTileSet().length) {
        getTileSet().addTile(newTile);
    }

    state.setProject(getProject());
    state.saveToLocalStorage();

    // Increment to maintain the selected tile index if it is after the index where the tile was inserted
    if (instanceState.tileIndex >= index) {
        instanceState.tileIndex++;
    }

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Places a tile in the clipboard and removes it from the tile map.
 * @param {number} index - Tile index to clone.
 */
function cutTileToClipboardAt(index) {
    if (index < 0 || index >= getTileSet().length) return;

    addUndoState();

    const tile = getTileSet().getTile(index);
    instanceState.tileClipboard = TileUtil.toHex(tile);
    getTileSet().removeTile(index);

    // Maintain selection state, don't allow it to exceed tile count
    if (instanceState.tileIndex >= getTileSet().length) {
        instanceState.tileIndex = getTileSet().length - 1;
    }

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Places a tile in the clipboard.
 * @param {number} index - Tile index to clone.
 */
function copyTileToClipboardAt(index) {
    if (index < 0 || index >= getTileSet().length) return;

    const tile = getTileSet().getTile(index);
    instanceState.tileClipboard = TileUtil.toHex(tile);

    navigator.clipboard.writeText(TileUtil.toHex(tile));

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Pastes a tile from the clipboard.
 * @param {number} index - Tile index to clone.
 */
function pasteTileAt(index) {
    if (index < 0 || index >= getTileSet().length) return;
    if (!instanceState.tileClipboard) return;

    addUndoState();

    const newTile = TileFactory.fromHex(instanceState.tileClipboard);
    if (index >= 0 && index < getTileSet().length - 1) {
        getTileSet().insertTileAt(newTile, index + 1);
    } else {
        getTileSet().addTile(newTile);
    }

    // Select the new tile
    if (instanceState.tileIndex >= 0) {
        instanceState.tileIndex++;
    }

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Clones a tile at a given index.
 * @param {number} index - Tile index to clone.
 */
function cloneTileAt(index) {
    if (index < 0 || index >= getTileSet().length) return;

    addUndoState();

    const tile = getTileSet().getTile(index);
    const tileAsHex = TileUtil.toHex(tile);
    const newTile = TileFactory.fromHex(tileAsHex);

    if (index < getTileSet().length - 1) {
        getTileSet().insertTileAt(newTile, index + 1);
    } else {
        getTileSet().addTile(newTile);
    }

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Inserts a tile at a given index.
 * @param {number} index - Tile index to insert.
 */
function removeTileAt(index) {
    if (index < 0 || index >= getTileSet().length) return;

    addUndoState();

    getTileSet().removeTile(index);

    state.setProject(getProject());
    state.saveToLocalStorage();

    // Maintain tile index
    if (instanceState.tileIndex >= index) {
        instanceState.tileIndex--;
    }

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Swaps the places of two tiles witin the tile set.
 * @param {number} tileAIndex - Index of the first tile to swap.
 * @param {number} tileBIndex - Index of the second tile to swap.
 */
function swapTilesAt(tileAIndex, tileBIndex) {
    if (tileAIndex === tileBIndex) return;
    if (tileAIndex < 0 || tileAIndex >= getTileSet().length) return;
    if (tileBIndex < 0 || tileBIndex >= getTileSet().length) return;

    addUndoState();

    const lowerIndex = Math.min(tileAIndex, tileBIndex);
    const higherIndex = Math.max(tileAIndex, tileBIndex);

    const lowerTile = getTileSet().getTile(lowerIndex);
    const higherTile = getTileSet().getTile(higherIndex);

    getTileSet().removeTile(lowerIndex);
    getTileSet().insertTileAt(higherTile, lowerIndex);

    getTileSet().removeTile(higherIndex);
    getTileSet().insertTileAt(lowerTile, higherIndex);

    state.setProject(getProject());
    state.saveToLocalStorage();

    // Maintain tile index
    if (instanceState.tileIndex === lowerIndex) {
        instanceState.tileIndex = higherIndex;
    } else if (instanceState.tileIndex === higherIndex) {
        instanceState.tileIndex = lowerIndex;
    }

    tileEditor.setState({
        selectedTileIndex: instanceState.tileIndex,
        tileSet: getTileSet()
    });
}

/**
 * Selects a tool on the tile editor toolbar.
 * @param {string} tool - Name of the tool to select.
 */
function selectTileEditorToolbarTool(tool) {
    if (TileEditorToolbar.Tools[tool]) {
        const t = TileEditorToolbar.Tools;
        instanceState.tool = tool;
        if (tool !== TileEditorToolbar.Tools.select) {
            instanceState.tileIndex = -1;
            tileEditor.setState({
                selectedTileIndex: instanceState.tileIndex
            });
        }
        tileContextToolbar.setState({
            visible: tool === t.select
        });
        pencilContextToolbar.setState({
            visible: [t.pencil, t.eyedropper, t.bucket].includes(tool)
        });
        tileEditorToolbar.setState({
            selectedTool: tool
        });
        let cursor = 'arrow';
        if ([t.eyedropper, t.bucket].includes(tool)) {
            cursor = 'crosshair';
        } else if (tool === t.pencil) {
            cursor = 'none';
        }
        tileEditor.setState({
            cursor: cursor
        });
    }
}

/**
 * Sets the image scale level on the tile editor.
 * @param {number} scale - Must be in allowed scale levels.
 */
function setScale(scale) {
    if (typeof scale !== 'number') return;
    if (!TileEditorToolbar.scales.includes(scale)) return;

    getUIState().scale = scale;
    state.saveToLocalStorage();

    tileEditorToolbar.setState({
        scale: scale
    });
    tileEditor.setState({
        scale: scale
    });
}

/**
 * Selects a tool on the tile editor toolbar.
 * @param {string} tool - Name of the tool to select.
 */
function increaseScale() {
    const scaleIndex = TileEditorToolbar.scales.indexOf(getUIState().scale);
    if (scaleIndex >= TileEditorToolbar.scales.length - 1) return;

    let newScale = TileEditorToolbar.scales[scaleIndex + 1];
    setScale(newScale);
}

/**
 * Selects a tool on the tile editor toolbar.
 * @param {string} tool - Name of the tool to select.
 */
function decreaseScale() {
    const scaleIndex = TileEditorToolbar.scales.indexOf(getUIState().scale);
    if (scaleIndex <= 0) return;

    let newScale = TileEditorToolbar.scales[scaleIndex - 1];
    setScale(newScale);
}

/**
 * Selects a given palette.
 * @param {number} index - Palette index in the palette list.
 */
function selectPaletteIndex(index) {
    if (index < 0 || index >= getPaletteList().length) return;

    state.persistentUIState.paletteIndex = index;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: index
    });
    tileEditor.setState({
        palette: getPalette()
    });
}

/**
 * Selects a given colour by index.
 * @param {number} index - Colour index, 0 to 15.
 */
function selectColourIndex(index) {
    if (index < 0 || index >= 16) return;

    instanceState.colourIndex = index;

    paletteEditor.setState({
        selectedColourIndex: instanceState.colourIndex
    });
}



/* ****************************************************************************************************
   Initilisation
*/

$(() => {

    instanceState.tool = 'pencil';
    instanceState.colourToolboxTab = 'rgb';

    wireUpEventHandlers();
    createEventListeners();

    // Load and set state
    state.loadFromLocalStorage();

    createDefaultProjectIfNoneExists();
    checkPersistentUIValues();

    const palette = getPalette();
    const tileSet = getTileSet();
    const colour = palette.getColour(instanceState.colourIndex);

    headerBar.setState({
        projectTitle: state.project.title
    });
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getUIState().paletteIndex,
        lastPaletteInputSystem: getUIState().importPaletteSystem,
        selectedColourIndex: 0,
        displayNative: getUIState().displayNativeColour
    });
    colourPickerToolbox.setState({
        showTab: instanceState.colourToolboxTab,
        r: colour.r,
        g: colour.g,
        b: colour.b
    });
    tileEditorToolbar.setState({
        tileWidth: tileSet.tileWidth,
        selectedTool: instanceState.tool,
        scale: getUIState().scale,
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
    tileEditor.setState({
        palette: palette,
        tileSet: tileSet,
        scale: getUIState().scale,
        displayNative: getUIState().displayNativeColour,
        cursorSize: instanceState.pencilSize
    });
    pencilContextToolbar.setState({
        visible: instanceState.tool === TileEditorToolbar.Tools.pencil,
        brushSize: instanceState.pencilSize
    });
    selectTileEditorToolbarTool(instanceState.tool);
});
