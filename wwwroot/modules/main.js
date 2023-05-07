import State from "./state.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import PaintUtil from "./util/paintUtil.js";
import ColourPickerDialogue from "./ui/colourPickerDialogue.js";
import ColourPickerToolbox from "./ui/colourPickerToolbox.js";
import PaletteModalDialogue from "./ui/paletteImportModalDialogue.js";
import TileSetImportModalDialogue from "./ui/tileSetImportModalDialogue.js";
import ExportModalDialogue from "./ui/exportModalDialogue.js";
import PaletteEditor from "./ui/paletteEditor.js";
import TileEditor from "./ui/tileEditor.js";
import TileEditorToolbar from "./ui/tileEditorToolbar.js";
import TileContextToolbar from "./ui/tileContextToolbar.js";
import ProjectToolbar from "./ui/projectToolbar.js";
import ExportToolbar from "./ui/exportToolbar.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import ProjectAssemblySerialiser from "./serialisers/projectAssemblySerialiser.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";
import UndoManager from "./components/undoManager.js";
import ProjectFactory from "./factory/projectFactory.js";
import PaletteListFactory from "./factory/paletteListFactory.js";
import TileUtil from "./util/tileUtil.js";
import ImportImageModalDialogue from "./ui/importImageModalDialogue.js";
import FileUtil from "./util/fileUtil.js";
import Project from "./models/project.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectWatcher from "./components/projectWatcher.js";
import ImageUtil from "./util/imageUtil.js";
import ReferenceImage from "./models/referenceImage.js";
import AboutModalDialogue from "./ui/aboutModalDialogue.js";
import PrivacyModalDialogue from "./ui/privacyModalDialogue.js";
import ProjectDropdown from "./ui/projectDropdown.js";
import GoogleAnalyticsManager from "./components/googleAnalyticsManager.js";
import DocumentationViewer from "./ui/documentationViewer.js";
import WelcomeScreen from "./ui/welcomeScreen.js";
import ThemeManager from "./components/themeManager.js";
import OptionsToolbar from "./ui/optionsToolbar.js";
import SerialisationUtil from "./util/serialisationUtil.js";


/* ****************************************************************************************************
   State
*/

const state = new State();

