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
     * @param {Object} [options] - Options for the alert.
     * @param {'INFO'|'SUCCESS'|'ERROR'|'WARNING'} [options.type] - Optional, the type of message being conveyed, omit for default.
     * @param {'INFO'|'SUCCESS'|'ERROR'|'WARNING'} [options.icon] - Optional, icon to display, omit for none.
     */
    show(content, options) {
        this.#createToast(content, options);
    }


    /**
     * @param {string} content - Text content for the alert.
     * @param {Object} [options] - Options for the alert.
     * @param {'INFO'|'SUCCESS'|'ERROR'|'WARNING'} [options.type] - Optional, the type of message being conveyed, omit for default.
     * @param {'INFO'|'SUCCESS'|'ERROR'|'WARNING'} [options.icon] - Optional, icon to display, omit for none.
     */
    #createToast(content, options) {
        const toastContainerElm = document.createElement('div');
        toastContainerElm.innerHTML = this.#template.innerHTML;
        const toastElm = toastContainerElm.querySelector('.toast');
        this.#element.appendChild(toastElm);
        /** @type {HTMLButtonElement} */ 
        const closeButton = toastElm.querySelector('[data-smsgfx-id=close-button]');
        const type = options?.type ?? null;
        const icon = options?.icon ?? null;

        const contentElm = toastElm.querySelector('[data-smsgfx-id=content]');
        if (contentElm) {

            // Set the icon
            if (icon === 'INFO') {
                contentElm.appendChild(createIcon('info-circle-fill'));
            } else if (icon === 'SUCCESS') {
                contentElm.appendChild(createIcon('check-circle-fill'));
            } else if (icon === 'ERROR') {
                contentElm.appendChild(createIcon('x-circle-fill'));
            } else if (icon === 'WARNING') {
                contentElm.appendChild(createIcon('exclamation-triangle-fill'));
            }

            // Set the content
            if (typeof content === 'string') {
                const innerContentElm = document.createElement('p');
                innerContentElm.classList.add('p-0', 'm-0', 'd-inline-block', 'float-start', 'align-self-center');
                innerContentElm.innerText = content;
                contentElm.appendChild(innerContentElm);
            }
        }

        // Set the style
        if (type === 'INFO') {
            toastElm.classList.add('border-0', 'text-bg-info');
            if (closeButton) closeButton.classList.add('sms-btn-close-dark');
        } else if (type === 'SUCCESS') {
            toastElm.classList.add('border-0', 'text-bg-success');
            if (closeButton) closeButton.classList.add('btn-close-white');
        } else if (type === 'ERROR') {
            toastElm.classList.add('border-0', 'text-bg-danger');
            if (closeButton) closeButton.classList.add('btn-close-white');
        } else if (type === 'WARNING') {
            toastElm.classList.add('border-0', 'text-bg-warning');
            if (closeButton) closeButton.classList.add('sms-btn-close-dark');
        }

        // Wire up events
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



/**
 * @param {string} iconName 
 */
function createIcon(iconName) {
    const iconElm = document.createElement('i');
    iconElm.classList.add(`bi`, `bi-${iconName}`, `me-2`, `fs-4`, `float-start`, `align-self-start`);
    return iconElm;
}
