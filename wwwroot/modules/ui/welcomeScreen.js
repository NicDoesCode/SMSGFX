import EventDispatcher from "../components/eventDispatcher.js";
import TemplateUtil from "../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    dismiss: 'dismiss',
    changeShowOnStartUp: 'changeShowOnStartUp'
}

export default class WelcomeScreen {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    #dispatcher;
    /** @type {HTMLInputElement} */
    #showOnStartupCheckbox;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#showOnStartupCheckbox = this.#element.querySelector('[data-smsgfx-id=showOnStartup]');

        this.#showOnStartupCheckbox.onchange = (ev) => {
            const command = this.#showOnStartupCheckbox.getAttribute('data-command');
            const args = this.#createArgs(command);
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };

        this.#element.querySelectorAll('button[data-command]').forEach(button => {
            button.onclick = () => {
                const command = button.getAttribute('data-command');
                const args = this.#createArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<WelcomeScreen>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('welcomeScreen', element);
        return new WelcomeScreen(componentElement);
    }


    /**
     * Sets the state.
     * @param {WelcomeScreenState} state - State object.
     */
    setState(state) {
        if (typeof state?.visible === 'boolean') {
            if (state.visible) {
                this.#element.classList.remove('visually-hidden');
            } else {
                this.#element.classList.add('visually-hidden');
            }
        }
        if (typeof state?.showWelcomeScreenOnStartUpChecked === 'boolean') {
            this.#showOnStartupCheckbox.checked = state.showWelcomeScreenOnStartUpChecked;
        }
    }


    /**
     * Register a callback for when a command is invoked.
     * @param {WelcomeScreenStateCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {HTMLElement} element 
     * @returns {WelcomeScreenStateCommandEventArgs}
     */
    #createArgs(command) {
        /** @type {WelcomeScreenStateCommandEventArgs} */
        return {
            command: command,
            showOnStartUp: this.#showOnStartupCheckbox?.checked ?? false
        };
    }


}


/**
 * About dialogue state object.
 * @typedef {object} WelcomeScreenState
 * @property {boolean?} showWelcomeScreenOnStartUpChecked 
 * @property {boolean?} visible - Is the welcome screen visible?
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback WelcomeScreenStateCommandCallback
 * @argument {WelcomeScreenStateCommandEventArgs} data - Arguments.
 * @exports
 */
/**
 * @typedef {object} WelcomeScreenStateCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {boolean} showOnStartUp - Should the welcome screen be shown on start-up?
 * @exports
 */