const instanceState = {
    /** @type {string} */
    tool: null,
    /** @type {number} */
    colourIndex: 0,
    /** @type {number} */
    startingColourIndex: 0,
    /** @type {number} */
    tileIndex: -1,
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
    ctrlIsDown: false,
    shiftIsDown: false,
    altIsDown: false,
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
                    changePalette(getUIState().paletteIndex + 1);
                    handled = true;
                } else if (keyEvent.code === 'ArrowUp') {
                    // Higher palette
                    changePalette(getUIState().paletteIndex - 1);
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
                    newProject({
                        systemType: getProject()?.systemType ?? 'smsgg'
                    });
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


/** @param {import('./components/projectWatcher').ProjectWatcherEventArgs} args */
function handleWatcherEvent(args) {
    switch (args.event) {

        case ProjectWatcher.Events.projectChanged:
            const project = getProject();
            if (project && args.project && args.project.id === project.id) {
                state.setProject(args.project);
            } else {
                tileEditor.setState({ tileSet: null });
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


/** @param {import('./ui/projectToolbar').ProjectToolbarCommandEventArgs} args */
function handleProjectToolbarOnCommand(args) {

    switch (args.command) {

        case ProjectToolbar.Commands.title:
            if (args.title) setProjectTitle(args.title);
            break;

        case ProjectToolbar.Commands.projectNew:
            newProject({
                systemType: getProject()?.systemType ?? 'smsgg'
            });
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

/** @param {import('./ui/projectDropdown').ProjectDropdownCommandEventArgs} args */
function handleProjectDropdownOnCommand(args) {
    switch (args.command) {

        case ProjectDropdown.Commands.title:
            if (args.title) setProjectTitle(args.title);
            break;

        case ProjectDropdown.Commands.projectNew:
            newProject({
                systemType: args.systemType ?? 'smsgg'
            });
            break;

        case ProjectDropdown.Commands.projectLoadFromFile:
            importProjectFromJson();
            break;

        case ProjectDropdown.Commands.projectSaveToFile:
            exportProjectToJson();
            break;

        case ProjectDropdown.Commands.projectLoadById:
            const projects = state.getProjectsFromLocalStorage();
            const project = projects.getProjectById(args.projectId);
            state.setProject(project);
            break;

        case ProjectDropdown.Commands.projectDelete:
            state.deleteProjectFromStorage(args.projectId);
            break;

        case ProjectDropdown.Commands.showWelcomeScreen:
            welcomeScreen.setState({ visible: true, visibleCommands: ['dismiss'] });
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
            getUIState().exportGenerateTileMap = args.generateTileMap;
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
            changePalette(args.paletteIndex);
            break;

        case PaletteEditor.Commands.paletteNew:
            newPalette();
            break;

        case PaletteEditor.Commands.paletteImport:
            paletteImportDialogue.setState({
                paletteData: getUIState().importPaletteAssemblyCode,
                system: getUIState().importPaletteSystem,
                allowedSystems: getProject().systemType !== 'gb' ? ['ms', 'gg'] : ['gb']
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


/** @param {import('./ui/tileContextToolbar.js').TileContextToolbarCommandEventArgs} args */
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
            selectTile(args.tileIndex);
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
                if (args.isPrimaryButton) {
                    takeToolAction({
                        tool: instanceState.tool,
                        colourIndex: instanceState.colourIndex,
                        imageX: args.x,
                        imageY: args.y,
                        event: TileEditor.Events.pixelMouseDown
                    });
                }
                break;

            case TileEditor.Events.pixelMouseOver:
                const tileSet = getTileSet();

                if (args.mousePrimaryIsDown) {
                    takeToolAction({
                        tool: instanceState.tool,
                        colourIndex: instanceState.colourIndex,
                        imageX: args.x,
                        imageY: args.y,
                        event: TileEditor.Events.pixelMouseOver
                    });
                }

                // Show the palette colour
                const pixel = tileSet.getPixelAt(args.x, args.y);
                if (pixel !== null) {
                    paletteEditor.setState({
                        highlightedColourIndex: pixel
                    });
                }
                break;

            case TileEditor.Events.pixelMouseUp:
                if (instanceState.undoDisabled) {
                    state.saveToLocalStorage();
                    instanceState.undoDisabled = false;
                }
                break;

        }
    }
}


/** @param {import('./ui/paletteImportModalDialogue').PaletteImportModalDialogueConfirmEventArgs} args */
function handleImportPaletteModalDialogueOnConfirm(args) {
    if (!['gg', 'ms', 'gb'].includes(args.system)) throw new Error('System must be either ""ms", "gg" or "gb".');

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

    const palette = getPaletteList().getPalette(getUIState().paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {

        const newColour = PaletteColourFactory.create(args.r, args.g, args.b);
        palette.setColour(args.index, newColour);

        paletteEditor.setState({
            paletteList: getPaletteList()
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
    changeColourIndex(getUIState().paletteIndex, args.index, { r: args.r, g: args.g, b: args.b })
    colourPickerDialogue.hide();
}

/**
 * User has cancelled the colour picker, restore the original colour.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {

    const palette = getPaletteList().getPalette(getUIState().paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {

        const restoreColour = PaletteColourFactory.create(args.originalR, args.originalG, args.originalB);
        palette.setColour(args.index, restoreColour);

        paletteEditor.setState({
            paletteList: getPaletteList()
        });
        tileEditor.setState({
            palette: palette
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
            changeColourIndex(getUIState().paletteIndex, instanceState.colourIndex, { r: args.r, g: args.g, b: args.b })
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
    let importedTileSet;
    const tileSetBinarySerialiser = SerialisationUtil.getTileSetBinarySerialiser(getProject().systemType);
    th
    importedTileSet = tileSetBinarySerialiser.deserialise(tileSetDataArray);

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

    getUIState().paletteIndex = getPaletteList().length - 1;

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
        palette: getPalette(),
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


/** @param {import("./ui/welcomeScreen").WelcomeScreenStateCommandEventArgs} args */
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
            newProject({
                systemType: getProject()?.systemType ?? 'smsgg'
            });
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
 * @argument {{systemType: string?}} args
 * @returns {Project}
 */
function createEmptyProject(args) {

    const systemType = args?.systemType ?? 'smsgg';
    const defaultTileColourIndex = systemType === 'smsgg' ? 15 : 3;
    const project = ProjectFactory.create({ title: 'New project', systemType: systemType });

    // Create a default tile set
    project.tileSet = TileSetFactory.create();
    project.tileSet.tileWidth = 8;
    for (let i = 0; i < 64; i++) {
        project.tileSet.addTile(TileFactory.create(defaultTileColourIndex));
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

    return project;
}

function checkPersistentUIValues() {
    let dirty = false;
    if (state.project && (state.persistentUIState.paletteIndex < 0 || state.persistentUIState.paletteIndex >= state.project.paletteList.length)) {
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
 * Helpers and general methods
 */

function getProject() {
    return state.project;
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
function getPaletteList() {
    return getProject()?.paletteList ?? null;
}
function getPalette() {
    if (getPaletteList().length > 0) {
        const paletteIndex = getUIState().paletteIndex;
        if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {
            return getPaletteList().getPalette(paletteIndex);
        } else {
            getUIState().paletteIndex = 0;
            return getPaletteList().getPalette(0);
        }
    } else return null;
}
function getUIState() {
    return state.persistentUIState;
}

function formatForProject() {
    const palette = getPalette();
    const tileSet = getTileSet();
    const colour = palette.getColour(instanceState.colourIndex);
    const visibleTabs = [];
    switch (getPalette().system) {
        case 'ms', 'gg': visibleTabs.push('rgb', 'sms'); break;
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
        selectedPaletteIndex: getUIState().paletteIndex,
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
        tileSet: tileSet,
        scale: getUIState().scale,
        displayNative: getUIState().displayNativeColour,
        cursorSize: instanceState.pencilSize,
        showTileGrid: getUIState().showTileGrid,
        showPixelGrid: getUIState().showPixelGrid,
        enabled: true
    });
    tileContextToolbar.setState({
        enabled: true
    })
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
        tileSet: null,
        enabled: false
    });
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
 * Performs the action for a tool.
 * @param {{
 *      tool: string, 
 *      colourIndex: number, 
 *      imageX: number, 
 *      imageY: number, 
 *      event: string?
 * }} args 
 */
function takeToolAction(args) {

    const tool = args.tool; const colourIndex = args.colourIndex;
    const event = args.event;
    const imageX = args.imageX; const imageY = args.imageY;

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === TileEditorToolbar.Tools.select) {

            const tileIndex = getTileSet().getTileIndexByCoordinate(imageX, imageY);
            selectTile(tileIndex);

            instanceState.lastTileMapPx.x = -1;
            instanceState.lastTileMapPx.y = -1;

        } else if (tool === TileEditorToolbar.Tools.pencil) {

            // CTRL not down, so draw pixel
            const lastPx = instanceState.lastTileMapPx;
            if (imageX !== lastPx.x || imageY !== lastPx.y) {
                addUndoState();
                if (!instanceState.undoDisabled) {
                    instanceState.undoDisabled = true;
                }

                instanceState.lastTileMapPx.x = imageX;
                instanceState.lastTileMapPx.y = imageY;

                const tileSet = getTileSet();
                const size = instanceState.pencilSize;
                const updatedTiles = PaintUtil.drawOnTileSet(tileSet, imageX, imageY, colourIndex, { brushSize: size, affectAdjacentTiles: true });

                if (updatedTiles.affectedTileIndexes.length > 0) {
                    tileEditor.setState({ updatedTiles: updatedTiles.affectedTileIndexes });
                }
            }

        } else if (tool === TileEditorToolbar.Tools.colourReplace) {

            const lastPx = instanceState.lastTileMapPx;
            if (imageX !== lastPx.x || imageY !== lastPx.y) {
                addUndoState();
                if (!instanceState.undoDisabled) {
                    instanceState.undoDisabled = true;
                }

                if (event === TileEditor.Events.pixelMouseDown) {
                    console.log(event); // PX MOUSE DOWN 
                    instanceState.startingColourIndex = getTileSet().getPixelAt(imageX, imageY);
                }

                instanceState.lastTileMapPx.x = imageX;
                instanceState.lastTileMapPx.y = imageY;

                const sourceColourindex = instanceState.startingColourIndex;
                const replacementColourIndex = colourIndex;
                const tileSet = getTileSet();
                const size = instanceState.pencilSize;
                const updatedTiles = PaintUtil.replaceColourOnTileSet(tileSet, imageX, imageY, sourceColourindex, replacementColourIndex, { brushSize: size, affectAdjacentTiles: true });

                if (updatedTiles.affectedTileIndexes.length > 0) {
                    tileEditor.setState({ updatedTiles: updatedTiles.affectedTileIndexes });
                }
            }

        } else if (tool === TileEditorToolbar.Tools.bucket) {

            addUndoState();
            PaintUtil.fillOnTileSet(getTileSet(), imageX, imageY, colourIndex)
            tileEditor.setState({ tileSet: getTileSet() });

            instanceState.lastTileMapPx.x = -1;
            instanceState.lastTileMapPx.y = -1;

        } else if (tool === TileEditorToolbar.Tools.eyedropper) {

            const colourIndex = getTileSet().getPixelAt(imageX, imageY);
            if (colourIndex !== null) {
                selectColourIndex(colourIndex);
            }

            instanceState.lastTileMapPx.x = -1;
            instanceState.lastTileMapPx.y = -1;

        }

    }

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

    const system = getProject().systemType === 'gb' ? 'gb' : 'ms';
    const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', system);
    getPaletteList().addPalette(newPalette);

    state.setProject(getProject());
    state.saveToLocalStorage();

    const selectedPaletteIndex = getPaletteList().length - 1;

    // Update state
    getUIState().paletteIndex = selectedPaletteIndex;
    paletteEditor.setState({
        paletteList: getPaletteList(),
        selectedPaletteIndex: selectedPaletteIndex
    });
    tileEditor.setState({
        palette: getPaletteList().getPalette(selectedPaletteIndex)
    });
}

function clonePalette(paletteIndex) {
    if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {

        addUndoState();

        const newPalette = PaletteFactory.clone(getPalette());
        newPalette.title += ' (copy)';

        getPaletteList().addPalette(newPalette);

        const newPaletteIndex = getPaletteList().length - 1;

        paletteEditor.setState({
            paletteList: getPaletteList(),
            selectedPaletteIndex: newPaletteIndex
        });
        tileEditor.setState({
            palette: getPalette()
        });

        getUIState().paletteIndex = newPaletteIndex;
        state.saveToLocalStorage();
    }
}

function deletePalette(paletteIndex) {
    if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {

        addUndoState();

        // Remove palette
        getPaletteList().removeAt(paletteIndex);
        const newSelectedIndex = Math.min(paletteIndex, getPaletteList().length - 1);
        // Select a remaining palette or create a default if none exists.
        if (getPaletteList().length > 0) {
            paletteEditor.setState({
                paletteList: getPaletteList(),
                selectedPaletteIndex: newSelectedIndex
            });
            getUIState().paletteIndex = newSelectedIndex;
        } else {
            const newPalette = PaletteFactory.createNewStandardColourPaletteBySystemType(getProject().systemType);
            getPaletteList().addPalette(newPalette);
            paletteEditor.setState({
                paletteList: getPaletteList(),
                selectedPaletteIndex: 0
            });
            getUIState().paletteIndex = 0;
        }

        // Refresh image
        tileEditor.setState({
            palette: getPalette()
        });

        state.saveToLocalStorage();
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
        palette: getPalette(),
        displayNative: getUIState().displayNativeColour
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
        tileSet: getTileSet(),
        palette: getPalette(),
        displayNative: getUIState().displayNativeColour
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
        palette: getPalette(),
        tileSet: getTileSet()
    });

    paletteEditor.setState({
        paletteList: getPaletteList()
    });
}

function replaceColourIndex(sourceColourIndex, targetColourIndex) {
    addUndoState();

    getTileSet().replaceColourIndex(sourceColourIndex, targetColourIndex);

    state.saveToLocalStorage();

    tileEditor.setState({
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
 * @argument {{systemType: string?}} args
 */
function newProject(args) {
    addUndoState();

    const newProject = createEmptyProject({
        systemType: args.systemType
    });
    state.setProject(newProject);
    getUIState().paletteIndex = 0;
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
        selectedPaletteIndex: getUIState().paletteIndex
    });
    setCommonTileToolbarStates({
        tileWidth: getTileSet().tileWidth
    });
    tileEditor.setState({
        palette: getPalette(),
        tileSet: getTileSet(),
        selectedTileIndex: instanceState.tileIndex
    });
    welcomeScreen.setState({ visible: false });
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
                getUIState().paletteIndex = 0;

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
    const code = ProjectAssemblySerialiser.serialise(getProject(), {
        generateTileMapFromTileSet: getUIState().exportGenerateTileMap,
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
        projectToolbar.setState({
            projectTitle: getProject().title
        });
        projectDropdown.setState({
            projectTitle: getProject().title
        });
        tileEditor.setState({
            tileSet: getTileSet(),
            palette: getPalette()
        });
        paletteEditor.setState({
            paletteList: getPaletteList()
        });
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
function selectTool(tool) {
    if (TileEditorToolbar.Tools[tool]) {
        const tools = TileEditorToolbar.Tools;
        instanceState.tool = tool;
        if (tool !== TileEditorToolbar.Tools.select) {
            instanceState.tileIndex = -1;
            tileEditor.setState({
                selectedTileIndex: instanceState.tileIndex
            });
        }

        let visibleStrips = [];
        if ([tools.pencil, tools.eyedropper, tools.bucket, tools.colourReplace].includes(tool)) {
            visibleStrips.push(TileContextToolbar.Toolstrips.pencil);
        }
        if ([tools.select].includes(tool)) {
            visibleStrips.push(TileContextToolbar.Toolstrips.select);
        }
        if ([tools.referenceImage].includes(tool)) {
            visibleStrips.push(TileContextToolbar.Toolstrips.referenceImage);
        }

        let cursor = 'arrow';
        let cursorSize = 1;
        if ([tools.eyedropper, tools.bucket].includes(tool)) {
            cursor = 'crosshair';
        } else if (tool === tools.pencil || tool === tools.colourReplace) {
            cursor = 'crosshair';
            cursorSize = instanceState.pencilSize;
        }

        setCommonTileToolbarStates({
            selectedTool: tool
        });
        tileContextToolbar.setState({
            visible: true,
            brushSize: instanceState.pencilSize,
            visibleToolstrips: visibleStrips
        });
        tileEditor.setState({
            cursor: cursor,
            cursorSize: cursorSize
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
function changePalette(index) {
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

/**
 * @param {import('./ui/tileEditorToolbar.js').TileEditorToolbarState} state 
 */
function setCommonTileToolbarStates(state) {
    tileEditorToolbar.setState(state);
    tileEditorBottomToolbar.setState(state);
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
    projectToolbar.setState({
        projects: projects
    });
    projectDropdown.setState({
        projects: projects
    });

    // Set up tool strips
    const strips = TileEditorToolbar.ToolStrips;
    tileEditorToolbar.setState({
        visibleToolstrips: [strips.tileAdd, strips.undo, strips.tools, strips.tileWidth]
    });
    tileEditorBottomToolbar.setState({
        visibleToolstrips: [strips.scale, strips.showTileGrid, strips.showPixelGrid]
    });

    tileContextToolbar.setState({
        referenceTransparency: 15,
        referenceLockAspect: instanceState.referenceImageLockAspect
    });

    selectTool(instanceState.tool);

    displaySelectedProject();

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
        invisibleCommands: getProject() instanceof Project === false ? ['dismiss'] : []
    });

    optionsToolbar.setState({
        theme: getUIState().theme,
        welcomeOnStartUp: getUIState().welcomeVisibleOnStartup,
        documentationOnStartUp: getUIState().documentationVisibleOnStartup
    });

    exportDialogue.setState({
        generateTileMapChecked: getUIState().exportGenerateTileMap,
        paletteIndex: getUIState().exportTileMapPaletteIndex,
        vramOffset: getUIState().exportTileMapVramOffset
    });

    setTimeout(() => themeManager.setTheme(getUIState().theme), 50);
});
