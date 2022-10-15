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
     * When the project title is changed.
     */
    get onProjectTitleChanged() {
        return this.#onProjectTitleChangedCallback;
    }
    set onProjectTitleChanged(value) {
        if (value && typeof value === 'function') {
            this.#onProjectTitleChangedCallback = value;
        } else {
            this.#onProjectTitleChangedCallback = () => { };
        }
    }

    /** @type {HeaderBarCallback} */
    #onProjectTitleChangedCallback = () => { };

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


    /**
     * 
     * @param {HTMLElement} element Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#tbProjectTitle = this.#element.querySelector('#tbProjectTitle');
        this.#tbProjectTitle.onchange = (evt) => this.onProjectTitleChanged(this, { });
        this.#tbProjectTitle.onkeydown = (evt) => {
            // Prevent the enter key from triggering the 'load project' button
            // instead make it trigger the onchange event.
            if (evt.key.toLowerCase() === 'enter') {
                this.#tbProjectTitle.onchange();
                return false;
            }
        };

        this.#btnProjectLoad = this.#element.querySelector('#btnProjectLoad');
        this.#btnProjectLoad.onclick = () => this.onProjectLoad(this, {});

        this.#btnProjectSave = this.#element.querySelector('#btnProjectSave');
        this.#btnProjectSave.onclick = () => this.onProjectSave(this, {});

        this.#btnCodeExport = this.#element.querySelector('#btnCodeExport');
        this.#btnCodeExport.onclick = () => this.onCodeExport(this, {});
    }

}

/**
 * Event callback.
 * @callback HeaderBarCallback
 * @param {HeaderBar} sender - Originating header bar.
 * @param {object} e - Event args.
 * @exports
 */
