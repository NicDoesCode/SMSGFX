import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_RequestAddTile = 'EVENT_RequestAddTile';
const EVENT_RequestImportTileSet = 'EVENT_RequestImportTileSet';
const EVENT_RequestImportImage = 'EVENT_RequestImportImage';
const EVENT_RequestToolChange = 'EVENT_RequestToolChange';
const EVENT_RequestTileWidthChange = 'EVENT_RequestTileWidthChange';
const EVENT_RequestScaleChange = 'EVENT_RequestScaleChange';
const EVENT_RequestUndo = 'EVENT_RequestUndo';
const EVENT_RequestRedo = 'EVENT_RequestRedo';

const tools = { select: 'select', pencil: 'pencil', bucket: 'bucket', eyedropper: 'eyedropper' };
const scales = [1, 2, 5, 10, 15, 20, 50];

export default class TileEditorToolbar {


    static get Tools() {
        return tools;
    }

    static get scales() {
        return scales;
    }


    /**
     * Gets the current pixel scale value.
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
    /** @type {HTMLButtonElement} */
    #btnImageImport;
    /** @type {HTMLInputElement} */
    #tbTileSetWidth;
    /** @type {HTMLSelectElement} */
    #tbTileSetScale;
    /** @type {HTMLButtonElement} */
    #btnToolUndo;
    /** @type {HTMLButtonElement} */
    #btnToolRedo;
    #lastScale = 1;
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

        this.#btnImageImport = this.#element.querySelector('#btnImageImport');
        this.#btnImageImport.onclick = (e) => this.#handleRequestImportImage(e);

        this.#btnTilesImport = this.#element.querySelector('#btnTilesImport');
        this.#btnTilesImport.onclick = (e) => this.#handleRequestImportTilesFromCode(e);

        this.#tbTileSetWidth = this.#element.querySelector('#tbTileSetWidth');
        this.#tbTileSetWidth.onchange = (e) => this.#handleTileSetWidthChange(e);

        this.#tbTileSetScale = this.#element.querySelector('#tbTileSetScale');
        this.#tbTileSetScale.onchange = (e) => this.#handleScaleChange(e);

        this.#btnToolUndo = this.#element.querySelector('#btnToolUndo');
        this.#btnToolUndo.onclick = (e) => this.#handleToolUndoClick(e);

        this.#btnToolRedo = this.#element.querySelector('#btnToolRedo');
        this.#btnToolRedo.onclick = (e) => this.#handleToolRedoClick(e);

        const toolButtons = this.#element.querySelectorAll('button[data-tool]');
        toolButtons.forEach(toolButton => {
            toolButton.onclick = (e) => this.#handleToolChanged(e, toolButton.getAttribute('data-tool'));
        });
    }


    /**
     * Sets the state of the tile editor.
     * @param {TileEditorToolbarState} state - State object.
     */
    setState(state) {
        if (typeof state?.tileWidth === 'number') {
            this.#tileWidth = state.tileWidth;
        }
        if (typeof state?.selectedTool === 'string') {
            this.#highlightTool(state.selectedTool);
        }
        if (typeof state?.scale === 'number') {
            this.#scaleValue = state.scale;
        }
        if (typeof state?.undoEnabled === 'boolean' || typeof state?.undoEnabled === 'number') {
            if (state.undoEnabled) {
                this.#btnToolUndo.removeAttribute('disabled');
            } else {
                this.#btnToolUndo.setAttribute('disabled', 'disabled');
            }
        }
        if (typeof state?.redoEnabled === 'boolean' || typeof state?.redoEnabled === 'number') {
            if (state.redoEnabled) {
                this.#btnToolRedo.removeAttribute('disabled');
            } else {
                this.#btnToolRedo.setAttribute('disabled', 'disabled');
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
    addHandlerRequestImportImage(callback) {
        this.#dispatcher.on(EVENT_RequestImportImage, callback);
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
     * Triggered when scale level is changed.
     * @param {TileEditorToolbarUICallback} callback - Callback function.
     */
    addHandlerRequestScaleChange(callback) {
        this.#dispatcher.on(EVENT_RequestScaleChange, callback);
    }


    /**
     * @param {string} toolName
     */
    #highlightTool(toolName) {
        const buttons = this.#element.querySelectorAll('button[data-tool]');
        buttons.forEach(button => {
            if (button.getAttribute('data-tool') === toolName) {
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

    #handleRequestImportImage(event) {
        this.#dispatcher.dispatch(EVENT_RequestImportImage, {});
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

    #handleScaleChange(event) {
        const newScale = this.#scaleValue;
        if (newScale !== this.#lastScale) {
            /** @type {TileEditorToolbarUIEventArgs} */
            const args = { scale: newScale };
            this.#dispatcher.dispatch(EVENT_RequestScaleChange, args);
            this.#lastScale = newScale;
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
        /** @type {TileEditorToolbarUIEventArgs} */
        const args = { tool: tool };
        this.#dispatcher.dispatch(EVENT_RequestToolChange, args);
    }


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
 * @property {number} scale - Current sale value.
 * @exports
 */


