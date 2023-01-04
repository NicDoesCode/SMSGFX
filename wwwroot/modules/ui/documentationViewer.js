import TemplateUtil from "../util/templateUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    close: 'close'
}

export default class DocumentationViewer {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                /** @type {DocumentationViewerCommandEventArgs} */
                const args = { command: element.getAttribute('data-command') };
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<DocumentationViewer>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.injectComponentAsync('documentationViewer', element);
        return new DocumentationViewer(componentElement);
    }


    /**
     * Sets the state.
     * @param {DocumentationViewerState} state - State object.
     */
    setState(state) {
        if (typeof state?.visible === 'boolean') {
            if (state.visible) {
                this.#element.classList.remove('visually-hidden');
            } else {
                this.#element.classList.add('visually-hidden');
            }
        }
    }


    /**
     * Registers a handler for a command.
     * @param {DocumentationViewerCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * Documentation viewer state object.
 * @typedef {object} DocumentationViewerState
 * @property {string} visible - Should the sidebar be visible?
 * @exports
 */

/**
 * When a command is issued from the palette editor.
 * @callback DocumentationViewerCommandCallback
 * @param {DocumentationViewerCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} DocumentationViewerCommandEventArgs
 * @property {string} command - The command being invoked.
 * @exports
 */
