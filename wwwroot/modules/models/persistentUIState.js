export default class PersistentUIState {


    /**
     * Gets or sets the last project ID that was selected.
     */
    get lastProjectId() {
        return this.#lastProjectId;
    }
    set lastProjectId(value) {
        this.#lastProjectId = value;
    }

    /**
     * Gets or sets the last text that was entered into the palette input box.
     */
    get importPaletteAssemblyCode() {
        return this.#importPaletteAssemblyCode;
    }
    set importPaletteAssemblyCode(value) {
        this.#importPaletteAssemblyCode = value;
    }

    /**
     * Gets or sets the last system that was entered into the palette input box.
     */
    get importPaletteSystem() {
        return this.#importPaletteSystem;
    }
    set importPaletteSystem(value) {
        this.#importPaletteSystem = value;
    }

    /**
     * Gets or sets the last text that was entered into the tile set input box.
     */
    get importTileAssemblyCode() {
        return this.#importTileAssemblyCode;
    }
    set importTileAssemblyCode(value) {
        this.#importTileAssemblyCode = value;
    }

    /**
     * Gets or sets the last replace value that was set in the import tile box.
     */
    get importTileReplace() {
        return this.#importTileReplace;
    }
    set importTileReplace(value) {
        this.#importTileReplace = value;
    }

    /**
     * Index in the palette list of the last selected palette.
     */
    get paletteIndex() {
        return this.#paletteIndex;
    }
    set paletteIndex(value) {
        this.#paletteIndex = value;
    }

    /**
     * Scale level.
     */
    get scale() {
        return this.#scale;
    }
    set scale(value) {
        this.#scale = value;
    }

    /**
     * Gets or sets whether UI elements should display native colours.
     */
    get displayNativeColour() {
        return this.#displayNativeColour;
    }
    set displayNativeColour(value) {
        this.#displayNativeColour = value;
    }

    /**
     * Gets or sets whether to draw grid lines for the tiles.
     */
    get showTileGrid() {
        return this.#showTileGrid;
    }
    set showTileGrid(value) {
        this.#showTileGrid = value;
    }

    /**
     * Gets or sets whether to draw grid lines for the pixels.
     */
    get showPixelGrid() {
        return this.#showPixelGrid;
    }
    set showPixelGrid(value) {
        this.#showPixelGrid = value;
    }

    /**
     * Gets or sets whether the documentation is visible on startup.
     */
    get documentationVisibleOnStartup() {
        return this.#documentationVisibleOnStartup;
    }
    set documentationVisibleOnStartup(value) {
        this.#documentationVisibleOnStartup = value;
    }

    /**
     * Gets or sets whether the welcome screen is visible on startup.
     */
    get welcomeVisibleOnStartup() {
        return this.#welcomeVisibleOnStartup;
    }
    set welcomeVisibleOnStartup(value) {
        this.#welcomeVisibleOnStartup = value;
    }

    /**
     * Gets or sets whether the theme (either 'light', 'dark' or 'system').
     */
    get theme() {
        return this.#theme;
    }
    set theme(value) {
        if (['light', 'dark', 'system'].includes(value)) {
            this.#theme = value;
        }
    }


    /** @type {string} */
    #lastProjectId = null;
    /** @type {string} */
    #importPaletteAssemblyCode = '';
    /** @type {string} */
    #importPaletteSystem = 'gg';
    /** @type {string} */
    #importTileAssemblyCode = '';
    /** @type {boolean} */
    #importTileReplace = false;
    /** @type {number} */
    #paletteIndex = 0;
    /** @type {number} */
    #scale = 10;
    /** @type {boolean} */
    #displayNativeColour = true;
    /** @type {boolean} */
    #showTileGrid = true;
    /** @type {boolean} */
    #showPixelGrid = true;
    /** @type {boolean} */
    #documentationVisibleOnStartup = false;
    /** @type {boolean} */
    #welcomeVisibleOnStartup = true;
    /** @type {string} */
    #theme = 'system';


    constructor() {
    }


}
