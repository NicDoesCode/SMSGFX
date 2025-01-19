import State from "./state.js";
import Engine from "./engine/engine.js";
import AssemblyUtil from "./util/assemblyUtil.js";
import ProjectUtil from "./util/projectUtil.js";
import PaletteFactory from "./factory/paletteFactory.js";
import TileFactory from "./factory/tileFactory.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import TileMapTileFactory from "./factory/tileMapTileFactory.js";
import PaletteColourFactory from "./factory/paletteColourFactory.js";
import UndoManager from "./components/undoManager.js";
import ConfigManager from "./components/configManager.js";
import ProjectFactory from "./factory/projectFactory.js";
import PaletteListFactory from "./factory/paletteListFactory.js";
import TileUtil from "./util/tileUtil.js";
import FileUtil from "./util/fileUtil.js";
import Project from "./models/project.js";
import ProjectEntry from "./models/projectEntry.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectWatcher from "./components/projectWatcher.js";
import ImageUtil from "./util/imageUtil.js";
import ReferenceImage from "./models/referenceImage.js";
import GoogleAnalyticsManager from "./components/googleAnalyticsManager.js";
import VersionManager from './components/versionManager.js';
import ThemeManager from "./components/themeManager.js";
import PatternManager from "./components/patternManager.js";
import SerialisationUtil from "./util/serialisationUtil.js";

import PaletteEditor from "./ui/paletteEditor.js";
import TileEditor from "./ui/tileEditor.js";
import TileManager from "./ui/tileManager.js";

import ColourPickerDialogue from "./ui/dialogues/colourPickerDialogue.js";
import AssemblyExportModalDialogue from "./ui/dialogues/assemblyExportModalDialogue.js";
import AssemblyImportTilesModalDialogue from "./ui/dialogues/assemblyImportTilesModalDialogue.js";
import ImportImageModalDialogue from "./ui/dialogues/importImageModalDialogue.js";
import NewProjectDialogue from "./ui/dialogues/newProjectDialogue.js";
import NewTileMapDialogue from "./ui/dialogues/newTileMapDialogue.js";
import PaletteModalDialogue from "./ui/dialogues/paletteImportModalDialogue.js";
import ProjectDropdown from "./ui/dialogues/projectDropdown.js";
import WelcomeScreen from "./ui/dialogues/welcomeScreen.js";
import PageModalDialogue from "./ui/dialogues/pageModalDialogue.js";

import ExportToolbar from "./ui/toolbars/exportToolbar.js";
import FeedbackToolbar from "./ui/toolbars/feedbackToolbar.js";
import OptionsToolbar from "./ui/toolbars/optionsToolbar.js";
import ProjectToolbar from "./ui/toolbars/projectToolbar.js";
import TileContextToolbar from "./ui/toolbars/tileContextToolbar.js";
import TileEditorToolbar from "./ui/toolbars/tileEditorToolbar.js";

import ColourPickerToolbox from "./ui/colourPickerToolbox.js";
import DocumentationViewer from "./ui/documentationViewer.js";
import Toast from "./ui/toast.js";
import TileMap from "./models/tileMap.js";
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
import TileSet from "./models/tileSet.js";
import SampleProjectManager from "./components/sampleProjectManager.js";
import KeyboardManager, { KeyDownHandler, KeyUpHandler } from "./components/keyboardManager.js";
import ProjectList from "./models/projectList.js";
import ProjectEntryList from "./models/projectEntryList.js";
import SystemUtil from "./util/systemUtil.js";
import { DropPosition } from "./types.js";
import TileMapUtil from "./util/tileMapUtil.js";
import PaintUtil from "./util/paintUtil.js";
import PaletteUtil from "./util/paletteUtil.js";
import TileMapList from "./models/tileMapList.js";


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
    secondaryColourIndex: 0,
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
    /** @type {number} */
    patternIndex: 0,
    /** @type {boolean} */
    patternFixedOrigin: true,
    /** @type {string?} */
    rowColumnMode: 'addRow',
    /** @type {string?} */
    rowColumnFillMode: TileMapRowColumnTool.TileFillMode.useSelected,
    /** @type {number} */
    paletteSlot: 0,
    /** @type {string?} */
    previousProjectId: null,
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
    /** @type {number} */
    referenceImageTransparencyIndex: 0,
    /** @type {HTMLImageElement} */
    referenceImageOriginal: null,
    /** @type {DOMRect} */
    referenceImageOriginalBounds: null,
    referenceImageLockAspect: true,
    referenceImageMoving: false,
    /** @type {import("./types.js").SampleProject[]} */
    sampleProjects: [],
    /** @type {import("./types.js").SortEntry?} */
    paletteSort: null,
    /** @type {import("./types.js").SortEntry?} */
    tileMapSort: null
};

const currentProject = {
    /** @type {PaletteList?} */
    nativePalettes: null
};


/* ****************************************************************************************************
   Components
*/

const undoManager = new UndoManager(50);
const watcher = new ProjectWatcher(instanceState.sessionId);
const googleAnalytics = new GoogleAnalyticsManager();
const themeManager = new ThemeManager();
const patternManager = new PatternManager();

/** @type {ProjectToolbar} */ let projectToolbar;
/** @type {ProjectDropdown} */ let projectDropdown;
/** @type {ExportToolbar} */ let exportToolbar;
/** @type {FeedbackToolbar} */ let feedbackToolbar;
/** @type {OptionsToolbar} */ let optionsToolbar;
/** @type {AssemblyExportModalDialogue} */ let assemblyExportDialogue;
/** @type {AssemblyImportTilesModalDialogue} */ let assemblyImportTilesModalDialogue;
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
/** @type {ImportImageModalDialogue} */ let importImageModalDialogue;
/** @type {DocumentationViewer} */ let documentationViewer;
/** @type {Toast} */ let toast;
/** @type {WelcomeScreen} */ let welcomeScreen;

async function initialiseComponents() {
    await googleAnalytics.injectIfConfiguredAsync();

    projectToolbar = await ProjectToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=project-toolbar]'));
    projectDropdown = await ProjectDropdown.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=project-dropdown]'));
    exportToolbar = await ExportToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=export-toolbar]'));
    feedbackToolbar = await FeedbackToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=feedback-toolbar]'));
    optionsToolbar = await OptionsToolbar.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=options-toolbar]'));
    assemblyExportDialogue = await AssemblyExportModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=assembly-export-dialogue]'));
    assemblyImportTilesModalDialogue = await AssemblyImportTilesModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=tile-import-dialogue]'));
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
    importImageModalDialogue = await ImportImageModalDialogue.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=import-image-modal]'));
    documentationViewer = await DocumentationViewer.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=documentation-viewer]'));
    toast = await Toast.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=toast]'));
    welcomeScreen = await WelcomeScreen.loadIntoAsync(document.querySelector('[data-smsgfx-component-id=welcome-screen]'));
}

