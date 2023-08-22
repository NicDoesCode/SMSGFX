import EventDispatcher from "../../components/eventDispatcher.js";
import ProjectList from "../../models/projectList.js";
import TemplateUtil from "../../util/templateUtil.js";
import ModalDialogue from "./../modalDialogue.js";
import ProjectListing from "../components/projectListing.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    title: 'title',
    projectNew: 'projectNew',
    projectLoadFromFile: 'projectLoadFromFile',
    projectLoadById: 'projectLoadById',
    projectSaveToFile: 'projectSaveToFile',
    projectDelete: 'projectDelete',
    sampleProjectSelect: 'sampleProjectSelect',
    showWelcomeScreen: 'showWelcomeScreen'
}

export default class ProjectDropdown extends ModalDialogue {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    #enabled = true;
    /** @type {ProjectListing} */
    #projectListing = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                const args = this.#createArgs(element.getAttribute('data-command'), element);
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
     * @returns {Promise<ProjectDropdown>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/projectDropdown', element);
        return new ProjectDropdown(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {ProjectDropdownState} state - State to set.
     */
    async setState(state) {

        if (typeof state?.projectTitle === 'string') {
            this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
                element.value = state.projectTitle;
            });
        }

        if (state.projects instanceof ProjectList) {
            await this.#displayProjects(state.projects);
        }

        if (typeof state.systemType === 'string') {
            switch (state.systemType) {
                case 'gb': this.#element.querySelector(`[data-smsgfx-id=system-type]`).value = 'gb'; break;
                case 'nes': this.#element.querySelector(`[data-smsgfx-id=system-type]`).value = 'nes'; break;
                case 'smsgg': default: this.#element.querySelector(`[data-smsgfx-id=system-type]`).value = 'smsgg'; break;
            }
        }

        if (Array.isArray(state.sampleProjects)) {
            this.#populateSampleProjectSelect(state.sampleProjects);
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (typeof state?.visible === 'boolean') {
            if (state.visible) {
                super.show();
            } else {
                super.hide();
            }
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
     * Registers a handler for a command.
     * @param {ProjectDropdownCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @param {HTMLElement} sender
     * @returns {ProjectDropdownCommandEventArgs}
     */
    #createArgs(command, sender) {
        return {
            command: command,
            title: this.#element.querySelector(`[data-command=${commands.title}]`)?.value ?? null,
            projectId: null,
            systemType: sender?.getAttribute('data-target-system-type') ?? null
        };
    }


    /**
     * @param {ProjectList} projects
     */
    async #displayProjects(projects) {

        // Ensure project listing object created
        if (!this.#projectListing) {
            const projectListingElm = this.#element.querySelector('[data-smsgfx-component-id=project-listing]');
            if (projectListingElm) {
                this.#projectListing = await ProjectListing.loadIntoAsync(projectListingElm);
                this.#projectListing.addHandlerOnCommand((args) => {
                    switch (args.command) {
                        case ProjectListing.Commands.projectSelect:
                            const selArgs = this.#createArgs(commands.projectLoadById);
                            selArgs.projectId = args.projectId;
                            this.#dispatcher.dispatch(EVENT_OnCommand, selArgs);
                            break;
                        case ProjectListing.Commands.projectDelete:
                            const delArgs = this.#createArgs(commands.projectDelete);
                            delArgs.projectId = args.projectId;
                            this.#dispatcher.dispatch(EVENT_OnCommand, delArgs);
                            break;
                    }
                });
            }
        }

        // Display the projects
        this.#projectListing.setState({
            projects: projects,
            height: '200px',
            showDelete: true
        });
    }

    /**
     * @param {SampleProject[]} arrayOfSampleProjects 
     */
    #populateSampleProjectSelect(arrayOfSampleProjects) {
        const elmSampleProjectList = this.#element.querySelector('[data-smsgfx-id=project-samples] ul');
        // Create the list items
        arrayOfSampleProjects
            .filter((sampleProject) => sampleProject.system && sampleProject.title && sampleProject.url)
            .forEach((sampleProject) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.classList.add('dropdown-item');
                a.innerText = sampleProject.title;
                a.setAttribute('data-command', commands.sampleProjectSelect);
                a.setAttribute('data-sample-project-id', sampleProject.sampleProjectId);
                li.appendChild(a);
                elmSampleProjectList?.appendChild(li);
            });
        // Click event handler
        elmSampleProjectList?.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', (ev) => {
                const args = this.#createArgs(a.getAttribute('data-command'));
                args.sampleProjectId = a.getAttribute('data-sample-project-id');
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
                ev.preventDefault();
            });
        });
    }


}


/**
 * Project dropdown state.
 * @typedef {Object} ProjectDropdownState
 * @property {string?} [projectTitle] - Project title to display.
 * @property {string[]?} [enabledCommands] - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} [disabledCommands] - Array of commands that should be disabled, overrided enabled state.
 * @property {ProjectList} [projects] - List of projects to display in the menu.
 * @property {string?} [systemType] - System type to target, either 'smsgg', 'gb' or 'nes'.
 * @property {SampleProject[]?} [sampleProjects] - List of projects to include in samples menu.
 * @property {boolean?} [enabled] - Is the control enabled or disabled?
 * @property {boolean?} [visible] - Is the control visible?
 */

/**
 * Command callback.
 * @callback ProjectDropdownCommandCallback
 * @param {ProjectDropdownCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} ProjectDropdownCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} title - Project title.
 * @property {string?} projectId - Project ID.
 * @property {string?} systemType - Type of system to target, either 'smsgg', 'gb' or 'nes'.
 * @property {string?} [sampleProjectId] - URL of the sample project to load.
 * @exports
 */

/**
 * @typedef {import('../../types.js').SampleProject} SampleProject
 */