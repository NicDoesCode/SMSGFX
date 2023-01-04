import EventDispatcher from "../components/eventDispatcher.js";
import TemplateUtil from "../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    exportCode: 'exportCode',
    exportImage: 'exportImage'
}

export default class ExportToolbar {


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
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                const args = this.#createArgs(element.getAttribute('data-command'));
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        // Prevent pressing 'Enter' on the title field from submitting.
        this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
            element.onchange = () => {
                const args = this.#createArgs(element.getAttribute('data-command'));
                args.title = element.value;
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
            element.onkeydown = (keyEvent) => {
                if (keyEvent.code === 'Enter') {
                    element.onchange();
                    keyEvent.stopImmediatePropagation();
                    return false;
                }
            };
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ExportToolbar>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('exportToolbar', element);
        return new ExportToolbar(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {ExportToolbarState} state - State to set.
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
     * @param {ExportToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @returns {ExportToolbarCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command
        };
    }


}


/**
 * Export toolbar state.
 * @typedef {object} ExportToolbarState
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 */

/**
 * Export toolbar callback.
 * @callback ExportToolbarCommandCallback
 * @param {ExportToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} ExportToolbarCommandEventArgs
 * @property {string} command - The command being invoked.
 * @exports
 */

