import ModalDialogue from "./modalDialogue.js";
import TemplateUtil from "../util/templateUtil.js";

export default class ExportModalDialogue extends ModalDialogue {


    /** @type {HTMLElement} */
    #element;
    /** @type {HTMLTextAreaElement} */
    #tbExport;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#tbExport = this.#element.querySelector('[data-smsgfx-id=export-text]');
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ExportModalDialogue>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.injectComponentAsync('exportModalDialogue', element);
        return new ExportModalDialogue(componentElement);
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