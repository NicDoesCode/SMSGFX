import ModalDialogue from "./modalDialogue.js";

export default class PaletteModalDialogue extends ModalDialogue {


    get inputSystem() {
        return this.#tbPaletteInputSystem.value;
    }
    set inputSystem(value) {
        if (!value || (value !== 'ms' && value !== 'gg')) {
            throw new Error('System must be either "ms" or "gg".');
        }
        this.#tbPaletteInputSystem.value = value;
    }

    get inputData() {
        return this.#tbPaletteInput.value;
    }
    set inputData(value) {
        this.#tbPaletteInput.value = value;
    }

    
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


}