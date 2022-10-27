import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    swapColour: 'swapColour',
    replaceColour: 'replaceColour'
}

export default class PaletteEditorContextMenu {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement} */
    #btnMenuActivate;
    /** @type {EventDispatcher} */
    #dispatcher;
    #dropDown;
    #colourIndex = -1;


    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#btnMenuActivate = element.querySelector('[data-smsgfx-id=button-palette-editor-activate]');
        this.#dropDown = new bootstrap.Dropdown(this.#btnMenuActivate);

        this.#element.querySelector('button[data-command=swap-colour]').onclick = (event) => {
            /** @type {HTMLSelectElement} */
            const select = this.#element.querySelector('select[data-value=swap-colour]');
            /** @type {PaletteEditorContextMenuCommandEventArgs} */
            const args = {
                command: commands.swapColour,
                sourceColourIndex: this.#colourIndex,
                targetColourIndex: parseInt(select.value)
            };
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };

        this.#element.querySelector('button[data-command=replace-colour]').onclick = (event) => {
            /** @type {HTMLSelectElement} */
            const select = this.#element.querySelector('select[data-value=replace-colour]');
            /** @type {PaletteEditorContextMenuCommandEventArgs} */
            const args = {
                command: commands.replaceColour,
                sourceColourIndex: this.#colourIndex,
                targetColourIndex: parseInt(select.value)
            };
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };
    }


    /**
     * Shows the context menu.
     * @param {number} clientX - X coordinate relative to the client viewport.
     * @param {number} clientY - Y coordinate relative to the client viewport.
     * @returns {boolean}
     */
    show(clientX, clientY) {
        // Position menu to mouse pointer
        const rect = this.#element.getBoundingClientRect();
        this.#btnMenuActivate.style.top = `${(clientY - rect.top - 5)}px`;
        this.#btnMenuActivate.style.left = `${(clientX - rect.left - 5)}px`;

        // Launch menu
        this.#btnMenuActivate.click();

        // Prevent default action of Boostrap context menu.
        return false;
    }


    /**
     * Sets the state of the context menu.
     * @param {PaletteEditorContextMenuState} state - State object.
     */
    setState(state) {
        if (typeof state?.colourIndex === 'number') {
            this.#element.querySelector('[data-smsgfx-id=heading]').innerHTML = `Colour #${state.colourIndex}`;
            this.#colourIndex = state?.colourIndex;
        } else {
            this.#element.querySelector('[data-smsgfx-id=heading]').innerHTML = `Colour`;
            this.#colourIndex = -1;
        }
        if (state?.position && typeof state.position.x === 'number' && typeof state.position.y === 'number') {
            // Position menu to mouse pointer
            const position = state.position;
            const rect = this.#element.getBoundingClientRect();
            console.log(rect);
            this.#btnMenuActivate.style.left = `${position.x - rect.left - 5}px`;
            this.#btnMenuActivate.style.top = `${position.y - rect.top - 5}px`;
        }
        if (typeof state?.visible === 'boolean') {
            // Set visibility
            if (state.visible) {
                this.#dropDown.show();
            } else {
                this.#dropDown.hide();
            }
        }
    }


    /**
     * Register a callback for when a command is invoked.
     * @param {PaletteEditorContextMenuCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * @typedef {object} PaletteEditorContextMenuState
 * @property {number?} colourIndex - Palette colour index from 0 to 15.
 * @property {boolean?} visible - Visibility of the menu.
 * @property {{x: number, y: number}?} position - Screen position to display the menu.
 * @exports
 */

/**
 * Tile editor tool UI callback.
 * @callback PaletteEditorContextMenuCommandCallback
 * @param {PaletteEditorContextMenuCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} PaletteEditorContextMenuCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {number} sourceColourIndex - Source palette colour index from 0 to 15.
 * @property {number} targetColourIndex - Target palette colour index from 0 to 15.
 * @exports
 */

