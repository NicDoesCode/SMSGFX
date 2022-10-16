import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_RequestAddTile = 'EVENT_RequestAddTile';
const EVENT_RequestImportTileSet = 'EVENT_RequestImportTileSet';
const EVENT_RequestToolChange = 'EVENT_RequestToolChange';
const EVENT_RequestTileWidthChange = 'EVENT_RequestTileWidthChange';
const EVENT_RequestZoomChange = 'EVENT_RequestZoomChange';
const EVENT_RequestUndo = 'EVENT_RequestUndo';
const EVENT_RequestRedo = 'EVENT_RequestRedo';

const tools = ['pencil', 'bucket'];

export default class TileEditorToolbar {


    /**
     * Gets the current pixel zoom value.
     */
    get #scaleValue() {
        return parseInt(this.#tbTileSetScale.value);
    }
    set #scaleValue(value) {
        this.#tbTileSetScale.value = value;
    }

    /**
     * Gets the current tile width value.
     */
    get #tileWidth() {
        return parseInt(this.#tbTileSetWidth.value);
    }
    set #tileWidth(value) {
        this.#tbTileSetWidth.value = value;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement} */
    #btnTilesAddTile;
    /** @type {HTMLButtonElement} */
    #btnTilesImport;
    /** @type {HTMLInputElement} */
    #tbTileSetWidth;
    /** @type {HTMLSelectElement} */
    #tbTileSetScale;
    /** @type {HTMLButtonElement} */
    #btnToolUndo;
    /** @type {HTMLButtonElement} */
    #btnToolRedo;
    #lastZoom = 1;
    #dispatcher;


    /**
     * Initialises a new instance of the tile manager.
     * @param {HTMLElement} element - Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#btnTilesAddTile = this.#element.querySelector('#btnTilesAddTile');
        this.#btnTilesAddTile.onclick = (e) => this.#handleRequestAddTile(e);

        this.#btnTilesImport = this.#element.querySelector('#btnTilesImport');
        this.#btnTilesImport.onclick = (e) => this.#handleRequestImportTilesFromCode(e);

        this.#tbTileSetWidth = this.#element.querySelector('#tbTileSetWidth');
        this.#tbTileSetWidth.onchange = (e) => this.#handleTileSetWidthChange(e);

        this.#tbTileSetScale = this.#element.querySelector('#tbTileSetScale');
        this.#tbTileSetScale.onchange = (e) => this.#handleZoomChange(e);

        this.#btnToolUndo = this.#element.querySelector('#btnToolUndo');
        this.#btnToolUndo.onclick = (e) => this.#handleToolUndoClick(e);

        this.#btnToolRedo = this.#element.querySelector('#btnToolRedo');
        this.#btnToolRedo.onclick = (e) => this.#handleToolRedoClick(e);

        const toolButtons = this.#element.querySelectorAll('button[data-tool-button]');
        toolButtons.forEach(toolButton => {
            toolButton.onclick = (e) => this.#handleToolChanged(e, toolButton.getAttribute('data-tool-button'));
        });
    }


    /**
     * @typedef {object} TileEditorToolbarState
     * @property {number?} tileWidth - Tile width to display.
     * @property {string?} selectedTool - Currently selected tool.
     * @property {number?} scale - New scale level.
     * @property {boolean?} undoEnabled - Is the user able to undo?
     * @property {boolean?} redoEnabled - Is the user able to redo?
     * @exports 
     */
    /**
     * Sets the state of the tile editor.
     * @param {TileEditorToolbarState} state - State object.
     */
    setState(state) {
        if (state) {
            if (typeof state.tileWidth === 'number') {
                this.#tileWidth = state.tileWidth;
            }
            if (typeof state.selectedTool === 'string' && tools.includes(state.selectedTool)) {
                this.#highlightTool(state.selectedTool);
            }
            if (typeof state.scale === 'number') {
                this.#scaleValue = state.scale;
            }
            if (typeof state.undoEnabled === 'boolean' || typeof state.undoEnabled === 'number') {
                if (state.undoEnabled) {
                    this.#btnToolUndo.removeAttribute('disabled');
                } else {
                    this.#btnToolUndo.setAttribute('disabled', 'disabled');
                }
            }
            if (typeof state.redoEnabled === 'boolean' || typeof state.redoEnabled === 'number') {
                if (state.redoEnabled) {
                    this.#btnToolRedo.removeAttribute('disabled');
                } else {
                    this.#btnToolRedo.setAttribute('disabled', 'disabled');
                }
            }
        }
    }


    /**
     * Triggered when add new tile is requested.
     * @param {TileEditorToolbarCallback} callback - Callback function.
     */
    addHandlerRequestAddTile(callback) {
        this.#dispatcher.on(EVENT_RequestAddTile, callback);
    }

    /**
     * Triggered when import tile set from code is requested.
     * @param {TileEditorToolbarCallback} callback - Callback function.
     */
    addHandlerRequestImportTileSetFromCode(callback) {
        this.#dispatcher.on(EVENT_RequestImportTileSet, callback);
    }

    /**
     * Triggered when undo is requested.
     * @param {TileEditorToolbarCallback} callback - Callback function.
     */
    addHandlerRequestUndo(callback) {
        this.#dispatcher.on(EVENT_RequestUndo, callback);
    }

    /**
     * Triggered when redo is requested.
     * @param {TileEditorToolbarCallback} callback - Callback function.
     */
    addHandlerRequestRedo(callback) {
        this.#dispatcher.on(EVENT_RequestRedo, callback);
    }

    /**
     * Triggered when tool change requested.
     * @param {TileEditorToolbarUICallback} callback - Callback function.
     */
    addHandlerRequestToolChange(callback) {
        this.#dispatcher.on(EVENT_RequestToolChange, callback);
    }

    /**
     * Triggered when tile width is changed.
     * @param {TileEditorToolbarUICallback} callback - Callback function.
     */
    addHandlerRequestTileWidthChange(callback) {
        this.#dispatcher.on(EVENT_RequestTileWidthChange, callback);
    }

    /**
     * Triggered when zoom level is changed.
     * @param {TileEditorToolbarUICallback} callback - Callback function.
     */
    addHandlerRequestZoomChange(callback) {
        this.#dispatcher.on(EVENT_RequestZoomChange, callback);
    }


    /**
     * Highlights selected tool.
     * @param {string} toolName Tool to highlight.
     */
    #highlightTool(toolName) {
        const buttons = this.#element.querySelectorAll('button[data-tool-button]');
        buttons.forEach(button => {
            if (button.getAttribute('data-tool-button') === toolName) {
                button.classList.remove('btn-outline-secondary');
                if (!button.classList.contains('btn-secondary')) {
                    button.classList.add('btn-secondary');
                }
            } else {
                button.classList.remove('btn-secondary');
                if (!button.classList.contains('btn-outline-secondary')) {
                    button.classList.add('btn-outline-secondary');
                }
            }
        });
    }


    #handleRequestAddTile(event) {
        this.#dispatcher.dispatch(EVENT_RequestAddTile, {});
    }

    #handleRequestImportTilesFromCode(event) {
        this.#dispatcher.dispatch(EVENT_RequestImportTileSet, {});
    }

    #handleTileSetWidthChange(event) {
        const newTileWidth = this.#tileWidth;
        if (!isNaN(newTileWidth) && newTileWidth > 0 && newTileWidth <= 16) {
            /** @type {TileEditorToolbarUIEventArgs} */
            const args = { tileWidth: newTileWidth };
            this.#dispatcher.dispatch(EVENT_RequestTileWidthChange, args);
            this.#tbTileSetWidth.classList.remove('is-invalid');
        } else if (!this.#tbTileSetWidth.classList.contains('is-invalid')) {
            this.#tbTileSetWidth.classList.add('is-invalid');
        }
    }

    #handleZoomChange(event) {
        const newZoom = this.#scaleValue;
        if (newZoom !== this.#lastZoom) {
            /** @type {TileEditorToolbarUIEventArgs} */
            const args = { zoom: newZoom };
            this.#dispatcher.dispatch(EVENT_RequestZoomChange, args);
            this.#lastZoom = newZoom;
        }
    }

    #handleToolUndoClick(event) {
        this.#dispatcher.dispatch(EVENT_RequestUndo, {});
    }

    #handleToolRedoClick(event) {
        this.#dispatcher.dispatch(EVENT_RequestRedo, {});
    }

    /** @param {string} tool */
    #handleToolChanged(event, tool) {
        if (tool && tools.includes(tool)) {
            /** @type {TileEditorToolbarUIEventArgs} */
            const args = { tool: tool };
            this.#dispatcher.dispatch(EVENT_RequestToolChange, args);
        }
    }


}

/**
 * Tile editor toolbar event callback.
 * @callback TileEditorToolbarCallback
 * @param {object} args - Arguments.
 * @exports
 */
/**
 * Tile editor tool UI callback.
 * @callback TileEditorToolbarUICallback
 * @param {TileEditorToolbarUIEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorToolbarUIEventArgs
 * @property {string} tool - Current selected tool.
 * @property {number} tileWidth - Current tile width.
 * @property {number} zoom - Current zoom value.
 * @exports
 */


