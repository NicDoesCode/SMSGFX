import EventDispatcher from "../../components/eventDispatcher.js";
import ProjectList from "../../models/projectList.js";
import TemplateUtil from "../../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    projectSelect: 'projectSelect',
    projectDelete: 'projectDelete'
}

export default class ProjectListing {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLElement} */
    #listElmement;
    /** @type {EventDispatcher} */
    #dispatcher;
    #projectListTemplate;
    #enabled = true;
    #showDeleteButton = false;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;
        this.#listElmement = this.#element.querySelector('[data-smsgfx-id=project-list]');

        this.#dispatcher = new EventDispatcher();

        // Compile handlebars template
        const source = this.#element.querySelector('[data-smsgfx-id=project-list-template]').innerHTML;
        this.#projectListTemplate = Handlebars.compile(source);
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ProjectListing>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/projectListing', element);
        return new ProjectListing(componentElement);
    }


    /**
     * Updates the state of the object.
     * @param {ProjectListingState} state - State to set.
     */
    setState(state) {
        if (typeof state.showDelete !== 'undefined') {
            this.#showDeleteButton = state.showDelete;
            this.#listElmement.querySelectorAll('[data-command=projectDelete]').forEach((elm) => {
                elm.style.display = this.#showDeleteButton ? null : 'none';
            });
        }

        if (typeof state.width !== 'undefined') {
            this.#listElmement.style.width = (state.width !== null) ? state.width : null;
        }

        if (typeof state.height !== 'undefined') {
            this.#listElmement.style.height = (state.height !== null) ? state.height : null;
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
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {ProjectListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @returns {ProjectListingCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command,
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
                id: p.id,
                systemType: p.systemType,
                isSmsgg: p.systemType === 'smsgg',
                isNes: p.systemType === 'nes',
                isGb: p.systemType === 'gb'
            };
        });
        const html = this.#projectListTemplate(renderList);

        this.#listElmement.innerHTML = html;
        this.#listElmement.querySelectorAll('[data-command]').forEach((elm) => {
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
        this.#listElmement.querySelectorAll('[data-command=projectDelete]').forEach((elm) => {
            elm.style.display = this.#showDeleteButton ? null : 'none';
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
 * Project list state.
 * @typedef {object} ProjectListingState
 * @property {ProjectList?} projects - List of projects to display in the menu.
 * @property {boolean?} showDelete - Show the delete button?
 * @property {string?} width - List width CSS declaration.
 * @property {string?} height - List height CSS declaration.
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {boolean?} visible - Is the control visible?
 */

/**
 * Project list callback.
 * @callback ProjectListingCommandCallback
 * @param {ProjectListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} ProjectListingCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} projectId - Project ID.
 * @exports
 */
