import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";
import Project from "../../models/project.js";
import ProjectEntry from "../../models/projectEntry.js";
import ProjectList from "../../models/projectList.js";
import ProjectEntryList from "../../models/projectEntryList.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    title: 'title',
    projectNew: 'projectNew',
    projectLoadFromFile: 'projectLoadFromFile',
    projectLoadById: 'projectLoadById',
    projectSaveToFile: 'projectSaveToFile',
    projectDelete: 'projectDelete',
    showDropdown: 'showDropdown'
}

export default class ProjectToolbar extends ComponentBase {


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
     * @returns {Promise<ProjectToolbar>}
     */
     static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('toolbars/projectToolbar', element);
        return new ProjectToolbar(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {ProjectToolbarState} state - State to set.
     */
    setState(state) {
        if (typeof state?.projectTitle === 'string' && state.projectTitle.length > 0 && state.projectTitle !== null) {
            this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
                element.value = state.projectTitle;
            });
        }

        if (state.projects instanceof ProjectEntryList || state.projects instanceof ProjectList || Array.isArray(state.projects)) {
            this.#displayProjects(state.projects);
        }

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
     * @param {ProjectToolbarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @returns {ProjectToolbarCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command,
            title: this.#element.querySelector(`[data-command=${commands.title}]`)?.value ?? null,
            projectId: null
        };
    }


    /**
     * @param {ProjectList|ProjectEntryList|Project[]|ProjectEntry[]} projects
     */
    #displayProjects(projects) {
        const elm = this.#element.querySelector('[data-smsgfx-id=project-list]');
        while (elm.childNodes.length > 0) {
            elm.childNodes[0].remove();
        }

        /** @type {Project[]|ProjectEntry[]} */
        const projectArray = [];
        if (projects instanceof ProjectList) projectArray.push(...projects.getProjects());
        if (projects instanceof ProjectEntryList) projectArray.push(...projects.getProjectEntries());
        if (Array.isArray(projects)) projectArray.push(...projects);

        projectArray.forEach((project) => {
            const row = document.createElement('div');
            row.classList.add('dropdown-item', 'd-flex', 'justify-content-between', 'pt-0', 'pb-0', 'mb-1', 'ps-2', 'pe-2');
            row.appendChild((() => {

                const btn = document.createElement('button');
                btn.classList.add('btn', 'btn-sm', 'btn-link', 'ms-0', 'ps-0');
                btn.type = 'button';
                btn.innerText = project.title;
                btn.setAttribute('data-command', commands.projectLoadById);
                btn.setAttribute('data-project-id', project.id);
                btn.onclick = () => this.#handleProjectCommandButtonClicked(commands.projectLoadById, project.id);
                return btn;

            })());
            row.appendChild((() => {

                const btn = document.createElement('button');
                btn.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
                btn.type = 'button';
                btn.setAttribute('data-command', commands.pro);
                btn.setAttribute('data-project-id', project.id);
                btn.onclick = () => this.#handleProjectCommandButtonClicked(commands.projectDelete, project.id);
                btn.appendChild((() => {
                    const i = document.createElement('i');
                    i.classList.add('bi', 'bi-trash-fill');
                    return i;
                })());
                return btn;

            })());
            elm.appendChild(row);
        });
    }


    /**
     * @param {string} command 
     * @param {string} projectId 
     */
    #handleProjectCommandButtonClicked(command, projectId) {
        const args = this.#createArgs(command);
        args.projectId = projectId;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


}


/**
 * Project toolbar state.
 * @typedef {Object} ProjectToolbarState
 * @property {string?} projectTitle - Project title to display.
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {ProjectList|ProjectEntryList|Project[]|ProjectEntry[]} projects - List of projects to display in the menu.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 */

/**
 * Project toolbar callback.
 * @callback ProjectToolbarCommandCallback
 * @param {ProjectToolbarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} ProjectToolbarCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} title - Project title.
 * @property {string?} projectId - Project ID.
 * @exports
 */

