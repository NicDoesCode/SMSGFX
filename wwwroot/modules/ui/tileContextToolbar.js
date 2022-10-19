import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const toolbarButtons = {
    cut: 'cut', copy: 'copy', paste: 'paste',
    clone: 'clone', remove: 'remove',
    moveLeft: 'moveLeft', moveRight: 'moveRight',
    mirrorHorizontal: 'mirrorHorizontal', mirrorVertical: 'mirrorVertical',
    insertBefore: 'insertBefore', insertAfter: 'insertAfter'
}

export default class TileContextToolbar {


    static get ToolbarButtons() {
        return toolbarButtons;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {HTMLButtonElement[]} */
    #buttonArray = [];
    /** @type {{HTMLButtonElement}} */
    #buttons = {};
    #dispatcher;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - HTML element that contains the toolbar markup.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        element.querySelectorAll('[data-command]').forEach(button => {
            const command = button.getAttribute('data-command');
            this.#buttonArray.push(button);
            this.#buttons[command] = button;
            /** @type {TileContextToolbarCommandEventArgs} */
            const args = { command: command };
            button.onclick = () => this.#dispatcher.dispatch(EVENT_OnCommand, args);
        });
    }


    /**
     * Sets the state of the tile context toolbar.
     * @param {TileContextToolbarState} state - State object.
     */
    setState(state) {
        if (state) {
            if (typeof state.visible === 'boolean') {
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
            } else if (state.disabledButtons && Array.isArray(state.disabledButtons)) {
                this.#buttonArray.forEach(button => {
                    button.removeAttribute('disabled');
                });
                state.disabledButtons.forEach(disabledButton => {
                    if (disabledButton && typeof disabledButton === 'string') {
                        if (this.#buttons[disabledButton]) {
                            this.#buttons[disabledButton].addAttribute('disabled', 'disabled');
                        }
                    }
                });
            }
        }
    }


    /**
     * Register a callback for when a command button is clicked on the tile context toolbar.
     * @param {TileContextToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnButtonCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * @typedef {object} TileContextToolbarState
 * @property {string[]?} disabledButtons - An array of strings containing disabled buttons.
 * @property {boolean?} visible - An array of strings containing disabled buttons.
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
 * @exports
 */

