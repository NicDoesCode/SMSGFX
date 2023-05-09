import EventDispatcher from "../../components/eventDispatcher.js";
import ProjectList from "../../models/projectList.js";
import TemplateUtil from "../../util/templateUtil.js";
import ProjectListing from "../components/projectListing.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    dismiss: 'dismiss',
    changeShowOnStartUp: 'changeShowOnStartUp',
    projectNew: 'projectNew',
    projectLoadById: 'projectLoadById',
    projectLoadFromFile: 'projectLoadFromFile',
    tileImageImport: 'tileImageImport',
    showDocumentation: 'showDocumentation'
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
    /** @type {ProjectListing} */
    #projectListing = null;


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

        this.#element.querySelectorAll('[data-command]').forEach((elm) => {
            elm.onclick = () => {
                const command = elm.getAttribute('data-command');
                const args = this.#createArgs(command, elm);
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
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/welcomeScreen', element);
        return new WelcomeScreen(componentElement);
    }


    /**
     * Sets the state.
     * @param {WelcomeScreenState} state - State object.
     */
    async setState(state) {
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

        if (Array.isArray(state?.visibleCommands)) {
            const visible = state.visibleCommands;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                if (visible.includes(element.getAttribute('data-command'))) {
                    element.classList.remove('visually-hidden');
                }
            });
        }

        if (Array.isArray(state?.invisibleCommands)) {
            const invisible = state.invisibleCommands;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                if (invisible.includes(element.getAttribute('data-command'))) {
                    element.classList.add('visually-hidden');
                }
            });
        }

        if (state?.projects !== null) {
            await this.#loadProjectListIfNotLoaded();
            if (this.#projectListing) {
                this.#projectListing.setState({
                    projects: state.projects,
                    height: '100%',
                    showDelete: false
                });
            }
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
     * @param {string} command 
     * @param {HTMLElement} sender 
     * @returns {WelcomeScreenStateCommandEventArgs}
     */
    #createArgs(command, sender) {
        return {
            command: command,
            showOnStartUp: this.#showOnStartupCheckbox?.checked ?? false,
            systemType: sender?.getAttribute('data-target-system-type') ?? null,
            projectId: null
        };
    }


    async #loadProjectListIfNotLoaded() {
        if (!this.#projectListing) {
            const projectListingElm = this.#element.querySelector('[data-smsgfx-component-id=project-listing]');
            if (projectListingElm) {
                this.#projectListing = await ProjectListing.loadIntoAsync(projectListingElm);
                this.#projectListing.addHandlerOnCommand((args) => {
                    switch (args.command) {
                        case ProjectListing.Commands.projectSelect:
                            const projArgs = this.#createArgs(commands.projectLoadById);
                            projArgs.projectId = args.projectId;
                            this.#dispatcher.dispatch(EVENT_OnCommand, projArgs);
                            break;
                    }
                });
            }
        }
    }


}


/**
 * About dialogue state object.
 * @typedef {object} WelcomeScreenState
 * @property {boolean?} showWelcomeScreenOnStartUpChecked 
 * @property {ProjectList?} projects 
 * @property {boolean?} visible - Is the welcome screen visible?
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {string[]?} visibleCommands - Array of commands that should be made visible, overrided enabled state.
 * @property {string[]?} invisibleCommands - Array of commands that should be made invisible, overrided enabled state.
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
 * @property {string?} systemType - Type of system, either 'smsgg', 'gb' or 'nes'.
 * @property {string?} projectId - Project ID.
 * @property {boolean?} showOnStartUp - Should the welcome screen be shown on start-up?
 * @exports
 */




