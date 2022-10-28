import ModalDialogue from "./modalDialogue.js";

export default class PaletteModalDialogue extends ModalDialogue {


    /** @type {HTMLSelectElement} */
    #tbPaletteSystem;
    /** @type {HTMLTextAreaElement} */
    #tbPaletteData;
    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#tbPaletteSystem = this.#element.querySelector('[data-smsgfx-id=select-palette-system]');
        this.#tbPaletteData = this.#element.querySelector('[data-smsgfx-id=text-palette-data]');
    }


    /**
     * Sets the state of the palette import dialogue.
     * @param {PaletteImportModalDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state?.system === 'string') {
            this.#tbPaletteSystem.value = state.system;
        }
        if (typeof state?.paletteData === 'string') {
            this.#tbPaletteData.value = state.paletteData;
        }
    }


    /**
     * Adds an event handler for when the user confirms the palette modal dialogue.
     * @param {PaletteImportModalDialogueConfirmCallback} callback - Callback function.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({
                system: this.#tbPaletteSystem.value,
                paletteData: this.#tbPaletteData.value
            });
        });
    }


}


/**
 * Import tile set dialogue state object.
 * @typedef {object} PaletteImportModalDialogueState
 * @property {string} system - The system to be imported, either 'ms' or 'gg'.
 * @property {string} paletteData - The WLA-DLX assembly code that contains the palette.
 */

/**
 * Import palette dialogue confirm callback.
 * @callback PaletteImportModalDialogueConfirmCallback
 * @argument {PaletteImportModalDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * Import palette dialogue confirm args.
 * @typedef {object} PaletteImportModalDialogueConfirmEventArgs
 * @property {string} system - The system to be imported, either 'ms' or 'gg'.
 * @property {string} paletteData - The WLA-DLX assembly code that contains the palette.
 * @exports
 */