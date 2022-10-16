export default class PersistentUIState {


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
     * Index in the palette list of the last selected palette.
     */
    get paletteIndex() {
        return this.#paletteIndex;
    }
    set paletteIndex(value) {
        this.#paletteIndex = value;
    }

    /**
     * Zoom level.
     */
    get scale() {
        return this.#scale;
    }
    set scale(value) {
        this.#scale = value;
    }


    /** @type {string} */
    #importPaletteAssemblyCode = '';
    /** @type {string} */
    #importPaletteSystem = 'gg';
    /** @type {string} */
    #importTileAssemblyCode = '';
    /** @type {number} */
    #paletteIndex = 0;
    /** @type {number} */
    #scale = 10;


    constructor() {
    }


}