async function wireUpGenericComponents() {
    document.querySelectorAll('[data-smsgfx-generic]').forEach((element) => {
        const command = element.getAttribute('data-smsgfx-generic');
        if (command === 'documentation' && ['A', 'BUTTON'].includes(element.tagName)) {
            element.addEventListener('click', (ev) => {
                documentationViewer.setState({ visible: true });
                getUIState().documentationVisibleOnStartup = true;
                state.saveToLocalStorage();
                ev.preventDefault();
            });
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
    feedbackToolbar.addHandlerOnCommand(handleFeedbackToolbarOnCommand);

    optionsToolbar.addHandlerOnCommand(handleOptionsToolbarOnCommand);

    assemblyExportDialogue.addHandlerOnCommand(handleAssemblyExportDialogueOnCommand);
    assemblyImportTilesModalDialogue.addHandlerOnConfirm(handleImportTileSet);

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

    importImageModalDialogue.addHandlerOnConfirm(handleImageImportModalOnConfirm);

    documentationViewer.addHandlerOnCommand(documentationViewerOnCommand);

    toast.addHandlerOnCommand(toastOnCommand);

    welcomeScreen.addHandlerOnCommand(welcomeScreenOnCommand);
}

const keyboardCommands = {
    undo: 'undo',
    redo: 'redo',
    cut: 'cut',
    copy: 'copy',
    paste: 'paste',
    duplicate: 'duplicate',
    exportCode: 'exportCode',
    jsonImport: 'jsonImport',
    jsonExport: 'jsonExport',
    control: 'control',
    brushBigger: 'brushBigger',
    brushSmaller: 'brushSmaller',
    brushMuchBigger: 'brushMuchBigger',
    brushMuchSmaller: 'brushMuchSmaller',
    projectNew: 'projectNew',
    paletteNew: 'paletteNew',
    paletteImportCode: 'paletteImportCode',
    paletteIndexLeft: 'paletteIndexLeft',
    paletteIndexRight: 'paletteIndexRight',
    paletteIndexHigher: 'paletteIndexHigher',
    paletteIndexLower: 'paletteIndexLower',
    paletteSwapPrimarySecondary: 'paletteSwapPrimarySecondary',
    tileNew: 'tileNew',
    tileDelete: 'tileDelete',
    tileMapNew: 'tileMapNew',
    tileMapIndexHigher: 'tileMapIndexHigher',
    tileMapIndexLower: 'tileMapIndexLower',
    tileImportCode: 'tileImportCode',
    tileImportImage: 'tileImportImage',
    tileMirrorHorizontal: 'tileMirrorHorizontal',
    tileMirrorVertical: 'tileMirrorVertical',
    toolSelect: 'toolSelect',
    toolPencil: 'toolPencil',
    toolPaintBucket: 'toolPaintBucket',
    toolColourReplace: 'toolColourReplace',
    toolReferenceImage: 'toolReferenceImage',
    toolBreakLink: 'toolBreakLink',
    toolRowColumn: 'toolRowColumn',
    toolTileStamp: 'toolTileStamp',
    toolTilePalettePaint: 'toolTilePalettePaint',
    toolEyedropper: 'toolEyedropper',
    viewportZoomIn: 'viewportZoomIn',
    viewportZoomOut: 'viewportZoomOut',
    viewportPanLeft: 'viewportPanLeft',
    viewportPanRight: 'viewportPanRight',
    viewportPanUp: 'viewportPanUp',
    viewportPanDown: 'viewportPanDown',
    selectUp: 'selectUp',
    selectDown: 'selectDown',
    selectLeft: 'selectLeft',
    selectRight: 'selectRight',
    moveUp: 'moveUp',
    moveDown: 'moveDown',
    moveLeft: 'moveLeft',
    moveRight: 'moveRight',
}

function createEventListeners() {

    const platform = navigator.userAgent.includes('(Macintosh;') ? 'mac' : 'pc';
    const keyboardManager = new KeyboardManager(platform);

    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.undo, [
        { modifiers: { control: true }, key: ['z', 'Z'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['z', 'Z'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.redo, [
        { modifiers: { control: true }, key: ['y', 'Y'] },
        { platform: 'mac', modifiers: { meta: true, shift: true }, key: ['z', 'Z'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.cut, [
        { modifiers: { control: true }, key: ['x', 'X'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['x', 'X'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.copy, [
        { modifiers: { control: true }, key: ['c', 'C'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['c', 'C'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paste, [
        { modifiers: { control: true }, key: ['v', 'V'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['v', 'V'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.duplicate, [
        { modifiers: { control: true }, key: ['d', 'D'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['d', 'D'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.exportCode, [
        { modifiers: { control: true, shift: true }, key: ['e', 'E'] },
        { platform: 'mac', modifiers: { meta: true, shift: true }, key: ['e', 'E'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.jsonImport, [
        { modifiers: { control: true }, key: ['o', 'O'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['o', 'O'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.jsonExport, [
        { modifiers: { control: true }, key: ['s', 'S'] },
        { platform: 'mac', modifiers: { meta: true }, key: ['s', 'S'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.projectNew, [
        { modifiers: { alt: true }, keySeries: [{ key: ['n', 'N'] }, { key: ['n', 'N'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyN' }, { code: 'KeyN' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteNew, [
        { modifiers: { alt: true }, keySeries: [{ key: ['n', 'N'] }, { key: ['p', 'P'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyN' }, { code: 'KeyP' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteImportCode, [
        { modifiers: { alt: true }, keySeries: [{ key: ['i', 'I'] }, { key: ['p', 'P'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyI' }, { code: 'KeyP' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteIndexLeft, [
        { modifiers: { shift: true }, keySeries: [{ key: ['<', ','] }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteIndexRight, [
        { modifiers: { shift: true }, keySeries: [{ key: ['>', ','] }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteIndexHigher, [
        { modifiers: { shift: true, control: true }, keySeries: [{ key: ['>', '.'] }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteIndexLower, [
        { modifiers: { shift: true, control: true }, keySeries: [{ key: ['<', ','] }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.paletteSwapPrimarySecondary, [
        { key: ['x', 'X'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileNew, [
        { modifiers: { alt: true }, keySeries: [{ key: ['n', 'N'] }, { key: ['t', 'T'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyN' }, { key: ['†', 'ˇ'], code: 'KeyT' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileDelete, [
        { key: 'Delete' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileImportCode, [
        { modifiers: { alt: true }, keySeries: [{ key: ['i', 'I'] }, { key: ['t', 'T'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyI' }, { key: ['†', 'ˇ'], code: 'KeyT' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileImportImage, [
        { modifiers: { alt: true }, keySeries: [{ key: ['i', 'I'] }, { key: ['i', 'I'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyI' }, { code: 'KeyI' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileMirrorHorizontal, [
        { modifiers: { alt: true }, key: ['[', '{', '“'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileMirrorVertical, [
        { modifiers: { alt: true }, key: [']', '}', '‘'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileMapNew, [
        { modifiers: { alt: true }, keySeries: [{ code: ['n', 'N'] }, { key: ['m', 'M'] }] },
        { platform: 'mac', modifiers: { alt: true }, keySeries: [{ code: 'KeyN' }, { key: ['µ', 'Â'], code: 'KeyM' }] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileMapIndexHigher, [
        { modifiers: { shift: true, alt: true }, key: ['>', '.', '˘'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.tileMapIndexLower, [
        { modifiers: { shift: true, alt: true }, key: ['<', ',', '¯'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.moveUp, [
        { modifiers: { alt: true }, key: 'ArrowUp' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.moveDown, [
        { modifiers: { alt: true }, key: 'ArrowDown' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.moveLeft, [
        { modifiers: { alt: true }, key: 'ArrowLeft' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.moveRight, [
        { modifiers: { alt: true }, key: 'ArrowRight' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.brushSmaller, [
        { modifiers: { control: true }, key: '[' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.brushBigger, [
        { modifiers: { control: true }, key: ']' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.brushMuchSmaller, [
        { modifiers: { control: true, shift: true }, key: '{' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.brushMuchBigger, [
        { modifiers: { control: true, shift: true }, key: '}' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolSelect, [
        { key: ['s', 'S'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolPencil, [
        { key: ['p', 'P'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolColourReplace, [
        { key: ['r', 'R'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolPaintBucket, [
        { key: ['b', 'B'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolEyedropper, [
        { key: ['i', 'I'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolReferenceImage, [
        { key: ['f', 'F'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolRowColumn, [
        { key: ['-', '_', '+', '='] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolBreakLink, [
        { key: ['l', 'L'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolTileStamp, [
        { key: ['s', 'S'], modifiers: { shift: true } }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.toolTilePalettePaint, [
        { key: ['c', 'C'] }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportZoomIn, [
        { modifiers: { shift: true }, key: ['=', '+'], code: 'NumpadAdd' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportZoomOut, [
        { modifiers: { shift: true }, key: ['-', '_'], code: 'NumpadSubtract' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanUp, [
        { modifiers: { shift: true }, key: 'ArrowUp' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanDown, [
        { modifiers: { shift: true }, key: 'ArrowDown' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanLeft, [
        { modifiers: { shift: true }, key: 'ArrowLeft' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanRight, [
        { modifiers: { shift: true }, key: 'ArrowRight' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanUp, [
        { modifiers: { shift: true, control: true }, key: 'ArrowUp' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanDown, [
        { modifiers: { shift: true, control: true }, key: 'ArrowDown' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanLeft, [
        { modifiers: { shift: true, control: true }, key: 'ArrowLeft' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.viewportPanRight, [
        { modifiers: { shift: true, control: true }, key: 'ArrowRight' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.selectUp, [
        { key: 'ArrowUp' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.selectDown, [
        { key: 'ArrowDown' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.selectLeft, [
        { key: 'ArrowLeft' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.selectRight, [
        { key: 'ArrowRight' }
    ]));
    keyboardManager.addKeyHandler(new KeyDownHandler(keyboardCommands.control, [
        { modifiers: { control: true }, key: 'Control' }
    ]));
    keyboardManager.addKeyHandler(new KeyUpHandler(keyboardCommands.control, [
        { key: 'Control' }
    ]));

    keyboardManager.addHandlerOnCommand((args) => {
        const keyEvent = args.keyboardEvent;

        if (keyEvent.target.tagName === 'INPUT') return;
        if (keyEvent.target.tagName === 'SELECT') return;
        if (keyEvent.target.tagName === 'TEXTAREA') return;

        let proposedIndex;

        switch (args.command) {
            case keyboardCommands.undo:
                undoOrRedo('u');
                break;
            case keyboardCommands.redo:
                undoOrRedo('r');
                break;
            case keyboardCommands.jsonImport:
                importProjectFromJson();
                break;
            case keyboardCommands.jsonExport:
                exportProjectToJson();
                break;
            case keyboardCommands.exportCode:
                displayExportToAssemblyDialogue();
                break;
            case keyboardCommands.brushBigger:
                restoreSwapTool();
                changePencilSize(1);
                break;
            case keyboardCommands.brushSmaller:
                restoreSwapTool();
                changePencilSize(-1);
                break;
            case keyboardCommands.brushMuchBigger:
                changePencilSize(5);
                break;
            case keyboardCommands.brushMuchSmaller:
                changePencilSize(-5);
                break;
            case keyboardCommands.projectNew:
                newProjectDialogue.setState({
                    title: 'New project',
                    systemType: getProject()?.systemType ?? NewProjectDialogue.Systems.smsgg,
                    selectedtilePreset: NewProjectDialogue.TilePresets["8x8"],
                    createTileMap: true
                });
                newProjectDialogue.show();
                break;
            case keyboardCommands.paletteNew:
                paletteNew();
                break;
            case keyboardCommands.paletteImportCode:
                paletteImportFromAssembly();
                break;
            case keyboardCommands.paletteIndexLeft:
                selectColourIndex(instanceState.colourIndex - 1);
                break;
            case keyboardCommands.paletteIndexRight:
                selectColourIndex(instanceState.colourIndex + 1);
                break;
            case keyboardCommands.paletteIndexHigher:
                paletteSelectByIndex(getProjectUIState().paletteIndex + 1);
                break;
            case keyboardCommands.paletteIndexLower:
                paletteSelectByIndex(getProjectUIState().paletteIndex - 1);
                break;
            case keyboardCommands.paletteSwapPrimarySecondary:
                swapPrimarySecondaryColourIndex();
                break;
            case keyboardCommands.tileNew:
                tileNew();
                break;
            case keyboardCommands.tileDelete:
                if (isTileSet() && instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                    tileRemoveByIndex(instanceState.tileIndex);
                }
                break;
            case keyboardCommands.tileImportCode:
                tilesImportFromAssembly();
                break;
            case keyboardCommands.tileImportImage:
                tilesImportFromImage();
                break;
            case keyboardCommands.tileMirrorHorizontal:
                if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileGrid().tileCount) {
                    if (isTileSet()) {
                        tileMirrorAtIndex('h', instanceState.tileIndex);
                    } else {
                        const tile = getTileMap().getTileByIndex(instanceState.tileIndex);
                        tile.horizontalFlip = !tile.horizontalFlip;
                        updateTilesOnEditors([tile.tileId]);
                    }
                }
                break;
            case keyboardCommands.tileMirrorVertical:
                if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileGrid().tileCount) {
                    if (isTileSet()) {
                        tileMirrorAtIndex('v', instanceState.tileIndex);
                    } else {
                        const tile = getTileMap().getTileByIndex(instanceState.tileIndex);
                        tile.verticalFlip = !tile.verticalFlip;
                        updateTilesOnEditors([tile.tileId]);
                    }
                }
                break;
            case keyboardCommands.moveUp:
                if (isTileSet()) {
                    proposedIndex = instanceState.tileIndex - getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        tileSwapByIndex(proposedIndex, instanceState.tileIndex);
                    }
                }
                break;
            case keyboardCommands.moveDown:
                if (isTileSet()) {
                    proposedIndex = instanceState.tileIndex + getTileSet().tileWidth;
                    if (proposedIndex >= 0 && proposedIndex < getTileSet().length) {
                        tileSwapByIndex(instanceState.tileIndex, proposedIndex);
                    }
                }
                break;
            case keyboardCommands.moveLeft:
                if (isTileSet()) {
                    if (instanceState.tileIndex > 0 && instanceState.tileIndex < getTileSet().length) {
                        tileSwapByIndex(instanceState.tileIndex - 1, instanceState.tileIndex);
                    }
                }
                break;
            case keyboardCommands.moveRight:
                if (isTileSet()) {
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length - 1) {
                        tileSwapByIndex(instanceState.tileIndex, instanceState.tileIndex + 1);
                    }
                }
                break;
            case keyboardCommands.tileMapNew:
                tileMapCreate();
                break;
            case keyboardCommands.tileMapIndexLower:
                if (isTileMap()) {
                    const index = getTileMapList().getTileMaps().findIndex((tm) => tm.tileMapId === getProjectUIState().tileMapId);
                    tileMapOrTileSetSelectByIndex(index - 1);
                } else {
                    tileMapOrTileSetSelectByIndex(getTileMapList().length - 1);
                }
                break;
            case keyboardCommands.tileMapIndexHigher:
                if (isTileMap()) {
                    const index = getTileMapList().getTileMaps().findIndex((tm) => tm.tileMapId === getProjectUIState().tileMapId);
                    tileMapOrTileSetSelectByIndex(index + 1);
                } else {
                    tileMapOrTileSetSelectByIndex(0);
                }
                break;
            case keyboardCommands.toolSelect:
                selectTool(isTileSet() ? TileEditorToolbar.Tools.select : TileEditorToolbar.Tools.tileMapTileMapTileAttributes);
                break;
            case keyboardCommands.toolPencil:
                selectTool(TileEditorToolbar.Tools.pencil);
                break;
            case keyboardCommands.toolPencil:
                selectTool(TileEditorToolbar.Tools.pencil);
                break;
            case keyboardCommands.toolPaintBucket:
                selectTool(TileEditorToolbar.Tools.bucket);
                break;
            case keyboardCommands.toolColourReplace:
                selectTool(TileEditorToolbar.Tools.colourReplace);
                break;
            case keyboardCommands.toolReferenceImage:
                selectTool(TileEditorToolbar.Tools.referenceImage);
                break;
            case keyboardCommands.toolBreakLink:
                if (isTileMap()) selectTool(TileEditorToolbar.Tools.tileLinkBreak);
                break;
            case keyboardCommands.toolRowColumn:
                if (isTileMap()) selectTool(TileEditorToolbar.Tools.rowColumn);
                break;
            case keyboardCommands.toolTileStamp:
                if (isTileMap()) selectTool(TileEditorToolbar.Tools.tileStamp);
                break;
            case keyboardCommands.toolTilePalettePaint:
                if (isTileMap()) selectTool(TileEditorToolbar.Tools.palettePaint);
                break;
            case keyboardCommands.toolEyedropper:
                if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
                    selectTool(TileEditorToolbar.Tools.tileEyedropper);
                } else {
                    selectTool(TileEditorToolbar.Tools.eyedropper);
                }
                break;
            case keyboardCommands.viewportZoomIn:
                increaseScale();
                break;
            case keyboardCommands.viewportZoomOut:
                decreaseScale();
                break;
            case keyboardCommands.viewportPanUp:
                tileEditor.setState({ viewportPanVertical: keyEvent.ctrlKey ? -250 : -50 });
                break;
            case keyboardCommands.viewportPanDown:
                tileEditor.setState({ viewportPanVertical: keyEvent.ctrlKey ? 250 : 50 });
                break;
            case keyboardCommands.viewportPanLeft:
                tileEditor.setState({ viewportPanHorizontal: keyEvent.ctrlKey ? -250 : -50 });
                break;
            case keyboardCommands.viewportPanRight:
                tileEditor.setState({ viewportPanHorizontal: keyEvent.ctrlKey ? 250 : 50 });
                break;
            case keyboardCommands.selectUp:
                proposedIndex = instanceState.tileIndex - getTileGrid().columnCount;
                if (proposedIndex >= 0 && proposedIndex < getTileGrid().tileCount) {
                    toggleTileIndexSelectedState(proposedIndex);
                }
                break;
            case keyboardCommands.selectDown:
                proposedIndex = instanceState.tileIndex + getTileGrid().columnCount;
                if (proposedIndex >= 0 && proposedIndex < getTileGrid().tileCount) {
                    toggleTileIndexSelectedState(proposedIndex);
                }
                break;
            case keyboardCommands.selectLeft:
                if (instanceState.tileIndex > 0 && instanceState.tileIndex < getTileGrid().tileCount) {
                    toggleTileIndexSelectedState(instanceState.tileIndex - 1);
                }
                break;
            case keyboardCommands.selectRight:
                if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileGrid().tileCount - 1) {
                    toggleTileIndexSelectedState(instanceState.tileIndex + 1);
                }
                break;
        }

        if (isTileSet()) {
            switch (args.command) {
                case keyboardCommands.cut:
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        tileCutToClipboardAtIndex(instanceState.tileIndex);
                    }
                    break;
                case keyboardCommands.copy:
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        tileCopyToClipboardFromIndex(instanceState.tileIndex);
                    }
                    break;
                case keyboardCommands.paste:
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        tilePasteAtIndex(instanceState.tileIndex);
                    }
                    break;
                case keyboardCommands.duplicate:
                    if (instanceState.tileIndex >= 0 && instanceState.tileIndex < getTileSet().length) {
                        tileCloneByIndex(instanceState.tileIndex);
                    }
                    break;
            }
        }

        if (args.type === KeyboardManager.types.keydown && args.command === keyboardCommands.control) {
            if (instanceState.tool === TileEditorToolbar.Tools.pencil) {
                selectTool(TileEditorToolbar.Tools.eyedropper);
                instanceState.swapTool = TileEditorToolbar.Tools.pencil;
            } else if (instanceState.tool === TileEditorToolbar.Tools.colourReplace) {
                selectTool(TileEditorToolbar.Tools.eyedropper);
                instanceState.swapTool = TileEditorToolbar.Tools.colourReplace;
            } else if (instanceState.tool === TileEditorToolbar.Tools.bucket) {
                selectTool(TileEditorToolbar.Tools.eyedropper);
                instanceState.swapTool = TileEditorToolbar.Tools.bucket;
            } else if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
                selectTool(TileEditorToolbar.Tools.tileEyedropper);
                instanceState.swapTool = TileEditorToolbar.Tools.tileStamp;
            }
        } else if (args.type === KeyboardManager.types.keyup && args.command === keyboardCommands.control) {
            restoreSwapTool();
        }

        args.preventDefault();
        args.stopImmediatePropagation();
    });

    document.addEventListener('blur', (e) => {
        restoreSwapTool();
    });

    document.addEventListener('paste', (clipboardEvent) => {
        if (clipboardEvent.clipboardData?.files?.length > 0) {
            const targetTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
            const file = clipboardEvent.clipboardData.files[0];
            if (targetTypes.includes(file.type)) {
                tilesImportFromImage(file);
            }
        } else {
            /** @type {string} */
            let pasteData = (clipboardEvent.clipboardData || window.clipboardData).getData('text');
            if (typeof pasteData === 'string' && pasteData.length === 128 && /^[0-9a-f]+$/i.test(pasteData)) {
                if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileSet().length) {
                    instanceState.tileIndex = getTileSet().length;
                }
                instanceState.tileClipboard = pasteData;
                tilePasteAtIndex(instanceState.tileIndex);
            }
        }
    });
}


/** 
 * Project watcher was notified of a project change from another window
 * @param {import('./components/projectWatcher.js').ProjectWatcherEventArgs} args 
 */
function handleWatcherEvent(args) {
    switch (args.event) {

        case ProjectWatcher.Events.projectChanged:
            const project = getProject();
            const sameProjectInRemoteWindowAsThisOne = project && args.project && args.project.id === project.id;
            if (sameProjectInRemoteWindowAsThisOne) {
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
            uiRefreshProjectLists();
            break;

        case ProjectWatcher.Events.projectListChanged:
            setTimeout(() => {
                uiRefreshProjectLists();
            }, 50);
            break;

    }
}


/** @param {import('./state.js').StateEventArgs} args */
function handleStateEvent(args) {
    switch (args.event) {

        case State.Events.projectChanged:
            const projectChanged = args.projectId !== args.previousProjectId;
            if (projectChanged) {
                currentProject.nativePalettes = null;
                // Set this as the last used project ID in storage
                getUIState().lastProjectId = args.projectId;
                state.savePersistentUIStateToLocalStorage();
                // Update instance details
                instanceState.previousProjectId = args.previousProjectId;
                resetViewportToCentre();
                // Push the new project to window history to make the back and forward buttons work 
                // (as long as this project change wasn't due to 'history' ie. the user clicking back or forward buttons)
                if (args.context !== State.Contexts.history) {
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('project', args.projectId);
                    if (args.context === State.Contexts.init) {
                        window.history.replaceState({ projectId: args.projectId }, '', newUrl);
                    } else {
                        window.history.pushState({ projectId: args.projectId }, '', newUrl);
                    }
                }
            }
            displaySelectedProject();
            break;

        case State.Events.projectUpdated:
            displaySelectedProject();
            break;

        case State.Events.projectSaved:
            const project = getProject();
            watcher.sendProjectChanged(project);
            break;

        case State.Events.projectListChanged:
            uiRefreshProjectLists();
            watcher.sendProjectListChanged();
            if (args.context === State.Contexts.deleted) {
                toast.show('Project deleted.');
            }
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
            state.setProjectById(args.projectId);
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
async function handleProjectDropdownOnCommand(args) {
    const projectEntries = state.getProjectEntries();
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

        case ProjectDropdown.Commands.projectLink:
            const url = new URL(window.location);
            url.hash = '';
            url.search = '';
            url.searchParams.set('project', getProject().id);
            navigator.clipboard.writeText(url.toString()).then(() => {
                toast.show('Project link copied to clipboard.');
            });
            break;

        case ProjectDropdown.Commands.projectLoadById:
            state.setProjectById(args.projectId);
            projectDropdown.setState({ visible: false });
            break;

        case ProjectDropdown.Commands.projectDelete:
            state.deleteProjectFromStorage(args.projectId);
            break;

        case ProjectDropdown.Commands.projectSort:
            const sort = getUIState().projectDropDownSort ?? {};
            if (args.sortField === 'dateLastModified') {
                sort.direction = sort.field !== args.sortField || !sort.direction || sort.direction === 'asc' ? 'desc' : 'asc';
                sort.field = args.sortField;
            } else if (args.sortField === 'title') {
                sort.direction = sort.field !== args.sortField || !sort.direction || sort.direction === 'desc' ? 'asc' : 'desc';
                sort.field = args.sortField;
            } else {
                sort = {};
            }
            getUIState().projectDropDownSort = sort;
            state.savePersistentUIStateToLocalStorage();
            projectDropdown.setState({
                projects: getSortedProjectArray(projectEntries, sort)
            });
            break;

        case ProjectDropdown.Commands.sampleProjectSelect:
            await loadSampleProjectAsync(args.sampleProjectId);
            projectDropdown.setState({ visible: false });
            uiRefreshProjectLists();
            toast.show('Sample project loaded.');
            break;

        case ProjectDropdown.Commands.showWelcomeScreen:
            welcomeScreen.setState({
                visible: true,
                projects: getSortedProjectArray(projectEntries, getUIState().projectDropDownSort),
                visibleCommands: ['dismiss']
            });
            projectDropdown.setState({ visible: false });
            break;

    }
}

function handleProjectDropdownOnHidden() {
    if (getProject() instanceof Project === false) {
        welcomeScreen.setState({
            visible: true,
            invisibleCommands: ['dismiss']
        });
    }
}

/** @param {import('./ui/toolbars/exportToolbar.js').ExportToolbarCommandEventArgs} args */
function handleExportToolbarOnCommand(args) {

    switch (args.command) {

        case ExportToolbar.Commands.exportCode:
            displayExportToAssemblyDialogue();
            break;

        case ExportToolbar.Commands.exportImage:
            exportCurrentTileGridAsImage();
            break;

    }
}

/** @param {import('./ui/toolbars/feedbackToolbar.js').FeedbackToolbarCommandEventArgs} args */
function handleFeedbackToolbarOnCommand(args) {

    switch (args.command) {
    }

}

/** @param {import('./ui/toolbars/optionsToolbar.js').OptionsToolbarCommandEventArgs} args */
function handleOptionsToolbarOnCommand(args) {

    switch (args.command) {

        case OptionsToolbar.Commands.changeTheme:
            getUIState().theme = args.theme;
            state.savePersistentUIStateToLocalStorage();
            themeManager.setTheme(args.theme);
            break;

        case OptionsToolbar.Commands.changeBackgroundTheme:
            getUIState().backgroundTheme = args.backgroundTheme;
            state.savePersistentUIStateToLocalStorage();
            themeManager.setBackgroundTheme(args.backgroundTheme);
            break;

        case OptionsToolbar.Commands.changeWelcomeOnStartUp:
            getUIState().welcomeVisibleOnStartup = args.welcomeOnStartUp;
            state.savePersistentUIStateToLocalStorage();
            break;

        case OptionsToolbar.Commands.changeDocumentationOnStartUp:
            getUIState().documentationVisibleOnStartup = args.documentationOnStartUp;
            state.savePersistentUIStateToLocalStorage();
            break;

    }
}

/** @param {import('./ui/dialogues/assemblyExportModalDialogue.js').AssemblyExportDialogueCommandEventArgs} args */
function handleAssemblyExportDialogueOnCommand(args) {
    const command = args.command;
    const commands = AssemblyExportModalDialogue.Commands;
    if (command === commands.update || command === commands.clipboard || command === commands.download) {

        const code = getExportAssemblyCode(args.selectedTileMapIds, args.optimiseMode, args.vramOffset, {
            tileMaps: args.exportTileMaps,
            tileSet: args.exportTileSet,
            palettes: args.exportPalettes
        });

        // Save state
        getProjectAssemblyExportState().tileMapIds = args.selectedTileMapIds;
        getProjectAssemblyExportState().optimiseMode = args.selectedTileoptimiseModeMapIds;
        getProjectAssemblyExportState().vramOffset = args.vramOffset;
        getProjectAssemblyExportState().exportTileMaps = args.exportTileMaps;
        getProjectAssemblyExportState().exportTileSet = args.exportTileSet;
        getProjectAssemblyExportState().exportPalettes = args.exportPalettes;
        state.savePersistentUIStateToLocalStorage();

        if (command === commands.update) {
            assemblyExportDialogue.setState({ content: code });
        } else if (command === commands.clipboard) {
            navigator.clipboard.writeText(code);
            toast.show('Code copied to clipboard.');
        } else if (command === commands.download) {
            downloadAssemblyCode(code);
        }

    }
}

/** @param {import('./ui/paletteEditor').PaletteEditorCommandEventArgs} args */
function handlePaletteEditorOnCommand(args) {
    switch (args.command) {
        case PaletteEditor.Commands.paletteSelect:
            if (args.paletteId) {
                paletteSelectById(args.paletteId);
            } else {
                paletteSelectByIndex(args.paletteIndex);
            }
            break;

        case PaletteEditor.Commands.paletteChangePosition:
            paletteReorder(args.paletteId, args.targetPaletteId, args.targetPosition);
            break;

        case PaletteEditor.Commands.paletteNew:
            paletteNew();
            break;

        case PaletteEditor.Commands.paletteImport:
            paletteImportFromAssembly();
            break;

        case PaletteEditor.Commands.paletteClone:
            paletteClone(args.paletteIndex);
            break;

        case PaletteEditor.Commands.paletteDelete:
            paletteDelete(args.paletteIndex);
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

        case PaletteEditor.Commands.sort:
            if (typeof args.field === 'string' || args.field === null) {
                paletteListSort(args.field);
            }
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
            tilesImportFromImage();
            break;
        case TileEditorToolbar.Commands.tileCodeImport:
            tilesImportFromAssembly();
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
        case TileEditorToolbar.Commands.highlightSameTiles:
            getUIState().highlightSameTiles = args.highlightSameTiles;
            state.saveToLocalStorage();
            tileEditor.setState({ highlightSameTiles: args.highlightSameTiles });
            break;
    }
}


/** @param {import('./ui/toolbars/tileContextToolbar.js').TileContextToolbarCommandEventArgs} args */
function handleTileContextToolbarCommand(args) {
    if (instanceState.tileIndex > -1 && instanceState.tileIndex < getTileSet().length) {

        switch (args.command) {

            case TileContextToolbar.Commands.cut:
                tileCutToClipboardAtIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.copy:
                tileCopyToClipboardFromIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.paste:
                tilePasteAtIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.clone:
                tileCloneByIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.remove:
                tileRemoveByIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.moveLeft:
                if (instanceState.tileIndex > 0) {
                    tileSwapByIndex(instanceState.tileIndex - 1, instanceState.tileIndex);
                }
                break;

            case TileContextToolbar.Commands.moveRight:
                if (instanceState.tileIndex < getTile().length - 1) {
                    tileSwapByIndex(instanceState.tileIndex, instanceState.tileIndex + 1);
                }
                break;

            case TileContextToolbar.Commands.mirrorHorizontal:
                tileMirrorAtIndex('h', instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.mirrorVertical:
                tileMirrorAtIndex('v', instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.insertBefore:
                tileInsertAtIndex(instanceState.tileIndex);
                break;

            case TileContextToolbar.Commands.insertAfter:
                tileInsertAtIndex(instanceState.tileIndex + 1);
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
    if (args.command === TileContextToolbar.Commands.tileSetTileAttributes) {
        setTileSetTileAttributes(args.tileSetTileAttributes);
    }
    if (args.command === TileContextToolbar.Commands.tileMapTileAttributes) {
        setTileMapTileAttributes(args.tileMapTileAttributes);
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
    if (args.command === TileContextToolbar.Commands.patternIndex) {
        setPatternIndex(args.patternIndex);
    }
    if (args.command === TileContextToolbar.Commands.patternFixedOrigin) {
        setPatternFixedOrigin(args.patternFixedOrigin);
    }
    if (args.command === TileContextToolbar.Commands.colourIndex) {
        setColourIndex(args.colourIndex);
    }
    if (args.command === TileContextToolbar.Commands.secondaryColourIndex) {
        setSecondaryColourIndex(args.secondaryColourIndex);
    }
    if (args.command === TileContextToolbar.Commands.swapColourIndex) {
        swapPrimarySecondaryColourIndex();
    }
}


/** @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args */
function handleTileManagerOnCommand(args) {
    switch (args.command) {

        case TileManager.Commands.tileMapNew:
            tileMapCreate();
            break;

        case TileManager.Commands.tileSetToTileMap:
            tileMapCreateFromTileSet();
            break;

        case TileManager.Commands.tileSetSelect:
            tileMapOrTileSetSelectById();
            break;

        case TileManager.Commands.tileMapSelect:
            tileMapOrTileSetSelectById(args.tileMapId);
            break;

        case TileManager.Commands.tileMapChangePosition:
            tileMapReorder(args.tileMapId, args.targetTileMapId, args.targetPosition);
            break;

        case TileManager.Commands.sort:
            tileMapSort(args.field);
            break;

        case TileManager.Commands.tileSelect:
            tileSetTileSelectById(args.tileId);
            break;

        case TileManager.Commands.tileHighlight:
            tileHighlightById(args.tileId);
            break;

        case TileManager.Commands.tileMapClone:
            tileMapClone(args.tileMapId);
            break;

        case TileManager.Commands.tileMapCloneMirror:
            tileMapClone(args.tileMapId, { mirror: true });
            break;

        case TileManager.Commands.tileMapDelete:
            tileMapRemove(args.tileMapId);
            break;

        case TileManager.Commands.tileMapChange:
            tileMapUpdate(args.tileMapId, args);
            break;

        case TileManager.Commands.tileMapMirror:
            tileMapMirrorOrFlip(args.tileMapId, { mirror: true });
            break;

        case TileManager.Commands.tileMapFlip:
            tileMapMirrorOrFlip(args.tileMapId, { flip: true });
            break;

        case TileManager.Commands.tileMapReference:
            referenceImageFromTileMap(args.tileMapId);
            break;

        case TileManager.Commands.tileSetChange:
            tileSetUpdate(args);
            break;

        case TileManager.Commands.assemblyImport:
            tilesImportFromAssembly();
            break;

    }
}


/** @param {import("./ui/tileEditor.js").TileEditorCommandEventArgs} args */
function handleTileEditorOnCommand(args) {
    switch (args.command) {

        case TileEditor.Commands.clone:
            tileCloneByIndex(args.tileIndex);
            break;

        case TileEditor.Commands.insertAfter:
            tileInsertAtIndex(args.tileIndex + 1);
            break;

        case TileEditor.Commands.insertBefore:
            tileInsertAtIndex(args.tileIndex);
            break;

        case TileEditor.Commands.mirrorHorizontal:
            tileMirrorAtIndex('h', args.tileIndex);
            break;

        case TileEditor.Commands.mirrorVertical:
            tileMirrorAtIndex('v', args.tileIndex);
            break;

        case TileEditor.Commands.moveLeft:
            if (!args || typeof args.tileIndex !== 'number') return;
            if (args.tileIndex > 0 && args.tileIndex < getTileSet().length) {
                tileSwapByIndex(args.tileIndex - 1, args.tileIndex);
            }
            break;

        case TileEditor.Commands.moveRight:
            if (!args || typeof args.tileIndex !== 'number') return;
            if (args.tileIndex >= 0 && args.tileIndex < getTileSet().length - 1) {
                tileSwapByIndex(args.tileIndex, args.tileIndex + 1);
            }
            break;

        case TileEditor.Commands.remove:
            tileRemoveByIndex(args.tileIndex);
            break;

        case TileEditor.Commands.selectTile:
            toggleTileIndexSelectedState(args.tileIndex);
            break;

        case TileEditor.Commands.zoomIn:
            increaseScale(true);
            break;

        case TileEditor.Commands.zoomOut:
            decreaseScale(true);
            break;
    }
}

/** @param {import("./ui/tileEditor.js").TileEditorEventArgs} args */
function handleTileEditorOnEvent(args) {
    if (instanceState.tool === TileEditorToolbar.Tools.referenceImage) {
        takeReferenceImageAction(args);
    } else {
        switch (args.event) {

            case TileEditor.Events.tileGridImage:
                if (args.tileGridImage instanceof ImageBitmap) {
                    exportImage(args.tileGridImage);
                }
                break;

            case TileEditor.Events.pixelMouseDown:
                instanceState.operationTileIndex = getTileGrid().getTileIndexByCoordinate(args.x, args.y);
                if (args.isPrimaryButton) {
                    const result = takeToolAction({
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
                    if (result?.saveProject) {
                        state.saveToLocalStorage();
                    }
                }
                break;

            case TileEditor.Events.pixelMouseOver:
                if (args.mousePrimaryIsDown) {
                    const result = takeToolAction({
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
                    if (result?.saveProject) {
                        state.saveToLocalStorage();
                    }
                }

                if (args.isInBounds) {
                    const tools = TileEditorToolbar.Tools;
                    if ([tools.select, tools.tileEyedropper, tools.tileLinkBreak, tools.tileMapTileAttributes].includes(instanceState.tool)) {
                        const tileInfo = getTileGrid().getTileInfoByRowAndColumn(args.tileGridRowIndex, args.tileGridColumnIndex);
                        tileHighlightById(tileInfo.tileId);
                    } else {
                        tileHighlightById(null);
                    }
                } else {
                    tileHighlightById(null);
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
    projectNew({
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

        state.saveToLocalStorage();

        tileMapOrTileSetSelectById(newTileMap.tileMapId);

        newTileMapDialogue.hide();

        toast.show('Tile map created.');

    } catch (e) {
        toast.show('Error creating tile map.');
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

    currentProject.nativePalettes = null;

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        selectedPaletteIndex: getProjectUIState().paletteIndex
    });
    tileManager.setState({
        paletteList: getRenderPaletteList()
    });
    tileEditor.setState({
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });

    paletteImportDialogue.hide();
    toast.show('Palette imported.');
}

/**
 * User is playing with the colour picker, provide a live preview.
 * @param {import('./ui/colourPickerDialogue').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerChange(args) {
    const currentColour = getPalette().getColour(args.index);
    if (args.r !== currentColour.r || args.g !== currentColour.g || args.b !== currentColour.b) {
        paletteSetColourAtIndexWithoutSaving(getProjectUIState().paletteIndex, args.index, { r: args.r, g: args.g, b: args.b })
    }
}

/**
 * User has confirmed their colour choice, finalise the colour selection and save.
 * @param {import('./ui/dialogues/colourPickerDialogue.js').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerConfirm(args) {
    paletteSetColourAtIndex(getProjectUIState().paletteIndex, args.index, { r: args.r, g: args.g, b: args.b })
    colourPickerDialogue.hide();
}

/**
 * User has cancelled the colour picker, restore the original colour.
 * @param {import('./ui/dialogues/colourPickerDialogue.js').ColourPickerDialogueColourEventArgs} args - Event args.
 */
function handleColourPickerCancel(args) {

    const palette = getPaletteList().getPalette(getProjectUIState().paletteIndex);
    const currentColour = palette.getColour(args.index);

    if (args.originalR !== currentColour.r || args.originalG !== currentColour.g || args.originalB !== currentColour.b) {
        paletteSetColourAtIndex(getProjectUIState().paletteIndex, args.index, { r: args.originalR, g: args.originalG, b: args.originalB })
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
            paletteSetColourAtIndex(getProjectUIState().paletteIndex, instanceState.colourIndex, { r: args.r, g: args.g, b: args.b })
            break;

    }
}


/**
 * @param {number} paletteIndex
 * @param {number} colourIndex
 * @param {import('./types.js').ColourInformation} colour
 */
function paletteSetColourAtIndexWithoutSaving(paletteIndex, colourIndex, colour) {
    currentProject.nativePalettes = null;

    const palette = getPaletteList().getPalette(paletteIndex);

    const newColour = PaletteColourFactory.create(colour.r, colour.g, colour.b);
    palette.setColour(colourIndex, newColour);

    currentProject.nativePalettes = null;

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileManager.setState({
        palette: getRenderPalette(),
        paletteList: getRenderPaletteList(),
        tileSet: getTileSet()
    });
    tileEditor.setState({
        palette: getRenderPalette(),
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        forceRefresh: true
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
}

/**
 * @param {number} paletteIndex
 * @param {number} colourIndex
 * @param {import('./types.js').ColourInformation} colour
 */
function paletteSetColourAtIndex(paletteIndex, colourIndex, colour) {
    addUndoState();
    paletteSetColourAtIndexWithoutSaving(paletteIndex, colourIndex, colour);
    state.saveProjectToLocalStorage();
}


/**
 * Import tile set from assembly dialogue is confirmed.
 * @param {import('./ui/dialogues/assemblyImportTilesModalDialogue.js').AssemblyImportTilesModalDialogueConfirmEventArgs} args - Arguments.
 */
function handleImportTileSet(args) {
    addUndoState();

    const tileSetData = args.tileSetData;
    const tileSetDataArray = AssemblyUtil.readAsUint8ClampedArray(tileSetData);
    const tileSetBinarySerialiser = SerialisationUtil.getTileSetBinarySerialiser(getProject().systemType);
    const importedTileSet = tileSetBinarySerialiser.deserialise(tileSetDataArray);

    importedTileSet.getTiles().forEach(importedTile => {
        getTileSet().addTile(importedTile);
    });

    getUIState().importTileAssemblyCode = args.tileSetData;
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

    assemblyImportTilesModalDialogue.hide();
    toast.show('Tile data imported.');
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

    state.saveToLocalStorage();

    currentProject.nativePalettes = null;

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        selectedPaletteIndex: getRenderPaletteList().length - 1
    });
    setCommonTileToolbarStates({
        tileWidth: getTileSet().tileWidth
    });
    const focusedTile = (Math.floor(getTileGrid().rowCount / 2) * getTileGrid().columnCount) + (Math.floor(getTileGrid().columnCount) / 2);
    tileEditor.setState({
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        tileGrid: getTileGrid(),
        tileSet: getTileSet(),
        focusedTile: focusedTile
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
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


/** @param {import("./ui/toast.js").ToastCommandEventArgs} args */
function toastOnCommand(args) {
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
            state.setProjectById(args.projectId);
            welcomeScreen.setState({ visible: false });
            break;

        case WelcomeScreen.Commands.projectLoadFromFile:
            importProjectFromJson();
            break;

        case WelcomeScreen.Commands.projectSort:
            const sort = getUIState().welcomeScreenProjectSort ?? {};
            if (args.sortField === 'dateLastModified') {
                sort.direction = sort.field !== args.sortField || !sort.direction || sort.direction === 'asc' ? 'desc' : 'asc';
                sort.field = args.sortField;
            } else if (args.sortField === 'title') {
                sort.direction = sort.field !== args.sortField || !sort.direction || sort.direction === 'desc' ? 'asc' : 'desc';
                sort.field = args.sortField;
            } else {
                sort = {};
            }
            getUIState().welcomeScreenProjectSort = sort;
            state.savePersistentUIStateToLocalStorage();
            welcomeScreen.setState({
                projects: getSortedProjectArray(state.getProjectEntries(), sort)
            });
            break;

        case WelcomeScreen.Commands.tileImageImport:
            tilesImportFromImage();
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
    const projects = state.getProjectEntries();
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
    const defaultTileColourIndex = 0;
    const project = ProjectFactory.create({ title: title, systemType: systemType });

    // Create a default tile set
    project.tileSet = TileSetFactory.create({
        tileWidth: args.tileWidth ?? 8,
        numberOfTiles: args.createTileMap ? args.tileWidth * args.tileHeight : 64,
        defaultColourIndex: defaultTileColourIndex
    });

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
    if (!state.persistentUIState.projectDropDownSort?.field) {
        state.persistentUIState.projectDropDownSort = {
            field: 'title',
            direction: 'asc'
        };
        dirty = true;
    }
    if (!state.persistentUIState.welcomeScreenProjectSort?.field) {
        state.persistentUIState.welcomeScreenProjectSort = {
            field: 'title',
            direction: 'asc'
        };
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
 * Returns the entire project render palette list (native colours or default)
 * @returns {PaletteList}
 */
function getRenderPaletteList() {
    if (!getProject()?.paletteList) return null;
    if (!currentProject.nativePalettes) {
        currentProject.nativePalettes = PaletteUtil.clonePaletteListWithNativeColours(getProject().paletteList, { preserveIds: true });
    }
    if (getUIState().displayNativeColour) {
        return currentProject.nativePalettes;
    } else {
        return getProject().paletteList;
    }
}
/**
 * Gets the render palette list (native colours or default) for the tile editor to used which is based on selected 
 * console limitations, as well as tile map settings, like locking in a colour
 * @returns {PaletteList}
 */
function getPaletteListToSuitTileMapOrTileSetSelection() {
    if (isTileMap()) {
        // Tile map, return a palette list, fill it with selected palettes sequentially
        // when we exceed the amount of allowed palettes in the tile map, instead just repeat
        // the last selected palette.
        const capability = SystemUtil.getGraphicsCapability(getProject().systemType, getTileMap().isSprite ? 'sprite' : 'background');
        const paletteList = PaletteListFactory.create();
        let lastGoodPalette = PaletteFactory.createNewStandardColourPaletteBySystemType(getProject().systemType);
        for (let i = 0; i < capability.totalPaletteSlots; i++) {
            const paletteId = getTileMap().getPalette(i);
            let palette = getPaletteList().getPaletteById(paletteId);
            if (palette) {
                lastGoodPalette = palette;
            } else {
                palette = PaletteFactory.createNewStandardColourPaletteBySystemType(getProject().systemType);
            }
            paletteList.addPalette(palette);
        }
        return paletteList;
    } else {
        // With a tile set, just select the palette that is selected in the palette list on the left
        const palette = getPaletteList().getPalette(getProjectUIState().paletteIndex);
        return PaletteListFactory.create([palette]);
    }
}
/**
 * Gets the palette list for the tile editor to used which is based on selected console limitations, as well as
 * tile map settings, like locking in a colour
 * @returns {PaletteList}
 */
function getRenderPaletteListToSuitTileMapOrTileSetSelection() {
    const paletteList = getPaletteListToSuitTileMapOrTileSetSelection();
    if (getUIState().displayNativeColour) {
        return PaletteUtil.clonePaletteListWithNativeColours(paletteList, { preserveIds: true });
    } else {
        return paletteList;
    }
}
/**
 * Gets the currently selected palette.
 * @param {PaletteList?} customPaletteList - Custom palette list to obtain palette from.
 * @returns {Palette?}
 */
function getPalette(customPaletteList) {
    const paletteList = customPaletteList ?? getPaletteList();
    if (paletteList.length > 0) {
        const paletteIndex = getProjectUIState().paletteIndex;
        if (paletteIndex >= 0 && paletteIndex < paletteList.length) {
            return paletteList.getPalette(paletteIndex);
        } else {
            getProjectUIState().paletteIndex = 0;
            return paletteList.getPalette(0);
        }
    } else return null;
}
/**
 * Gets the currently selected render palette (native colours or default).
 * @param {PaletteList?} customPaletteList - Custom palette list to obtain palette from.
 * @returns {Palette?}
 */
function getRenderPalette() {
    return getPalette(getRenderPaletteList());
}
function getUIState() {
    return state.persistentUIState;
}
/**
 * Gets the UI state of a project from local storage, if one doesn't exist it will be created.
 * @param {Project} [project] - Optional. Project to get UI state for. When omitted it will be the currently loaded project.
 * @returns {import("./models/persistentUIState.js").ProjectState?}
 */
function getProjectUIState(project) {
    const targetProject = project ?? getProject();
    if (targetProject) {
        const projectId = targetProject.id;
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
/**
 * Gets the project assembly export state from local storage, if one doesn't exist it will be created.
 * @param {Project} [project] - Optional. Project to get UI state for. When omitted it will be the currently loaded project.
 */
function getProjectAssemblyExportState(project) {
    const projectState = getProjectUIState(project);
    if (!projectState.assemblyExportState || projectState.assemblyExportState === null) {
        projectState.assemblyExportState = {
            tileMapIds: [],
            optimiseMode: 'default',
            vramOffset: 0,
            exportPalettes: true,
            exportTileSet: true,
            exportTileMaps: true
        };
    }
    return projectState.assemblyExportState;
}

function getToolState() {
    if (!instanceState.tool) return {};
    if (!instanceState.toolData[instanceState.tool]) instanceState.toolData[instanceState.tool] = {};
    return instanceState.toolData[instanceState.tool];
}

function getDefaultPaletteSystemType() {
    switch (getProject().systemType) {
        case 'smsgg': return 'ms';
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

/**
 * @param {ProjectEntryList|ProjectEntry[]|ProjectList|Project[]} projects 
 * @param {import('./types.js').SortEntry} sort 
 * @returns {Project[]|ProjectEntry[]}
 */
function getSortedProjectArray(projects, sort) {
    /** @type {Project[]|ProjectEntry[]} */
    const projectArray = [];
    if (projects instanceof ProjectList) projectArray.push(...projects.getProjects());
    if (projects instanceof ProjectEntryList) projectArray.push(...projects.getProjectEntries());
    if (Array.isArray(projects)) projectArray.push(...projects);

    if (sort?.field === 'title') {
        if (sort.direction === 'asc') {
            projectArray.sort((a, b) => a.title > b.title ? 1 : -1);
        } else {
            projectArray.sort((a, b) => a.title < b.title ? 1 : -1);
        }
    } else if (sort?.field === 'dateLastModified') {
        if (sort.direction === 'asc') {
            projectArray.sort((a, b) => a.dateLastModified > b.dateLastModified ? 1 : -1);
        } else {
            projectArray.sort((a, b) => a.dateLastModified < b.dateLastModified ? 1 : -1);
        }
    }
    return projectArray;
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
    if (instanceState.tileIndex >= getTileGrid().tileCount) { instanceState.tileIndex = getTileGrid().tileCount - 1; dirty = true; }

    projectToolbar.setState({
        projectTitle: getProject().title
    });

    projectDropdown.setState({
        projectTitle: getProject().title
    });

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        selectedPaletteId: getPalette().paletteId,
        lastPaletteInputSystem: getUIState().importPaletteSystem,
        selectedPaletteIndex: getProjectUIState().paletteIndex,
        selectedColourIndex: instanceState.colourIndex,
        enabled: true
    });

    const capabilityType = isTileMap() ? getTileMap().isSprite ? 'sprite' : 'background' : 'background';
    const graphicsCapability = SystemUtil.getGraphicsCapability(getProject().systemType, capabilityType);

    tileEditor.setState({
        forceRefresh: true,
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        tileSet: getTileSet(),
        tileGrid: getTileGrid(),
        tilesPerBlock: getTilesPerBlock(),
        transparencyIndicies: getTransparencyIndicies(),
        lockedPaletteSlotIndex: graphicsCapability.lockedPaletteIndex,
        selectedTileIndex: instanceState.tileIndex,
        cursorSize: instanceState.pencilSize,
        scale: getUIState().scale,
        showTileGrid: getUIState().showTileGrid,
        showPixelGrid: getUIState().showPixelGrid,
        highlightSameTiles: getUIState().highlightSameTiles,
        enabled: true
    });

    tileManager.setState({
        paletteList: getRenderPaletteList(),
        palette: getRenderPalette(),
        tileMapList: getTileMapList(),
        tileSet: getTileSet(),
        selectedTileMapId: getProjectUIState().tileMapId,
        selectedTileId: getProjectUIState().tileId,
        numberOfPaletteSlots: graphicsCapability.totalPaletteSlots,
        lockedPaletteSlotIndex: graphicsCapability.lockedPaletteIndex
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
        visibleToolstrips: [toolStrips.scale, toolStrips.showTileGrid, toolStrips.showPixelGrid, toolStrips.highlightSameTiles],
        systemType: getProject().systemType
    });
    tileContextToolbar.setState({
        toolstripLayout: getTileContextToolbarLayout(instanceState.tool)
    });

    const disabledCommands = [];
    if (isTileMap() && instanceState.tool === TileEditorToolbar.Tools.bucket) {
        instanceState.clampToTile = true;
        disabledCommands.push(TileContextToolbar.Commands.tileClamp);
    }
    tileContextToolbar.setState({
        disabledCommands: disabledCommands,
        clampToTile: instanceState.clampToTile,
        tileBreakLinks: instanceState.tileBreakLinks,
        systemType: getProject().systemType,
        palette: getRenderPalette()
    });

    resizeToolboxes();

}

function formatForProject() {

    currentProject.nativePalettes = null;

    const project = getProject();
    const projectChanged = project.id !== instanceState.previousProjectId;

    if (projectChanged) {
        instanceState.colourIndex = 0;
        instanceState.secondaryColourIndex = 0;
        if (instanceState.paletteSlot < 0) instanceState.paletteSlot = 0;
        if (instanceState.paletteSlot >= getNumberOfPaletteSlots()) instanceState.paletteSlot = getNumberOfPaletteSlots() - 1;
    }

    const palette = getPalette();
    const tileSet = getTileSet();
    const colour = palette.getColour(instanceState.colourIndex);
    const visibleTabs = [];
    switch (getPalette().system) {
        case 'ms': case 'gg': visibleTabs.push('rgb', 'ms'); break;
        case 'nes': visibleTabs.push('nes'); break;
        case 'gb': visibleTabs.push('gb'); break;
    }

    if (!getProjectUIState().tileId && getTileSet().tileCount > 0) {
        getProjectUIState().tileId = getTileSet().getTile(0).tileId;
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
    feedbackToolbar.setState({
        enabled: true
    });
    paletteEditor.setState({
        paletteList: project.paletteList,
        selectedColourIndex: 0,
        displayNative: getUIState().displayNativeColour,
        enabled: false
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
        highlightSameTilesChecked: getUIState().highlightSameTiles,
        enabled: true
    });
    tileEditor.setState({
        paletteList: null,
        tileSet: null,
        lockedPaletteSlotIndex: null,
        enabled: false
    });
    tileManager.setState({
        paletteList: null,
        palette: null,
        tileSet: null,
        selectedTileMapId: null,
        selectedTileId: null,
        displayNative: false
    });
    tileContextToolbar.setState({
        enabled: true,
        palette: null,
        paletteSlotCount: getNumberOfPaletteSlots(),
        paletteSlot: instanceState.paletteSlot,
        patternIndex: instanceState.patternIndex,
        patternFixedOrigin: instanceState.patternFixedOrigin,
        colourIndex: instanceState.colourIndex,
        secondaryColourIndex: instanceState.secondaryColourIndex
    });

    updateTileEditorGridColours();

    refreshProjectUI();

    instanceState.previousProjectId = getProject().id;
}

/**
 * Updates a list of tiles on the tile editors.
 * @param {string[]?} [tileIdOrIds] - Array of tile IDs that were updated.
 * @param {number[]?} [tileGridIndexes] - Array of tile grid indexes that were updated.
 */
function updateTilesOnEditors(tileIdOrIds, tileGridIndexes) {
    tileEditor.setState({
        updatedTileIds: Array.isArray(tileIdOrIds) ? tileIdOrIds : undefined,
        updatedTileGridIndexes: Array.isArray(tileGridIndexes) ? tileGridIndexes : undefined
    });
    tileManager.setState({
        updatedTileIds: Array.isArray(tileIdOrIds) ? tileIdOrIds : undefined
    });
}

function resetViewportToCentre() {
    if (getProject()) {
        const focusedTile = (Math.floor(getTileGrid().rowCount / 2) * getTileGrid().columnCount) + (Math.floor(getTileGrid().columnCount) / 2);
        tileEditor.setState({
            focusedTile: focusedTile
        });
    }
}

function formatForNoProject() {

    currentProject.nativePalettes = null;

    projectToolbar.setState({
        enabled: false,
        projectTitle: ' ',
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
        projectTitle: ' ',
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
    feedbackToolbar.setState({
        enabled: false
    });
    paletteEditor.setState({
        paletteList: null,
        selectedPaletteIndex: 0,
        selectedColourIndex: 0,
        enabled: false
    });
    colourPickerToolbox.setState({
        visibleTabs: [ColourPickerToolbox.Tabs.rgb],
        showTab: ColourPickerToolbox.Tabs.rgb
    });
    tileContextToolbar.setState({
        enabled: false,
        palette: null
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
    tileManager.setState({
        tileMapList: new TileMapList([]),
        tileSet: new TileSet(),
        palette: null,
        paletteList: null,
        selectedTileMapId: null
    });

    updateTileEditorGridColours();
}

/** Gets the visible toolstrip options for a given tool.
 * @param {string} tool - Tool to get the items for.
 * @returns {string[]}
 */
function getTileContextToolbarLayout(tool) {
    if (tool && typeof tool === 'string') {
        const tools = TileEditorToolbar.Tools;
        const layouts = TileContextToolbar.ToolstripLayouts;
        switch (tool) {
            case tools.pencil:
                return isTileMap() ? layouts.tilePencil : layouts.tileMapPencil;
            case tools.colourReplace:
                return isTileMap() ? layouts.tileColourReplace : layouts.tileMapColourReplace;
            case tools.bucket:
                return isTileMap() ? layouts.tileBucket : layouts.tileMapBucket;
            case tools.eyedropper:
                return layouts.eyedropper;
            case tools.select:
                return layouts.tileSelect;
            case tools.referenceImage:
                return layouts.referenceImage;
            case tools.tileMapTileAttributes:
                return layouts.tileMapSelect;
            case tools.rowColumn:
                return layouts.tileMapAddRemove;
            case tools.tileLinkBreak:
                return layouts.tileMapBreakLink;
            case tools.palettePaint:
                return layouts.tileMapPalettePaint;
            case tools.tileStamp:
                return layouts.tileStampPattern;
            case tools.tileEyedropper:
                return layouts.tileEyedropper;
        }
    }
    return [];
}

function displaySelectedProject() {
    if (getProject()) {
        if (getPaletteList().length === 0) {
            const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', getDefaultPaletteSystemType());
            getPaletteList().addPalette(newPalette);
        }
        formatForProject();
    } else {
        formatForNoProject();
        // Select default project if one was there
        const projectEntries = state.getProjectEntries();
        const project = (() => {
            if (getUIState().lastProjectId) {
                const lastProject = state.getProjectById(getUIState().lastProjectId);
                if (lastProject) return lastProject;
            }
            if (projectEntries.length > 0) return state.getProjectFromLocalStorage(projectEntries[0].id);
            return null;
        })();
        if (project) state.setProject(project);
    }
}

function uiRefreshProjectLists() {
    const projectEntryList = state.getProjectEntries();
    projectToolbar.setState({
        projects: projectEntryList
    });
    projectDropdown.setState({
        projects: getSortedProjectArray(projectEntryList, getUIState().projectDropDownSort)
    });
    welcomeScreen.setState({
        projects: getSortedProjectArray(projectEntryList, getUIState().welcomeScreenProjectSort)
    });
}

/** 
 * @typedef {Object} ToolActionArgs
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
 * @returns {undefined|{ saveProject: boolean }}
 */
function takeToolAction(args) {

    const tool = args.tool; const colourIndex = args.colourIndex;
    const event = args.event;
    const imageX = args.imageX; const imageY = args.imageY;
    let saveProject = false;

    if (tool !== null && colourIndex >= 0 && colourIndex < 16) {

        if (tool === TileEditorToolbar.Tools.select) {
            if (event === TileEditor.Events.pixelMouseDown) {

                const tileInfo = getTileGrid().getTileInfoByPixel(imageX, imageY);
                toggleTileIndexSelectedState(tileInfo.tileIndex);
                tileSetTileSelectById(tileInfo.tileId);

                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;

            }
        } else if (tool === TileEditorToolbar.Tools.pencil && args.isInBounds) {
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

                        instanceState.lastTileMapPx.x = imageX;
                        instanceState.lastTileMapPx.y = imageY;

                        const breakLinks = isTileMap() && instanceState.breakTileLinks;
                        const originalTileSet = breakLinks ? TileSetFactory.clone(getTileSet()) : null;

                        const updatedTiles = PaintTool.paintOntoTileGrid(getTileGrid(), getTileSet(), {
                            coordinate: { x: imageX, y: imageY },
                            brush: { 
                                primaryColourIndex: instanceState.colourIndex, 
                                secondaryColourIndex: instanceState.secondaryColourIndex, 
                                size: instanceState.pencilSize 
                            },
                            options: { 
                                clampToTile: clamp
                            },
                            pattern: {
                                pattern: (instanceState.patternIndex > -1) ? patternManager.getPattern(instanceState.patternIndex) : null, 
                                originX: (instanceState.patternFixedOrigin) ? 0 : imageX,
                                originY: (instanceState.patternFixedOrigin) ? 0 : imageY
                            }
                        });

                        if (updatedTiles.affectedTileIndexes.length > 0) {

                            if (breakLinks) {
                                takeToolAction_breakLinks(updatedTiles.affectedTileIndexes, originalTileSet);
                            }

                            updateTilesOnEditors(updatedTiles.affectedTileIds);

                        }

                    }
                }

            } else {
                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;
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
                            const tileInfo = getTileGrid().getTileInfoByPixel(imageX, imageY);
                            const tile = getTileSet().getTileById(tileInfo.tileId);
                            const colour = tile.readAtCoord(imageX % 8, imageY % 8);
                            instanceState.startingColourIndex = colour;
                        }

                        instanceState.lastTileMapPx.x = imageX;
                        instanceState.lastTileMapPx.y = imageY;

                        const breakLinks = isTileMap() && instanceState.breakTileLinks;
                        const originalTileSet = breakLinks ? TileSetFactory.clone(getTileSet()) : null;

                        const updatedTiles = PaintTool.paintOntoTileGrid(getTileGrid(), getTileSet(), {
                            coordinate: { x: imageX, y: imageY },
                            brush: { 
                                primaryColourIndex: instanceState.colourIndex, 
                                secondaryColourIndex: instanceState.secondaryColourIndex, 
                                size: instanceState.pencilSize 
                            },
                            options: { 
                                constrainToColourIndex: instanceState.startingColourIndex, 
                                clampToTile: clamp
                            },
                            pattern: {
                                pattern: (instanceState.patternIndex > -1) ? patternManager.getPattern(instanceState.patternIndex) : null, 
                                originX: (instanceState.patternFixedOrigin) ? 0 : imageX,
                                originY: (instanceState.patternFixedOrigin) ? 0 : imageY
                            }
                        });

                        if (updatedTiles && updatedTiles.affectedTileIndexes.length > 0) {

                            if (breakLinks) {
                                takeToolAction_breakLinks(updatedTiles.affectedTileIndexes, originalTileSet);
                            }

                            updateTilesOnEditors(updatedTiles.affectedTileIds);

                        }

                    }
                }

            } else {
                instanceState.lastTileMapPx.x = -1;
                instanceState.lastTileMapPx.y = -1;
            }
        } else if (tool === TileEditorToolbar.Tools.bucket && args.isInBounds) {
            if (event === TileEditor.Events.pixelMouseDown) {

                addUndoState();
                const updatedTiles = PaintTool.fillColourOnTileGrid(getTileGrid(), getTileSet(), imageX, imageY, colourIndex, instanceState.clampToTile);
                if (updatedTiles && updatedTiles.affectedTileIndexes.length > 0) {
                    updateTilesOnEditors(updatedTiles.affectedTileIds);
                }
                saveProject = true;

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

                if (args.tile.row >= 0 && args.tile.row < getTileGrid().rowCount && args.tile.col >= 0 && args.tile.col < getTileGrid().columnCount) {
                    const tileInfo = getTileGrid().getTileInfoByRowAndColumn(args.tile.row, args.tile.col);
                    if (tileInfo) {
                        tileSetTileSelectById(tileInfo.tileId);
                    }
                }

            }
        }

        if (isTileMap()) {
            let actionTaken = false;
            /** @type {string[]} */
            let updatedTileIds = [];
            /** @type {number[]} */
            let updatedTileMapTileIndexes = [];

            if (tool === TileEditorToolbar.Tools.tileMapTileAttributes && args.isInBounds) {
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
                        saveProject = true;
                    } catch (e) {
                        undoManager.removeLastUndo();
                        throw e;
                    }

                }
            } else if (tool === TileEditorToolbar.Tools.tileStamp) {

                const result = takeToolAction_tileStamp(args);
                if (result != null) {
                    updatedTileMapTileIndexes = updatedTileMapTileIndexes.concat(result.updatedTileMapTileIndexes);
                    saveProject = true;
                }

            } else if (tool === TileEditorToolbar.Tools.palettePaint && args.isInBounds) {
                if (event === TileEditor.Events.pixelMouseDown || event === TileEditor.Events.pixelMouseOver) {

                    addUndoState();
                    try {
                        if (!instanceState.undoDisabled) {
                            instanceState.undoDisabled = true;
                        }
                        const result = PalettePaintTool.setTileBlockPaletteIndex({
                            paletteIndex: instanceState.paletteSlot,
                            tileMap: getTileMap(),
                            tileSet: getTileSet(),
                            row: args.tileBlock.row,
                            column: args.tileBlock.col,
                            tilesPerBlock: args.tilesPerBlock
                        });
                        if (result != null) {
                            updatedTileMapTileIndexes = updatedTileMapTileIndexes.concat(result.updatedTileMapTileIndexes);
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
                        if (result.updatedTileIds.length > 0 || result.updatedTileMapTileIndexes.length > 0) {

                            tileManager.setState({ tileSet: getTileSet() });

                            updatedTileIds = updatedTileIds.concat(result.updatedTileIds);
                            updatedTileMapTileIndexes = updatedTileMapTileIndexes.concat(result.updatedTileMapTileIndexes);
                            saveProject = true;

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

            updateTilesOnEditors(updatedTileIds, updatedTileMapTileIndexes);
        }

    }

    return {
        saveProject: saveProject
    };
}

/**
 * Breaks links on modified tiles when the break links option is enabled. 
 * @param {number[]} tileIndexes - Indexes of the tiles witin the tile grid.
 * @param {TileSet} originalTileSet - Tile set that contains the original tiles. 
 */
function takeToolAction_breakLinks(tileIndexes, originalTileSet) {
    let changesMade = false;
    tileIndexes.forEach((tileIndex) => {
        const originalTileId = getTileGrid().getTileInfoByIndex(tileIndex).tileId;
        const breakResult = TileLinkBreakTool.createAndLinkNewTileIfUsedElsewhere(tileIndex, getTileMap(), getTileSet(), getProject());
        if (breakResult.changesMade) {
            const originalTile = originalTileSet.getTileById(originalTileId);
            const originalTileData = originalTile.readAll();
            getTileSet().getTileById(originalTileId).setData(originalTileData);
            changesMade = true;
        }
    });
    if (changesMade) {
        tileEditor.setState({
            tileGrid: getTileGrid(),
            tileSet: getTileSet()
        });
        tileManager.setState({
            tileSet: getTileSet()
        });
    }
}

/** 
 * @param {ToolActionArgs} args 
 * @returns {{updatedTileIds: string[], updatedTileMapTileIndexes: number[]}?}
 */
function takeToolAction_tileStamp(args) {
    if (!args.isInBounds) return;
    const ts = getToolState();

    // Define mode 
    if (ts.mode === 'define') {

        if (args.event === TileEditor.Events.pixelMouseDown) {

            ts.selectedRegion = {
                rowIndex: args.tile.row,
                columnIndex: args.tile.col,
                width: 1,
                height: 1
            };
            ts.originTile = { rowIndex: args.tile.row, columnIndex: args.tile.col };
            tileEditor.setState({ selectedRegion: ts.selectedRegion });

        } else if (args.event === TileEditor.Events.pixelMouseOver) {

            if (!ts.selectedRegion) {
                ts.selectedRegion = {
                    rowIndex: args.tile.row,
                    columnIndex: args.tile.col,
                    width: 1,
                    height: 1
                };
            }
            if (!ts.originTile) {
                ts.originTile = {
                    rowIndex: ts.selectedRegion.rowIndex,
                    columnIndex: ts.selectedRegion.columnIndex
                };
            }

            /** @type {import("./models/tileGridProvider.js").TileGridRegion} */
            const r = ts.selectedRegion;

            const startCol = Math.max(0, Math.min(args.tile.col, ts.originTile.columnIndex));
            const endCol = Math.min(getTileGrid().columnCount, Math.max(args.tile.col, ts.originTile.columnIndex));
            const width = (endCol - startCol) + 1;

            r.columnIndex = startCol;
            r.width = width;

            const startRow = Math.max(0, Math.min(args.tile.row, ts.originTile.rowIndex));
            const endRow = Math.min(getTileGrid().rowCount, Math.max(args.tile.row, ts.originTile.rowIndex));
            const height = (endRow - startRow) + 1;

            r.rowIndex = startRow;
            r.height = height;

            ts.selectedRegion = r;
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
                if (result.updatedTileMapTileIndexes.length > 0) {
                    return {
                        updatedTileIds: result.updatedTileIds,
                        updatedTileMapTileIndexes: result.updatedTileMapTileIndexes
                    };
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
                    tileEditor.setState({
                        referenceImageBounds: {
                            x: newX, y: newY, width: newW, height: newH
                        }
                    })
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
            referenceImage: instanceState.referenceImage,
            transparencyIndicies: getTransparencyIndicies()
        });
    };
    fileInput.click();
}

/**
 * Sets a tile map as a reference image.
 * @param {string} tileMapId - Unique ID of the tile map.
 */
function referenceImageFromTileMap(tileMapId) {
    if (!tileMapId || typeof tileMapId !== 'string') throw new Error('Please pass a tile map ID.');
    const tileMap = getTileMapList().getTileMapById(tileMapId);
    if (!tileMap) throw new Error('Tile map not found.');

    const palettes = tileMap.getPalettes().map((id) => getRenderPaletteList().getPaletteById(id));
    const transparentIndicies = tileMap.isSprite ? [0] : [];
    const image = PaintUtil.createTileGridImage(tileMap, getTileSet(), palettes, transparentIndicies);

    instanceState.referenceImage = new ReferenceImage();
    instanceState.referenceImage.setImage(image);
    instanceState.referenceImage.setBounds(0, 0, image.width, image.height);

    tileContextToolbar.setState({
        referenceBounds: instanceState.referenceImage.getBounds(),
        referenceTransparency: instanceState.transparencyIndex
    });
    tileEditor.setState({
        referenceImage: instanceState.referenceImage,
        transparencyIndicies: getTransparencyIndicies()
    });
}

function clearReferenceImage() {

    instanceState.referenceImage.clearImage();
    instanceState.referenceImageOriginal = null;

    tileContextToolbar.setState({
        referenceBounds: instanceState.referenceImage.getBounds()
    });
    tileEditor.setState({
        referenceImage: instanceState.referenceImage,
        transparencyIndicies: getTransparencyIndicies()
    });

    toast.show('Reference image cleared.');
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
    instanceState.referenceImageTransparencyIndex = transparencyIndex;

    const refImage = instanceState.referenceImage;

    tileEditor.setState({
        referenceImageBounds: {
            x: refImage.positionX,
            y: refImage.positionY,
            width: bounds.width,
            height: bounds.height
        },
        referenceImageDrawMode: (transparencyIndex === -2) ? 'overlay' : (transparencyIndex === -1) ? 'underlay' : 'overIndex',
        transparencyIndicies: getTransparencyIndicies()
    });
    tileContextToolbar.setState({
        referenceBounds: refImage.getBounds(),
        referenceTransparency: instanceState.referenceImageTransparencyIndex
    });
}

/**
 * Makes the pencil size bigger or smaller.
 * @param {number} step - Step in size, between -50 and 50.
 */
function changePencilSize(step) {
    step = Math.max(-50, Math.min(step, 50));
    const newSize = instanceState.pencilSize + step;
    setPencilSize(Math.max(1, Math.min(newSize, 50)));
}

/**
 * Sets the pencil size.
 * @param {number} brushSize - Pencil size, 1 to 50.
 */
function setPencilSize(brushSize) {
    const TOOLS = TileEditorToolbar.Tools;
    if (brushSize && brushSize >= 1 && brushSize <= 50) {
        instanceState.pencilSize = brushSize;
        tileContextToolbar.setState({
            brushSize: instanceState.pencilSize
        });
        let cursorSize = 1;
        if (instanceState.tool === TOOLS.pencil || instanceState.tool === TOOLS.colourReplace || instanceState.tool === TOOLS.pattern) {
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
 * Sets the pattern index value.
 * @param {number} value - Index of the pattern.
 */
function setPatternIndex(value) {
    instanceState.patternIndex = value;
    tileContextToolbar.setState({
        patternIndex: instanceState.patternIndex
    });
}

/**
 * Sets the pattern fixed origin value.
 * @param {boolean} value - Fixed origin value.
 */
function setPatternFixedOrigin(value) {
    instanceState.patternFixedOrigin = value;
    tileContextToolbar.setState({
        patternFixedOrigin: instanceState.patternFixedOrigin
    });
}

/**
 * Sets the index of the primary colour slot.
 * @param {number} value - Colour index.
 */
function setColourIndex(value) {
    selectColourIndex(value);
}

/**
 * Sets the index of the secondary colour slot.
 * @param {number} value - Colour index.
 */
function setSecondaryColourIndex(value) {
    instanceState.secondaryColourIndex = value;
    tileContextToolbar.setState({
        secondaryColourIndex: instanceState.secondaryColourIndex
    });
}

/**
 * Swaps the primary and secondary colour indexes.
 */
function swapPrimarySecondaryColourIndex() {
    [instanceState.colourIndex, instanceState.secondaryColourIndex] = [instanceState.secondaryColourIndex, instanceState.colourIndex];
    setColourIndex(instanceState.colourIndex);
    setSecondaryColourIndex(instanceState.secondaryColourIndex);
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

    state.saveToLocalStorage();

    tileContextToolbar.setState({
        paletteSlot: instanceState.paletteSlot
    });
}

/**
 * Sets the attributes on the currently selected tile set tile.
 * @param {import("./ui/toolbars/tileContextToolbar.js").TileContextToolbarTileSetTileAttributes} attributes - Attributes to set.
 */
function setTileSetTileAttributes(attributes) {
    if (!isTileSet()) return;
    if (!attributes) return;
    if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileGrid().tileCount) return;

    const tileIndex = instanceState.tileIndex;
    const tileSetTile = getTileSet().getTileByIndex(tileIndex);
    if (!tileSetTile) return;

    addUndoState();
    try {

        const updatedTileIds = [];

        if (typeof attributes.alwaysKeep === 'boolean') {
            tileSetTile.alwaysKeep = attributes.alwaysKeep;
            updatedTileIds.push(tileSetTile.tileId);
        }

        if (updatedTileIds.length > 0) {
            state.saveToLocalStorage();

            updateTilesOnEditors(updatedTileIds);
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

/**
 * Sets the attributes on the currently selected tile map tile.
 * @param {import("./ui/toolbars/tileContextToolbar.js").TileContextToolbarTileMapTileAttributes} attributes - Attributes to set.
 */
function setTileMapTileAttributes(attributes) {
    if (!isTileMap()) return;
    if (!attributes) return;
    if (instanceState.tileIndex < 0 || instanceState.tileIndex >= getTileGrid().tileCount) return;

    const tileIndex = instanceState.tileIndex;
    const tileMapTile = getTileMap().getTileByIndex(tileIndex);
    const tileSetTile = getTileSet().getTileById(tileMapTile.tileId);
    if (!tileMapTile) return;

    addUndoState();
    try {

        const updatedTileIds = [];

        if (typeof attributes.horizontalFlip === 'boolean') {
            tileMapTile.horizontalFlip = attributes.horizontalFlip;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof attributes.verticalFlip === 'boolean') {
            tileMapTile.verticalFlip = attributes.verticalFlip;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof attributes.priority === 'boolean') {
            tileMapTile.priority = attributes.priority;
            updatedTileIds.push(tileMapTile.tileId);
        }
        if (typeof attributes.palette === 'number') {
            const result = PalettePaintTool.setPaletteIndexByTileIndex({
                tileMap: getTileMap(),
                paletteIndex: attributes.palette,
                tilesPerBlock: getTilesPerBlock(),
                tileIndex: tileIndex
            });
            updatedTileIds.concat(result.updatedTileIds);
        }
        if (tileSetTile && typeof attributes.alwaysKeep === 'boolean') {
            tileSetTile.alwaysKeep = attributes.alwaysKeep;
            updatedTileIds.push(tileSetTile.tileId);
        }

        if (updatedTileIds.length > 0) {
            state.saveToLocalStorage();

            updateTilesOnEditors(updatedTileIds, [tileIndex]);
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
        tileStampPattern: null
    });
    tileContextToolbar.setState({ selectedCommands: [TileContextToolbar.Commands.tileStampDefine] });
}

function confirmTileStampRegion() {
    const toolState = getToolState();

    if (!isTileMap()) return;
    toolState.mode = 'tile';
    /** @type {import("./models/tileGridProvider.js").TileGridRegion} */
    let region = toolState.selectedRegion;
    /** @type {TileMapTile[]} */
    let tiles = [];
    for (let r = 0; r < region.height; r++) {
        const row = region.rowIndex + r;
        for (let c = 0; c < region.width; c++) {
            const col = region.columnIndex + c;
            const tile = getTileMap().getTileByRowAndColumn(row, col);
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

    toolState.tileMap = stampTileMap;
    toolState.selectedRegion = null;
    toolState.originTile = null;

    tileEditor.setState({
        selectedRegion: null,
        tileStampPattern: stampTileMap
    });
    tileContextToolbar.setState({
        selectedCommands: []
    });
}

function clearTileStampRegion() {
    const toolState = getToolState();
    toolState.mode = 'tile';
    toolState.selectedRegion = null;
    toolState.originTile = null;
    toolState.tileMap = null;

    tileEditor.setState({
        selectedRegion: null
    });
    tileContextToolbar.setState({
        selectedCommands: []
    });

    tileSetTileSelectById(getProjectUIState().tileId);
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

    if (isTileSet()) {
        const tile = getTileSet().getTileByIndex(tileIndex);
        tileContextToolbar.setState({
            tileSetTileAttributes: {
                alwaysKeep: tile?.alwaysKeep ?? false
            }
        });
    } else if (isTileMap()) {
        const tileSetTile = getTileMap().getTileByIndex(tileIndex);
        const tile = getTileSet().getTileById(tileSetTile.tileId);
        tileContextToolbar.setState({
            tileMapTileAttributes: {
                horizontalFlip: tileSetTile.horizontalFlip,
                verticalFlip: tileSetTile.verticalFlip,
                priority: tileSetTile.priority,
                palette: tileSetTile.palette,
                alwaysKeep: tile?.alwaysKeep ?? false
            }
        });
    }
}

/**
 * Change the palette index in the palette list.
 * @argument {string} paletteId
 * @argument {string} targetPaletteId
 * @argument {string} position
 */
function paletteReorder(paletteId, targetPaletteId, position) {
    if (paletteId === targetPaletteId) return;

    const originIndex = getPaletteList().indexOf(paletteId);
    let targetIndex = getPaletteList().indexOf(targetPaletteId);
    if (position === DropPosition.after) targetIndex++;

    let palettes = getPaletteList().getPalettes();
    if (originIndex === targetIndex) {
        return;
    } else if (originIndex > targetIndex) {
        const deleted = palettes.splice(originIndex, 1);
        const start = palettes.slice(0, targetIndex);
        const end = palettes.slice(targetIndex);
        palettes = start.concat(deleted).concat(end);
    } else if (originIndex < targetIndex) {
        const start = palettes.slice(0, targetIndex);
        const end = palettes.slice(targetIndex);
        const deleted = start.splice(originIndex, 1);
        palettes = start.concat(deleted).concat(end);
    }

    addUndoState();

    getPaletteList().setPalettes(palettes);

    state.saveToLocalStorage();

    currentProject.nativePalettes = null;

    updatePaletteLists({ skipTileEditor: true });
}

/**
 * Creates a new palette.
 */
function paletteNew() {
    addUndoState();
    try {
        const newPalette = PaletteFactory.createNewStandardColourPalette('New palette', getDefaultPaletteSystemType());
        getPaletteList().addPalette(newPalette);

        state.saveToLocalStorage();

        currentProject.nativePalettes = null;

        updatePaletteLists({ skipTileEditor: true });

        paletteSelectById(newPalette.paletteId);
        toast.show('Palette created.');
    } catch (e) {
        undoManager.removeLastUndo();
        toast.show('Error creating palette.');
        throw e;
    }
}

function paletteClone(paletteIndex) {
    if (paletteIndex >= 0 && paletteIndex < getPaletteList().length) {

        addUndoState();
        try {

            const newPalette = PaletteFactory.clone(getPalette());
            newPalette.title += ' (copy)';
            getPaletteList().insertAt(paletteIndex, newPalette);

            state.saveToLocalStorage();

            currentProject.nativePalettes = null;

            updatePaletteLists({ skipTileEditor: true });

            paletteSelectById(newPalette.paletteId);

            toast.show('Palette cloned.');

        } catch (e) {
            undoManager.removeLastUndo();
            toast.show('Error cloning palette.');
            throw e;
        }
    }
}

function paletteDelete(paletteIndex) {
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

            state.saveToLocalStorage();

            currentProject.nativePalettes = null;

            updatePaletteLists();

            const palette = getPaletteList().getPalette(paletteIndex);
            paletteSelectById(palette.paletteId);

            toast.show('Palette removed.');

        } catch (e) {
            undoManager.removeLastUndo();
            toast.show('Error removing palette.');
            throw e;
        }
    }
}

/**
 * @param {string?} field 
 */
function paletteListSort(field) {
    let dir = instanceState.paletteSort?.direction === 'desc' ? -1 : 1; // Default to ascending
    if (instanceState.paletteSort?.field !== field) {
        dir = 1; // If different field, sort ascending
    } else if (instanceState.paletteSort?.field === field) {
        dir *= -1; // If same field, swap sort direction
    }
    let sortedField = null;

    const palettes = getPaletteList().getPalettes();
    switch (field) {
        case PaletteEditor.SortFields.title:
            sortedField = field;
            palettes.sort((a, b) => (a.title > b.title ? 1 : -1) * dir);
            break;
        case PaletteEditor.SortFields.system:
            sortedField = field;
            palettes.sort((a, b) => {
                if (a.system > b.system) return 1 * dir;
                if (a.system < b.system) return -1 * dir;
                if (a.title > b.title) return 1 * dir;
                else if (a.title < b.title) return -1 * dir;
                else return 0;
            });
            break;
    }

    // Record last sort, if last field was null then no valid value was passed so don't record
    if (sortedField) {
        instanceState.paletteSort = {
            field: sortedField,
            direction: dir === 1 ? 'asc' : 'desc'
        };
    }

    // Update the project
    addUndoState();
    getPaletteList().setPalettes(palettes);
    state.saveProjectToLocalStorage();

    currentProject.nativePalettes = null;

    // Set the UI state
    updatePaletteLists();
}

/**
 * 
 * @param {{ skipTileEditor: boolean }} args 
 */
function updatePaletteLists(args) {
    paletteEditor.setState({
        paletteList: getRenderPaletteList()
    });
    tileManager.setState({
        paletteList: getRenderPaletteList()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
    if (args?.skipTileEditor !== true) {
        tileEditor.setState({
            paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection()
        });
    }
}

function paletteImportFromAssembly() {
    paletteImportDialogue.setState({
        paletteData: getUIState().importPaletteAssemblyCode,
        system: getUIState().importPaletteSystem,
        allowedSystems: getProject().systemType === 'gb' ? ['gb'] : getProject().systemType === 'nes' ? ['nes'] : ['ms', 'gg']
    });
    paletteImportDialogue.show();
}

function changePaletteTitle(paletteIndex, newTitle) {
    addUndoState();

    const palette = getPaletteList().getPalette(paletteIndex);
    palette.title = newTitle;

    state.saveToLocalStorage();

    currentProject.nativePalettes = null;

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileManager.setState({
        paletteList: getRenderPaletteList()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
}

function changePaletteSystem(paletteIndex, system) {
    addUndoState();

    const palette = getPaletteList().getPalette(paletteIndex);
    palette.system = system;

    currentProject.nativePalettes = null;

    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        selectedSystem: system,
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        forceRefresh: true
    });
    tileManager.setState({
        paletteList: getRenderPaletteList()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
}

function changePaletteEditorDisplayNativeColours(displayNative) {
    currentProject.nativePalettes = null;
    state.persistentUIState.displayNativeColour = displayNative;
    state.saveToLocalStorage();

    paletteEditor.setState({
        paletteList: getRenderPaletteList(),
        displayNative: getUIState().displayNativeColour
    });
    tileEditor.setState({
        tileGrid: getTileGrid(),
        tileSet: getTileSet(),
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection()
    });
    tileManager.setState({
        paletteList: getRenderPaletteList(),
        palette: getRenderPalette()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });

    updateTileEditorGridColours();
}

function updateTileEditorGridColours() {
    const isGameboyProject = getUIState().displayNativeColour && getProject()?.systemType === 'gb';
    tileEditor.setState({
        pixelGridColour: (isGameboyProject) ? '#98a200' : '#000000',
        pixelGridOpacity: (isGameboyProject) ? 0.5 : 0.2,
        tileGridColour: (isGameboyProject) ? '#98a200' : '#000000',
        tileGridOpacity: (isGameboyProject) ? 1 : 0.4
    });
}

function changeSelectedColourIndex(colourIndex) {
    if (colourIndex >= 0 && colourIndex < 16) {
        paletteEditor.setState({
            selectedColourIndex: colourIndex
        });
        tileContextToolbar.setState({
            colourIndex: colourIndex
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

    currentProject.nativePalettes = null;

    tileEditor.setState({
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        tileGrid: getTileGrid(),
        tileSet: getTileSet()
    });
    paletteEditor.setState({
        paletteList: getRenderPaletteList()
    });
    tileManager.setState({
        paletteList: getRenderPaletteList(),
        palette: getRenderPalette()
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
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

        state.saveToLocalStorage();

        tileEditor.setState({
            paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
            tileGrid: getTileGrid(),
            tileSet: getTileSet()
        });
    }
}

/**
 * @param {File|null} file 
 */
function tilesImportFromImage(file) {
    importImageModalDialogue.setState({
        paletteList: getPaletteList(),
        file: file ?? null
    });
    importImageModalDialogue.show();
}

function tilesImportFromAssembly() {
    assemblyImportTilesModalDialogue.setState({
        tileSetData: getUIState().importTileAssemblyCode,
        replace: getUIState().importTileReplace
    });
    assemblyImportTilesModalDialogue.show();
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

    projectToolbar.setState({
        projectTitle: getProject().title
    });
    projectDropdown.setState({
        projectTitle: getProject().title
    });
}

/**
 * Imports the project from a JSON file.
 * @argument {{title: string?, systemType: string?, createTileMap: boolean?, tileWidth: number?, tileHeight: number?}} args
 */
function projectNew(args) {
    addUndoState();

    const newProject = createEmptyProject({
        title: args.title,
        systemType: args.systemType,
        createTileMap: args.createTileMap,
        tileWidth: args.tileWidth,
        tileHeight: args.tileHeight
    });

    getProjectUIState(newProject).paletteIndex = 0;
    getProjectUIState(newProject).tileMapId = args.createTileMap ? newProject.tileMapList.getTileMap(0).tileMapId : null;

    instanceState.tileIndex = -1;
    instanceState.colourIndex = 0;

    state.setProject(newProject);
    state.saveToLocalStorage();

    resetViewportToCentre();

    toast.show('New project created.');
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
            ProjectUtil.loadFromBlob(input.files[0]).then((project) => {
                addUndoState();

                // If it doesn't exist, use the project ID
                const preferredProjectId = project.id;
                project.id = state.generateUniqueProjectId(preferredProjectId);

                // Store the project
                state.setProject(project);
                state.saveProjectToLocalStorage();
                getProjectUIState().paletteIndex = 0;
                resetViewportToCentre();

                // Display the project
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
 * Loads a sample project.
 * @param {string} sampleProjectId 
 */
async function loadSampleProjectAsync(sampleProjectId) {
    if (typeof sampleProjectId !== 'string') throw new Error('No URL.');

    if (Array.isArray(instanceState.sampleProjects)) {
        const sampleProject = instanceState.sampleProjects.find((s) => s.sampleProjectId === sampleProjectId);
        if (sampleProject) {
            const sampleManager = await SampleProjectManager.getInstanceAsync();
            const loadedProject = await sampleManager.loadSampleProjectAsync(sampleProject.url);
            if (loadedProject) {
                state.saveProjectToLocalStorage(loadedProject, false);
                const defaultTileMap = loadedProject.tileMapList.getTileMapById(sampleProject.defaultTileMapId);
                getProjectUIState(loadedProject).tileMapId = defaultTileMap?.tileMapId ?? null;
                state.setProject(loadedProject);
                resetViewportToCentre();
            }
        }
    }
}

/**
 * Shows the export to assembly dialogue.
 */
function displayExportToAssemblyDialogue() {
    const expState = getProjectAssemblyExportState();
    if (expState.tileMapIds.length === 0) {
        getTileMapList().getTileMaps().forEach((tileMap) => expState.tileMapIds.push(tileMap.tileMapId));
    }
    assemblyExportDialogue.setState({
        tileMapList: getTileMapList(),
        selectedTileMapIds: expState.tileMapIds,
        optimiseMode: expState.optimiseMode,
        exportTileMaps: expState.exportTileMaps,
        exportTileSet: expState.exportTileSet,
        exportPalettes: expState.exportPalettes,
        vramOffset: expState.vramOffset
    });
    const code = getExportAssemblyCode(
        expState.tileMapIds,
        expState.optimiseMode,
        expState.vramOffset,
        { tileMaps: expState.exportTileMaps, tileSet: expState.exportTileSet, palettes: expState.exportPalettes }
    );
    assemblyExportDialogue.setState({
        content: code
    });
    assemblyExportDialogue.show();
}

/**
 * Updates the content in the tile map export dialogue.
 * @param {string[]} tileMapIds 
 * @param {string} optimiseMode 
 * @param {number} vramOffset 
 * @param {{tileMaps: boolean, tileSet: boolean, palettes: boolean}} exportWhat 
 */
function getExportAssemblyCode(tileMapIds, optimiseMode, vramOffset, exportWhat) {
    const serialiser = SerialisationUtil.getProjectAssemblySerialiser(getProject().systemType);
    return serialiser.serialise(getProject(), {
        tileMapIds: tileMapIds,
        optimiseMode: optimiseMode,
        vramOffset: vramOffset,
        exportTileMaps: exportWhat.tileMaps,
        exportTileSet: exportWhat.tileSet,
        exportPalettes: exportWhat.palettes
    });
}

/**
 * Exports tileset to an image.
 * @param {string} code
 */
function downloadAssemblyCode(code) {
    const fileName = getProject().title && getProject().title.length > 0 ? getProject().title : 'image';
    const fileNameClean = FileUtil.getCleanFileName(fileName);
    const fullFileName = `${fileNameClean}.asm`;

    const fileContent = new Blob([code], { type: 'text/plain' });
    const dataUrl = URL.createObjectURL(fileContent);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fullFileName;
    a.click();
    a.remove();
}

/**
 * Exports the currently selected tile set or tile grid to an image.
 */
function exportCurrentTileGridAsImage() {
    const tileGrid = getTileGrid();
    const palettes = getRenderPaletteListToSuitTileMapOrTileSetSelection();
    const image = PaintUtil.createTileGridImage(tileGrid, getTileSet(), palettes);
    exportImage(image);
}

/**
 * Exports tileset to an image.
 * @argument {ImageBitmap} image
 */
function exportImage(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const dataUrl = canvas.toDataURL();

    const fileName = getProject().title && getProject().title.length > 0 ? getProject().title : 'image';
    const fileNameClean = FileUtil.getCleanFileName(fileName);
    const fullFileName = `${fileNameClean}.png`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fullFileName;
    a.click();
    a.remove();

    toast.show('Tiles exported as image.');
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

        state.saveProjectToLocalStorage();
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
 * @param {string} direction - Direction to mirror, either 'h' for horizontal or 'v' for vertical.
 * @param {number} index - Tile index.
 */
function tileMirrorAtIndex(direction, index) {
    if (index < 0 || index > getTileSet().length) return;
    if (!direction || !['h', 'v'].includes(direction)) throw new Error('Please specify horizontal "h" or vertical "v".');

    addUndoState();

    const tile = getTileSet().getTile(index);

    /** @type {Tile} */
    let mirroredTile;
    if (direction === 'h') {
        mirroredTile = TileUtil.createHorizontallyMirroredClone(tile);
    } else {
        mirroredTile = TileUtil.createVerticallyMirroredClone(tile);
    }

    getTileSet().removeTile(index);
    getTileSet().insertTileAt(mirroredTile, index);

    state.saveToLocalStorage();

    updateTilesOnEditors([tile.tileId]);
}

/**
 * Inserts a tile at a given index.
 * @param {number} index - Tile index to insert.
 */
function tileInsertAtIndex(index) {
    if (index < 0 || index > getTileSet().length) return;

    addUndoState();

    const tileDataArray = new Uint8ClampedArray(64);
    tileDataArray.fill(0, 0, tileDataArray.length);

    const newTile = TileFactory.fromArray(tileDataArray);
    if (index < getTileSet().length) {
        getTileSet().insertTileAt(newTile, index);
    } else if (index >= getTileSet().length) {
        getTileSet().addTile(newTile);
    }

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
function tileCutToClipboardAtIndex(index) {
    if (index < 0 || index >= getTileSet().length) return;

    addUndoState();

    const tile = getTileSet().getTile(index);
    instanceState.tileClipboard = TileUtil.toHex(tile);
    getTileSet().removeTile(index);

    // Maintain selection state, don't allow it to exceed tile count
    if (instanceState.tileIndex >= getTileSet().length) {
        instanceState.tileIndex = getTileSet().length - 1;
    }

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
function tileCopyToClipboardFromIndex(index) {
    if (index < 0 || index >= getTileSet().length) return;

    const tile = getTileSet().getTile(index);
    instanceState.tileClipboard = TileUtil.toHex(tile);

    navigator.clipboard.writeText(TileUtil.toHex(tile));

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
function tilePasteAtIndex(index) {
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
function tileMapCreate() {
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
function tileMapCreateFromTileSet() {
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

    state.saveToLocalStorage();

    tileMapOrTileSetSelectById(newTileMap.tileMapId);

    toast.show('Tile map created from tile set.');
}

/**
 * Selects a tile map by ID, if not not ID passed or not found, then the tile set is selected.
 * @param {string?} tileMapId - Unique ID of the tile map to select or null if none selected.
 */
function tileMapOrTileSetSelectById(tileMapId) {

    const tileMapFound = getTileMapList().containsTileMapById(tileMapId);
    getProjectUIState().tileMapId = tileMapFound ? tileMapId : null;

    if (isTileMap()) {

        // Ensure the tile map is in good order
        const tileMap = getTileMap();
        tileMapCheckAndRepair(tileMap);

        // Don't allow tile set only tools to be selected
        if (instanceState.tool === TileEditorToolbar.Tools.select) {
            selectTool(TileEditorToolbar.Tools.tileMapTileAttributes);
        }
        if (instanceState.tool === TileEditorToolbar.Tools.bucket) {
            instanceState.clampToTile = true;
        }

    } else if (isTileSet()) {

        // Don't allow tile map only tools to be selected
        if (instanceState.tool === TileEditorToolbar.Tools.tileMapTileAttributes) {
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

    state.saveToLocalStorage();

    // Focus the centre tile
    const focusedTile = (Math.floor(getTileGrid().rowCount / 2) * getTileGrid().columnCount) + (Math.floor(getTileGrid().columnCount) / 2);
    tileEditor.setState({
        focusedTile: focusedTile
    });

    refreshProjectUI();
}

/**
 * Change the tile map order in the tile map list.
 * @argument {string} tileMapId
 * @argument {string} targetTileMapId
 * @argument {string} position
 */
function tileMapReorder(tileMapId, targetTileMapId, position) {
    if (tileMapId === targetTileMapId) return;

    const originIndex = getTileMapList().indexOf(tileMapId);
    let targetIndex = getTileMapList().indexOf(targetTileMapId);
    if (position === DropPosition.after) targetIndex++;

    let tileMaps = getTileMapList().getTileMaps();
    if (originIndex === targetIndex) {
        return;
    } else if (originIndex > targetIndex) {
        const deleted = tileMaps.splice(originIndex, 1);
        const start = tileMaps.slice(0, targetIndex);
        const end = tileMaps.slice(targetIndex);
        tileMaps = start.concat(deleted).concat(end);
    } else if (originIndex < targetIndex) {
        const start = tileMaps.slice(0, targetIndex);
        const end = tileMaps.slice(targetIndex);
        const deleted = start.splice(originIndex, 1);
        tileMaps = start.concat(deleted).concat(end);
    }

    addUndoState();

    getTileMapList().setTileMaps(tileMaps);

    state.saveToLocalStorage();

    tileManager.setState({
        tileMapList: getTileMapList()
    });
}


/**
 * Selects a tile map based on index, where the index is out of range the tile set is selected.
 * @param {number?} index - Tile map index in the tile map list.
 */
function tileMapOrTileSetSelectByIndex(index) {
    if (index === null || index < 0 || index >= getTileMapList().length) {
        tileMapOrTileSetSelectById();
    } else {
        const tileMap = getTileMapList().getTileMap(index);
        if (tileMap.tileMapId === getProjectUIState().tileMapId) return;
        tileMapOrTileSetSelectById(tileMap.tileMapId);
    }
}

/**
 * Checks that a tile map is okay.
 * @param {TileMap} tileMap - Tile map to check.
 */
function tileMapCheckAndRepair(tileMap) {
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
function tileSetTileSelectById(tileId) {
    const tile = getTileSet().getTileById(tileId);
    if (tile) {
        getProjectUIState().tileId = tileId;
        state.savePersistentUIStateToLocalStorage();
        tileManager.setState({
            selectedTileId: tileId
        });
    }

    // Set the stamp preview in the canvas
    if (instanceState.tool === TileEditorToolbar.Tools.tileStamp) {
        tileEditor.setState({ tileStampPattern: tile?.tileId ?? null });
    }
}

/**
 * Selects a tile set tile.
 * @param {string?} tileId - Unique ID of the tile set tile.
 */
function tileHighlightById(tileId) {
    if (getUIState().highlightSameTiles) {
        tileEditor.setState({ outlineTileIds: tileId ?? [] })
    } else {
        tileEditor.setState({ outlineTileIds: [] })
    }
}

/**
 * Updates a tile set.
 * @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args
 */
function tileSetUpdate(args) {

    let undoAdded = false;

    // Update tile map
    const tileWidth = (typeof args.tileWidth === 'number') ? args.tileWidth : null;
    if (tileWidth !== null && tileWidth > 0) {
        if (!undoAdded) addUndoState();
        undoAdded = true;
        getTileSet().tileWidth = tileWidth;
    }

    // Update project
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
 * @param {{ mirror: boolean, flip: boolean }} args 
 */
function tileMapClone(tileMapId, args) {
    if (!tileMapId) throw new Error('The tile map ID was invalid.');

    const sourceTileMap = getTileMapList().getTileMapById(tileMapId);

    if (!sourceTileMap) throw new Error('No tile map matched the given ID.');

    addUndoState();

    try {

        const clonedTileMap = TileMapFactory.clone(sourceTileMap);
        clonedTileMap.title += " (copy)";

        if (args?.mirror === true) {
            TileMapUtil.mirrorTileMap(clonedTileMap);
        }

        if (args?.flip === true) {
            TileMapUtil.flipTileMap(clonedTileMap);
        }

        getTileMapList().addTileMap(clonedTileMap);

        tileMapOrTileSetSelectById(clonedTileMap.tileMapId);

        toast.show('Tile map cloned.');

    } catch (e) {

    }
}

/**
 * Deletes a tile map.
 * @param {string} tileMapId - Unique ID of the tile map to delete.
 */
function tileMapRemove(tileMapId) {
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

        state.saveToLocalStorage();

        tileMapOrTileSetSelectById(tileMapId);

        toast.show('Tile map removed.')

    } catch (e) {
        undoManager.removeLastUndo();
        toast.show('Error removing tile map.')
        throw e;
    }
}

/**
 * Updates a tile map.
 * @param {string} tileMapId - Unique ID of the tile map to delete.
 * @param {import("./ui/tileManager.js").TileManagerCommandEventArgs} args
 */
function tileMapUpdate(tileMapId, args) {
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
    if (typeof args.isSprite === 'boolean') {
        tileMap.isSprite = args.isSprite;
    }
    if (Array.isArray(args.paletteSlots) && args.paletteSlots.length > 0) {
        args.paletteSlots.forEach((paletteId, index) => {
            tileMap.setPalette(index, paletteId);
        });
    }

    // Update project
    state.saveToLocalStorage();

    const capabilityType = isTileMap() ? getTileMap().isSprite ? 'sprite' : 'background' : 'background';
    const graphicsCapability = SystemUtil.getGraphicsCapability(getProject().systemType, capabilityType);

    // Update UI
    tileManager.setState({
        tileMapList: getTileMapList(),
        selectedTileMapId: getProjectUIState().tileMapId,
        numberOfPaletteSlots: graphicsCapability.totalPaletteSlots,
        lockedPaletteSlotIndex: graphicsCapability.lockedPaletteIndex
    });
    tileEditor.setState({
        selectedTileIndex: -1,
        tileGrid: getTileGrid(),
        tileSet: getTileSet(),
        paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection(),
        transparencyIndicies: getTransparencyIndicies(),
        lockedPaletteSlotIndex: graphicsCapability.lockedPaletteIndex,
        forceRefresh: true
    });
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
}

/**
 * @param {string} tileMapId 
 * @param {{ mirror: boolean, flip: boolean }} args 
 */
function tileMapMirrorOrFlip(tileMapId, args) {
    if (!tileMapId) throw new Error('The tile map ID was invalid.');
    const tileMap = getTileMapList().getTileMapById(tileMapId);
    if (!tileMap) throw new Error('No tile map matched the given ID.');

    addUndoState();

    try {

        if (args?.mirror === true) {
            TileMapUtil.mirrorTileMap(tileMap);
            toast.show('Tile map mirrored.');
        }

        if (args?.flip === true) {
            TileMapUtil.flipTileMap(tileMap);
            toast.show('Tile map flipped.');
        }

    } catch (e) {
        undoManager.removeLastUndo();
        toast.show('Error mirroring or flipping tile map.')
        throw e;
    }

    // Update project
    state.saveToLocalStorage();

    // Update UI
    tileEditor.setState({
        selectedTileIndex: -1,
        tileGrid: getTileGrid(),
        forceRefresh: true
    });
}

/**
 * @param {string?} field 
 */
function tileMapSort(field) {
    let dir = instanceState.tileMapSort?.direction === 'desc' ? -1 : 1; // Default to ascending
    if (instanceState.tileMapSort?.field !== field) {
        dir = 1; // If different field, sort ascending
    } else if (instanceState.tileMapSort?.field === field) {
        dir *= -1; // If same field, swap sort direction
    }
    let sortedField = null;

    const tileMaps = getTileMapList().getTileMaps();
    switch (field) {
        case TileManager.SortFields.title:
            sortedField = field;
            tileMaps.sort((a, b) => (a.title > b.title ? 1 : -1) * dir);
            break;
    }

    // Record last sort, if last field was null then no valid value was passed so don't record
    if (sortedField) {
        instanceState.tileMapSort = {
            field: sortedField,
            direction: dir === 1 ? 'asc' : 'desc'
        };
    }

    // Update the project
    addUndoState();
    getTileMapList().setTileMaps(tileMaps);
    state.saveProjectToLocalStorage();

    // Set the UI state
    tileManager.setState({
        tileMapList: getTileMapList()
    });
}

/**
 * Clones a tile at a given index.
 * @param {number} index - Tile index to clone.
 */
function tileCloneByIndex(index) {
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
function tileRemoveByIndex(index) {
    if (index < 0 || index >= getTileSet().length) return;

    addUndoState();

    getTileSet().removeTile(index);

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
function tileSwapByIndex(tileAIndex, tileBIndex) {
    if (tileAIndex === tileBIndex) return;
    if (tileAIndex < 0 || tileAIndex >= getTileSet().length) return;
    if (tileBIndex < 0 || tileBIndex >= getTileSet().length) return;

    addUndoState();

    const lowerIndex = Math.min(tileAIndex, tileBIndex);
    const higherIndex = Math.max(tileAIndex, tileBIndex);
    // state.setProject(getProject());

    const lowerTile = getTileSet().getTile(lowerIndex);
    const higherTile = getTileSet().getTile(higherIndex);

    getTileSet().removeTile(lowerIndex);
    getTileSet().insertTileAt(higherTile, lowerIndex);

    getTileSet().removeTile(higherIndex);
    getTileSet().insertTileAt(lowerTile, higherIndex);

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
        const TOOLS = TileEditorToolbar.Tools;

        instanceState.tool = tool;
        instanceState.swapTool = null;

        if (tool !== TOOLS.select) {
            // Select tool
            const tile = getTileSet().getTileByIndex(instanceState.tileIndex);
            if (tile) {
                tileContextToolbar.setState({
                    tileSetTileAttributes: {
                        alwaysKeep: tile.alwaysKeep
                    }
                });
            }
        } else {
            // Was not select tool, de-select any tiles
            if (tool !== TOOLS.select) {
                instanceState.tileIndex = -1;
                tileEditor.setState({
                    selectedTileIndex: instanceState.tileIndex
                });
            }
        }

        // Set the stamp preview in the canvas
        if (tool === TOOLS.tileStamp) {
            if (!getProjectUIState().tileId && getTileSet() && getTileSet().length > 0 || !getTileSet().getTileById(getProjectUIState().tileId)) {
                tileSetTileSelectById(getTileSet().getTile(0).tileId);
            }
            tileEditor.setState({ tileStampPattern: getProjectUIState().tileId });
        } else {
            tileEditor.setState({ tileStampPattern: null });
        }

        if (tool !== TOOLS.tileStamp && getProject() !== null) {
            clearTileStampRegion();
        }

        instanceState.clampToTile = instanceState.userClampToTile;

        let cursor = 'arrow';
        let cursorSize = 1;
        if ([TOOLS.eyedropper, TOOLS.bucket].includes(tool)) {
            cursor = 'crosshair';
        } else if (tool === TOOLS.pencil || tool === TOOLS.colourReplace) {
            cursor = 'crosshair';
            cursorSize = instanceState.pencilSize;
        }

        const disabledCommands = [];
        if (isTileMap() && instanceState.tool === TOOLS.bucket) {
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
            toolstripLayout: getTileContextToolbarLayout(tool),
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

function restoreSwapTool() {
    if (instanceState.swapTool) {
        selectTool(instanceState.swapTool);
        instanceState.swapTool = null;
    }
}

/**
 * Sets the image scale level on the tile editor.
 * @param {number} scale - Must be in allowed scale levels.
 * @param {boolean?} [relativeToMouse] - Scale relative to the mouse position.
 */
function setScale(scale, relativeToMouse) {
    if (typeof scale !== 'number') return;
    if (!TileEditorToolbar.scales.includes(scale)) return;

    getUIState().scale = scale;
    state.saveToLocalStorage();

    setCommonTileToolbarStates({
        scale: scale
    });
    tileEditor.setState({
        forceRefresh: true,
        scale: scale,
        scaleRelativeToMouse: relativeToMouse
    });
}

/**
 * Increases the tile editor display scale.
 * @param {boolean?} [relativeToMouse] - Scale relative to the mouse position.
 */
function increaseScale(relativeToMouse) {
    const scaleIndex = TileEditorToolbar.scales.indexOf(getUIState().scale);
    if (scaleIndex >= TileEditorToolbar.scales.length - 1) return;

    let newScale = TileEditorToolbar.scales[scaleIndex + 1];
    setScale(newScale, relativeToMouse);
}

/**
 * Decreases the tile editor display scale.
 * @param {boolean?} [relativeToMouse] - Scale relative to the mouse position.
 */
function decreaseScale(relativeToMouse) {
    const scaleIndex = TileEditorToolbar.scales.indexOf(getUIState().scale);
    if (scaleIndex <= 0) return;

    let newScale = TileEditorToolbar.scales[scaleIndex - 1];
    setScale(newScale, relativeToMouse);
}

/**
 * Changes the selected palette by palette ID.
 * @param {number} paletteId - Unique palette ID.
 */
function paletteSelectById(paletteId) {
    if (typeof paletteId !== 'string') return;
    let index = getPaletteList().indexOf(paletteId);
    paletteSelectByIndex(index);
}

/**
 * Selects a given palette.
 * @param {number} index - Palette index in the palette list.
 */
function paletteSelectByIndex(index) {
    if (index < 0) index = getPaletteList().length - 1;
    if (index >= getPaletteList().length) index = 0;

    getProjectUIState().paletteIndex = index;
    state.saveToLocalStorage();

    paletteEditor.setState({
        selectedPaletteId: getPalette().paletteId
    });
    tileManager.setState({
        palette: getRenderPalette()
    });
    if (isTileSet()) {
        tileEditor.setState({
            paletteList: getRenderPaletteListToSuitTileMapOrTileSetSelection()
        });
    }
    tileContextToolbar.setState({
        palette: getRenderPalette()
    });
}

function getTransparencyIndicies() {
    const capabilities = SystemUtil.getGraphicsCapabilities(getProject().systemType);
    const result = [];
    if (instanceState.referenceImage?.hasImage() && instanceState.referenceImageTransparencyIndex >= 0) {
        result.push(instanceState.referenceImageTransparencyIndex);
    }
    if (isTileMap()) {
        const capability = getTileMap()?.isSprite ? capabilities.sprite : capabilities.background;
        if (capability.transparencyIndex !== null) {
            result.push(capability.transparencyIndex);
        }
    }
    return result.sort();
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
    tileContextToolbar.setState({
        colourIndex: instanceState.colourIndex
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

Engine.init();

function LoadingScreenManager() {

    const appStartTime = Date.now();
    const loadingContainer = document.querySelector('.sms-loading');
    const appContainer = document.querySelector('.sms-application');

    // Fade in the loading screen
    loadingContainer.style.opacity = '1';

    // Hide the loading screen and show the main content
    this.switchToApp = (minimumTimeout) => {
        const timeSinceLaunch = Date.now() - appStartTime;
        const waitTime = Math.max(10, minimumTimeout - timeSinceLaunch);
        setTimeout(() => {
            loadingContainer.style.opacity = '0';
            appContainer.addEventListener('transitionend', (ev) => {
                if (ev.target === appContainer) {
                    loadingContainer.remove();
                }
            });
            appContainer.style.display = 'block';
            appContainer.style.opacity = '1';
        }, waitTime);
    }
}

window.addEventListener('load', async () => {

    const loadingScreenManager = new LoadingScreenManager();

    instanceState.tool = 'pencil';
    instanceState.colourToolboxTab = 'rgb';

    await patternManager.loadPatterns();

    await initialiseComponents();
    wireUpEventHandlers();
    createEventListeners();
    wireUpGenericComponents();
    await PageModalDialogue.wireUpElementsAsync(document.body);

    // Load and set state
    state.loadProjectEntriesFromLocalStorage();
    state.loadPersistentUIStateFromLocalStorage();

    checkPersistentUIValues();

    // Load initial projects
    let projectEntryList = state.getProjectEntries();
    const sampleManager = await SampleProjectManager.getInstanceAsync();
    instanceState.sampleProjects = await sampleManager.getSampleProjectsAsync();

    const sampleProjects = instanceState.sampleProjects;
    if (projectEntryList.length === 0) {
        for (let i = 0; i < sampleProjects.length; i++) {
            const sampleProject = sampleProjects[i];
            const loadedProject = await sampleManager.loadSampleProjectAsync(sampleProject.url);
            // Add to storage
            state.saveProjectToLocalStorage(loadedProject, false);
            // Default tile map ID
            const defaultTileMap = loadedProject.tileMapList.getTileMapById(sampleProject.defaultTileMapId);
            getProjectUIState(loadedProject).tileMapId = defaultTileMap?.tileMapId ?? null;
        }
        getUIState().lastProjectId = state.getProjectEntries()[0].id;
        state.savePersistentUIStateToLocalStorage();
        projectEntryList = state.getProjectEntries();
    }

    // Load project from URL?
    const params = new URLSearchParams(window.location.search);
    if (params.has('project')) {
        const projectId = params.get('project');
        const project = state.getProjectEntries().filter((p) => p.id === projectId)[0];
        if (project) {
            getUIState().lastProjectId = projectId;
        } else {
            toast.show('Project ID from URL not found.');
        }
    }

    // Load project
    try {
        state.setProjectById(getUIState().lastProjectId, State.Contexts.init);
    } catch {
        const firstProjectId = state.getProjectEntries()[0].id;
        state.setProjectById(firstProjectId, State.Contexts.init);
    }

    // Add event listener for when the user clicks back or forward, so that we load their project
    window.addEventListener('popstate', (e) => {
        if (e.state?.projectId) {
            if (e.state?.projectId !== getProject().id) {
                state.setProjectById(e.state?.projectId, State.Contexts.history);
            }
        }
    });

    projectToolbar.setState({
        projects: projectEntryList
    });
    projectDropdown.setState({
        projects: getSortedProjectArray(projectEntryList, getUIState().projectDropDownSort),
        sampleProjects: sampleProjects
    });

    // Clean up unused project states
    Object.keys(getUIState().projectStates).forEach((projectId) => {
        const found = state.getProjectEntries().filter((p) => p.id === projectId);
        if (found.length === 0) {
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
        visibleToolstrips: [strips.scale, strips.showTileGrid, strips.showPixelGrid, strips.highlightSameTiles]
    });

    tileContextToolbar.setState({
        rowColumnMode: instanceState.rowColumnMode,
        referenceTransparency: instanceState.referenceImageTransparencyIndex,
        referenceLockAspect: instanceState.referenceImageLockAspect,
        patterns: patternManager.getAllPatterns(),
        patternIndex: instanceState.patternIndex,
        patternFixedOrigin: instanceState.patternFixedOrigin,
        colourIndex: instanceState.colourIndex,
        secondaryColourIndex: instanceState.secondaryColourIndex
    });

    selectTool(instanceState.tool);

    welcomeScreen.setState({
        visible: getUIState().welcomeVisibleOnStartup || getProject() instanceof Project === false,
        showWelcomeScreenOnStartUpChecked: getUIState().welcomeVisibleOnStartup,
        visibleCommands: getProject() instanceof Project === true ? ['dismiss'] : [],
        invisibleCommands: getProject() instanceof Project === false ? ['dismiss'] : [],
        projects: getSortedProjectArray(projectEntryList, getUIState().welcomeScreenProjectSort)
    });

    optionsToolbar.setState({
        theme: getUIState().theme,
        backgroundTheme: getUIState().backgroundTheme,
        welcomeOnStartUp: getUIState().welcomeVisibleOnStartup,
        documentationOnStartUp: getUIState().documentationVisibleOnStartup
    });

    observeResizeEvents();

    // Set default background theme
    if (getUIState().backgroundTheme === null) {
        getUIState().backgroundTheme = '01';
    }

    setTimeout(() => {
        themeManager.setTheme(getUIState().theme);
        themeManager.setBackgroundTheme(getUIState().backgroundTheme);
    }, 50);

    // Load general config
    ConfigManager.getInstanceAsync().then(async (configManager) => {
        const config = configManager.config;
        const versionManager = await VersionManager.getInstanceAsync();
        const versionMeta = document.head.querySelector('meta[name="smsgfx-version"]')?.content;
        const versionInfo = (versionMeta) ? versionManager.versions[versionMeta ?? ''] : null;
        const channelInfo = (versionManager) ? versionManager.getChannel(window.location.hostname) : null;

        documentationViewer.setState({
            documentationUrl: config.documentationUrl,
            documentationInlineUrl: config.documentationInlineUrl,
            visible: getUIState().documentationVisibleOnStartup
        });

        welcomeScreen.setState({
            version: versionInfo,
            channel: channelInfo
        });

        // Set handles on Sponsorship buttons
        if (typeof config?.kofiHandle === 'string') {
            const link = document.querySelector('[data-smsgfx-id=kofi-link-footer]');
            link.href = link.getAttribute('data-href').replace('{{HANDLE}}', encodeURIComponent(config.kofiHandle));
            link.classList.remove('visually-hidden');
            link.after(' | ');
        }
        if (typeof config?.patreonHandle === 'string') {
            const link = document.querySelector('[data-smsgfx-id=patreon-link-footer]');
            link.href = link.getAttribute('data-href').replace('{{HANDLE}}', encodeURIComponent(config.patreonHandle));
            link.classList.remove('visually-hidden');
            link.after(' | ');
        }
        // Documentation link
        const link = document.querySelector('[data-smsgfx-id=documentation-link]');
        if (link) {
            link.href = config.documentationInlineUrl ?? config.documentationUrl ?? 'about:blank';
            if (!config.documentationUrl && !config.documentationInlineUrl) {
                link.style.display = 'none';
            } else {
                link.after(' | ');
            }
        }

        // Footer version number
        const versionFooter = document.querySelector('[data-smsgfx-id="version-footer"]');
        if (versionFooter && versionInfo) {
            if (versionFooter) {
                versionFooter.innerHTML = '';
                if (versionInfo) {
                    versionFooter.append(`Version `);
                    const a = document.createElement('a');
                    a.href = versionInfo.releaseNotesUrl;
                    a.title = `Version ${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
                    a.target = `_blank`;
                    a.innerText = `${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
                    versionFooter.append(a);
                } else if (versionMeta) {
                    versionFooter.append(`Version ${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`);
                }
                if (channelInfo) {
                    versionFooter.append(` (${channelInfo.name})`);
                }
                versionFooter.append(versionFooter.innerHTML.length > 0 ? ' | ' : '');
            }
        }

        // Loading screen version number
        const versionLoading = document.querySelector('[data-smsgfx-id="loading-version"]');
        if (versionLoading && versionInfo) {
            versionLoading.innerText = `Version ${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
            versionLoading.classList.remove('visually-hidden');
        }

        loadingScreenManager.switchToApp(1500);
    });
});
