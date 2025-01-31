import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";
import ComponentBase from "../componentBase.js";
import ProjectListing from "../components/projectListing.js";
import ConfigManager from "../../components/configManager.js";
import Project from "../../models/project.js";
import ProjectEntry from "../../models/projectEntry.js";
import ProjectList from "../../models/projectList.js";
import ProjectEntryList from "../../models/projectEntryList.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    dismiss: 'dismiss',
    changeShowOnStartUp: 'changeShowOnStartUp',
    projectNew: 'projectNew',
    projectLoadById: 'projectLoadById',
    projectLoadFromFile: 'projectLoadFromFile',
    projectSort: 'projectSort',
    tileImageImport: 'tileImageImport',
    showDocumentation: 'showDocumentation'
}

export default class WelcomeScreen extends ComponentBase {


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
    /** @type {import("../../components/versionManager.js").VersionInformation} */
    #version = null;
    /** @type {import("../../components/versionManager.js").ChannelInformation} */
    #channel = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
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

        ConfigManager.getInstanceAsync().then((configManager) => {
            const config = configManager.config;
            if (typeof config?.kofiHandle === 'string') {
                const link = this.#element.querySelector('[data-smsgfx-id=kofi-link]');
                link.href = link.getAttribute('data-href').replace('{{HANDLE}}', encodeURIComponent(config.kofiHandle));
                link.classList.remove('visually-hidden');
            }
            if (typeof config?.patreonHandle === 'string') {
                const link = this.#element.querySelector('[data-smsgfx-id=patreon-link]');
                link.href = link.getAttribute('data-href').replace('{{HANDLE}}', encodeURIComponent(config.patreonHandle));
                link.classList.remove('visually-hidden');
            }
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

        if (state.projects instanceof ProjectList || state.projects instanceof ProjectEntryList || Array.isArray(state.projects) || state.projects === null) {
            const projects = state.projects ?? [];
            await this.#loadProjectListIfNotLoaded();
            if (this.#projectListing) {
                this.#projectListing.setState({
                    projects: projects,
                    height: '100%',
                    showDelete: false
                });
            }
        }

        let versionDirty = false;
        if (state.version || state.version === null) {
            if (state.version !== this.#version) {
                this.#version = state.version;
                versionDirty = true;
            }
        }

        if (state.channel || state.channel === null) {
            if (state.channel !== this.#channel) {
                this.#channel = state.channel;
                versionDirty = true;
            }
        }

        if (versionDirty) {
            const versionElms = this.#element.querySelectorAll('[data-smsgfx-id="version-information"]');
            versionElms.forEach((versionElm) => {
                this.renderTemplateToElement(versionElm, 'version-information', { version: this.#version, channel: this.#channel });
            });
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
                        case ProjectListing.Commands.sort:
                            const sortArgs = this.#createArgs(commands.projectSort);
                            sortArgs.sortField = args.field;
                            this.#dispatcher.dispatch(EVENT_OnCommand, sortArgs);
                            break;
                    }
                });
            }
        }
    }


}


/**
 * State object.
 * @typedef {Object} WelcomeScreenState
 * @property {boolean?} showWelcomeScreenOnStartUpChecked 
 * @property {ProjectList|Project[]|ProjectEntryList|ProjectEntry[]|null} [projects] 
 * @property {boolean?} visible - Is the welcome screen visible?
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {string[]?} visibleCommands - Array of commands that should be made visible, overrided enabled state.
 * @property {string[]?} invisibleCommands - Array of commands that should be made invisible, overrided enabled state.
 * @property {import("../../components/versionManager.js").VersionInformation} version - Information about the current version.
 * @property {import("../../components/versionManager.js").ChannelInformation} channel - Information about the current channel.
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback WelcomeScreenStateCommandCallback
 * @argument {WelcomeScreenStateCommandEventArgs} data - Arguments.
 * @exports
 */
/**
 * @typedef {Object} WelcomeScreenStateCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} systemType - Type of system, either 'smsgg', 'gb' or 'nes'.
 * @property {string?} projectId - Project ID.
 * @property {boolean?} showOnStartUp - Should the welcome screen be shown on start-up?
 * @property {string?} [sortField] - Name of the field to be sorted.
 * @exports
 */




