import ModalDialogue from "./modalDialogue.js";
import Export from "./../export.js";

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

    /**
     * 
     * @param {TileSet} tileSet 
     * @param {PaletteList} palettes 
     */
    generateExportData(tileSet, palettes) {
        const exp = new Export();
        this.inputData = exp.getExportData(tileSet, palettes);
    }


}