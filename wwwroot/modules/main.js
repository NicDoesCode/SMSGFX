import State from "./state.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import PaintUtil from "./util/paintUtil.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import TileMapTileFactory from "./factory/tileMapTileFactory.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";
import UndoManager from "./components/undoManager.js";
import ProjectFactory from "./factory/projectFactory.js";
import PaletteListFactory from "./factory/paletteListFactory.js";
import TileUtil from "./util/tileUtil.js";
import FileUtil from "./util/fileUtil.js";
import Project from "./models/project.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectWatcher from "./components/projectWatcher.js";
import ImageUtil from "./util/imageUtil.js";
import ReferenceImage from "./models/referenceImage.js";
import GoogleAnalyticsManager from "./components/googleAnalyticsManager.js";
import ThemeManager from "./components/themeManager.js";
import SerialisationUtil from "./util/serialisationUtil.js";

import PaletteEditor from "./ui/paletteEditor.js";
import TileEditor from "./ui/tileEditor.js";
import TileManager from "./ui/tileManager.js";

import AboutModalDialogue from "./ui/dialogues/aboutModalDialogue.js";
import ColourPickerDialogue from "./ui/dialogues/colourPickerDialogue.js";
import ExportModalDialogue from "./ui/dialogues/exportModalDialogue.js";
import ImportImageModalDialogue from "./ui/dialogues/importImageModalDialogue.js";
import NewProjectDialogue from "./ui/dialogues/newProjectDialogue.js";
import NewTileMapDialogue from "./ui/dialogues/newTileMapDialogue.js";
import PaletteModalDialogue from "./ui/dialogues/paletteImportModalDialogue.js";
import PrivacyModalDialogue from "./ui/dialogues/privacyModalDialogue.js";
import ProjectDropdown from "./ui/dialogues/projectDropdown.js";
import TileSetImportModalDialogue from "./ui/dialogues/tileSetImportModalDialogue.js";
import WelcomeScreen from "./ui/dialogues/welcomeScreen.js";

import ExportToolbar from "./ui/toolbars/exportToolbar.js";
import OptionsToolbar from "./ui/toolbars/optionsToolbar.js";
import ProjectToolbar from "./ui/toolbars/projectToolbar.js";
import TileContextToolbar from "./ui/toolbars/tileContextToolbar.js";
import TileEditorToolbar from "./ui/toolbars/tileEditorToolbar.js";

import ColourPickerToolbox from "./ui/colourPickerToolbox.js";
import DocumentationViewer from "./ui/documentationViewer.js";
import TileMap from "./models/tileMap.js";
import TileMapUtil from "./util/tileMapUtil.js";
import TileMapFactory from "./factory/tileMapFactory.js";
import TileGridProvider from "./models/tileGridProvider.js";
import PaletteList from "./models/paletteList.js";

import TileMapRowColumnTool from "./tools/tileMapRowColumnTool.js";
import TileLinkBreakTool from "./tools/tileLinkBreakTool.js";
import EyedropperTool from "./tools/eyedropperTool.js";
import PaintTool from "./tools/paintTool.js";
import PalettePaintTool from "./tools/palettePaintTool.js";
import TileStampTool from "./tools/tileStampTool.js";
import Tile from "./models/tile.js";
import TileMapTool from "./tools/tileMapTool.js";


/* ****************************************************************************************************
   State
*/

const state = new State();

const instanceState = {
    /** @type {string} */
    tool: null,
    toolData: {},
    /** @type {number} */
    colourIndex: 0,
    /** @type {number} */
    startingColourIndex: 0,
    /** @type {number} */
    tileIndex: -1,
    /** @type {number} */
    operationTileIndex: -1,
    /** @type {string} */
    tileClipboard: null,
    /** @type {string} */
    colourToolboxTab: null,
    /** @type {boolean} */
    undoDisabled: false,
    /** @type {string} */
    lastBound: null,
    lastTileMapPx: {
        x: -1, y: -1
    },
    /** @type {number} */
    pencilSize: 1,
    /** @type {boolean} */
    userClampToTile: false,
    /** @type {boolean} */
    clampToTile: false,
    /** @type {boolean} */
    breakTileLinks: false,
    /** @type {string?} */
    rowColumnMode: 'addRow',
    /** @type {string?} */
    rowColumnFillMode: TileMapRowColumnTool.TileFillMode.useSelected,
    /** @type {number} */
    paletteSlot: 0,
    /** @type {string?} */
    lastProjectId: null,
    /** @type {string?} */
    selectedTileMapId: null,
    ctrlIsDown: false,
    shiftIsDown: false,
    altIsDown: false,
    /** @type {string?} */
    swapTool: null,
    sessionId: GeneralUtil.generateRandomString(32),
    /** @type {ReferenceImage} */
    referenceImage: null,
    /** @type {HTMLImageElement} */
    referenceImageOriginal: null,
    /** @type {DOMRect} */
    referenceImageOriginalBounds: null,
    referenceImageLockAspect: true,
    referenceImageMoving: false
};




/* ****************************************************************************************************
   Components
*/

const undoManager = new UndoManager(50);
const watcher = new ProjectWatcher(instanceState.sessionId);
const googleAnalytics = new GoogleAnalyticsManager();
const themeManager = new ThemeManager();

/** @type {ProjectToolbar} */ let projectToolbar;
/** @type {ProjectDropdown} */ let projectDropdown;
/** @type {ExportToolbar} */ let exportToolbar;
/** @type {OptionsToolbar} */ let optionsToolbar;
/** @type {ExportModalDialogue} */ let exportDialogue;
/** @type {ColourPickerDialogue} */ let colourPickerDialogue;
/** @type {ColourPickerToolbox} */ let colourPickerToolbox;
/** @type {PaletteEditor} */ let paletteEditor;
/** @type {TileManager} */ let tileManager;
/** @type {NewProjectDialogue} */ let newProjectDialogue;
/** @type {NewTileMapDialogue} */ let newTileMapDialogue;
/** @type {PaletteModalDialogue} */ let paletteImportDialogue;
/** @type {TileEditor} */ let tileEditor;
/** @type {TileEditorToolbar} */ let tileEditorToolbar;
/** @type {TileEditorToolbar} */ let tileEditorBottomToolbar;
/** @type {TileContextToolbar} */ let tileContextToolbar;
/** @type {TileSetImportModalDialogue} */ let tileImportDialogue;
/** @type {ImportImageModalDialogue} */ let importImageModalDialogue;
/** @type {AboutModalDialogue} */ let aboutDialogue;
/** @type {PrivacyModalDialogue} */ let privacyModalDialogue;
/** @type {DocumentationViewer} */ let documentationViewer;
/** @type {WelcomeScreen} */ let welcomeScreen;

async function initialiseComponents() {
    await googleAnalytics.injectIfConfiguredAsync();

    projectToolbar = await ProjectToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=project-toolbar]'));
    projectDropdown = await ProjectDropdown.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=project-dropdown]'));
    exportToolbar = await ExportToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=export-toolbar]'));
    optionsToolbar = await OptionsToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=options-toolbar]'));
    exportDialogue = await ExportModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=export-dialogue]'));
    colourPickerDialogue = await ColourPickerDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=colour-picker-dialogue]'));
    colourPickerToolbox = await ColourPickerToolbox.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=colour-picker-toolbox]'));
    paletteEditor = await PaletteEditor.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=palette-editor]'));
    tileManager = await TileManager.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-manager]'));
    newProjectDialogue = await NewProjectDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=new-project-dialogue]'));
    newTileMapDialogue = await NewTileMapDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=new-tile-map-dialogue]'));
    paletteImportDialogue = await PaletteModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=palette-import-dialogue]'));
    tileEditor = await TileEditor.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-editor]'));
    tileEditorToolbar = await TileEditorToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-editor-toolbar]'));
    tileEditorBottomToolbar = await TileEditorToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-editor-bottom-toolbar]'));
    tileContextToolbar = await TileContextToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-context-toolbar]'));
    tileImportDialogue = await TileSetImportModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-import-dialogue]'));
    importImageModalDialogue = await ImportImageModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=import-image-modal]'));
    aboutDialogue = await AboutModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=about-modal]'));
    privacyModalDialogue = await PrivacyModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=privacy-modal]'));
    documentationViewer = await DocumentationViewer.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=documentation-viewer]'));
    welcomeScreen = await WelcomeScreen.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=welcome-screen]'));
}

function wireUpGenericComponents() {
    document.querySelectorAll('[data-smsgfx-generic]').forEach((element) => {
        const command = element.getAttribute('data-smsgfx-generic');
        if (command === 'about' && ['A', 'BUTTON'].includes(element.tagName)) {
            element.onclick = () => {
                aboutDialogue.show();
                return false;
            }
        }
        if (command === 'privacy' && ['A', 'BUTTON'].includes(element.tagName)) {
            element.onclick = () => {
                privacyModalDialogue.show();
                return false;
            }
        }
    });
}




/* ****************************************************************************************************
   Event handlers
*/

function wireUpEventHandlers() {

    watcher.addHandlerOnEvent(handleWatcherEvent);

    state.addHandlerOnEvent(handleStateEvent);

    themeManager.addHandlerOnEvent(handleThemeManagerEvent);

    projectToolbar.addHandlerOnCommand(handleProjectToolbarOnCommand);
    projectDropdown.addHandlerOnCommand(handleProjectDropdownOnCommand);
    projectDropdown.addHandlerOnHidden(handleProjectDropdownOnHidden);

    exportToolbar.addHandlerOnCommand(handleExportToolbarOnCommand);

    optionsToolbar.addHandlerOnCommand(handleOptionsToolbarOnCommand);

    exportDialogue.addHandlerOnCommand(handleExportDialogueOnCommand);

    paletteEditor.addHandlerOnCommand(handlePaletteEditorOnCommand);

    tileEditor.addHandlerOnCommand(handleTileEditorOnCommand);
    tileEditor.addHandlerOnEvent(handleTileEditorOnEvent);

    tileEditorToolbar.addHandlerOnCommand(handleTileEditorToolbarOnCommand);
    tileEditorBottomToolbar.addHandlerOnCommand(handleTileEditorToolbarOnCommand);
    tileContextToolbar.addHandlerOnCommand(handleTileContextToolbarCommand);

    tileManager.addHandlerOnCommand(handleTileManagerOnCommand);

    newProjectDialogue.addHandlerOnConfirm(handleNewProjectDialogueOnConfirm);
    newTileMapDialogue.addHandlerOnConfirm(handleNewTileMapDialogueOnConfirm);

    paletteImportDialogue.addHandlerOnConfirm(handleImportPaletteModalDialogueOnConfirm);

    colourPickerDialogue.addHandlerOnChange(handleColourPickerChange);
    colourPickerDialogue.addHandlerOnConfirm(handleColourPickerConfirm);
    colourPickerDialogue.addHandlerOnCancel(handleColourPickerCancel);

    colourPickerToolbox.addHandlerOnCommand(handleColourPickerToolboxOnCommand);

    tileImportDialogue.addHandlerOnConfirm(handleImportTileSet);

    importImageModalDialogue.addHandlerOnConfirm(handleImageImportModalOnConfirm);

    documentationViewer.addHandlerOnCommand(documentationViewerOnCommand);

    welcomeScreen.addHandlerOnCommand(welcomeScreenOnCommand);
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

        if (keyEvent.target.tagName === 'INPUT') return;
        if (keyEvent.target.tagName === 'SELECT') return;
        if (keyEvent.target.tagName === 'TEXTAREA') return;

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
            } else {
                // Ctrl key with no other modifier

                if (instanceState.tool === TileEditorToolbar.Tools.pencil) {
                    selectTool(TileEditorToolbar.Tools.eyedropper);
                    instanceState.swapTool = TileEditorToolbar.Tools.pencil;
                    handled = true;
                } else if (instanceState.tool === TileEditorToolbar.Tools.colourReplace) {
                    selectTool(TileEditorToolbar.Tools.eyedropper);
                    instanceState.swapTool = TileEditorToolbar.Tools.colourReplace;
                    handled = true;
                } else if (instanceState.tool === TileEditorToolbar.Tools.bucket) {
                    selectTool(TileEditorToolbar.Tools.eyedropper);
                    instanceState.swapTool = TileEditorToolbar.Tools.bucket;
                    handled = true;
                } else if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
                    selectTool(TileEditorToolbar.Tools.tileEyedropper);
                    instanceState.swapTool = TileEditorToolbar.Tools.tileStamp;
                    handled = true;
                }

            }

        }
        if (handled) {
            keyEvent.preventDefault();
            keyEvent.stopImmediatePropagation();
        }
    });

    document.addEventListener('keyup', (keyEvent) => {
        // console.log('keyup', keyEvent);

        // instanceState.ctrlIsDown = keyEvent.ctrlKey;
        // instanceState.altIsDown = keyEvent.altKey;
        // instanceState.shiftIsDown = keyEvent.shiftKey;

        if (keyEvent.target.tagName === 'INPUT') return;
        if (keyEvent.target.tagName === 'SELECT') return;
        if (keyEvent.target.tagName === 'TEXTAREA') return;

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

        } else if (keyEvent.shiftKey) {
            // Shift

            if (keyEvent.code === 'KeyI') {
                // Tile eyedropper
                selectTool(TileEditorToolbar.Tools.tileEyedropper);
                handled = true;
            } else if (keyEvent.code === 'KeyS') {
                // Tile stamp
                selectTool(TileEditorToolbar.Tools.tileStamp);
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
                changePaletteIndex(getProjectUIState().paletteIndex + 1);
                handled = true;
            } else if (keyEvent.code === 'ArrowUp') {
                // Higher palette
                changePaletteIndex(getProjectUIState().paletteIndex - 1);
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
                newProjectDialogue.setState({
                    title: 'New project',
                    systemType: getProject()?.systemType ?? NewProjectDialogue.Systems.smsgg,
                    selectedtilePreset: NewProjectDialogue.TilePresets["8x8"],
                    createTileMap: true
                });
                newProjectDialogue.show();
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
                selectTool(TileEditorToolbar.Tools.bucket);
                handled = true;
            } else if (keyEvent.code === 'KeyS') {
                // Select selection tool
                selectTool(TileEditorToolbar.Tools.select);
                handled = true;
            } else if (keyEvent.code === 'KeyP') {
                // Select pencil tool
                selectTool(TileEditorToolbar.Tools.pencil);
                handled = true;
            } else if (keyEvent.code === 'KeyI') {
                // Select eyedropper tool
                selectTool(TileEditorToolbar.Tools.eyedropper);
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
                    toggleTileIndexSelectedState(instanceState.tileIndex - 1);
                    handled = true;
                }
            } else if (keyEvent.code === 'ArrowRight') {
                // Move selection tile right
                if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length - 1) {
                    toggleTileIndexSelectedState(instanceState.tileIndex + 1);
                    handled = true;
                }
            } else if (keyEvent.code === 'ArrowUp') {
                // Move selection tile up
                const proposedIndex = instanceState.tileIndex - getTileSet().tileWidth;
                if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                    toggleTileIndexSelectedState(proposedIndex);
                    handled = true;
                }
            } else if (keyEvent.code === 'ArrowDown') {
                // Move selection tile down
                const proposedIndex = instanceState.tileIndex + getTileSet().tileWidth;
                if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                    toggleTileIndexSelectedState(proposedIndex);
                    handled = true;
                }
            } else if (keyEvent.code === 'NumpadAdd') {
                // Increase viewport scale
                increaseScale();
                handled = true;
            } else if (keyEvent.code === 'NumpadSubtract') {
                // Decrease viewport scale
                decreaseScale();
                handled = true;
            } else if (keyEvent.code === 'ControlLeft' || keyEvent.code === 'ControlRight') {
                // Swap back to previous tool?
                if (instanceState.swapTool) {
                    selectTool(instanceState.swapTool);
                    handled = true;
                    instanceState.swapTool = null;
                }
            }

        }
        if (handled) {
            keyEvent.preventDefault();
            keyEvent.stopImmediatePropagation();
        }
    });
}


