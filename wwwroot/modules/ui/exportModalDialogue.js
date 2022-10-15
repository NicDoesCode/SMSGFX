import ModalDialogue from "./modalDialogue.js";

export default class ExportModalDialogue extends ModalDialogue {


    /** @type {HTMLTextAreaElement} */
    #tbExport = document.getElementById('tbExport');


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
    }


    /**
     * Shows the dialogue with assembly data.
     * @param {string} code - Assembly code to show.
     */
    show(code) {
        this.#tbExport.value = code
        super.show();
    }


}