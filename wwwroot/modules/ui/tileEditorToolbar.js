import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';
const EVENT_RequestAddTile = 'EVENT_RequestAddTile';
const EVENT_RequestImportTileSet = 'EVENT_RequestImportTileSet';
const EVENT_RequestImportImage = 'EVENT_RequestImportImage';
const EVENT_RequestToolChange = 'EVENT_RequestToolChange';
const EVENT_RequestTileWidthChange = 'EVENT_RequestTileWidthChange';
const EVENT_RequestScaleChange = 'EVENT_RequestScaleChange';
const EVENT_RequestUndo = 'EVENT_RequestUndo';
const EVENT_RequestRedo = 'EVENT_RequestRedo';

const commands = {
    tileAdd: 'tileAdd',
    tileImageImport: 'tileImageImport',
    tileCodeImport: 'tileCodeImport',
    undo: 'undo',
    redo: 'redo',
    toolChange: 'toolChange',
    tileWidth: 'tileWidth',
    scale: 'scale'
}
const tools = {
    select: 'select',
    pencil: 'pencil',
    bucket: 'bucket',
    eyedropper: 'eyedropper'
};
const scales = [1, 2, 5, 10, 15, 20, 50];

export default class TileEditorToolbar {


    static get Commands() {
        return commands;
    }

    static get Tools() {
        return tools;
    }

    static get scales() {
        return scales;
    }


    /** @type {HTMLDivElement} */
    #element;
    #lastScale = 1;
    #dispatcher;


    /**
     * Initialises a new instance of the tile manager.
     * @param {HTMLElement} element - Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => this.#handleToolbarButton(element);
        });

        this.#element.querySelectorAll(`[data-command=${commands.tileWidth}]`).forEach(element => {
            element.onchange = () => this.#handleTileWidthChange(element);
        });

        this.#element.querySelectorAll(`select[data-command=${commands.scale}]`).forEach(element => {
            element.onchange = () => this.#handleScaleChange(element);
        });
    }


    /**
     * Sets the state of the tile editor.
     * @param {TileEditorToolbarState} state - State object.
     */
    setState(state) {
        if (typeof state?.tileWidth === 'number') {
            this.#getElement(commands.tileWidth).value = state.tileWidth;
        }
        if (typeof state?.selectedTool === 'string') {
            this.#highlightTool(state.selectedTool);
        }
        if (typeof state?.scale === 'number') {
            this.#getElement(commands.scale).value = state.scale;
        }
        if (typeof state?.undoEnabled === 'boolean' || typeof state?.undoEnabled === 'number') {
            if (state.undoEnabled) {
                this.#getElement(commands.undo).removeAttribute('disabled');
            } else {
                this.#getElement(commands.undo).setAttribute('disabled', 'disabled');
            }
        }
        if (typeof state?.redoEnabled === 'boolean' || typeof state?.redoEnabled === 'number') {
            if (state.redoEnabled) {
                this.#getElement(commands.redo).removeAttribute('disabled');
            } else {
                this.#getElement(commands.redo).setAttribute('disabled', 'disabled');
            }
        }
    }


    /**
     * Handler for when a command is received from the toolbar.
     * @param {TileEditorToolbarCommandCallback} callback - Callback function.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    #handleToolbarButton(element) {
        const command = element.getAttribute('data-command');
        const args = this.#createArgs(command);
        if (command === commands.toolChange && element.hasAttribute('data-tool')) {
            args.tool = element.getAttribute('data-tool');
        }
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }

    /**
     * @param {HTMLElement} element 
     */
    #handleTileWidthChange(element) {
        const command = element.getAttribute('data-command');
        const args = this.#createArgs(command);
        element.classList.remove('is-invalid');
        if (args.tileWidth > 0 && args.tileWidth <= 64) {
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        } else {
            element.classList.add('is-invalid');
        }
    }

    #handleScaleChange(element) {
        const command = element.getAttribute('data-command');
        const args = this.#createArgs(command);
        if (args.scale !== this.#lastScale) {
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
            this.#lastScale = args.scale;
        }
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

    /**
     * @param {string} command - The command.
     * @returns {TileEditorToolbarCommandEventArgs}
     */
    #createArgs(command) {
        const tileWidth = parseInt(this.#getElement(commands.tileWidth).value);
        const scale = parseInt(this.#getElement(commands.scale).value);
        return {
            command: command,
            scale: scale,
            tileWidth: tileWidth,
            tool: null
        };
    }

    #getElement(command) {
        return this.#element.querySelector(`[data-command=${command}]`);
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
 * Tile editor toolbar callback.
 * @callback TileEditorToolbarCommandCallback
 * @param {TileEditorToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorToolbarCommandEventArgs
 * @property {string} command - Command being issued.
 * @property {string} tool - Current selected tool.
 * @property {number} tileWidth - Current tile width.
 * @property {number} scale - Current sale value.
 * @exports
 */
