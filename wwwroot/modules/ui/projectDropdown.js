import EventDispatcher from "../components/eventDispatcher.js";
import ProjectList from "../models/projectList.js";
import TemplateUtil from "../util/templateUtil.js";
import ModalDialogue from "./modalDialogue.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    title: 'title',
    projectNew: 'projectNew',
    projectLoadFromFile: 'projectLoadFromFile',
    projectLoadById: 'projectLoadById',
    projectSaveToFile: 'projectSaveToFile',
    projectDelete: 'projectDelete',
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
    #projectListTemplate;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        const source = this.#element.querySelector('[data-smsgfx-id=project-list-template]').innerHTML;
        this.#projectListTemplate = Handlebars.compile(source);

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
     * @returns {Promise<ProjectDropdown>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('projectDropdown', element);
        return new ProjectDropdown(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {ProjectDropdownState} state - State to set.
     */
    setState(state) {
        if (typeof state?.projectTitle === 'string' && state.projectTitle.length > 0 && state.projectTitle !== null) {
            this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
                element.value = state.projectTitle;
            });
        }

        if (typeof state.projects?.getProjects === 'function') {
            this.#displayProjects(state.projects);
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
     * @returns {ProjectDropdownCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command,
            title: this.#element.querySelector(`[data-command=${commands.title}]`)?.value ?? null,
            projectId: null
        };
    }


    /**
     * @param {ProjectList} projects
     */
    #displayProjects(projects) {
        const renderList = projects.getProjects().map((p) => {
            return {
                title: p.title,
                id: p.id
            };
        });
        const html = this.#projectListTemplate(renderList);

        const listElm = this.#element.querySelector('[data-smsgfx-id=project-list]');
        listElm.innerHTML = html;

        listElm.querySelectorAll('[data-command]').forEach((elm) => {
            const command = elm.getAttribute('data-command');
            const id = elm.getAttribute('data-project-id');
            if (command && id) {
                /** @param {MouseEvent} ev */
                elm.onclick = (ev) => { 
                    this.#handleProjectCommandButtonClicked(command, id);  
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                }
            }
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
 * Project dropdown state.
 * @typedef {object} ProjectDropdownState
 * @property {string?} projectTitle - Project title to display.
 * @property {string[]?} enabledCommands - Array of commands that should be enabled, overrided enabled state.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled, overrided enabled state.
 * @property {ProjectList} projects - List of projects to display in the menu.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {boolean?} visible - Is the control visible?
 */

/**
 * Command callback.
 * @callback ProjectDropdownCommandCallback
 * @param {ProjectDropdownCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} ProjectDropdownCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} title - Project title.
 * @property {string?} projectId - Project ID.
 * @exports
 */