/** @param {import('./components/projectWatcher').ProjectWatcherEventArgs} args */
function handleWatcherEvent(args) {
    switch (args.event) {

        case ProjectWatcher.Events.projectChanged:
            const project = getProject();
            if (project && args.project && args.project.id === project.id) {
                state.setProject(args.project);
            } else {
                tileEditor.setState({
                    paletteList: null,
                    palette: null,
                    tileGrid: null,
                    tileSet: null
                });
            }
            formatForProject();
            break;

        case ProjectWatcher.Events.projectListChanged:
            setTimeout(() => displayProjectList(), 50);
            break;

    }
}


/** @param {import('./state.js').StateEventArgs} args */
function handleStateEvent(args) {
    switch (args.event) {

        case State.Events.projectChanged:
            displaySelectedProject();
            break;

        case State.Events.projectSaved:
            const project = getProject();
            watcher.sendProjectChanged(project);
            break;

        case State.Events.projectListChanged:
            displayProjectList();
            watcher.sendProjectListChanged();
            break;

    }
}


/** @param {import('./components/themeManager.js').ThemeManagerOnEventEventArgs} args */
function handleThemeManagerEvent(args) {
    switch (args.event) {

        case ThemeManager.Events.themeChange:
            tileEditor.setState({ theme: args.theme });
            break;

    }
}


/** @param {import('./ui/toolbars/projectToolbar').ProjectToolbarCommandEventArgs} args */
function handleProjectToolbarOnCommand(args) {

    switch (args.command) {

        case ProjectToolbar.Commands.title:
            if (args.title) setProjectTitle(args.title);
            break;

        case ProjectToolbar.Commands.projectNew:
            newProjectDialogue.setState({
                title: 'New project',
                systemType: getProject()?.systemType ?? NewProjectDialogue.Systems.smsgg,
                selectedtilePreset: NewProjectDialogue.TilePresets["8x8"],
                createTileMap: true
            });
            newProjectDialogue.show();
            break;

        case ProjectToolbar.Commands.projectLoadFromFile:
            importProjectFromJson();
            break;

        case ProjectToolbar.Commands.projectSaveToFile:
            exportProjectToJson();
            break;

        case ProjectToolbar.Commands.projectLoadById:
            const projects = state.getProjectsFromLocalStorage();
            const project = projects.getProjectById(args.projectId);
            state.setProject(project);
            break;

        case ProjectToolbar.Commands.projectDelete:
            state.deleteProjectFromStorage(args.projectId);
            break;

        case ProjectToolbar.Commands.showDropdown:
            projectDropdown.show();
            break;

    }
}

/** @param {import('./ui/dialogues/projectDropdown.js').ProjectDropdownCommandEventArgs} args */
function handleProjectDropdownOnCommand(args) {
    const projects = state.getProjectsFromLocalStorage();
    switch (args.command) {

        case ProjectDropdown.Commands.title:
            if (args.title) setProjectTitle(args.title);
            break;

        case ProjectDropdown.Commands.projectNew:
            newProjectDialogue.setState({
                title: 'New project',
                systemType: args?.systemType ?? NewProjectDialogue.Systems.smsgg,
                selectedtilePreset: NewProjectDialogue.TilePresets["8x8"],
                createTileMap: true
            });
            newProjectDialogue.show();
            projectDropdown.setState({ visible: false });
            break;

        case ProjectDropdown.Commands.projectLoadFromFile:
            importProjectFromJson();
            projectDropdown.setState({ visible: false });
            break;

        case ProjectDropdown.Commands.projectSaveToFile:
            exportProjectToJson();
            break;

        case ProjectDropdown.Commands.projectLoadById:
            const project = projects.getProjectById(args.projectId);
            state.setProject(project);
            projectDropdown.setState({ visible: false });
            break;

        case ProjectDropdown.Commands.projectDelete:
            state.deleteProjectFromStorage(args.projectId);
            break;

        case ProjectDropdown.Commands.showWelcomeScreen:
            welcomeScreen.setState({
                visible: true,
                projects: projects,
                visibleCommands: ['dismiss']
            });
            projectDropdown.setState({ visible: false });
            break;

    }
}

function handleProjectDropdownOnHidden() {
    if (getProject() instanceof Project === false) {
        welcomeScreen.setState({ visible: true, invisibleCommands: ['dismiss'] });
    }
}

/** @param {import('./ui/exportToolbar.js').ExportToolbarCommandEventArgs} args */
function handleExportToolbarOnCommand(args) {

    switch (args.command) {

        case ExportToolbar.Commands.exportCode:
            exportProjectToAssembly();
            break;

        case ExportToolbar.Commands.exportImage:
            exportImage();
            break;

    }
}

/** @param {import('./ui/optionsToolbar').OptionsToolbarCommandEventArgs} args */
function handleOptionsToolbarOnCommand(args) {

    switch (args.command) {

        case OptionsToolbar.Commands.changeTheme:
            getUIState().theme = args.theme;
            state.saveToLocalStorage();
            themeManager.setTheme(args.theme);
            break;

        case OptionsToolbar.Commands.changeWelcomeOnStartUp:
            getUIState().welcomeVisibleOnStartup = args.welcomeOnStartUp;
            state.saveToLocalStorage();
            break;

        case OptionsToolbar.Commands.changeDocumentationOnStartUp:
            getUIState().documentationVisibleOnStartup = args.documentationOnStartUp;
            state.saveToLocalStorage();
            break;

    }
}

/** @param {import('./ui/exportModalDialogue').ExportDialogueCommandEventArgs} args */
function handleExportDialogueOnCommand(args) {

    switch (args.command) {

        case ExportModalDialogue.Commands.valueChanged:
            getUIState().exportOptimiseTileMap = args.optimiseTileMap;
            getUIState().exportTileMapPaletteIndex = args.paletteIndex;
            getUIState().exportTileMapVramOffset = args.vramOffset;
            state.saveToLocalStorage();
            exportProjectToAssembly();
            break;

    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorCommandEventArgs} args */
function handlePaletteEditorOnCommand(args) {
    switch (args.command) {
        case PaletteEditor.Commands.paletteSelect:
            if (args.paletteId) {
                changePalette(args.paletteId);
            } else {
                changePaletteIndex(args.paletteIndex);
            }
            break;

        case PaletteEditor.Commands.paletteNew:
            newPalette();
            break;

        case PaletteEditor.Commands.paletteImport:
            paletteImportDialogue.setState({
                paletteData: getUIState().importPaletteAssemblyCode,
                system: getUIState().importPaletteSystem,
                allowedSystems: getProject().systemType === 'gb' ? ['gb'] : getProject().systemType === 'nes' ? ['nes'] : ['ms', 'gg']
            });
            paletteImportDialogue.show();
            break;

        case PaletteEditor.Commands.paletteClone:
            clonePalette(args.paletteIndex);
            break;

        case PaletteEditor.Commands.paletteDelete:
            deletePalette(args.paletteIndex);
            break;

        case PaletteEditor.Commands.paletteTitle:
            changePaletteTitle(args.paletteIndex, args.paletteTitle);
            break;

        case PaletteEditor.Commands.paletteSystem:
            changePaletteSystem(args.paletteIndex, args.paletteSystem);
            break;

        case PaletteEditor.Commands.displayNativeColours:
            changePaletteEditorDisplayNativeColours(args.displayNative);
            break;

        case PaletteEditor.Commands.colourIndexChange:
            changeSelectedColourIndex(args.colourIndex);
            break;

        case PaletteEditor.Commands.colourIndexEdit:
            editSelectedColourIndex(args.paletteIndex, args.colourIndex);
            break;

        case PaletteEditor.Commands.colourIndexSwap:
            swapColourIndex(args.colourIndex, args.targetColourIndex);
            break;

        case PaletteEditor.Commands.colourIndexReplace:
            replaceColourIndex(args.colourIndex, args.targetColourIndex);
            break;

    }
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
            selectTool(args.tool);
            break;
        case TileEditorToolbar.Commands.tileWidth:
            tileWidthSet(args.tileWidth);
            break;
        case TileEditorToolbar.Commands.scale:
            setScale(args.scale);
            break;
        case TileEditorToolbar.Commands.showTileGrid:
            getUIState().showTileGrid = args.showTileGrid;
            state.saveToLocalStorage();
            tileEditor.setState({ showTileGrid: args.showTileGrid });
            break;
        case TileEditorToolbar.Commands.showPixelGrid:
            getUIState().showPixelGrid = args.showPixelGrid;
            state.saveToLocalStorage();
            tileEditor.setState({ showPixelGrid: args.showPixelGrid });
            break;
    }
}


