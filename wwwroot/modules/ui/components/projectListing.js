import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import ProjectList from "../../models/projectList.js";
import TemplateUtil from "../../util/templateUtil.js";
import DateTimeUtil from "../../util/dateTimeUtil.js";
import GeneralUtil from "../../util/generalUtil.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    sort: 'sort',
    projectSelect: 'projectSelect',
    projectDelete: 'projectDelete'
}


/**
 * UI component that displays a list of projects.
 */
export default class ProjectListing extends ComponentBase {


    /**
     * Gets an enumeration of all the commands that may be invoked by this class.
     */
    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLElement} */
    #listElmement;
    /** @type {HTMLElement} */
    #toolsElement;
    /** @type {EventDispatcher} */
    #dispatcher;
    #enabled = true;
    #showDeleteButton = false;
    #showLastModifiedColumn = true;
    #showSortButton = true;
    #dropDown;


    /**
     * Constructor for the class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);

        this.#element = element;
        this.#listElmement = this.#element.querySelector('[data-smsgfx-id=project-list]');
        this.#toolsElement = this.#element.querySelector('[data-smsgfx-id=tools]');
        this.#dropDown = new bootstrap.Dropdown(this.#toolsElement.querySelector('.dropdown-toggle'));

        this.#dispatcher = new EventDispatcher();

        this.#element.addEventListener('mousemove', () => {
            if (this.#showSortButton) {
                this.#toolsElement.style.opacity = '1';
            }
        });

        this.#element.addEventListener('mouseenter', () => {
            if (this.#showSortButton) {
                this.#dropDown.hide();
                this.#toolsElement.style.opacity = '1';
            }
        });

        this.#element.addEventListener('mouseout', () => {
            this.#toolsElement.style.opacity = '0';
        });

        this.#toolsElement.querySelectorAll(`a[data-command=${commands.sort}]`).forEach((sortElm) => {
            sortElm.addEventListener('click', (ev) => {
                this.#dropDown.hide();
                const args = this.#createArgs(sortElm.getAttribute('data-command'));
                args.field = sortElm.getAttribute('data-field');
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
                ev.stopImmediatePropagation();
                ev.preventDefault();
            });
        });
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
        if (typeof state.showDelete === 'boolean' || state.showDateLastModified === null) {
            this.#showDeleteButton = state.showDelete ?? false;
        }

        if (typeof state.showDateLastModified === 'boolean' || state.showDateLastModified === null) {
            this.#showLastModifiedColumn = state.showDateLastModified ?? true;
        }

        if (typeof state.showSort === 'boolean' || state.showDateLastModified === null) {
            this.#showSortButton = state.showSort ?? true;
        }

        if (typeof state.width !== 'undefined') {
            this.#listElmement.style.width = (state.width !== null) ? state.width : null;
        }

        if (typeof state.height !== 'undefined') {
            this.#listElmement.style.height = (state.height !== null) ? state.height : null;
        }

        if (state.projects instanceof ProjectList || Array.isArray(state.projects)) {
            this.#displayProjects(state.projects);
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        this.#updateFieldVisibility();
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {ProjectListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {ProjectList|Project[]} projects
     */
    #displayProjects(projects) {
        const projectArray = projects instanceof ProjectList ? projects.getProjects() : projects;
        const renderList = projectArray.map((p) => {
            return {
                title: p.title,
                id: p.id,
                systemType: p.systemType,
                isSmsgg: p.systemType === 'smsgg',
                isNes: p.systemType === 'nes',
                isGb: p.systemType === 'gb',
                dateLastModifiedFuzzy: p.dateLastModified.getTime() === 0 ? '' : DateTimeUtil.getFuzzyDateTime(p.dateLastModified),
                tooltip: GeneralUtil.escapeHtmlAttribute(`${p.title}\r\nModified: ${moment(p.dateLastModified).format('L LT')}`)
            };
        });

        this.renderTemplateToElement(this.#listElmement, 'project-list-template', renderList);

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

        this.#updateFieldVisibility();
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


    #updateFieldVisibility() {
        this.#listElmement.querySelectorAll('[data-field=dateModified]').forEach((elm) => {
            elm.style.display = this.#showLastModifiedColumn ? null : 'none';
        });
        this.#listElmement.querySelectorAll('[data-command=projectDelete]').forEach((elm) => {
            elm.style.display = this.#showDeleteButton ? null : 'none';
        });
    }


}


/**
 * Project list state.
 * @typedef {object} ProjectListingState
 * @property {ProjectList|Project[]|null} [projects] - List of projects to display in the menu.
 * @property {boolean?} [showDateLastModified] - Show the date last modified column?
 * @property {boolean?} [showDelete] - Show the delete button?
 * @property {boolean?} [showSort] - Show the sort button?
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
 * @property {string?} [field] - Name of the field that this command relates to.
 * @exports
 */

