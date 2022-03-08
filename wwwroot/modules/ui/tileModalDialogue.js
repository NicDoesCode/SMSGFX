import ModalDialogue from "./modalDialogue.js";

export default class TileModalDialogue extends ModalDialogue {

    
    get inputData() {
        return this.#tbLoadTiles.value;
    }
    set inputData(value) {
        this.#tbLoadTiles.value = value;
    }


    /** @type {HTMLTextAreaElement} */
    #tbLoadTiles = document.getElementById('tbLoadTiles');


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
    }


}