/** @param {import('./ui/toolbars/tileContextToolbar.js').TileContextToolbarCommandEventArgs} args */
function handleTileContextToolbarCommand(args) {
    if (instanceState.tileIndex > -1 && instanceState.tileIndex < getTileSet().length) {

        switch (args.command) {

            case TileContextToolbar.Commands.cut:
                cutTileToClipboardAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.copy:
                copyTileToClipboardAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.paste:
                pasteTileAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.clone:
                cloneTileAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.remove:
                removeTileAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.moveLeft:
                if (instanceState.tileIndex > 0) {
                    swapTilesAt(instanceState.tileIndex - 1, instanceState.tileIndex);
                }
                break;

            case TileContextToolbar.Commands.moveRight:
                if (instanceState.tileIndex < getTile().length - 1) {
                    swapTilesAt(instanceState.tileIndex, instanceState.tileIndex + 1);
                }
                break;

            case TileContextToolbar.Commands.mirrorHorizontal:
                mirrorTileAt('h', instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.mirrorVertical:
                mirrorTileAt('v', instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.insertBefore:
                insertTileAt(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.insertAfter:
                insertTileAt(instanceState.tileIndex + 1);
                break;

        }

    }
    if (args.command === TileContextToolbar.Commands.brushSize) {
        if (args.brushSize && args.brushSize >= 1 && args.brushSize <= 5) {
            setPencilSize(args.brushSize);
        }
    }
    if (args.command === TileContextToolbar.Commands.tileClamp) {
        setTileClamp(args.tileClamp);
    }
    if (args.command === TileContextToolbar.Commands.tileLinkBreak) {
        setTileLinkBreak(args.tileBreakLinks);
    }
    if (args.command === TileContextToolbar.Commands.rowColumnMode || args.command === TileContextToolbar.Commands.rowColumnFillMode) {
        setRowColumnMode(args.rowColumnMode, args.rowColumnFillMode);
    }
    if (args.command === TileContextToolbar.Commands.paletteSlot) {
        setPaletteSlot(args.paletteSlot);
    }
    if (args.command === TileContextToolbar.Commands.tileAttributes) {
        setTileAttributes(args.tileAttributes);
    }
    if (args.command === TileContextToolbar.Commands.tileStampDefine) {
        setTileStampDefineMode();
    }
    if (args.command === TileContextToolbar.Commands.tileStampClear) {
        clearTileStampRegion();
    }
    if (args.command === TileContextToolbar.Commands.referenceImageSelect) {
        selectReferenceImage();
    }
    if (args.command === TileContextToolbar.Commands.referenceImageClear) {
        clearReferenceImage();
    }
    if (args.command === TileContextToolbar.Commands.referenceImageLockAspect) {
        instanceState.referenceImageLockAspect = args.referenceLockAspect;
    }
    if (args.command === TileContextToolbar.Commands.referenceImageDisplay) {
        updateReferenceImage(args.referenceBounds, args.referenceTransparency);
    }
    if (args.command === TileContextToolbar.Commands.referenceImageRevert) {
        const drawDimensions = ImageUtil.calculateAspectRatioDimensions(instanceState.referenceImageOriginal, getTileSet().tileWidth * 8, getTileSet().tileHeight * 8);
        const restoredBounds = new DOMRect(0, 0, drawDimensions.width, drawDimensions.height);
        updateReferenceImage(restoredBounds, args.referenceTransparency);
    }
}


/** @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args */
function handleTileManagerOnCommand(args) {
    switch (args.command) {

        case TileManager.Commands.tileMapNew:
            createNewTileMap();
            break;

        case TileManager.Commands.tileSetToTileMap:
            createNewTileMapFromTileSet();
            break;

        case TileManager.Commands.tileSetSelect:
            selectTileSetOrMap();
            break;

        case TileManager.Commands.tileMapSelect:
            selectTileSetOrMap(args.tileMapId);
            break;

        case TileManager.Commands.tileSelect:
            selectTileSetTile(args.tileId);
            setTileSetTileIfTileMapTileSelected(args.tileId);
            break;

        case TileManager.Commands.tileMapClone:
            cloneTileMap(args.tileMapId);
            break;

        case TileManager.Commands.tileMapDelete:
            deleteTileMap(args.tileMapId);
            break;

        case TileManager.Commands.tileMapChange:
            updateTileMap(args.tileMapId, args);
            break;

        case TileManager.Commands.tileSetChange:
            updateTileSet(args);
            break;

    }
}


/** @param {import("./ui/tileEditor.js").TileEditorCommandEventArgs} args */
function handleTileEditorOnCommand(args) {
    switch (args.command) {

        case TileEditor.Commands.clone:
            cloneTileAt(args.tileIndex);
            break;

        case TileEditor.Commands.insertAfter:
            insertTileAt(args.tileIndex + 1);
            break;

        case TileEditor.Commands.insertBefore:
            insertTileAt(args.tileIndex);
            break;

        case TileEditor.Commands.mirrorHorizontal:
            mirrorTileAt('h', args.tileIndex);
            break;

        case TileEditor.Commands.mirrorVertical:
            mirrorTileAt('v', args.tileIndex);
            break;

        case TileEditor.Commands.moveLeft:
            if (!args || typeof args.tileIndex !== 'number') return;
            if (args.tileIndex > 0 && args.tileIndex < getTileSet().length) {
                swapTilesAt(args.tileIndex - 1, args.tileIndex);
            }
            break;

        case TileEditor.Commands.moveRight:
            if (!args || typeof args.tileIndex !== 'number') return;
            if (args.tileIndex >= 0 && args.tileIndex < getTileSet().length - 1) {
                swapTilesAt(args.tileIndex, args.tileIndex + 1);
            }
            break;

        case TileEditor.Commands.remove:
            removeTileAt(args.tileIndex);
            break;

        case TileEditor.Commands.selectTile:
            toggleTileIndexSelectedState(args.tileIndex);
            break;

        case TileEditor.Commands.zoomIn:
            increaseScale();
            tileEditor.setState({ focusedTile: args.tileIndex });
            break;

        case TileEditor.Commands.zoomOut:
            decreaseScale();
            tileEditor.setState({ focusedTile: args.tileIndex });
            break;
    }
}

/** @param {import("./ui/tileEditor.js").TileEditorEventArgs} args */
function handleTileEditorOnEvent(args) {
    if (instanceState.tool === TileEditorToolbar.Tools.referenceImage) {
        takeReferenceImageAction(args);
    } else {
        switch (args.event) {

            case TileEditor.Events.pixelMouseDown:
                instanceState.operationTileIndex = getTileGrid().getTileIndexByCoordinate(args.x, args.y);
                if (args.isPrimaryButton) {
                    takeToolAction({
                        tool: instanceState.tool,
                        colourIndex: instanceState.colourIndex,
                        imageX: args.x,
                        imageY: args.y,
                        tile: { row: args.tileGridRowIndex, col: args.tileGridColumnIndex },
                        tileIndex: { row: args.tileGridInsertRowIndex, col: args.tileGridInsertColumnIndex },
                        tileBlock: { row: args.tileBlockGridRowIndex, col: args.tileBlockGridColumnIndex },
                        tileBlockIndex: { row: args.tileBlockGridInsertRowIndex, col: args.tileBlockGridInsertColumnIndex },
                        tilesPerBlock: args.tilesPerBlock,
                        isInBounds: args.isInBounds,
                        event: TileEditor.Events.pixelMouseDown
                    });
                }
                break;

            case TileEditor.Events.pixelMouseOver:
                if (args.mousePrimaryIsDown) {
                    takeToolAction({
                        tool: instanceState.tool,
                        colourIndex: instanceState.colourIndex,
                        imageX: args.x,
                        imageY: args.y,
                        tile: { row: args.tileGridRowIndex, col: args.tileGridColumnIndex },
                        tileIndex: { row: args.tileGridInsertRowIndex, col: args.tileGridInsertColumnIndex },
                        tileBlock: { row: args.tileBlockGridRowIndex, col: args.tileBlockGridColumnIndex },
                        tileBlockIndex: { row: args.tileBlockGridInsertRowIndex, col: args.tileBlockGridInsertColumnIndex },
                        tilesPerBlock: args.tilesPerBlock,
                        isInBounds: args.isInBounds,
                        event: TileEditor.Events.pixelMouseOver
                    });
                }

                // Show the palette colour
                if (args.isInBounds) {
                    const colourIndex = EyedropperTool.getPixelColour(getTileGrid(), getTileSet(), args.x, args.y);
                    if (colourIndex !== null) {
                        paletteEditor.setState({
                            highlightedColourIndex: colourIndex
                        });
                    }
                } else {
                    paletteEditor.setState({
                        highlightedColourIndex: null
                    });
                }
                break;

            case TileEditor.Events.pixelMouseUp:
                takeToolAction({
                    tool: instanceState.tool,
                    colourIndex: instanceState.colourIndex,
                    imageX: args.x,
                    imageY: args.y,
                    tile: { row: args.tileGridRowIndex, col: args.tileGridColumnIndex },
                    tileIndex: { row: args.tileGridInsertRowIndex, col: args.tileGridInsertColumnIndex },
                    tileBlock: { row: args.tileBlockGridRowIndex, col: args.tileBlockGridColumnIndex },
                    tileBlockIndex: { row: args.tileBlockGridInsertRowIndex, col: args.tileBlockGridInsertColumnIndex },
                    tilesPerBlock: args.tilesPerBlock,
                    isInBounds: args.isInBounds,
                    event: TileEditor.Events.pixelMouseUp
                });
                instanceState.operationTileIndex = -1;
                if (instanceState.undoDisabled) {
                    state.saveToLocalStorage();
                    instanceState.undoDisabled = false;
                }
                break;

        }
    }
}


/** @param {import('./ui/dialogues/newProjectDialogue.js').NewProjectDialogueConfirmEventArgs} args */
function handleNewProjectDialogueOnConfirm(args) {
    newProject({
        title: args.title,
        systemType: args.systemType ?? 'smsgg',
        createTileMap: args.createTileMap,
        tileWidth: args.tileWidth,
        tileHeight: args.tileHeight
    });
    newProjectDialogue.hide();
}


/** @param {import('./ui/dialogues/newTileMapDialogue.js').NewTileMapDialogueConfirmEventArgs} args */
function handleNewTileMapDialogueOnConfirm(args) {
    try {
        addUndoState();

        /** @type {TileMap} */
        let newTileMap;

        if (args.createMode === NewTileMapDialogue.CreateModes.new) {
            // Creating a new tile map

            const baseArgs = {
                title: args.title ?? 'New tile map',
                columnCount: args.tileMapWidth,
                rowCount: args.tileMapHeight,
                defaultPaletteId: getPalette().paletteId,
                tileSet: getTileSet()
            };

            if (args.createOption === NewTileMapDialogue.TileOptions.createNew) {
                newTileMap = TileMapTool.createTileMapWithNewTiles({
                    ...baseArgs,
                    defaultColourIndex: instanceState.colourIndex
                });
            } else if (args.createOption === NewTileMapDialogue.TileOptions.repeatNew) {
                newTileMap = TileMapTool.createTileMapWithOneNewTile({
                    ...baseArgs,
                    defaultColourIndex: instanceState.colourIndex
                });
            } else if (args.createOption === NewTileMapDialogue.TileOptions.useSelected) {
                newTileMap = TileMapTool.createTileMapWithTileId({
                    ...baseArgs,
                    tileId: getProjectUIState().tileId
                });
            } else if (args.createOption === NewTileMapDialogue.TileOptions.useTileSet) {
                newTileMap = TileMapTool.createTileMapWithTileSet({
                    ...baseArgs,
                    startTileIndex: 0
                });
            } else {
                throw new Error('Unknown creation option argument.');
            }

        } else if (args.createMode === NewTileMapDialogue.CreateModes.clone) {
            // Cloning existing tile map

            if (!args.cloneTileMapId) throw new Error('The tile map ID was invalid.');
            const tileMapToClone = getTileMapList().getTileMapById(args.cloneTileMapId);
            if (!tileMapToClone) throw new Error('No tile map matched the given ID.');

            newTileMap = TileMapTool.cloneTileMap({
                title: args.title ?? 'New tile map',
                tileMapToClone: tileMapToClone,
                cloneTiles: args.cloneTiles,
                tileSet: getTileSet()
            });

        } else {
            throw new Error('Unknown creation mode.');
        }

        getTileMapList().addTileMap(newTileMap);

        state.setProject(getProject());
        state.saveToLocalStorage();

        selectTileSetOrMap(newTileMap.tileMapId);

        newTileMapDialogue.hide();

    } catch (e) {
        undoManager.removeLastUndo();
        console.error(e);
    }
}


/** @param {import('./ui/dialogues/paletteImportModalDialogue.js').PaletteImportModalDialogueConfirmEventArgs} args */
function handleImportPaletteModalDialogueOnConfirm(args) {
    if (!['gg', 'ms', 'gb', 'nes'].includes(args.system)) throw new Error('System must be either "ms", "gg", "gb" or "nes".');

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
    } else if (system === 'gb') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromGameBoyPalette(array);
        getPaletteList().addPalette(palette);
    } else if (system === 'nes') {
        const array = AssemblyUtil.readAsUint8ClampedArray(paletteData);
        const palette = PaletteFactory.createFromNesPalette(array);
        getPaletteList().addPalette(palette);
    }

    getProjectUIState().paletteIndex = getPaletteList().length - 1;
    getUIState().importPaletteSystem = args.system;
    getUIState().importPaletteAssemblyCode = args.paletteData;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getProjectUIState().paletteIndex
    });
    tileEditor.setState({
        paletteList: getTileEditorPaletteList()
    });

    paletteImportDialogue.hide();
}

/**
 * User is playing with the colour picker, provide a live preview.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerChange(args) {

    const palette = getPaletteList().getPalette(getProjectUIState().paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {

        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteEditor.setState({
            paletteList: getPaletteList()
        });
        tileEditor.setState({
            palette: getPalette(),
            paletteList: getTileEditorPaletteList()
        });

    }

}

/**
 * User has confirmed their colour choice, finalise the colour selection and save.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerConfirm(args) {
    changeColourIndex(getProjectUIState().paletteIndex, args.index, { r: args.r, g: args.g, b: args.b })
    colourPickerDialogue.hide();
}

/**
 * User has cancelled the colour picker, restore the original colour.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {

    const palette = getPaletteList().getPalette(getProjectUIState().paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {

        const restoreColour = PaletteColourFactory.create(args.originalR, args.originalG, args.originalB);
        palette.setColour(args.index, restoreColour);

        paletteEditor.setState({
            paletteList: getPaletteList()
        });
        tileEditor.setState({
            palette: palette,
            paletteList: getTileEditorPaletteList()
        });

    }
    colourPickerDialogue.hide();
}


/**
 * @param {import('./ui/colourPickerToolbox.js').ColourPickerToolboxCommandEventArgs} args
 */
function handleColourPickerToolboxOnCommand(args) {
    switch (args.command) {

        case ColourPickerToolbox.Commands.tabChanged:
            colourPickerToolbox.setState({
                showTab: args.tab
            });
            break;

        case ColourPickerToolbox.Commands.colourChanged:
            changeColourIndex(getProjectUIState().paletteIndex, instanceState.colourIndex, { r: args.r, g: args.g, b: args.b })
            break;

    }
}


/**
 * @param {number} paletteIndex
 * @param {number} colourIndex
 * @param {{r: number, g: number, b: number}} colour
 */
