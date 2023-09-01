import ComponentBase from "./componentBase.js";
import TemplateUtil from "../util/templateUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    close: 'close',
    popOut: 'popOut',
    shown: 'shown',
    hidden: 'hidden'
}

export default class DocumentationViewer extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {HTMLIFrameElement} */
    #iframe;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#iframe = this.#element.querySelector('[data-smsgfx-id=documentation-iframe]');

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                const args = this.#createArgs(element.getAttribute('data-command'));
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        this.addHandlerOnCommand((args) => {
            if (args.command === commands.shown) {
                if (!this.#iframe.hasAttribute('src') && this.#iframe.hasAttribute('data-src')) {
                    this.#iframe.src = this.#iframe.getAttribute('data-src');
                }
            }
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<DocumentationViewer>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('documentationViewer', element);
        return new DocumentationViewer(componentElement);
    }


    /**
     * Sets the state.
     * @param {DocumentationViewerState} state - State object.
     */
    setState(state) {
        if (typeof state.documentationInlineUrl === 'string' && state.documentationInlineUrl !== '') {
            this.#iframe.setAttribute('data-src', state.documentationInlineUrl);
            if (this.#iframe.hasAttribute('src')) this.#iframe.src = state.documentationInlineUrl;
        } else if (typeof state.documentationUrl === 'string' && state.documentationUrl !== '') {
            this.#iframe.setAttribute('data-src', state.documentationUrl);
            if (this.#iframe.hasAttribute('src')) this.#iframe.src = state.documentationUrl;
        }
        if (typeof state?.visible === 'boolean') {
            if (state.visible) {
                this.#element.classList.remove('visually-hidden');
                document.body.setAttribute('data-smsgfx-documentation', 'true');
                this.#dispatcher.dispatch(EVENT_OnCommand, this.#createArgs(commands.shown));
            } else {
                this.#element.classList.add('visually-hidden');
                document.body.removeAttribute('data-smsgfx-documentation');
                this.#dispatcher.dispatch(EVENT_OnCommand, this.#createArgs(commands.hidden));
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


    /**
     * Creates command arguments.
     * @param {string} command - Command being issued.
     * @returns {DocumentationViewerCommandEventArgs}
     */
    #createArgs(command) {
        // TODO: CORS access exception when trying to access URL of embedded help page.
        // See if CORS can be fixed.
        return { 
            command: command,
            currentDocumentationUrl: this.#iframe.src
        };
    }


}


/**
 * Documentation viewer state object.
 * @typedef {object} DocumentationViewerState
 * @property {string?} [documentationUrl] - URL for main documentation.
 * @property {string?} [documentationInlineUrl] - URL for inline help.
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
 * @property {string} currentDocumentationUrl - Current URL being displayed in the the documentation iframe.
 * @exports
 */
