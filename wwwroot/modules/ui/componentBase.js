import TemplateUtil from "../util/templateUtil.js";

const RX_NAME = /^[\w+-_@#]+$/i;

export default class ComponentBase {


    /** @type {Object.<string, { template: object, componentBase: ComponentBase }>} */
    #templates = {};


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     * @param {ComponentBase} [componentBase] - Top level hierachy component base element.
     */
    constructor(element, componentBase) {
        ComponentBase.#extractTemplates(element, componentBase ?? this);
        TemplateUtil.wireUpTabPanels(element);
    }


    /**
     * 
     * @param {HTMLElement} element 
     * @param {ComponentBase} componentBase 
     */
    static #extractTemplates(element, componentBase) {
        element.querySelectorAll(`script[type=${CSS.escape('text/x-handlebars-template')}][data-smsgfx-template-id]`).forEach((scriptElm) => {
            const id = scriptElm.getAttribute('data-smsgfx-template-id');
            if (id && id.length > 0 && RX_NAME.test(id)) {
                const source = scriptElm.innerHTML;
                componentBase.#templates[id] = {
                    template: Handlebars.compile(source),
                    componentBase: componentBase
                }
                scriptElm.remove();
            }
        });
    }

    /**
     * Renders a template to HTML string.
     * @param {string} id - Unique ID of the template to render.
     * @param {object} data - Object containing the data to use for render.
     * @returns {string?}
     */
    renderTemplate(id, data) {
        if (id && id.length > 0 && RX_NAME.test(id) && this.#templates[id]) {
            return this.#templates[id].template(data);
        }
        return null;
    }

    /**
     * Replaces all child elements in a given element with rendered template content.
     * @param {HTMLElement} element - Element to render the template to.
     * @param {string} id - Unique ID of the template to render.
     * @param {object} data - Object containing the data to use for render.
     */
    renderTemplateToElement(element, id, data) {
        if (element) {
            const html = this.renderTemplate(id, data);
            if (html) {
                element.innerHTML = html;
            }
        }
    }

    /**
     * Override to handle auto events.
     * @param {HTMLElement} element - Element that generated the event.
     * @param {string} event - Name of the event that occurred.
     * @param {string} command - Name of the command that was invoked.
     * @param {Event} domEvent - The DOM event that occurred.
     */
    handleAutoEvent(element, event, command, domEvent) {
    }


}