function changeColourIndex(paletteIndex, colourIndex, colour) {
    addUndoState();

    const palette = getPaletteList().getPalette(paletteIndex);

    const newColour = PaletteColourFactory.create(colour.r, colour.g, colour.b);
    palette.setColour(colourIndex, newColour);

    state.saveProjectToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList()
    });
    tileEditor.setState({
        palette: getPalette(),
        paletteList: getTileEditorPaletteList()
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
    const tileSetBinarySerialiser = SerialisationUtil.getTileSetBinarySerialiser(getProject().systemType);
    const importedTileSet = tileSetBinarySerialiser.deserialise(tileSetDataArray);

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

    setCommonTileToolbarStates({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
    if (getProject() instanceof Project) {
        welcomeScreen.setState({ visible: false });
    }

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
        const project = ProjectFactory.create({ title: args.title, tileSet: args.tileSet, paletteList: paletteList, systemType: args.systemType });
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

    getProjectUIState().paletteIndex = getPaletteList().length - 1;

    state.setProject(getProject());
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getPaletteList().length - 1
    });
    setCommonTileToolbarStates({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        paletteList: getTileEditorPaletteList(),
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
    projectToolbar.setState({
        projectTitle: getProject().title
    });
    projectDropdown.setState({
        projectTitle: getProject().title
    });
    welcomeScreen.setState({
        visible: false
    });

    importImageModalDialogue.hide();
}


/** @param {import("./ui/documentationViewer").DocumentationViewerCommandEventArgs} args */
function documentationViewerOnCommand(args) {
    const closeDocumentation = () => {
        documentationViewer.setState({ visible: false });
        getUIState().documentationVisibleOnStartup = false;
        state.saveToLocalStorage();
    }
    switch (args.command) {

        case DocumentationViewer.Commands.popOut:
            window.open(args.currentDocumentationUrl);
            closeDocumentation();
            break;

        case DocumentationViewer.Commands.close:
            closeDocumentation();
            break;

    }
}


/** @param {import("./ui/dialogues/welcomeScreen").WelcomeScreenStateCommandEventArgs} args */
function welcomeScreenOnCommand(args) {
    switch (args.command) {

        case WelcomeScreen.Commands.dismiss:
            welcomeScreen.setState({ visible: false });
            break;

        case WelcomeScreen.Commands.changeShowOnStartUp:
            getUIState().welcomeVisibleOnStartup = args.showOnStartUp;
            state.saveToLocalStorage();
            break;

        case WelcomeScreen.Commands.projectNew:
            welcomeScreen.setState({ visible: false });
            newProjectDialogue.setState({
                title: 'New project',
                systemType: args?.systemType ?? NewProjectDialogue.Systems.smsgg,
                selectedtilePreset: NewProjectDialogue.TilePresets["8x8"],
                createTileMap: true
            });
            newProjectDialogue.show();
            break;

        case WelcomeScreen.Commands.projectLoadById:
            const projects = state.getProjectsFromLocalStorage();
            const project = projects.getProjectById(args.projectId);
            state.setProject(project);
            welcomeScreen.setState({ visible: false });
            break;

        case WelcomeScreen.Commands.projectLoadFromFile:
            importProjectFromJson();
            break;

        case WelcomeScreen.Commands.tileImageImport:
            tileImportImage();
            break;

        case WelcomeScreen.Commands.showDocumentation:
            documentationViewer.setState({ visible: true });
            break;

    }
}


/**
 * Creates a default tile set and palettes when the data store doesn't contain any.
 */
function createDefaultProjectIfNoneExists() {
    const projects = state.getProjectsFromLocalStorage();
    if (projects.length === 0) {
        const newProject = createEmptyProject();
        state.setProject(newProject);
        state.saveProjectToLocalStorage();
    }
}

/**
 * Creates a default project file.
 * @argument {{title: string?, systemType: string?, createTileMap: boolean?, tileWidth: number?, tileHeight: number?}} args
 * @returns {Project}
 */
function createEmptyProject(args) {

    const title = args?.title ?? 'New project';
    const systemType = args?.systemType ?? 'smsgg';
    const defaultTileColourIndex = systemType === 'smsgg' ? 15 : 3;
    const project = ProjectFactory.create({ title: title, systemType: systemType });

    // Create a default tile set
    project.tileSet = TileSetFactory.create();
    project.tileSet.tileWidth = 8;
    const numTiles = args.createTileMap ? args.tileWidth * args.tileHeight : 64;
    for (let i = 0; i < numTiles; i++) {
        project.tileSet.addTile(TileFactory.create({ defaultColourIndex: defaultTileColourIndex }));
    }

    // Create a default palette 
    project.paletteList = PaletteListFactory.create();
    if (project.systemType === 'smsgg') {
        // For Game Gear and Master System
        project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Master System', 'ms'));
        project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Game Gear', 'gg'));
    } else if (project.systemType === 'gb') {
        // For Game Boy
        project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default Game Boy', 'gb'));
    } else if (project.systemType === 'nes') {
        // For Nintendo Entertainment System
        project.paletteList.addPalette(PaletteFactory.createNewStandardColourPalette('Default NES', 'nes'));
    }

    // Create the default tile map
    if (args.createTileMap) {
        const tileSet = project.tileSet;
        const newTileMap = TileMapFactory.create({
            title: 'Tile map',
            columns: args.tileWidth,
            rows: args.tileHeight,
            tiles: tileSet.getTiles().map((tile) => {
                return TileMapTileFactory.create({
                    tileId: tile.tileId,
                    palette: 0
                })
            })
        });
        const defaultPaletteId = project.paletteList.getPalettes()[0].paletteId;
        for (let i = 0; i < 16; i++) {
            newTileMap.setPalette(i, defaultPaletteId);
        }
        project.tileMapList.addTileMap(newTileMap);
    }

    return project;
}

function checkPersistentUIValues() {
    let dirty = false;
    if (state.project && (getProjectUIState().paletteIndex < 0 || getProjectUIState().paletteIndex >= state.project.paletteList.length)) {
        getProjectUIState().paletteIndex = 0;
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
 * Helpers and general methods
 */

function getProject() {
    return state.project;
}
/**
 * @returns {TileGridProvider}
 */
function getTileGrid() {
    if (getTileMap()) {
        return getTileMap();
    } else {
        return getTileSet();
    }
}
function getTileMapList() {
    return getProject().tileMapList;
}
/** @returns {TileMap?} */
function getTileMap() {
    if (!state.project) return null;
    const tileMapId = getProjectUIState().tileMapId;
    if (tileMapId) {
        return getTileMapList().getTileMapById(tileMapId) ?? null;
    } else {
        return null;
    }
}
function getTileSet() {
    return getProject().tileSet;
}
function getTile() {
    if (instanceState.tileIndex > -1 && instanceState.tileIndex < getTileSet().length) {
        return getTileSet().getTile(instanceState.tileIndex);
    } else {
        return null;
    }
}
/**
 * Returns the entire project palette list
 * @returns {PaletteList}
 */
function getPaletteList() {
    return getProject()?.paletteList ?? null;
}
/**
 * Gets the palette list for the tile editor based on whether the selected tile grid is a tile set or tile map.
 * @returns {PaletteList}
 */
function getTileEditorPaletteList() {
    if (isTileMap()) {
        const palettes = getTileMap().getPalettes().map((paletteId) => getPaletteList().getPaletteById(paletteId));
        return PaletteListFactory.create(palettes);
    } else {
        const palette = getPaletteList().getPalette(getProjectUIState().paletteIndex);
        return PaletteListFactory.create([palette]);
    }
}
function getPalette() {
    if (getPaletteList().length > 0) {
        const paletteIndex = getProjectUIState().paletteIndex;
        if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {
            return getPaletteList().getPalette(paletteIndex);
        } else {
            getProjectUIState().paletteIndex = 0;
            return getPaletteList().getPalette(0);
        }
    } else return null;
}
function getUIState() {
    return state.persistentUIState;
}
function getProjectUIState() {
    if (getProject()) {
        const projectId = getProject().id;
        if (!getUIState().projectStates[projectId]) {
            getUIState().projectStates[projectId] = {
                projectId: projectId,
                paletteIndex: 0,
                tileId: null,
                tileMapId: null
            };
        }
        return getUIState().projectStates[projectId];
    }
    return null;
}

function getToolState() {
    if (!instanceState.tool) return {};
    if (!instanceState.toolData[instanceState.tool]) instanceState.toolData[instanceState.tool] = {};
    return instanceState.toolData[instanceState.tool];
}

function getDefaultPaletteSystemType() {
    switch (getProject().systemType) {
        case 'smsgg': return 'sms';
        case 'nes': return 'nes';
        case 'gb': return 'gg';
        default: throw new Error('Unknown system type.');
    }
}

function getNumberOfPaletteSlots() {
    switch (getProject().systemType) {
        case 'smsgg': return 2;
        case 'nes': return 4;
        case 'gb': return 1;
        default: return 0;
    }
}

function getTilesPerBlock() {
    switch (getProject().systemType) {
        case 'smsgg': return 1;
        case 'nes': return 2;
        case 'gb': return 1;
        default: return 1;
    }
}

function isTileSet() {
    return getTileMap() === null;
}
function isTileMap() {
    return getTileMap() !== null;
}

function refreshProjectUI() {
    let dirty = false;

    const maps = getTileMapList();
    if (!maps.containsTileMapById(getProjectUIState().tileMapId)) { getProjectUIState().tileMapId = null; dirty = true; }

    const tileSet = getTileSet();
    if (!tileSet.containsTileById(getProjectUIState().tileId)) { getProjectUIState().tileId = null; dirty = true; }

    if (instanceState.paletteSlot < 0) { instanceState.paletteSlot = 0; dirty = true; }
    if (instanceState.paletteSlot >= getNumberOfPaletteSlots()) { instanceState.paletteSlot = getNumberOfPaletteSlots() - 1; dirty = true; }

    const palette = getPalette();
    if (instanceState.colourIndex < 0) { instanceState.colourIndex = 0; dirty = true; }
    if (instanceState.colourIndex >= palette.getColours().length) { instanceState.colourIndex = palette.getColours().length - 1; dirty = true; }

    if (instanceState.tileIndex < -1) { instanceState.tileIndex = -1; dirty = true; }
    if (instanceState.tileIndex >= getTileGrid().tileCount) { instanceState.tileIndex = -1; dirty = true; }

    projectToolbar.setState({
        projectTitle: getProject().title
    });

    projectDropdown.setState({
        projectTitle: getProject().title
    });

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteId: getPalette().paletteId,
        selectedPaletteIndex: getProjectUIState().paletteIndex,
        selectedColourIndex: instanceState.colourIndex
    });

    tileEditor.setState({
        forceRefresh: true,
        paletteList: getTileEditorPaletteList(),
        tileSet: getTileSet(),
        tileGrid: getTileGrid(),
        selectedTileIndex: instanceState.tileIndex
    });

    tileManager.setState({
        paletteList: getPaletteList(),
        tileMapList: getTileMapList(),
        selectedTileMapId: getProjectUIState().tileMapId,
        tileSet: getTileSet(),
        selectedTileId: getProjectUIState().tileId
    });

    const toolStrips = TileEditorToolbar.ToolStrips;
    if (isTileSet()) {
        tileEditorToolbar.setState({
            visibleToolstrips: [toolStrips.tileAdd, toolStrips.undo, toolStrips.tileSetTools],
            systemType: getProject().systemType
        });
    } else if (isTileMap()) {
        tileEditorToolbar.setState({
            visibleToolstrips: [toolStrips.undo, toolStrips.tileMapTools],
            systemType: getProject().systemType
        });
    }
    tileEditorBottomToolbar.setState({
        visibleToolstrips: [toolStrips.scale, toolStrips.showTileGrid, toolStrips.showPixelGrid],
        systemType: getProject().systemType
    });
    tileContextToolbar.setState({
        visibleToolstrips: getTileMapContextToolbarVisibleToolstrips(instanceState.tool)
    });

    const disabledCommands = [];
    if (isTileMap() && instanceState.tool === TileEditorToolbar.Tools.bucket) {
        instanceState.clampToTile = true;
        disabledCommands.push(TileContextToolbar.Commands.tileClamp);
    }
    if (isTileMap() && getProject().systemType === 'gb') {
        disabledCommands.push(TileContextToolbar.Commands.tileAttributes);
    }
    tileContextToolbar.setState({
        disabledCommands: disabledCommands,
        clampToTile: instanceState.clampToTile,
        tileBreakLinks: instanceState.tileBreakLinks,
        systemType: getProject().systemType
    });

    resizeToolboxes();

}

function formatForProject() {

    const project = getProject();
    const projectChanged = project.id !== instanceState.lastProjectId;

    if (projectChanged) {
        instanceState.colourIndex = 0;
        if (instanceState.paletteSlot < 0) instanceState.paletteSlot = 0;
        if (instanceState.paletteSlot >= getNumberOfPaletteSlots()) instanceState.paletteSlot = getNumberOfPaletteSlots() - 1;
    }

    const palette = getPalette();
    const tileSet = getTileSet();
    const colour = palette.getColour(instanceState.colourIndex);
    const visibleTabs = [];
    switch (getPalette().system) {
        case 'ms': case 'gg': visibleTabs.push('rgb', 'sms'); break;
        case 'nes': visibleTabs.push('nes'); break;
        case 'gb': visibleTabs.push('gb'); break;
    }

    projectToolbar.setState({
        projectTitle: getProject().title,
        enabled: true
    });
    projectDropdown.setState({
        projectTitle: getProject().title,
        enabled: true
    });
    exportToolbar.setState({
        enabled: true
    });
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: getProjectUIState().paletteIndex,
        lastPaletteInputSystem: getUIState().importPaletteSystem,
        selectedColourIndex: instanceState.colourIndex,
        displayNative: getUIState().displayNativeColour,
        enabled: true
    });
    let colourPickerTab = instanceState.colourToolboxTab;
    if (getPalette().system === 'gb') colourPickerTab = 'gb';
    if (getPalette().system === 'nes') colourPickerTab = 'nes';
    colourPickerToolbox.setState({
        showTab: colourPickerTab,
        r: colour.r,
        g: colour.g,
        b: colour.b,
        enabled: true,
        visibleTabs: visibleTabs
    });
    setCommonTileToolbarStates({
        tileWidth: tileSet.tileWidth,
        selectedTool: instanceState.tool,
        scale: getUIState().scale,
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo,
        showTileGridChecked: getUIState().showTileGrid,
        showPixelGridChecked: getUIState().showPixelGrid,
        enabled: true
    });
    tileEditor.setState({
        palette: palette,
        paletteList: getTileEditorPaletteList(),
        tileGrid: getTileGrid(),
        tileSet: tileSet,
        scale: getUIState().scale,
        tilesPerBlock: getTilesPerBlock(),
        displayNative: getUIState().displayNativeColour,
        cursorSize: instanceState.pencilSize,
        showTileGrid: getUIState().showTileGrid,
        showPixelGrid: getUIState().showPixelGrid,
        enabled: true
    });
    tileContextToolbar.setState({
        enabled: true,
        paletteSlotCount: getNumberOfPaletteSlots(),
        paletteSlot: instanceState.paletteSlot
    });
    tileManager.setState({
        tileMapList: getTileMapList(),
        tileSet: tileSet,
        palette: palette,
        paletteList: getPaletteList(),
        numberOfPaletteSlots: getNumberOfPaletteSlots()
    });

    refreshProjectUI();

    instanceState.lastProjectId = getProject().id;
}

function formatForNoProject() {
    const dummyProject = createEmptyProject({ systemType: 'smsgg' });
    projectToolbar.setState({
        enabled: false,
        projectTitle: '',
        enabledCommands: [
            ProjectToolbar.Commands.showDropdown,
            ProjectToolbar.Commands.projectNew,
            ProjectToolbar.Commands.projectLoadFromFile,
            ProjectToolbar.Commands.projectLoadById,
            ProjectToolbar.Commands.projectDelete
        ]
    });
    projectDropdown.setState({
        enabled: false,
        projectTitle: '',
        enabledCommands: [
            ProjectDropdown.Commands.projectNew,
            ProjectDropdown.Commands.projectLoadFromFile,
            ProjectDropdown.Commands.projectLoadById,
            ProjectDropdown.Commands.projectDelete,
            ProjectDropdown.Commands.showWelcomeScreen
        ]
    });
    exportToolbar.setState({
        enabled: false
    });
    paletteEditor.setState({
        paletteList: dummyProject.paletteList,
        selectedPaletteIndex: 0,
        selectedColourIndex: 0,
        enabled: false
    });
    tileContextToolbar.setState({
        enabled: false
    });
    tileEditorToolbar.setState({
        enabled: false
    });
    tileEditorBottomToolbar.setState({
        enabled: false
    });
    colourPickerToolbox.setState({
        enabled: false
    });
    tileEditor.setState({
        tileGrid: null,
        tileSet: null,
        palette: null,
        paletteList: null,
        enabled: false
    });
}

/**
 * Gets what toolstrips should be visible on the tile context toolbar.
 * @param {string} tool - Currently selected tool.
 * @returns {string[]}
 */
function getTileMapContextToolbarVisibleToolstrips(tool) {
    let visibleStrips = [];
    if (tool && typeof tool === 'string') {
        const tools = TileEditorToolbar.Tools;
        switch (tool) {
            case tools.pencil:
            case tools.eyedropper:
            case tools.bucket:
            case tools.colourReplace:
                visibleStrips.push(TileContextToolbar.Toolstrips.pencil);
                if (isTileMap()) {
                    visibleStrips.push(TileContextToolbar.Toolstrips.tileMapPencil);
                }
                break;
            case tools.select:
                visibleStrips.push(TileContextToolbar.Toolstrips.select);
                break;
            case tools.referenceImage:
                visibleStrips.push(TileContextToolbar.Toolstrips.referenceImage);
                break;
            case tools.tileAttributes:
                visibleStrips.push(TileContextToolbar.Toolstrips.tileAttributes);
                break;
            case tools.rowColumn:
                visibleStrips.push(TileContextToolbar.Toolstrips.rowColumn);
                break;
            case tools.tileLinkBreak:
                visibleStrips.push(TileContextToolbar.Toolstrips.tileLinkBreak);
                break;
            case tools.palettePaint:
                visibleStrips.push(TileContextToolbar.Toolstrips.palettePaint);
                break;
            case tools.tileStamp:
                visibleStrips.push(TileContextToolbar.Toolstrips.tileStamp);
                break;
            case tools.tileEyedropper:
                visibleStrips.push(TileContextToolbar.Toolstrips.tileEyedropper);
                break;
        }
    }
    return visibleStrips;
}

function displaySelectedProject() {
    if (getProject()) {
        getUIState().lastProjectId = getProject().id;
        state.saveUIStateToLocalStorage();
        formatForProject();
    } else {
        formatForNoProject();
        // Select default project if one was there
        const projects = state.getProjectsFromLocalStorage();
        const project = (() => {
            const lastProject = projects.getProjectById(getUIState().lastProjectId);
            if (lastProject) return lastProject;
            if (projects.length > 0) return projects.getProject(0);
            return null;
        })();
        if (project) state.setProject(project);
    }
}

function displayProjectList() {
    const projects = state.getProjectsFromLocalStorage();
    projectToolbar.setState({
        projects: projects
    });
    projectDropdown.setState({
        projects: projects
    });
}

/** 
 * @typedef {object} ToolActionArgs
 * @property {string} tool 
 * @property {number} colourIndex 
 * @property {number} imageX 
 * @property {number} imageY 
 * @property {{ row: number, col: number }} tile 
 * @property {{ row: number, col: number }} tileIndex 
 * @property {{ row: number, col: number }} tileBlock 
 * @property {{ row: number, col: number }} tileBlockIndex 
 * @property {number} tilesPerBlock 
 * @property {boolean} isInBounds 
 * @property {string} event 
 */

/**
 * Performs the action for a tool.
 * @param {ToolActionArgs} args 
 */
function takeToolAction(args) {

    const tool = args.tool; const colourIndex = args.colourIndex;
    const event = args.event;
    const imageX = args.imageX; const imageY = args.imageY;

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === TileEditorToolbar.Tools.select) {
            if (event === TileEditor.Events.pixelMouseOver) {

                const tileIndex = getTileGrid().getTileIndexByCoordinate(imageX, imageY);
                toggleTileIndexSelectedState(tileIndex);

                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;

            }
        } else if (tool === TileEditorToolbar.Tools.pencil && args.isInBounds) {
            if (event === TileEditor.Events.pixelMouseDown || event === TileEditor.Events.pixelMouseOver) {

                // CTRL not down, so draw pixel
                const lastPx = instanceState.lastTileMapPx;
                if (imageX !== lastPx.x || imageY !== lastPx.y) {

                    const tileIndex = getTileGrid().getTileIndexByCoordinate(imageX, imageY);
                    const clamp = instanceState.clampToTile;
                    if (!clamp || (clamp && tileIndex === instanceState.operationTileIndex)) {

                        addUndoState();
                        if (!instanceState.undoDisabled) {
                            instanceState.undoDisabled = true;
                        }

                        instanceState.lastTileMapPx.x = imageX;
                        instanceState.lastTileMapPx.y = imageY;

                        const breakLinks = isTileMap() && instanceState.breakTileLinks;
                        const size = instanceState.pencilSize;
                        const originalTileSet = breakLinks ? TileSetFactory.clone(getTileSet()) : null;

                        const updatedTiles = PaintTool.paintColourOnTileGrid(getTileGrid(), getTileSet(), imageX, imageY, colourIndex, size, clamp);
                        if (updatedTiles.affectedTileIndexes.length > 0) {

                            let linkUpdated = false;
                            if (breakLinks) {
                                updatedTiles.affectedTileIndexes.forEach((tileIndex) => {
                                    const originalTileId = getTileGrid().getTileInfoByIndex(tileIndex).tileId;
                                    const breakResult = TileLinkBreakTool.createAndLinkNewTileIfUsedElsewhere(tileIndex, getTileMap(), getTileSet(), getProject());
                                    if (breakResult.changesMade) {
                                        const originalTile = originalTileSet.getTileById(originalTileId);
                                        const originalTileData = originalTile.readAll();
                                        getTileSet().getTileById(originalTileId).setData(originalTileData);
                                        linkUpdated = true;
                                    }
                                });
                            }

                            if (linkUpdated) {
                                tileEditor.setState({
                                    tileGrid: getTileGrid(),
                                    tileSet: getTileSet()
                                });
                                tileManager.setState({
                                    tileSet: getTileSet()
                                });
                            } else {
                                tileEditor.setState({
                                    updatedTileIds: updatedTiles.affectedTileIds
                                });
                                tileManager.setState({
                                    updatedTileIds: updatedTiles.affectedTileIds
                                });
                            }

                        }

                    }
                }

            }
        } else if (tool === TileEditorToolbar.Tools.colourReplace && args.isInBounds) {
            if (event === TileEditor.Events.pixelMouseDown || event === TileEditor.Events.pixelMouseOver) {

                const lastPx = instanceState.lastTileMapPx;
                if (imageX !== lastPx.x || imageY !== lastPx.y) {

                    const tileIndex = getTileGrid().getTileIndexByCoordinate(imageX, imageY);
                    const clamp = instanceState.clampToTile;
                    if (!clamp || (clamp && tileIndex === instanceState.operationTileIndex)) {

                        addUndoState();
                        if (!instanceState.undoDisabled) {
                            instanceState.undoDisabled = true;
                        }

                        if (event === TileEditor.Events.pixelMouseDown) {
                            instanceState.startingColourIndex = getTileSet().getPixelAt(imageX, imageY);
                        }

                        instanceState.lastTileMapPx.x = imageX;
                        instanceState.lastTileMapPx.y = imageY;

                        const sourceColourindex = instanceState.startingColourIndex;
                        const replacementColourIndex = colourIndex;
                        const size = instanceState.pencilSize;
                        const updatedTiles = PaintTool.replaceColourOnTileGrid(getTileGrid(), getTileSet(), imageX, imageY, sourceColourindex, replacementColourIndex, size, clamp);

                        if (updatedTiles.affectedTileIndexes.length > 0) {
                            tileEditor.setState({
                                updatedTileIds: updatedTiles.affectedTileIds
                            });
                            tileManager.setState({
                                tileSet: getTileSet(),
                                updatedTileIds: updatedTiles.affectedTileIds
                            });
                        }

                    }
                }

            }
        } else if (tool === TileEditorToolbar.Tools.bucket && args.isInBounds) {
            if (event === TileEditor.Events.pixelMouseDown) {

                addUndoState();
                PaintTool.fillColourOnTileGrid(getTileGrid(), getTileSet(), imageX, imageY, colourIndex, instanceState.clampToTile);

                tileEditor.setState({
                    tileGrid: getTileGrid(),
                    tileSet: getTileSet()
                });
                tileManager.setState({
                    tileSet: getTileSet()
                });

                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;

            }
        } else if (tool === TileEditorToolbar.Tools.eyedropper) {
            if (event === TileEditor.Events.pixelMouseDown) {

                const colourIndex = EyedropperTool.getPixelColour(getTileGrid(), getTileSet(), imageX, imageY);
                if (colourIndex !== null) {
                    selectColourIndex(colourIndex);
                }

                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;

            }
        } else if (tool === TileEditorToolbar.Tools.tileEyedropper) {
            if (event === TileEditor.Events.pixelMouseDown) {

                if (args.tile.row > 0 && args.tile.row < getTileGrid().rowCount && args.tile.col > 0 && args.tile.col < getTileGrid().columnCount) {
                    const tileInfo = getTileGrid().getTileInfoByRowAndColumn(args.tile.row, args.tile.col);
                    if (tileInfo) {
                        selectTileSetTile(tileInfo.tileId);
                    }
                }

            }
        }

        if (isTileMap()) {
            let actionTaken = false;
            /** @type {string[]} */
            let updatedTileIds = [];

            if (tool === TileEditorToolbar.Tools.tileAttributes && args.isInBounds) {
                if (event === TileEditor.Events.pixelMouseDown) {

                    const tileIndex = getTileGrid().getTileIndexByCoordinate(imageX, imageY);
                    toggleTileIndexSelectedState(tileIndex);

                    instanceState.lastTileMapPx.x = -1;
                    instanceState.lastTileMapPx.y = -1;

                }
            } else if (tool === TileEditorToolbar.Tools.rowColumn) {
                if (event === TileEditor.Events.pixelMouseDown) {

                    addUndoState();
                    try {
                        let index = -1;
                        switch (instanceState.rowColumnMode) {
                            case TileMapRowColumnTool.Mode.addRow: index = args.tileBlockIndex.row; break;
                            case TileMapRowColumnTool.Mode.deleteRow: index = args.tileBlock.row; break;
                            case TileMapRowColumnTool.Mode.addColumn: index = args.tileBlockIndex.col; break;
                            case TileMapRowColumnTool.Mode.deleteColumn: index = args.tileBlock.col; break;
                        }
                        TileMapRowColumnTool.takeAction({
                            tileMap: getTileMap(),
                            tileSet: getTileSet(),
                            mode: instanceState.rowColumnMode,
                            fillMode: instanceState.rowColumnFillMode,
                            index: index,
                            tilesPerBlock: args.tilesPerBlock,
                            tileId: getProjectUIState().tileId,
                            colourIndex: instanceState.colourIndex
                        });
                        actionTaken = true;
                    } catch (e) {
                        undoManager.removeLastUndo();
                        throw e;
                    }

                }
            } else if (tool === TileEditorToolbar.Tools.tileStamp) {

                const stampUpdatedTileIds = takeToolAction_tileStamp(args);
                if (Array.isArray(stampUpdatedTileIds)) {
                    updatedTileIds = updatedTileIds.concat(stampUpdatedTileIds);
                }

            } else if (tool === TileEditorToolbar.Tools.palettePaint && args.isInBounds) {
                if (event === TileEditor.Events.pixelMouseDown || event === TileEditor.Events.pixelMouseOver) {

                    addUndoState();
                    try {
                        const result = PalettePaintTool.setTileBlockPaletteIndex({
                            paletteIndex: instanceState.paletteSlot,
                            tileMap: getTileMap(),
                            tileSet: getTileSet(),
                            row: args.tileBlock.row,
                            column: args.tileBlock.col,
                            tilesPerBlock: args.tilesPerBlock
                        });
                        if (result.updatedTileIds.length > 0) {
                            updatedTileIds = result.updatedTileIds;
                        } else {
                            undoManager.removeLastUndo();
                        }
                    } catch (e) {
                        undoManager.removeLastUndo();
                        throw e;
                    }

                }
            } else if (tool === TileEditorToolbar.Tools.tileLinkBreak && args.isInBounds) {
                if (event === TileEditor.Events.pixelMouseDown) {

                    addUndoState();
                    try {
                        const tileIndex = getTileGrid().getTileIndexByCoordinate(imageX, imageY);
                        const result = TileLinkBreakTool.createAndLinkNewTileIfUsedElsewhere(tileIndex, getTileMap(), getTileSet(), getProject());
                        if (Array.isArray(result.updatedTileIds) && result.updatedTileIds.length > 0) {

                            tileEditor.setState({ tileGrid: getTileGrid(), tileSet: getTileSet() });
                            tileManager.setState({ tileSet: getTileSet() });

                        } else {
                            undoManager.removeLastUndo();
                        }
                    } catch (e) {
                        undoManager.removeLastUndo();
                        throw e;
                    }

                }
            }

            if (actionTaken) {
                tileEditor.setState({
                    tileGrid: getTileGrid(),
                    tileSet: getTileSet()
                });
            }
            if (updatedTileIds) {
                tileEditor.setState({
                    updatedTileIds: updatedTileIds
                });
                tileManager.setState({
                    updatedTileIds: updatedTileIds
                });
            }
        }

    }

}

