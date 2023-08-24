import ModalDialogue from "./../modalDialogue.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";
import TileMapList from "../../models/tileMapList.js";
import TileMapListing from "../components/tileMapListing.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const optimiseModes = {
    'default': 'default',
    'always': 'always',
    'never': 'never'
}

const commands = {
    update: 'update',
    clipboard: 'clipboard',
    download: 'download'
}

export default class AssemblyExportModalDialogue extends ModalDialogue {


    static get Commands() {
        return commands;
    }

    static get OptimiseModes() {
        return optimiseModes;
    }


    /** @type {HTMLElement} */
    #element;
    #dispatcher;
    /** @type {TileMapList} */
    #tileMapList = null;
    /** @type {HTMLTextAreaElement} */
    #tbExport;
    /** @type {HTMLSelectElement} */
    #tbOptimiseMode;
    /** @type {HTMLInputElement} */
    #tbExportTileMaps;
    /** @type {HTMLInputElement} */
    #tbExportTileSet;
    /** @type {HTMLInputElement} */
    #tbExportPalettes;
    /** @type {HTMLInputElement} */
    #tbMemoryOffset;
    /** @type {TileMapListing} */
    #tileMapListing;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbExport = this.#element.querySelector('[data-smsgfx-id=export-text]');
        this.#tbOptimiseMode = this.#element.querySelector('[data-smsgfx-id=optimise-mode]');
        this.#tbExportTileMaps = this.#element.querySelector('[data-smsgfx-id=export-tile-maps]');
        this.#tbExportTileSet = this.#element.querySelector('[data-smsgfx-id=export-tile-set]');
        this.#tbExportPalettes = this.#element.querySelector('[data-smsgfx-id=export-palettes]');
        this.#tbMemoryOffset = this.#element.querySelector('[data-smsgfx-id=memory-offset]');

        TileMapListing.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-map-listing]'))
            .then((component) => {
                this.#tileMapListing = component;
                this.#tileMapListing.addHandlerOnCommand((args) => this.#handleTileMapListingOnCommand(args));
            });

        TemplateUtil.wireUpLabels(this.#element);
        TemplateUtil.wireUpCommandAutoEvents(this.#element, (element, event, command) => this.handleAutoEvent(element, event, command));
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<AssemblyExportModalDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/assemblyExportModalDialogue', element);
        return new AssemblyExportModalDialogue(componentElement);
    }


    /**
     * Sets the state.
     * @param {AssemblyExportModalDialogueState} state - State object.
     */
    setState(state) {
        let tileMapListingDirty = false;

        if (typeof state?.content === 'string') {
            this.#tbExport.value = state.content ?? '';
        }

        if (state?.tileMapList && state.tileMapList instanceof TileMapList) {
            this.#tileMapList = state.tileMapList;
            tileMapListingDirty = true;
        }

        if (state?.optimiseMode) if (optimiseModes[state.optimiseMode]) {
            this.#tbOptimiseMode.value = state.optimiseMode;
        } else {
            console.warn(`Unknown optimise mode: ${state.optimiseMode}`);
        }

        if (typeof state?.exportTileMaps === 'boolean') {
            this.#tbExportTileMaps.checked = state.exportTileMaps;
        }

        if (typeof state?.exportTileSet === 'boolean') {
            this.#tbExportTileSet.checked = state.exportTileSet;
        }

        if (typeof state?.exportPalettes === 'boolean') {
            this.#tbExportPalettes.checked = state.exportPalettes;
        }

        if (typeof state?.vramOffset === 'number') {
            this.#tbMemoryOffset.value = state.vramOffset;
        }

        if (tileMapListingDirty) {
            this.#tileMapListing.setState({
                tileMapList: this.#tileMapList
            });
        }

        if (Array.isArray(state.selectedTileMapIds)) {
            this.#element.querySelectorAll('[data-smsgfx-id=tile-maps] input').forEach((element) => {
                if (state.selectedTileMapIds.includes(element.getAttribute('data-tile-map-id'))) {
                    element.checked = true
                }
            });
        }

        if (typeof state?.selectAllTileMaps === 'boolean' && state.selectAllTileMaps) {
            this.#element.querySelectorAll('[data-smsgfx-id=tile-maps] input').forEach((element) => {
                element.checked = true
            });
        }
    }


    /**
     * Register a callback for when a command is invoked.
     * @param {AssemblyExportDialogueCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {HTMLElement} element 
     * @param {string} event 
     * @param {string} command 
     */
    handleAutoEvent(element, event, command) {
        if (element && command && commands[command]) {
            this.#dispatcher.dispatch(EVENT_OnCommand, this.#createArgs(command));
        }
    }


    #handleTileMapListingOnCommand(args) {
        if (args?.command && commands[args.command]) {
            this.#dispatcher.dispatch(EVENT_OnCommand, this.#createArgs(args.command));
        }
    }

    /**
     * @param {HTMLElement} element 
     * @returns {AssemblyExportDialogueCommandEventArgs}
     */
    #createArgs(command) {
        const tileMapIds = [];
        this.#element.querySelectorAll('[data-smsgfx-id=tile-maps] input').forEach((element) => {
            if (element.checked) tileMapIds.push(element.getAttribute('data-tile-map-id'));
        });
        /** @type {AssemblyExportDialogueCommandEventArgs} */
        return {
            command: command,
            optimiseMode: this.#tbOptimiseMode.value,
            selectedTileMapIds: tileMapIds,
            exportTileMaps: this.#tbExportTileMaps.checked,
            exportTileSet: this.#tbExportTileSet.checked,
            exportPalettes: this.#tbExportPalettes.checked,
            vramOffset: parseInt(this.#tbMemoryOffset.value)
        };
    }


}


/**
 * State object.
 * @typedef {object} AssemblyExportModalDialogueState
 * @property {string?} content - Exported content to display.
 * @property {boolean?} [selectAllTileMaps] - Selects all tile maps.
 * @property {string[]?} [selectedTileMapIds] - The selected tile map IDs.
 * @property {TileMapList?} [tileMapList] - Tile map list to be displayed in the listing.
 * @property {string?} [optimiseMode] - What is the currently selected optimise mode?
 * @property {boolean?} [exportTileMaps] - Export tile maps?
 * @property {boolean?} [exportTileSet] - Export the tile set?
 * @property {boolean?} [exportPalettes] - Export palettes?
 * @property {number?} vramOffset - Offset of the tiles in the tile map in bytes.
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback AssemblyExportDialogueCommandCallback
 * @argument {AssemblyExportDialogueCommandCallback} data - Arguments.
 * @exports
 */
/**
 * @typedef {object} AssemblyExportDialogueCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string[]} selectedTileMapIds - The selected tile map IDs.
 * @property {string} optimiseMode - What is the currently selected optimise mode?
 * @property {boolean} exportTileMaps - Export tile maps?
 * @property {boolean} exportTileSet - Export the tile set?
 * @property {boolean} exportPalettes - Export palettes?
 * @property {number} vramOffset - Offset of the tiles in the tile map in bytes.
 * @exports
 */