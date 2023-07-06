import ModalDialogue from "./../modalDialogue.js";
import TemplateUtil from "../../util/templateUtil.js";

export default class NewProjectDialogue extends ModalDialogue {


    /** @type {HTMLTextAreaElement} */
    #tbTileSetData;
    /** @type {HTMLInputElement} */
    #tbReplaceTiles;
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
        this.#tbReplaceTiles = this.#element.querySelector('[data-smsgfx-id=check-replace-tiles]');
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<NewProjectDialogue>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/newProjectDialogue', element);
        return new NewProjectDialogue(componentElement);
    }


    /**
     * Sets the state of the tile set import dialogue.
     * @param {NewProjectDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state?.tileSetData === 'string') {
            this.#tbTileSetData.value = state.tileSetData;
        }
        if (typeof state?.replace === 'boolean' || typeof state?.replace === 'number') {
            this.#tbReplaceTiles.checked = state.replace;
        }
    }


    /**
     * @param {NewProjectDialogueConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({
                tileSetData: this.#tbTileSetData.value,
                replace: this.#tbReplaceTiles.checked
            });
        });
    }


}


/**
 * Import tile set dialogue state object.
 * @typedef {object} NewProjectDialogueState
 * @property {string?} tileSetData - The WLA-DLX assembly code that contains the tiles.
 * @property {boolean?} replace - Should the 'replace tiles' checkbox be checked?
 */

/**
 * Import tile set dialogue confirm callback.
 * @callback NewProjectDialogueConfirmCallback
 * @argument {NewProjectDialogueConfirmEventArgs} data - Data from the dialogue.
 * @exports
 */
/**
 * Import tile set dialogue confirm args.
 * @typedef {object} NewProjectDialogueConfirmEventArgs
 * @property {string} tileSetData - The WLA-DLX assembly code that contains the palette.
 * @property {boolean} replace - 'true' if existing tiles should be replaced, otherwise 'false'.
 * @exports
 */