/** 
 * @param {ToolActionArgs} args 
 * @returns {string[]?}
 */
function takeToolAction_tileStamp(args) {
    if (!args.isInBounds) return;
    const ts = getToolState();

    // Define mode 
    if (ts.mode === 'define') {

        if (args.event === TileEditor.Events.pixelMouseDown) {

            ts.selectedRegion = { rowIndex: args.tile.row, columnIndex: args.tile.col, width: 1, height: 1 };
            ts.lastTile = { rowIndex: args.tile.row, columnIndex: args.tile.col };
            tileEditor.setState({ selectedRegion: ts.selectedRegion });

        } else if (args.event === TileEditor.Events.pixelMouseOver) {

            if (!ts.selectedRegion) {
                ts.selectedRegion = { rowIndex: args.tile.row, columnIndex: args.tile.col, width: 1, height: 1 };
            }

            /** @type {import("./models/tileGridProvider.js").TileGridRegion} */
            const r = ts.selectedRegion;

            const mCol = args.tile.col; // Mouse col
            const mRow = args.tile.row; // Mouse row
            let sRow = r.rowIndex;
            let eRow = r.rowIndex + r.height;
            let sCol = r.columnIndex;
            let eCol = r.columnIndex + r.width;

            const movingLeft = ts.lastTile.colIndex > mCol;
            if (movingLeft) {       // Moving towards left side
                if (mCol > sCol)    //  If mouse is on right of the start col
                    eCol = mCol;    //      Reset the end col
                else if (mCol < sCol)              //  Otherwise
                    sCol = mCol;    //      Reset start col
            } else {                // Moving towards right side
                if (mCol < eCol)    //  If mouse col less than end col
                    sCol = mCol;    //      Reset start col
                else if (mCol > eCol)               //  Otherwise
                    eCol = mCol;    //      Reset end col
            }

            const movingUp = ts.lastTile.rowIndex > mRow;
            if (movingUp) {
                if (mRow > sRow)
                    eRow = mRow;
                else if (mRow < sRow)
                    sRow = mRow;
            } else {
                if (mRow < eRow)
                    sRow = mRow;
                else if (mRow > eRow)
                    eRow = mRow;
            }

            r.rowIndex = sRow;
            r.height = Math.max(eRow - sRow, 1);
            r.columnIndex = sCol;
            r.width = Math.max(eCol - sCol, 1);

            ts.selectedRegion = r;
            ts.lastTile = { rowIndex: mRow, columnIndex: mCol };
            tileEditor.setState({ selectedRegion: ts.selectedRegion });
        } else if (args.event === TileEditor.Events.pixelMouseUp) {
            confirmTileStampRegion();
        }

    } else {

        if (args.event === TileEditor.Events.pixelMouseDown || args.event === TileEditor.Events.pixelMouseOver) {
            addUndoState();
            try {
                const stampTileMap = getToolState().tileMap;
                let result = null;
                if (stampTileMap) {
                    result = TileStampTool.stampTileMap({
                        stampTileMap: stampTileMap,
                        tileMap: getTileMap(),
                        tileSet: getTileSet(),
                        tileRow: args.tile.row,
                        tileCol: args.tile.col
                    });
                } else {
                    result = TileStampTool.stampTile({
                        tileId: getProjectUIState().tileId,
                        tileMap: getTileMap(),
                        tileSet: getTileSet(),
                        tileRow: args.tile.row,
                        tileCol: args.tile.col
                    });
                }
                if (result.updatedTileIds.length > 0) {
                    return result.updatedTileIds;
                } else {
                    undoManager.removeLastUndo();
                }
            } catch (e) {
                undoManager.removeLastUndo();
                throw e;
            }
        }

    }
    return null;
}

