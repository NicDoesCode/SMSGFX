import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    feedback: 'feedback'
}

export default class FeedbackToolbar extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        TemplateUtil.wireUpLabels(this.#element);
        TemplateUtil.wireUpCommandAutoEvents(this.#element, (sender, ev, command) => {
            this.#handleCommand(sender, command);
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<FeedbackToolbar>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('toolbars/feedbackToolbar', element);
        return new FeedbackToolbar(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {FeedbackToolbarState} state - State to set.
     */
    setState(state) {
        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (Array.isArray(state?.enabledCommands)) {
            const enabled = state.enabledCommands;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                if (enabled.includes(element.getAttribute('data-command'))) {
                    element.removeAttribute('disabled');
                }
            });
        }

        if (Array.isArray(state?.disabledCommands)) {
            const disabled = state.disabledCommands;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                if (disabled.includes(element.getAttribute('data-command'))) {
                    element.setAttribute('disabled', 'disabled');
                }
            });
        }
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {FeedbackToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {HTMLElement} sender 
     * @param {string} command 
     */
    #handleCommand(sender, command) {
        const args = this.#createArgs(command);
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


    /**
     * @param {string} command
     * @returns {FeedbackToolbarCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command
        };
    }


}


/**
 * State object.
 * @typedef {Object} FeedbackToolbarState
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 */

/**
 * Event callback.
 * @callback FeedbackToolbarCommandCallback
 * @param {FeedbackToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} FeedbackToolbarCommandEventArgs
 * @property {string} command - The command being invoked.
 * @exports
 */

