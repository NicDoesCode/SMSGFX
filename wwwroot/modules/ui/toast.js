import ComponentBase from "./componentBase.js";
import TemplateUtil from "../util/templateUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    shown: 'shown',
    hidden: 'hidden'
}

export default class Toast extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {HTMLTemplateElement} */
    #template;
    #toast;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();
        this.#template = this.#element.querySelector('template');
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<Toast>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('toast', element);
        return new Toast(componentElement);
    }


    /**
     * Shows a toast with given content.
     * @param {string} content - Content to display in the toast.
     */
    show(content) {
        this.#createToast(content);
    }


    /**
     * @param {string} content 
     */
    #createToast(content) {
        const toastContainerElm = document.createElement('div');
        toastContainerElm.innerHTML = this.#template.innerHTML;
        const toastElm = toastContainerElm.querySelector('.toast');
        this.#element.appendChild(toastElm);

        const contentElm = toastElm.querySelector('[data-smsgfx-id=content]');
        if (contentElm) {
            contentElm.innerText = content;
        }

        toastElm.addEventListener('shown.bs.toast', () => {
            const args = this.#createArgs(commands.shown);
            args.content = content;
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        });
        toastElm.addEventListener('hidden.bs.toast', () => {
            const args = this.#createArgs(commands.hidden);
            args.content = content;
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        });

        const toast = bootstrap.Toast.getOrCreateInstance(toastElm);
        toast.show();
    }


    /**
     * Sets the state.
     * @param {ToastState} state - State object.
     */
    setState(state) {
    }


    /**
     * Registers a handler for a command.
     * @param {ToastCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @param {string} content 
     * @returns {ToastCommandEventArgs}
     */
    #createArgs(command, content) {
        return {
            command: command,
            content: content
        };
    }


}


/**
 * State object.
 * @typedef {Object} ToastState
 * @exports
 */

/**
 * Command callback.
 * @callback ToastCommandCallback
 * @param {ToastCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * Command event args.
 * @typedef {Object} ToastCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} content - Content that was displayed.
 * @exports
 */
