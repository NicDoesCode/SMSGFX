import ModalDialogue from "./modalDialogue.js";
import EventDispatcher from "../eventDispatcher.js";

export default class PaletteModalDialogue extends ModalDialogue {


    /** @type {HTMLSelectElement} */
    #tbPaletteInputSystem = document.getElementById('tbPaletteInputSystem');
    /** @type {HTMLTextAreaElement} */
    #tbPaletteInput = document.getElementById('tbPaletteInput');


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
    }


    /**
     * Shows the dialogue with assembly data.
     * @param {string} system - The system to be imported, either 'ms' or 'gg'.
     * @param {string} paletteData - The WLA-DLX assembly code that contains the palette.
     */
    show(system, paletteData) {
        this.#tbPaletteInputSystem.value = system;
        this.#tbPaletteInput.value = paletteData;
        super.show();
    }


    /**
     * 
     * @param {PaletteConfirmDialogueCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({
                system: this.#tbPaletteInputSystem.value,
                paletteData: this.#tbPaletteInput.value
            });
        });
    }


}


/**
 * Import palette dialogue confirm callback.
 * @callback PaletteConfirmDialogueCallback
 * @argument {PaletteConfirmDialogueEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * Import palette dialogue confirm args.
 * @typedef {object} PaletteConfirmDialogueEventArgs
 * @property {string} system - The system to be imported, either 'ms' or 'gg'.
 * @property {string} paletteData - The WLA-DLX assembly code that contains the palette.
 * @exports
 */