/** @param {import("./ui/tileEditor.js").TileEditorEventArgs} args */
function takeReferenceImageAction(args) {
    if (instanceState.referenceImage) {

        if (args.event === TileEditor.Events.pixelMouseDown) {
            // Mouse is clicked, record the coords and ref image bound that was clicked

            const refBounds = instanceState.referenceImage.getBounds();
            instanceState.lastBound = getBoundType(args.x, args.y, refBounds);
            instanceState.lastTileMapPx.x = args.x;
            instanceState.lastTileMapPx.y = args.y;
            instanceState.referenceImageOriginalBounds = refBounds;

        } else if (args.event === TileEditor.Events.pixelMouseOver) {
            // Mouse is moved, set cursor and preform any required movement or resize

            const refBounds = instanceState.referenceImage.getBounds();
            const origBounds = instanceState.referenceImageOriginalBounds;
            const last = instanceState.lastTileMapPx;

            if (args.mousePrimaryIsDown) {
                // Mouse was held, so perform movement or resize

                let newX = refBounds.x;
                let newY = refBounds.y;
                let newW = refBounds.width;
                let newH = refBounds.height;

                const hasLastPosition = last.x !== -1 && last.y !== -1;
                if (hasLastPosition) {

                    const movementX = (last.x - args.x);
                    const movementY = (last.y - args.y);

                    // Move

                    if (instanceState.lastBound === boundTypes.c) {
                        // Moves entire image?
                        newX -= movementX;
                        newY -= movementY;
                    }

                    // Resize
                    switch (instanceState.lastBound) {
                        case boundTypes.t: newH += movementY; break;
                        case boundTypes.b: newH -= movementY; break;
                        case boundTypes.l: newW += movementX; break;
                        case boundTypes.r: newW -= movementX; break;
                        case boundTypes.tl: newW += movementX; newH += movementY; break;
                        case boundTypes.bl: newW += movementX; newH -= movementY; break;
                        case boundTypes.tr: newW -= movementX; newH += movementY; break;
                        case boundTypes.br: newW -= movementX; newH -= movementY; break;
                    }
                    if (args.ctrlKeyPressed) {
                        let origAxis = { w: origBounds.width, h: origBounds.height };
                        switch (instanceState.lastBound) {
                            case boundTypes.t:
                            case boundTypes.b:
                            case boundTypes.tl:
                            case boundTypes.br:
                                newW = calcAxisPx('w', newH, origAxis);
                                break;
                            case boundTypes.l:
                            case boundTypes.r:
                            case boundTypes.bl:
                            case boundTypes.tr:
                                newH = calcAxisPx('h', newW, origAxis);
                                break;
                        }
                    }

                    // Anchor
                    switch (instanceState.lastBound) {
                        case boundTypes.t: newY = origBounds.bottom - newH; break;
                        case boundTypes.b: newY = origBounds.top; break;
                        case boundTypes.l: newX = origBounds.right - newW; break;
                        case boundTypes.r: newX = origBounds.left; break;
                        case boundTypes.tl: newY = origBounds.bottom - newH; newX = origBounds.right - newW; break;
                        case boundTypes.bl: newY = origBounds.top; newX = origBounds.right - newW; break;
                        case boundTypes.tr: newY = origBounds.bottom - newH; newX = origBounds.left; break;
                        case boundTypes.br: newY = origBounds.top; newX = origBounds.left; break;
                    }
                    if (args.ctrlKeyPressed) {
                        switch (instanceState.lastBound) {
                            case boundTypes.t:
                            case boundTypes.b:
                                newX = origBounds.left + (origBounds.width / 2) - (newW / 2);
                                break;
                            case boundTypes.l:
                            case boundTypes.r:
                                newY = origBounds.top + (origBounds.height / 2) - (newH / 2);
                                break;
                        }
                    }

                    instanceState.referenceImage.setBounds(newX, newY, newW, newH);
                    tileContextToolbar.setState({ referenceBounds: instanceState.referenceImage.getBounds() });

                }
            } else {
                // Mouse wasn't held, so just update cursor to reflect the bound
                const refBounds = instanceState.referenceImage.getBounds();
                const bound = getBoundType(args.x, args.y, refBounds);
                if (bound === boundTypes.c) {
                    tileEditor.setState({ cursor: 'move' });
                } else if (bound === boundTypes.tl || bound === boundTypes.br) {
                    tileEditor.setState({ cursor: 'nwse-resize' });
                } else if (bound === boundTypes.bl || bound === boundTypes.tr) {
                    tileEditor.setState({ cursor: 'nesw-resize' });
                } else if (bound === boundTypes.t || bound === boundTypes.b) {
                    tileEditor.setState({ cursor: 'ns-resize' });
                } else if (bound === boundTypes.l || bound === boundTypes.r) {
                    tileEditor.setState({ cursor: 'ew-resize' });
                } else {
                    tileEditor.setState({ cursor: 'default' });
                }
            }

            instanceState.lastTileMapPx.x = args.x;
            instanceState.lastTileMapPx.y = args.y;

        } else if (args.event === TileEditor.Events.pixelMouseUp) {

            instanceState.lastBound = null;
            instanceState.lastTileMapPx.x = -1;
            instanceState.lastTileMapPx.y = -1;

        }
    }
}

const boundTypes = { c: 'c', t: 't', r: 'r', b: 'b', l: 'l', tl: 'tl', tr: 'tr', br: 'br', bl: 'bl' };

/**
 * Given the length of one axis, this will return the length of the other axis as a percentage.
 * @param {string} axis - Either 'w' or 'h'.
 * @param {number} otherAxisPx - Other axis value in Px.
 * @param {{ w: number, h: number }} originalValues - Bounds.
 * @returns {number}
 */
function calcAxisPx(axis, otherAxisPx, originalValues) {
    const otherAxis = axis === 'w' ? 'h' : 'w';
    const ratio = 1 / originalValues[axis] * originalValues[otherAxis];
    return otherAxisPx * ratio;
}

/**
 * @param {number} x 
 * @param {number} y 
 * @param {DOMRect} bounds 
 */
function getBoundType(x, y, bounds) {
    const centreBound = new DOMRect(bounds.left + 1, bounds.top + 1, bounds.width - 3, bounds.height - 3);
    if (isInBounds(x, y, centreBound)) return boundTypes.c;

    const topBounds = new DOMRect(bounds.left + 1, bounds.top - 1, bounds.width - 3, 3);
    if (isInBounds(x, y, topBounds)) return boundTypes.t;

    const botBounds = new DOMRect(bounds.left + 1, bounds.bottom - 3, bounds.width - 3, 3);
    if (isInBounds(x, y, botBounds)) return boundTypes.b;

    const leftBounds = new DOMRect(bounds.left - 1, bounds.top + 1, 3, bounds.height - 3);
    if (isInBounds(x, y, leftBounds)) return boundTypes.l;

    const rightBounds = new DOMRect(bounds.right - 3, bounds.top + 1, 3, bounds.height - 3);
    if (isInBounds(x, y, rightBounds)) return boundTypes.r;

    const topLeftBounds = new DOMRect(bounds.left - 1, bounds.top - 1, 3, 3);
    if (isInBounds(x, y, topLeftBounds)) return boundTypes.tl;

    const topRightBounds = new DOMRect(bounds.right - 3, bounds.top - 1, 3, 3);
    if (isInBounds(x, y, topRightBounds)) return boundTypes.tr;

    const bottomLeftBounds = new DOMRect(bounds.left - 1, bounds.bottom - 3, 3, 3);
    if (isInBounds(x, y, bottomLeftBounds)) return boundTypes.bl;

    const bottomRightBounds = new DOMRect(bounds.right - 3, bounds.bottom - 3, 3, 3);
    if (isInBounds(x, y, bottomRightBounds)) return boundTypes.br;

    return null;
}

/**
 * @param {number} x 
 * @param {number} y 
 * @param {DOMRect} bounds 
 * @param {number|null|undefined} collapsePx 
 */
function isInBounds(x, y, bounds, collapsePx) {
    if (!collapsePx) collapsePx = 0;
    return x > (bounds.left + collapsePx) &&
        x < (bounds.right - collapsePx) &&
        y > (bounds.top + collapsePx) &&
        y < (bounds.bottom - collapsePx);
}

function selectReferenceImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async () => {

        const sourceImg = await ImageUtil.fileInputToImageAsync(fileInput);
        instanceState.referenceImageOriginal = sourceImg;

        const dimensions = ImageUtil.calculateAspectRatioDimensions(sourceImg, 1024, 1024);
        const resizedImg = await ImageUtil.resizeImageAsync(sourceImg, dimensions.width, dimensions.height);
        const drawDimensions = ImageUtil.calculateAspectRatioDimensions(sourceImg, getTileSet().tileWidth * 8, getTileSet().tileHeight * 8);

        if (!instanceState.referenceImage) {
            instanceState.referenceImage = new ReferenceImage();
        }

        instanceState.referenceImage.setImage(resizedImg);
        instanceState.referenceImage.setBounds(0, 0, drawDimensions.width, drawDimensions.height);


        tileContextToolbar.setState({
            referenceBounds: instanceState.referenceImage.getBounds(),
            referenceTransparency: instanceState.transparencyIndex
        });
        tileEditor.setState({
            referenceImage: instanceState.referenceImage
        });
    };
    fileInput.click();
}

function clearReferenceImage() {

    instanceState.referenceImage.clearImage();
    instanceState.referenceImageOriginal = null;

    tileContextToolbar.setState({
        referenceBounds: instanceState.referenceImage.getBounds()
    });
    tileEditor.setState({
        referenceImage: instanceState.referenceImage
    });

}

/**
 * Updates the reference image.
 * @param {DOMRect} bounds - Bounds of the reference image.
 * @param {number} transparencyIndex - Transparency colour index.
 */
function updateReferenceImage(bounds, transparencyIndex) {
    if (!instanceState.referenceImage) {
        instanceState.referenceImage = new ReferenceImage();
    }
    instanceState.referenceImage.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    const refImage = instanceState.referenceImage;

    tileEditor.setState({
        referenceImage: refImage,
        transparencyIndex: transparencyIndex
    });
    tileContextToolbar.setState({
        referenceBounds: refImage.getBounds(),
        referenceTransparency: refImage.transparencyIndex
    });
}

/**
 * Sets the pencil size.
 * @param {number} brushSize - Pencil size, 1 to 5.
 */
function setPencilSize(brushSize) {
    if (brushSize && brushSize >= 1 && brushSize <= 50) {
        instanceState.pencilSize = brushSize;
        tileContextToolbar.setState({
            brushSize: instanceState.pencilSize
        });
        let cursorSize = 1;
        if (instanceState.tool === TileEditorToolbar.Tools.pencil || instanceState.tool === TileEditorToolbar.Tools.colourReplace) {
            cursorSize = instanceState.pencilSize;
        }
        tileEditor.setState({
            cursorSize: cursorSize
        });
    }
}

/**
 * Sets the tile clamp value.
 * @param {boolean} value - Tile clamp value.
 */
function setTileClamp(value) {
    instanceState.clampToTile = value;
    if (!isTileMap()) {
        instanceState.userClampToTile = value;
    } else if (instanceState.tool !== TileEditorToolbar.Tools.bucket) {
        instanceState.userClampToTile = value;
    }
    tileContextToolbar.setState({
        clampToTile: instanceState.clampToTile
    });
}

/**
 * Sets the tile link break value.
 * @param {boolean} value - Tile link break value.
 */
function setTileLinkBreak(value) {
    instanceState.breakTileLinks = value;
    tileContextToolbar.setState({
        tileBreakLinks: instanceState.breakTileLinks
    });
}

/**
 * Sets the row column insert delete mode.
 * @param {string} mode - Row column mode to set.
 * @param {string} fillMode - Fill mode to use when adding rows or columns.
 */
function setRowColumnMode(mode, fillMode) {
    switch (mode) {
        case 'addRow':
        case 'deleteRow':
        case 'addColumn':
        case 'deleteColumn':
            instanceState.rowColumnMode = mode;
            instanceState.rowColumnFillMode = fillMode;
            tileContextToolbar.setState({
                rowColumnMode: mode,
                rowColumnFillMode: fillMode
            });
            tileEditor.setState({
                canvasHighlightMode: getTileEditorHighlightMode()
            });
            break;
    }
}

/**
 * Sets the palette slot.
 * @param {number} paletteSlot - Palette slot number.
 */
function setPaletteSlot(paletteSlot) {
    paletteSlot = Math.max(paletteSlot, 0);
    paletteSlot = Math.min(paletteSlot, getNumberOfPaletteSlots() - 1);

    addUndoState();

    instanceState.paletteSlot = paletteSlot;

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileContextToolbar.setState({
        paletteSlot: instanceState.paletteSlot
    });
}

