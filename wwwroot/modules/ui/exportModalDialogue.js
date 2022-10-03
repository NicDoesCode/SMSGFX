import ModalDialogue from "./modalDialogue.js";

export default class ExportModalDialogue extends ModalDialogue {

    
    get inputData() {
        return this.#tbExport.value;
    }
    set inputData(value) {
        this.#tbExport.value = value;
    }


    /** @type {HTMLTextAreaElement} */
    #tbExport = document.getElementById('tbExport');


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
    }


}