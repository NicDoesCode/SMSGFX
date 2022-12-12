import ModalDialogue from "./modalDialogue.js";
import TemplateUtil from "../util/templateUtil.js";

export default class AboutModalDialogue extends ModalDialogue {


    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element.querySelector('[data-smsgfx-id=modal]'));
        this.#element = element;
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<AboutModalDialogue>}
     */
     static async loadIntoAsync(element) {
        await TemplateUtil.injectComponentAsync('aboutModalDialogue', element);
        return new AboutModalDialogue(element); 
    }


    /**
     * Sets the state.
     * @param {AboutModalDialogueState} state - State object.
     */
    setState(state) {
    }


    /**
     * @param {AboutModalDialogueStateConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({});
        });
    }


}


/**
 * About dialogue state object.
 * @typedef {object} AboutModalDialogueState
 */

/**
 * About dialogue confirm callback.
 * @callback AboutModalDialogueStateConfirmCallback
 * @argument {AboutModalDialogueStateConfirmEventArgs} data - Arguments.
 * @exports
 */
/**
 * About dialogue confirm args.
 * @typedef {object} AboutModalDialogueStateConfirmEventArgs
 * @exports
 */