/**
 * Sets the attributes on the currently selected tile.
 * @param {import("./ui/toolbars/tileContextToolbar.js").TileContextToolbarTileAttributes} tileAttributes - Attributes to set.
 */
function setTileAttributes(tileAttributes) {
    if (!isTileMap()) return;
    if (!tileAttributes) return;
    if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileGrid().tileCount) return;

    const tileIndex = instanceState.tileIndex;
    const tileMapTile = getTileMap().getTileByIndex(tileIndex);
    if (!tileMapTile) return;

    addUndoState();
    try {

        const updatedTileIds = [];

        if (typeof tileAttributes.horizontalFlip === 'boolean') {
            tileMapTile.horizontalFlip = tileAttributes.horizontalFlip;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof tileAttributes.verticalFlip === 'boolean') {
            tileMapTile.verticalFlip = tileAttributes.verticalFlip;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof tileAttributes.priority === 'boolean') {
            tileMapTile.priority = tileAttributes.priority;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof tileAttributes.palette === 'number') {
            const result = PalettePaintTool.setPaletteIndexByTileIndex({
                tileMap: getTileMap(),
                paletteIndex: tileAttributes.palette,
                tilesPerBlock: getTilesPerBlock(),
                tileIndex: tileIndex
            });
            updatedTileIds.concat(result.updatedTileIds);
        }

        if (updatedTileIds.length > 0) {

            state.setProject(getProject());
            state.saveToLocalStorage();

            tileEditor.setState({
                updatedTileIds: updatedTileIds
            });
            tileManager.setState({
                updatedTileIds: updatedTileIds
            });

            selectTileIndexIfNotSelected(tileIndex);

        } else {
            // Nothing changed, no reason to keep the undo in memory
            undoManager.removeLastUndo();
        }

    } catch (e) {
        undoManager.removeLastUndo();
        throw e;
    }


}

function setTileStampDefineMode() {
    getToolState().mode = 'define';
    tileEditor.setState({
        selectedRegion: getToolState().selectedRegion,
        tileStampPreview: null
    });
    tileContextToolbar.setState({ selectedCommands: [TileContextToolbar.Commands.tileStampDefine] });
}

function confirmTileStampRegion() {
    if (!isTileMap()) return;
    getToolState().mode = 'tile';
    /** @type {import("./models/tileGridProvider.js").TileGridRegion} */
    let region = getToolState().selectedRegion;
    /** @type {TileMapTile[]} */
    let tiles = [];
    for (let r = 0; r < region.height; r++) {
        const row = region.rowIndex + r;
        for (let c = 0; c < region.width; c++) {
            const col = region.columnIndex + c;
            const tile = getTileMap().getTileByCoordinate(row, col);
            tiles.push(TileMapTileFactory.create({
                tileId: tile.tileId,
                horizontalFlip: tile.horizontalFlip,
                verticalFlip: tile.verticalFlip,
                palette: tile.palette,
                priority: tile.priority
            }));
        }
    }
    const stampTileMap = TileMapFactory.create({
        tiles: tiles,
        rows: region.height,
        columns: region.width
    });
    getToolState().tileMap = stampTileMap;
    tileEditor.setState({
        selectedRegion: getToolState().selectedRegion,
        tileStampPreview: stampTileMap
    });
    tileContextToolbar.setState({ selectedCommands: [] });
}

function clearTileStampRegion() {
    getToolState().mode = 'tile';
    getToolState().selectedRegion = null;
    getToolState().tileMap = null;
    tileEditor.setState({
        selectedRegion: null
    });
    tileContextToolbar.setState({ selectedCommands: [] });
    selectTileSetTile(getProjectUIState().tileId);
}

/**
 * Sets the tile ID of a particular tile if a tile map tile is selected.
 * @param {string} tileId - Unique tile ID to set.
 */
function setTileSetTileIfTileMapTileSelected(tileId) {
    if (!isTileMap()) return;
    if (!tileId) return;
    if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileGrid().tileCount) return;
    if (instanceState.tool !== TileEditorToolbar.Tools.tileAttributes) return;

    const tile = getTileSet().getTileById(tileId);
    if (!tile) return;

    const tileIndex = instanceState.tileIndex;
    const tileMapTile = getTileMap().getTileByIndex(tileIndex);
    if (!tileMapTile) return;

    addUndoState();

    tileMapTile.tileId = tile.tileId;

    state.setProject(getProject());
    state.saveToLocalStorage();

    tileEditor.setState({
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
    toggleTileIndexSelectedState(tileIndex);
}

/**
 * Toggles the selected state of a tile by tile grid index.
 * @param {number} tileIndex - Tile index within the tile grid provider.
 */
function toggleTileIndexSelectedState(tileIndex) {
    if (tileIndex !== instanceState.tileIndex) {
        selectTileIndexIfNotSelected(tileIndex);
    } else {
        selectTileIndexIfNotSelected(-1);
    }
}

/**
 * Selects a tile grid index if not already selected.
 * @param {number} tileIndex - Tile index within the tile grid provider.
 */
function selectTileIndexIfNotSelected(tileIndex) {
    if (tileIndex < 0 || tileIndex > getTileGrid().tileCount) return;

    if (tileIndex !== instanceState.tileIndex) {
        instanceState.tileIndex = tileIndex;

        tileEditor.setState({
            selectedTileIndex: instanceState.tileIndex
        });
    }

    if (isTileMap() && instanceState.tool === TileEditorToolbar.Tools.tileAttributes) {
        const tileSetTile = getTileMap().getTileByIndex(tileIndex);
        tileContextToolbar.setState({
            tileAttributes: {
                horizontalFlip: tileSetTile.horizontalFlip,
                verticalFlip: tileSetTile.verticalFlip,
                priority: tileSetTile.priority,
                palette: tileSetTile.palette
            }
        });
    }
}

/**
 * Creates a new palette.
 */
function newPalette() {
    addUndoState();

    const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', getDefaultPaletteSystemType());
    getPaletteList().addPalette(newPalette);

    state.setProject(getProject());
    state.saveToLocalStorage();

    changePalette(newPalette.paletteId);
}

function clonePalette(paletteIndex) {
    if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {

        addUndoState();
        try {
            const newPalette = PaletteFactory.clone(getPalette());
            newPalette.title += ' (copy)';
            getPaletteList().insertAt(paletteIndex, newPalette);

            state.setProject(getProject());
            state.saveToLocalStorage();

            changePalette(newPalette.paletteId);
        } catch (e) {
            undoManager.removeLastUndo();
            throw e;
        }
    }
}

function deletePalette(paletteIndex) {
    if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {
        addUndoState();
        try {

            getPaletteList().removeAt(paletteIndex);
            if (getPaletteList().length === 0) {
                const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', getDefaultPaletteSystemType());
                getPaletteList().addPalette(newPalette);
                paletteIndex = 0;
            } else {
                paletteIndex = Math.max(0, Math.min(paletteIndex, getPaletteList().length - 1));
            }

            state.setProject(getProject());
            state.saveToLocalStorage();

            const palette = getPaletteList().getPalette(paletteIndex);
            changePalette(palette.paletteId);

        } catch (e) {
            undoManager.removeLastUndo();
            throw e;
        }
    }
}

function changePaletteTitle(paletteIndex, newTitle) {
    addUndoState();

    const palette = getPaletteList().getPalette(paletteIndex);
    palette.title = newTitle;

    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList()
    });
    tileManager.setState({
        paletteList: getPaletteList()
    });
}

function changePaletteSystem(paletteIndex, system) {
    addUndoState();

    const palette = getPaletteList().getPalette(paletteIndex);
    palette.system = system;

    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedSystem: system,
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        paletteList: getTileEditorPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileManager.setState({
        paletteList: getPaletteList()
    });
}

function changePaletteEditorDisplayNativeColours(displayNative) {

    state.persistentUIState.displayNativeColour = displayNative;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        tileGrid: getTileGrid(),
        tileSet: getTileSet(),
        paletteList: getTileEditorPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileManager.setState({
        paletteList: getPaletteList()
    });
}

function changeSelectedColourIndex(colourIndex) {
    if (colourIndex >= 0 && colourIndex < 16) {
        paletteEditor.setState({
            selectedColourIndex: colourIndex
        });
        instanceState.colourIndex = colourIndex;
        const colour = getPalette().getColour(instanceState.colourIndex);
        colourPickerToolbox.setState({
            r: colour.r,
            g: colour.g,
            b: colour.b
        });
    }
}

function editSelectedColourIndex(paletteIndex, colourIndex) {
    const palette = getPaletteList().getPalette(paletteIndex);
    colourPickerDialogue.show(palette, colourIndex);
}

function swapColourIndex(sourceColourIndex, targetColourIndex) {
    addUndoState();

    getTileSet().swapColourIndex(sourceColourIndex, targetColourIndex);

    const sourceColour = getPalette().getColour(sourceColourIndex);
    const targetColour = getPalette().getColour(targetColourIndex);

    getPalette().setColour(sourceColourIndex, targetColour);
    getPalette().setColour(targetColourIndex, sourceColour);

    state.saveToLocalStorage();

    tileEditor.setState({
        paletteList: getTileEditorPaletteList(),
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
    paletteEditor.setState({
        paletteList: getPaletteList()
    });
    tileManager.setState({
        paletteList: getPaletteList()
    });
}

function replaceColourIndex(sourceColourIndex, targetColourIndex) {
    addUndoState();

    getTileSet().replaceColourIndex(sourceColourIndex, targetColourIndex);

    state.saveToLocalStorage();

    tileEditor.setState({
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
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
            paletteList: getTileEditorPaletteList(),
            tileGrid: getTileGrid(),
            tileSet: getTileSet()
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
        tileGrid: getTileGrid(),
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
 * @argument {{title: string?, systemType: string?, createTileMap: boolean?, tileWidth: number?, tileHeight: number?}} args
 */
function newProject(args) {
    addUndoState();

    const newProject = createEmptyProject({
        title: args.title,
        systemType: args.systemType,
        createTileMap: args.createTileMap,
        tileWidth: args.tileWidth,
        tileHeight: args.tileHeight
    });
    state.setProject(newProject);
    getProjectUIState().paletteIndex = 0;
    state.saveToLocalStorage();

    instanceState.tileIndex = -1;
    instanceState.colourIndex = 0;

    projectToolbar.setState({
        projectTitle: getProject().title
    });
    projectDropdown.setState({
        projectTitle: getProject().title,
        visible: false
    });
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedColourIndex: instanceState.colourIndex,
        selectedPaletteIndex: getProjectUIState().paletteIndex
    });
    setCommonTileToolbarStates({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        paletteList: getTileEditorPaletteList(),
        tileGrid: getTileGrid(),
        tileSet: getTileSet(),
        selectedTileIndex: instanceState.tileIndex
    });
    tileEditor.setState({
        paletteList: getPaletteList(),
        tileSet: getTileSet(),
        tileGrid: getTileGrid()
    });
    welcomeScreen.setState({
        visible: false
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
                state.saveProjectToLocalStorage();
                getProjectUIState().paletteIndex = 0;

                displaySelectedProject();
                projectDropdown.setState({ visible: false });
                welcomeScreen.setState({ visible: false });
            });
        }
    }
    input.click();
}

/**
 * Exports the project to a JSON file.
 */
function exportProjectToJson() {
    ProjectUtil.saveToFile(getProject());
}

/**
 * Shows the export to assembly dialogue.
 */
function exportProjectToAssembly() {
    const serialiser = SerialisationUtil.getProjectAssemblySerialiser(getProject().systemType);
    const code = serialiser.serialise(getProject(), {
        optimiseTileMap: getUIState().exportOptimiseTileMap,
        paletteIndex: getUIState().exportTileMapPaletteIndex,
        tileMapMemoryOffset: getUIState().exportTileMapVramOffset
    });
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
        refreshProjectUI();
    }
    setCommonTileToolbarStates({
        undoEnabled: undoManager.canUndo,
        redoEnabled: undoManager.canRedo
    });
}

function addUndoState() {
    if (getProject() && !instanceState.undoDisabled) {
        undoManager.addUndoState(getProject());
        setCommonTileToolbarStates({
            undoEnabled: undoManager.canUndo,
            redoEnabled: undoManager.canRedo
        });
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
}

/**
 * Creates a new tile map.
 */
function createNewTileMap() {
    newTileMapDialogue.setState({
        title: 'New tile map',
        createMode: NewTileMapDialogue.CreateModes.new,
        createOption: NewTileMapDialogue.TileOptions.createNew,
        selectedSizePreset: NewTileMapDialogue.TilePresets.size8x8,
        tileMapList: getTileMapList(),
        cloneTiles: false
    });
    newTileMapDialogue.show();
}

/**
 * Creates a new tile map from tile set.
 */
function createNewTileMapFromTileSet() {
    addUndoState();

    const tileSet = getTileSet();
    const newTileMap = TileMapFactory.create({
        title: 'Tile map from tile set',
        columns: tileSet.columnCount,
        rows: Math.ceil(tileSet.tileCount / tileSet.columnCount),
        tiles: tileSet.getTiles().map((tile) => {
            return TileMapTileFactory.create({
                tileId: tile.tileId,
                palette: 0
            })
        })
    });
    const defaultPaletteId = getPaletteList().getPalettes()[0].paletteId;
    for (let i = 0; i < getNumberOfPaletteSlots(); i++) {
        newTileMap.setPalette(i, defaultPaletteId);
    }
    getTileMapList().addTileMap(newTileMap);

    state.setProject(getProject());
    state.saveToLocalStorage();

    selectTileSetOrMap(newTileMap.tileMapId);
}

/**
 * Selects a tile set or tile map.
 * @param {string?} tileMapId - Unique ID of the tile map to select or null if none selected.
 */
function selectTileSetOrMap(tileMapId) {

    getProjectUIState().tileMapId = tileMapId ?? null;

    if (isTileMap()) {

        // Ensure the tile map is in good order
        const tileMap = getTileMap();
        checkTileMap(tileMap);

        // Don't allow tile set only tools to be selected
        if (instanceState.tool === TileEditorToolbar.Tools.select) {
            selectTool(TileEditorToolbar.Tools.tileAttributes);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.bucket) {
            instanceState.clampToTile = true;
        }

    } else if (isTileSet()) {

        // Don't allow tile map only tools to be selected
        if (instanceState.tool === TileEditorToolbar.Tools.tileAttributes) {
            selectTool(TileEditorToolbar.Tools.select);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.rowColumn) {
            selectTool(TileEditorToolbar.Tools.select);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.tileLinkBreak) {
            selectTool(TileEditorToolbar.Tools.select);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
            selectTool(TileEditorToolbar.Tools.select);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.palettePaint) {
            selectTool(TileEditorToolbar.Tools.select);
        }

    }

    instanceState.tileIndex = -1;

    state.setProject(getProject());
    state.saveToLocalStorage();

    refreshProjectUI();
}

/**
 * Checks that a tile map is okay.
 * @param {TileMap} tileMap - Tile map to check.
 */
function checkTileMap(tileMap) {
    const defaultPaletteId = getPaletteList().getPalettes()[0].paletteId;
    tileMap.getPalettes().forEach((paletteId, index) => {
        const matchingPalette = getPaletteList().getPaletteById(paletteId);
        if (!matchingPalette) {
            tileMap.setPalette(index, defaultPaletteId);
        }
    });
}

/**
 * Selects a tile set tile.
 * @param {string?} tileId - Unique ID of the tile set tile.
 */
function selectTileSetTile(tileId) {
    const tile = getTileSet().getTileById(tileId);
    if (tile) {
        getProjectUIState().tileId = tileId;
        state.saveUIStateToLocalStorage();
        tileManager.setState({
            selectedTileId: tileId
        });
    }

    // Set the stamp preview in the canvas
    if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
        tileEditor.setState({ tileStampPreview: tile?.tileId ?? null });
    }
}

