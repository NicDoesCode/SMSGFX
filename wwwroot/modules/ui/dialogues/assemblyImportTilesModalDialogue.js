import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";

export default class AssemblyImportTilesModalDialogue extends ModalDialogue {


    /** @type {HTMLTextAreaElement} */
    #tbTileSetData;
    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#tbTileSetData = this.#element.querySelector('[data-smsgfx-id=text-tile-data]');
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<AssemblyImportTilesModalDialogue>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/assemblyImportTilesModalDialogue', element);
        return new AssemblyImportTilesModalDialogue(componentElement);
    }


    /**
     * Sets the state of the tile set import dialogue.
     * @param {AssemblyImportTilesModalDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state?.tileSetData === 'string') {
            this.#tbTileSetData.value = state.tileSetData;
        }
    }


    /**
     * @param {AssemblyImportTilesModalDialogueConfirmCallback} callback - Callback to use.
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
 * Import tile set dialogue state object.
 * @typedef {object} AssemblyImportTilesModalDialogueState
 * @property {string?} tileSetData - The WLA-DLX assembly code that contains the tiles.
 */

/**
 * Import tile set dialogue confirm callback.
 * @callback AssemblyImportTilesModalDialogueConfirmCallback
 * @argument {AssemblyImportTilesModalDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * Import tile set dialogue confirm args.
 * @typedef {object} AssemblyImportTilesModalDialogueConfirmEventArgs
 * @property {string} tileSetData - The WLA-DLX assembly code that contains the palette.
 * @exports
 */