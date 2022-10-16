import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_RequestTitleChange = 'EVENT_TitleChanged';
const EVENT_RequestProjectLoad = 'EVENT_ProjectLoad';
const EVENT_RequestProjectSave = 'EVENT_ProjectSave';
const EVENT_RequestCodeExport = 'EVENT_CodeExport';

export default class HeaderBar {


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLInputElement} */
    #tbProjectTitle;
    /** @type {HTMLButtonElement} */
    #btnProjectLoad;
    /** @type {HTMLButtonElement} */
    #btnProjectSave;
    /** @type {HTMLButtonElement} */
    #btnCodeExport;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * 
     * @param {HTMLElement} element Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#tbProjectTitle = this.#element.querySelector('#tbProjectTitle');
        this.#tbProjectTitle.onchange = () => {
            /** @type {HeaderBarProjectTitleChangeEventArgs} */
            const args = { projectTitle: this.#tbProjectTitle.value };
            this.#dispatcher.dispatch(EVENT_RequestTitleChange, args);
        };
        this.#tbProjectTitle.onkeydown = (evt) => {
            // Prevent the enter key from triggering the 'load project' button
            // instead make it trigger the onchange event.
            if (evt.key.toLowerCase() === 'enter') {
                this.#tbProjectTitle.onchange();
                return false;
            }
        };

        this.#btnProjectLoad = this.#element.querySelector('#btnProjectLoad');
        this.#btnProjectLoad.onclick = () => this.#dispatcher.dispatch(EVENT_RequestProjectLoad, {});

        this.#btnProjectSave = this.#element.querySelector('#btnProjectSave');
        this.#btnProjectSave.onclick = () => this.#dispatcher.dispatch(EVENT_RequestProjectSave, {});

        this.#btnCodeExport = this.#element.querySelector('#btnCodeExport');
        this.#btnCodeExport.onclick = () => this.#dispatcher.dispatch(EVENT_RequestCodeExport, {});
    }


    /**
     * Updates the state of the header bar.
     * @param {HeaderBarState} state - State to set.
     */
     setState(state) {
        if (state) {
            if (typeof state.projectTitle === 'string' && state.projectTitle.length > 0 && state.projectTitle !== null) {
                this.#tbProjectTitle.value = state.projectTitle;
            }
        }
    }


    /**
     * Adds a callback for when the project title was changed.
     * @param {HeaderBarProjectTitleChangeCallback} callback - Callback function.
     */
    addHandlerRequestProjectTitleChange(callback) {
        this.#dispatcher.on(EVENT_RequestTitleChange, callback);
    }

    /**
     * Adds a callback for loading a project from a file.
     * @param {HeaderBarCallback} callback - Callback function.
     */
    addHandlerRequestProjectLoad(callback) {
        this.#dispatcher.on(EVENT_RequestProjectLoad, callback);
    }

    /**
     * Adds a callback for saving the project to file.
     * @param {HeaderBarCallback} callback - Callback function.
     */
    addHandlerRequestProjectSave(callback) {
        this.#dispatcher.on(EVENT_RequestProjectSave, callback);
    }

    /**
     * Adds a callback for requesting code export.
     * @param {HeaderBarCallback} callback - Callback function.
     */
    addHandlerRequestCodeExport(callback) {
        this.#dispatcher.on(EVENT_RequestCodeExport, callback);
    }


}


/**
 * Header bar state.
 * @typedef {object} HeaderBarState
 * @property {string?} projectTitle - Project title to display.
 */

/**
 * Event callback.
 * @callback HeaderBarCallback
 * @param {object} args - Arguments.
 * @exports
 */

/**
 * Event args for when a header bar title change is requested.
 * @callback HeaderBarProjectTitleChangeCallback
 * @param {HeaderBarProjectTitleChangeEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} HeaderBarProjectTitleChangeEventArgs
 * @property {String} projectTitle - Changed title.
 * @exports 
 */
