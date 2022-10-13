export default class HeaderBar {


    /** 
     * When project is to be loaded from a file.
     * @type {HeaderBarCallback} 
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
     * @type {HeaderBarCallback} 
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

    /** @type {TileEditorCallback} */
    #onProjectSaveCallback = () => { };

    /** 
     * When code is to be exported.
     * @type {HeaderBarCallback} 
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

    /** @type {TileEditorCallback} */
    #onCodeExportCallback = () => { };


    /** @type {HTMLDivElement} */
    #element;
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

