import ModalDialogue from "./modalDialogue.js";
import EventDispatcher from "../components/eventDispatcher.js";

export default class PaletteModalDialogue extends ModalDialogue {


    /** @type {HTMLSelectElement} */
    #tbPaletteSystem;
    /** @type {HTMLTextAreaElement} */
    #tbPaletteData;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
        this.#tbPaletteSystem = document.getElementById('tbPaletteSystem');
        this.#tbPaletteData = document.getElementById('tbPaletteData');
    }


    /**
     * Shows the dialogue with assembly data.
     * @param {string} system - The system to be imported, either 'ms' or 'gg'.
     * @param {string} paletteData - The WLA-DLX assembly code that contains the palette.
     */
    show(system, paletteData) {
        this.#tbPaletteSystem.value = system;
        this.#tbPaletteData.value = paletteData;
        super.show();
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