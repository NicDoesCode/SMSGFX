import ModalDialogue from "./modalDialogue.js";
import TemplateUtil from "../util/templateUtil.js";

export default class PrivacyModalDialogue extends ModalDialogue {


    /** @type {HTMLElement} */
    #element;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<PrivacyModalDialogue>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('privacyModalDialogue', element);
        return new PrivacyModalDialogue(componentElement);
    }


    /**
     * Sets the state.
     * @param {PrivacyModalDialogueState} state - State object.
     */
    setState(state) {
    }


    /**
     * @param {PrivacyModalDialogueStateConfirmCallback} callback - Callback to use.
     */
    addHandlerOnConfirm(callback) {
        super.addHandlerOnConfirm(() => {
            callback({});
        });
    }


}


/**
 * Privacy dialogue state object.
 * @typedef {object} PrivacyModalDialogueState
 */

/**
 * Privacy dialogue confirm callback.
 * @callback PrivacyModalDialogueStateConfirmCallback
 * @argument {PrivacyModalDialogueStateConfirmEventArgs} data - Arguments.
 * @exports
 */
/**
 * Privacy dialogue confirm args.
 * @typedef {object} PrivacyModalDialogueStateConfirmEventArgs
 * @exports
 */