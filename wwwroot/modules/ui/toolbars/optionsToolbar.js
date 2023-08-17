import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    changeTheme: 'changeTheme',
    changeBackgroundTheme: 'changeBackgroundTheme',
    changeWelcomeOnStartUp: 'changeWelcomeOnStartUp',
    changeDocumentationOnStartUp: 'changeDocumentationOnStartUp'
}

export default class OptionsToolbar extends ComponentBase {


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

        this.#element.querySelectorAll('[data-command]').forEach(element => {
            element.onchange = () => {
                const args = this.#createArgs(element.getAttribute('data-command'));
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<OptionsToolbar>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('toolbars/optionsToolbar', element);
        return new OptionsToolbar(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {OptionsToolbarState} state - State to set.
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

        if (typeof state?.theme === 'string') {
            this.#element.querySelector(`[data-command=${commands.changeTheme}]`).value = state.theme;
        }

        if (typeof state?.backgroundTheme === 'string') {
            this.#element.querySelector(`[data-command=${commands.changeBackgroundTheme}]`).value = state.backgroundTheme;
        } else if (state?.backgroundTheme === null) {
            this.#element.querySelector(`[data-command=${commands.changeBackgroundTheme}]`).value = 'none';
        }

        if (typeof state?.welcomeOnStartUp === 'boolean') {
            this.#element.querySelector(`[data-command=${commands.changeWelcomeOnStartUp}]`).checked = state.welcomeOnStartUp;
        }

        if (typeof state?.documentationOnStartUp === 'boolean') {
            this.#element.querySelector(`[data-command=${commands.changeDocumentationOnStartUp}]`).checked = state.documentationOnStartUp;
        }
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {OptionsToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @returns {OptionsToolbarCommandEventArgs}
     */
    #createArgs(command) {
        const elmBackgroundTheme = this.#element.querySelector(`[data-command=${commands.changeBackgroundTheme}]`);
        return {
            command: command,
            theme: this.#element.querySelector(`[data-command=${commands.changeTheme}]`).value,
            backgroundTheme: this.#element.querySelector(`[data-command=${commands.changeBackgroundTheme}]`).value,
            welcomeOnStartUp: this.#element.querySelector(`[data-command=${commands.changeWelcomeOnStartUp}]`).checked,
            documentationOnStartUp: this.#element.querySelector(`[data-command=${commands.changeDocumentationOnStartUp}]`).checked
        };
    }


}


/**
 * State object.
 * @typedef {object} OptionsToolbarState
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {string?} theme - Selected theme.
 * @property {string?} backgroundTheme - Selected background theme.
 * @property {boolean?} welcomeOnStartUp - Welcome screen on start-up.
 * @property {boolean?} documentationOnStartUp - Documentation on start-up.
 */

/**
 * Command callback.
 * @callback OptionsToolbarCommandCallback
 * @param {OptionsToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} OptionsToolbarCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} theme - The theme to change to.
 * @property {string} backgroundTheme - The background theme to change to.
 * @property {boolean} welcomeOnStartUp - Welcome screen on start-up.
 * @property {boolean} documentationOnStartUp - Documentation on start-up.
 * @exports
 */

