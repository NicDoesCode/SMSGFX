import GeneralUtil from "../util/generalUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";
import TemplateUtil from "../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileAdd: 'tileAdd',
    tileImageImport: 'tileImageImport',
    tileCodeImport: 'tileCodeImport',
    undo: 'undo',
    redo: 'redo',
    toolChange: 'toolChange',
    tileWidth: 'tileWidth',
    scale: 'scale',
    showTileGrid: 'showTileGrid',
    showPixelGrid: 'showPixelGrid'
}
const tools = {
    select: 'select',
    pencil: 'pencil',
    bucket: 'bucket',
    eyedropper: 'eyedropper',
    referenceImage: 'referenceImage'
};
const scales = [1, 2, 5, 10, 15, 20, 50];
const toolstrips = {
    tileAdd: 'tileAdd', scale: 'scale', tileWidth: 'tileWidth', tools: 'tools', undo: 'undo',
    showTileGrid: 'showTileGrid', showPixelGrid: 'showPixelGrid'
}

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

    static get ToolStrips() {
        return toolstrips;
    }


    /** @type {HTMLDivElement} */
    #element;
    #lastScale = 1;
    #dispatcher;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
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

        this.#element.querySelectorAll(`input[type=checkbox][data-command]`).forEach(element => {
            element.onchange = () => this.#handleCheckedChanged(element);
        });

        this.#element.querySelectorAll('[data-labelled-by]').forEach(element => {
            const labelledBy = element.getAttribute('data-labelled-by');
            const labelElm = this.#element.querySelector(`label[for=${labelledBy}]`)
            if (labelElm) {
                const id = `smsgfx${GeneralUtil.generateRandomString(16)}`;
                labelElm.setAttribute('for', id);
                element.id = id;
            }
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileEditorToolbar>}
     */
    static async loadIntoAsync(element) {
        await TemplateUtil.loadURLIntoAsync('./modules/ui/tileEditorToolbar.html', element);
        return new TileEditorToolbar(element);
    }


    /**
     * Sets the state of the tile editor.
     * @param {TileEditorToolbarState} state - State object.
     */
    setState(state) {
        if (typeof state?.tileWidth === 'number') {
            const elm = this.#getElement(commands.tileWidth);
            if (elm) elm.value = state.tileWidth;
        }
        if (typeof state?.selectedTool === 'string') {
            this.#highlightTool(state.selectedTool);
        }
        if (typeof state?.scale === 'number') {
            const elm = this.#getElement(commands.scale);
            if (elm) elm.value = state.scale;
        }
        if (typeof state?.undoEnabled === 'boolean' || typeof state?.undoEnabled === 'number') {
            const elm = this.#getElement(commands.undo);
            if (elm) {
                if (state.undoEnabled) {
                    elm.removeAttribute('disabled');
                } else {
                    elm.setAttribute('disabled', 'disabled');
                }
            }
        }
        if (typeof state?.redoEnabled === 'boolean' || typeof state?.redoEnabled === 'number') {
            const elm = this.#getElement(commands.redo);
            if (elm) {
                if (state.redoEnabled) {
                    elm.removeAttribute('disabled');
                } else {
                    elm.setAttribute('disabled', 'disabled');
                }
            }
        }
        if (typeof state?.showTileGridChecked === 'boolean' || typeof state?.showTileGridChecked === 'number') {
            const elm = this.#getElement(commands.showTileGrid);
            if (elm) elm.checked = state?.showTileGridChecked;
        }
        if (typeof state?.showPixelGridChecked === 'boolean' || typeof state?.showPixelGridChecked === 'number') {
            const elm = this.#getElement(commands.showPixelGrid);
            if (elm) elm.checked = state?.showPixelGridChecked;
        }
        if (state?.visibleToolstrips && Array.isArray(state.visibleToolstrips)) {
            this.#element.querySelectorAll('[data-toolstrip]').forEach(element => {
                const toolstrip = element.getAttribute('data-toolstrip');
                if (state.visibleToolstrips.includes(toolstrip)) {
                    while (element.classList.contains('visually-hidden')) {
                        element.classList.remove('visually-hidden');
                    }
                } else {
                    element.classList.add('visually-hidden');
                }
            });
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
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

    /**
     * @param {HTMLSelectElement} element 
     */
    #handleScaleChange(element) {
        const command = element.getAttribute('data-command');
        const args = this.#createArgs(command);
        if (args.scale !== this.#lastScale) {
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
            this.#lastScale = args.scale;
        }
    }

    /**
     * @param {HTMLInputElement} element 
     */
    #handleCheckedChanged(element) {
        const command = element.getAttribute('data-command');
        const args = this.#createArgs(command);
        if (command === commands.showTileGrid) args.showTileGrid = element.checked;
        if (command === commands.showPixelGrid) args.showPixelGrid = element.checked;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
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
        const tileWidth = parseInt(this.#getElement(commands.tileWidth)?.value ?? 0);
        const scale = parseInt(this.#getElement(commands.scale)?.value ?? 1);
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
 * @property {boolean?} enabled - Is the toolbar enabled?
 * @property {string[]?} visibleToolstrips - An array of strings containing visible toolstrips.
 * @property {number?} tileWidth - Tile width to display.
 * @property {string?} selectedTool - Currently selected tool.
 * @property {number?} scale - New scale level.
 * @property {boolean?} undoEnabled - Is the user able to undo?
 * @property {boolean?} redoEnabled - Is the user able to redo?
 * @property {boolean?} showTileGridChecked - Should the 'show tile grid' option be checked?
 * @property {boolean?} showPixelGridChecked - Should the 'show pixel grid' option be checked?
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
 * @property {number} showTileGrid - Value for show tile grid.
 * @property {number} showPixelGrid - Value for show pixel grid.
 * @exports
 */