/**
 * Updates a tile set.
 * @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args
 */
function updateTileSet(args) {

    let undoAdded = false;

    // Update tile map
    const tileWidth = (typeof args.tileWidth === 'number') ? args.tileWidth : null;
    if (tileWidth !== null && tileWidth > 0) {
        if (!undoAdded) addUndoState();
        undoAdded = true;
        getTileSet().tileWidth = tileWidth;
    }

    // Update project
    state.setProject(getProject());
    state.saveToLocalStorage();

    // Reset UI
    tileEditorToolbar.setState({ tileWidth: getTileSet().tileWidth });
    tileEditorBottomToolbar.setState({ tileWidth: getTileSet().tileWidth });
    tileManager.setState({
        tileSet: getTileSet()
    });
    tileEditor.setState({
        selectedTileIndex: -1,
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
}

/**
 * Clones a tile map.
 * @param {string} tileMapId - Unique ID of the tile map to delete.
 */
function cloneTileMap(tileMapId) {
    if (!tileMapId) throw new Error('The tile map ID was invalid.');

    const sourceTileMap = getTileMapList().getTileMapById(tileMapId);

    if (!sourceTileMap) throw new Error('No tile map matched the given ID.');

    addUndoState();

    const clonedTileMap = TileMapFactory.clone(sourceTileMap);
    clonedTileMap.title += " (copy)";

    getTileMapList().addTileMap(clonedTileMap);

    selectTileSetOrMap(clonedTileMap.tileMapId);
}

/**
 * Deletes a tile map.
 * @param {string} tileMapId - Unique ID of the tile map to delete.
 */
function deleteTileMap(tileMapId) {
    if (!tileMapId) throw new Error('The tile map ID was invalid.');

    const tileMap = getTileMapList().getTileMapById(tileMapId);

    if (!tileMap) throw new Error('No tile map matched the given ID.');

    addUndoState();
    try {
        let tileMapIndex = getTileMapList().getTileMaps().indexOf(tileMap);

        // Delete the tile map
        getTileMapList().removeAt(tileMapIndex);

        // Select the next available tile map
        if (getTileMapList().length === 0) {
            tileMapId = null;
        } else {
            tileMapIndex = Math.max(0, Math.min(tileMapIndex, getTileMapList().length - 1));
            tileMapId = getTileMapList().getTileMap(tileMapIndex).tileMapId ?? null;
        }

        state.setProject(getProject());
        state.saveToLocalStorage();

        selectTileSetOrMap(tileMapId);

    } catch (e) {
        undoManager.removeLastUndo();
        throw e;
    }
}

/**
 * Updates a tile map.
 * @param {string} tileMapId - Unique ID of the tile map to delete.
 * @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args
 */
function updateTileMap(tileMapId, args) {
    if (!tileMapId) throw new Error('The tile map ID was invalid.');
    const tileMap = getTileMapList().getTileMapById(tileMapId);
    if (!tileMap) throw new Error('No tile map matched the given ID.');

    addUndoState();

    // Update tile map
    if (typeof args.title === 'string' && args.title.length > 0) {
        tileMap.title = args.title;
    }
    if (typeof args.optimise === 'boolean') {
        tileMap.optimise = args.optimise;
    }
    if (Array.isArray(args.paletteSlots) && args.paletteSlots.length > 0) {
        args.paletteSlots.forEach((paletteId, index) => {
            tileMap.setPalette(index, paletteId);
        });
    }

    // Update project
    state.setProject(getProject());
    state.saveToLocalStorage();

    // Reset UI
    tileManager.setState({
        tileMapList: getTileMapList(),
        selectedTileMapId: getProjectUIState().tileMapId
    });
    tileEditor.setState({
        selectedTileIndex: -1,
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
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
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
}

/**
 * Selects a tool on the tile editor toolbar.
 * @param {string} tool - Name of the tool to select.
 */
function selectTool(tool) {
    if (TileEditorToolbar.Tools[tool]) {
        instanceState.tool = tool;
        instanceState.swapTool = null;
        if (tool !== TileEditorToolbar.Tools.select) {
            instanceState.tileIndex = -1;
            tileEditor.setState({
                selectedTileIndex: instanceState.tileIndex
            });
        }

        // Set the stamp preview in the canvas
        if (tool === TileEditorToolbar.Tools.tileStamp) {
            if (!getProjectUIState().tileId && getTileSet() && getTileSet().length > 0 || !getTileSet().getTileById(getProjectUIState().tileId)) {
                selectTileSetTile(getTileSet().getTile(0).tileId);
            }
            tileEditor.setState({ tileStampPreview: getProjectUIState().tileId });
        } else {
            tileEditor.setState({ tileStampPreview: null });
        }

        if (tool !== TileEditorToolbar.Tools.tileStamp && getProject() !== null) {
            clearTileStampRegion();
        }

        instanceState.clampToTile = instanceState.userClampToTile;

        let cursor = 'arrow';
        let cursorSize = 1;
        if ([TileEditorToolbar.Tools.eyedropper, TileEditorToolbar.Tools.bucket].includes(tool)) {
            cursor = 'crosshair';
        } else if (tool === TileEditorToolbar.Tools.pencil || tool === TileEditorToolbar.Tools.colourReplace) {
            cursor = 'crosshair';
            cursorSize = instanceState.pencilSize;
        }

        const disabledCommands = [];
        if (isTileMap() && instanceState.tool === TileEditorToolbar.Tools.bucket) {
            instanceState.clampToTile = true;
            disabledCommands.push(TileContextToolbar.Commands.tileClamp);
        }

        setCommonTileToolbarStates({
            selectedTool: tool
        });
        tileContextToolbar.setState({
            visible: true,
            brushSize: instanceState.pencilSize,
            rowColumnFillMode: instanceState.rowColumnFillMode ?? TileMapRowColumnTool.TileFillMode.useSelected,
            visibleToolstrips: getTileMapContextToolbarVisibleToolstrips(tool),
            clampToTile: instanceState.clampToTile,
            disabledCommands: disabledCommands
        });
        tileEditor.setState({
            cursor: cursor,
            cursorSize: cursorSize,
            canvasHighlightMode: getTileEditorHighlightMode()
        });

        instanceState.lastTileMapPx.x = -1;
        instanceState.lastTileMapPx.y = -1;
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

    setCommonTileToolbarStates({
        scale: scale
    });
    tileEditor.setState({
        forceRefresh: true,
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
 * Changes the selected palette by palette ID.
 * @param {number} paletteId - Unique palette ID.
 */
function changePalette(paletteId) {
    if (typeof paletteId !== 'string') return;
    let index = getPaletteList().indexOf(paletteId);
    changePaletteIndex(index);
}

/**
 * Selects a given palette.
 * @param {number} index - Palette index in the palette list.
 */
function changePaletteIndex(index) {
    if (index < 0 || index >= getPaletteList().length) return;
    if (index === getProjectUIState().paletteIndex) return;

    getProjectUIState().paletteIndex = index;
    state.saveToLocalStorage();

    refreshProjectUI();
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

/**
 * @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarState} state 
 */
function setCommonTileToolbarStates(state) {
    tileEditorToolbar.setState(state);
    tileEditorBottomToolbar.setState(state);
}

function getTileEditorHighlightMode() {
    switch (instanceState.tool) {
        case TileEditorToolbar.Tools.select:
        case TileEditorToolbar.Tools.tileStamp:
            return TileEditor.CanvasHighlightModes.tile;
        case TileEditorToolbar.Tools.palettePaint:
            return TileEditor.CanvasHighlightModes.tileBlock;
        case TileEditorToolbar.Tools.rowColumn:
            switch (instanceState.rowColumnMode) {
                case 'addRow':
                    return TileEditor.CanvasHighlightModes.rowBlockIndex;
                case 'deleteRow':
                    return TileEditor.CanvasHighlightModes.rowBlock;
                case 'addColumn':
                    return TileEditor.CanvasHighlightModes.columnBlockIndex;
                case 'deleteColumn':
                    return TileEditor.CanvasHighlightModes.columnBlock;
            }
            break;
        default:
            return TileEditor.CanvasHighlightModes.pixel;
    }
}

function observeResizeEvents() {
    const documentResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            resizeToolboxes(entry.target);
        });
    });
    documentResizeObserver.observe(document.body);
    document.querySelectorAll('[data-smsgfx-toolbox][data-smsgfx-toolbox-vertical]').forEach((elm) => {
        documentResizeObserver.observe(elm);
    });
}

/**
 * Resizes all toolboxes on the page so that content doesn't overflow the page.
 */
function resizeToolboxes() {
    document.querySelectorAll('[data-smsgfx-toolbox][data-smsgfx-toolbox-vertical]').forEach((toolboxElement) => {
        resizeToolbox(toolboxElement);
    });
}

/**
 * Resizes an individual toolbox element so that content doesn't overflow the page.
 * @param {HTMLElement} toolboxElement - Toolbox element that has the toolstrips in it.
 */
function resizeToolbox(toolboxElement) {
    if (toolboxElement) {

        const growElement = toolboxElement.querySelector('[data-smsgfx-toolbox-item][data-smsgfx-toolbox-grow]');
        if (growElement) {
            growElement.style.height = null;

            const toolboxRect = toolboxElement.getBoundingClientRect();
            const toolboxBottomYCoord = toolboxRect.top + toolboxRect.height;
            const viewportHeight = window.innerHeight;

            // Toolbox ends outside the viewport
            if (toolboxBottomYCoord > viewportHeight) {
                let newHeight = viewportHeight - toolboxRect.top - 60;
                toolboxElement.querySelectorAll('[data-smsgfx-toolbox-item]:not([data-smsgfx-toolbox-grow])').forEach((elm) => {
                    const rect = elm.getBoundingClientRect();
                    newHeight -= rect.height;
                });
                growElement.style.height = `${newHeight}px`;
            }
        }

    }
}


/* ****************************************************************************************************
   Initilisation
*/

window.addEventListener('load', async () => {

    instanceState.tool = 'pencil';
    instanceState.colourToolboxTab = 'rgb';

    await initialiseComponents();
    wireUpEventHandlers();
    createEventListeners();
    wireUpGenericComponents();

    // Load and set state
    state.loadFromLocalStorage();

    checkPersistentUIValues();

    // Load initial projects
    const projects = state.getProjectsFromLocalStorage();
    const project = projects.getProjectById(getUIState().lastProjectId);
    state.setProject(project);

    projectToolbar.setState({
        projects: projects
    });
    projectDropdown.setState({
        projects: projects
    });

    // Clean up unused project states
    Object.keys(getUIState().projectStates).forEach((projectId) => {
        if (!projects.containsProjectById(projectId)) {
            delete getUIState().projectStates[projectId];
        }
    });

    // Set up tool strips
    const strips = TileEditorToolbar.ToolStrips;
    if (isTileSet()) {
        tileEditorToolbar.setState({
            visibleToolstrips: [strips.tileAdd, strips.undo, strips.tileSetTools]
        });
    } else if (isTileMap()) {
        tileEditorToolbar.setState({
            visibleToolstrips: [strips.undo, strips.tileMapTools]
        });
    }
    tileEditorBottomToolbar.setState({
        visibleToolstrips: [strips.scale, strips.showTileGrid, strips.showPixelGrid]
    });

    tileContextToolbar.setState({
        rowColumnMode: instanceState.rowColumnMode,
        referenceTransparency: 15,
        referenceLockAspect: instanceState.referenceImageLockAspect
    });

    selectTool(instanceState.tool);

    document.querySelectorAll('[data-smsgfx-command=openDocumentationViewer]').forEach((elm) => {
        elm.onclick = () => {
            documentationViewer.setState({ visible: true });
            getUIState().documentationVisibleOnStartup = true;
            state.saveToLocalStorage();
            return false;
        };
    });

    documentationViewer.setState({
        visible: getUIState().documentationVisibleOnStartup
    });

    welcomeScreen.setState({
        visible: getUIState().welcomeVisibleOnStartup || getProject() instanceof Project === false,
        showWelcomeScreenOnStartUpChecked: getUIState().welcomeVisibleOnStartup,
        visibleCommands: getProject() instanceof Project === true ? ['dismiss'] : [],
        invisibleCommands: getProject() instanceof Project === false ? ['dismiss'] : [],
        projects: projects
    });

    optionsToolbar.setState({
        theme: getUIState().theme,
        welcomeOnStartUp: getUIState().welcomeVisibleOnStartup,
        documentationOnStartUp: getUIState().documentationVisibleOnStartup
    });

    exportDialogue.setState({
        optimiseTileMap: getUIState().exportOptimiseTileMap,
        paletteIndex: getUIState().exportTileMapPaletteIndex,
        vramOffset: getUIState().exportTileMapVramOffset
    });

    observeResizeEvents();

    setTimeout(() => themeManager.setTheme(getUIState().theme), 50);
});
