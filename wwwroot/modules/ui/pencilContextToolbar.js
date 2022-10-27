import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    brushSize: 'brushSize'
}

export default class PencilContextToolbar {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    #dispatcher;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - HTML element that contains the toolbar markup.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        element.querySelectorAll('[data-command=brush-size]').forEach(button => {
            const size = parseInt(button.getAttribute('data-brush-size'));
            /** @type {PencilContextToolbarEventArgs} */
            const args = { command: commands.brushSize, brushSize: size };
            button.onclick = () => this.#dispatcher.dispatch(EVENT_OnCommand, args);
        });
    }


    /**
     * Sets the state of the pencil context toolbar.
     * @param {PencilContextToolbarState} state - State object.
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
        if (typeof state?.brushSize === 'number') {
            this.#element.querySelectorAll('[data-command=brush-size]').forEach(button => {
                button.classList.remove('active');
                const size = parseInt(button.getAttribute('data-brush-size'));
                if (size === state.brushSize) {
                    button.classList.add('active');
                }
            });
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
 * @typedef {object} PencilContextToolbarState
 * @property {boolean?} visible - Visibility of the toolbar.
 * @property {number?} brushSize - Selected brush size, 1 to 5.
 * @exports
 */

/**
 * Tile editor tool UI callback.
 * @callback PencilContextToolbarCommandCallback
 * @param {PencilContextToolbarEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} PencilContextToolbarEventArgs
 * @property {string} command - The command being invoked.
 * @property {number} brushSize - Brush size, 1 to 5.
 * @exports
 */

