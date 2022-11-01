import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    cut: 'cut', copy: 'copy', paste: 'paste',
    clone: 'clone', remove: 'remove',
    moveLeft: 'moveLeft', moveRight: 'moveRight',
    mirrorHorizontal: 'mirrorHorizontal', mirrorVertical: 'mirrorVertical',
    insertBefore: 'insertBefore', insertAfter: 'insertAfter',
    brushSize: 'brushSize'
}
const toolstrips = {
    select: 'select', pencil: 'pencil'
}

export default class TileContextToolbar {


    static get Commands() {
        return commands;
    }

    static get Toolstrips() {
        return toolstrips;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {{HTMLButtonElement}} */
    #buttons = {};
    #dispatcher;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - HTML element that contains the toolbar markup.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(button => {
            button.onclick = () => {
                /** @type {TileContextToolbarCommandEventArgs} */
                const args = {
                    command: button.getAttribute('data-command'),
                    brushSize: parseInt(button.getAttribute('data-brush-size') ?? 0)
                };
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
        });
    }


    /**
     * Sets the state of the tile context toolbar.
     * @param {TileContextToolbarState} state - State object.
     */
    setState(state) {
        if (typeof state?.visible === 'boolean') {
            // Set visibility
            if (state.visible) {
                while (this.#element.classList.contains('visually-hidden')) {
                    this.#element.classList.remove('visually-hidden');
                }
            } else {
                if (!this.#element.classList.contains('visually-hidden')) {
                    this.#element.classList.add('visually-hidden');
                }
            }
        }
        if (state?.disabledCommands && Array.isArray(state.disabledCommands)) {
            this.#element.querySelectorAll('[data-command]').forEach(button => {
                button.removeAttribute('disabled');
            });
            state.disabledCommands.forEach(disabledButton => {
                if (disabledButton && typeof disabledButton === 'string') {
                    if (this.#buttons[disabledButton]) {
                        this.#buttons[disabledButton].addAttribute('disabled', 'disabled');
                    }
                }
            });
        }
        if (typeof state?.brushSize === 'number') {
            this.#element.querySelectorAll(`[data-command=${commands.brushSize}]`).forEach(button => {
                button.classList.remove('active');
                const size = parseInt(button.getAttribute('data-brush-size'));
                if (size === state.brushSize) {
                    button.classList.add('active');
                }
            });
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
     * Register a callback for when a command button is clicked on the tile context toolbar.
     * @param {TileContextToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * @typedef {object} TileContextToolbarState
 * @property {boolean?} visible - Is the toolbar visible?
 * @property {boolean?} enabled - Is the toolbar enabled?
 * @property {string[]?} visibleToolstrips - An array of strings containing visible toolstrips.
 * @property {string[]?} disabledCommands - An array of strings containing disabled buttons.
 * @property {number?} brushSize - Selected brush size, 1 to 5.
 * @exports
 */

/**
 * Tile editor tool UI callback.
 * @callback TileContextToolbarCommandCallback
 * @param {TileContextToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileContextToolbarCommandEventArgs
 * @property {string} command - Command being invoked.
 * @property {number} brushSize - Brush size, 1 to 5.
 * @exports
 */

