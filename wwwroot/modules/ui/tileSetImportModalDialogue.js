import ModalDialogue from "./modalDialogue.js";

export default class TileSetImportModalDialogue extends ModalDialogue {


    /** @type {HTMLTextAreaElement} */
    #tbTileSetData;


    /**
     * Initialises a new instance of the AddPaletteModalDialogue class.
     * @param {HTMLDivElement} element The DIV that contains the modal.
     */
    constructor(element) {
        super(element);
        this.#tbTileSetData = element.querySelector('#tbTileSetData');
    }


    /**
     * Shows the dialogue with assembly data.
     * @param {string} tileSetData - The WLA-DLX assembly code that contains the tiles.
     */
    show(tileSetData) {
        this.#tbTileSetData.value = tileSetData;
        super.show();
    }


    /**
     * @param {TileSetImportModalDialogueConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({
                tileSetData: this.#tbTileSetData.value
            });
        });
    }


}


/**
 * Import tile set dialogue confirm callback.
 * @callback TileSetImportModalDialogueConfirmCallback
 * @argument {TileSetImportModalDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * Import tile set dialogue confirm args.
 * @typedef {object} TileSetImportModalDialogueConfirmEventArgs
 * @property {string} tileSetData - The WLA-DLX assembly code that contains the palette.
 * @exports
 */