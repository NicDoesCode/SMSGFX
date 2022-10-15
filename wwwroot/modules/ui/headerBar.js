import EventDispatcher from "../../eventDispatcher.js";


const EVENT_TitleChanged = 'EVENT_TitleChanged';
const EVENT_ProjectLoad = 'EVENT_ProjectLoad';
const EVENT_ProjectSave = 'EVENT_ProjectSave';
const EVENT_CodeExport = 'EVENT_CodeExport';


export default class HeaderBar {


    /**
     * Gets or sets the project title.
     */
    get projectTitle() {
        return this.#tbProjectTitle.value;
    }
    set projectTitle(value) {
        if (typeof value === 'undefined' || value === null) throw new Error('Project title was not valid.');
        this.#tbProjectTitle.value = value;
    }

    /** 
     * When project is to be loaded from a file.
     */
    get onProjectLoad() {
        return this.#onProjectLoadCallback;
    }
    set onProjectLoad(value) {
        if (value && typeof value === 'function') {
            this.#onProjectLoadCallback = value;
        } else {
            this.#onProjectLoadCallback = () => { };
        }
    }

    /** @type {TileEditorCallback} */
    #onProjectLoadCallback = () => { };

    /** 
     * When project is to be saved to a file.
     */
    get onProjectSave() {
        return this.#onProjectSaveCallback;
    }
    set onProjectSave(value) {
        if (value && typeof value === 'function') {
            this.#onProjectSaveCallback = value;
        } else {
            this.#onProjectSaveCallback = () => { };
        }
    }

    /** @type {HeaderBarCallback} */
    #onProjectSaveCallback = () => { };

    /** 
     * When code is to be exported.
     */
    get onCodeExport() {
        return this.#onCodeExportCallback;
    }
    set onCodeExport(value) {
        if (value && typeof value === 'function') {
            this.#onCodeExportCallback = value;
        } else {
            this.#onCodeExportCallback = () => { };
        }
    }

    /** @type {HeaderBarCallback} */
    #onCodeExportCallback = () => { };


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
            /** @type {HeaderBarTitleChangeEventArgs} */
            const args = { newTitle: this.projectTitle };
            this.#dispatcher.dispatch(EVENT_TitleChanged, args);
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
        this.#btnProjectLoad.onclick = () => this.#dispatcher.dispatch(EVENT_ProjectLoad, {});

        this.#btnProjectSave = this.#element.querySelector('#btnProjectSave');
        this.#btnProjectSave.onclick = () => this.#dispatcher.dispatch(EVENT_ProjectSave, {});

        this.#btnCodeExport = this.#element.querySelector('#btnCodeExport');
        this.#btnCodeExport.onclick = () => this.#dispatcher.dispatch(EVENT_CodeExport, {});
    }


    /**
     * Adds a callback for when the project title was changed.
     * @param {HeaderBarTitleChangeEventArgs} callback - Callback function.
     */
    addHandlerProjectTitleChanged(callback) {
        this.#dispatcher.on(EVENT_TitleChanged, callback);
    }

    /**
     * Adds a callback for loading a project from a file.
     * @param {HeaderBarEventArgs} callback - Callback function.
     */
     addHandlerProjectLoad(callback) {
        this.#dispatcher.on(EVENT_ProjectLoad, callback);
    }

    /**
     * Adds a callback for saving the project to file.
     * @param {HeaderBarEventArgs} callback - Callback function.
     */
     addHandlerProjectSave(callback) {
        this.#dispatcher.on(EVENT_ProjectSave, callback);
    }

    /**
     * Adds a callback for requesting code export.
     * @param {HeaderBarEventArgs} callback - Callback function.
     */
     addHandlerCodeExport(callback) {
        this.#dispatcher.on(EVENT_CodeExport, callback);
    }


}


/**
 * Project title is changed.
 * @typedef HeaderBarTitleChangeEventArgs
 * @property {String} newTitle - The newly updated title.
 */

/**
 * Generic event args.
 * @typedef HeaderBarEventArgs
 */
