import ModalDialogue from "./modalDialogue.js";
import TemplateUtil from "../util/templateUtil.js";

export default class ExportModalDialogue extends ModalDialogue {


    /** @type {HTMLTextAreaElement} */
    #tbExport = document.getElementById('tbExport');


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element.querySelector('[data-smsgfx-id=modal]'));
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ExportModalDialogue>}
     */
     static async loadIntoAsync(element) {
        await TemplateUtil.loadURLIntoAsync('./modules/ui/exportModalDialogue.html', element);
        return new ExportModalDialogue(element); 
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