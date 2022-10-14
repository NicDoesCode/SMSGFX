import ModalDialogue from "./modalDialogue.js";
import Export from "./../export.js";
import ProjectFactory from "../factory/projectFactory.js";
import ProjectAssemblySerialiser from "../serialisers/projectAssemblySerialiser.js";

export default class ExportModalDialogue extends ModalDialogue {


    get value() {
        return this.#tbExport.value;
    }
    set value(value) {
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