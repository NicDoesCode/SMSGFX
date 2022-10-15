export default class AppUIState {


    /**
     * Gets or sets the last text that was entered into the palette input box.
     */
    get lastPaletteInput() {
        return this.#lastPaletteInput;
    }
    set lastPaletteInput(value) {
        this.#lastPaletteInput = value;
    }

    /**
     * Gets or sets the last system that was entered into the palette input box.
     */
    get lastPaletteInputSystem() {
        return this.#lastPaletteInputSystem;
    }
    set lastPaletteInputSystem(value) {
        this.#lastPaletteInputSystem = value;
    }

    /**
     * Gets or sets the last text that was entered into the tile set input box.
     */
    get lastTileInput() {
        return this.#lastTileInput;
    }
    set lastTileInput(value) {
        this.#lastTileInput = value;
    }

    /**
     * Index in the palette list of the last selected palette.
     */
    get lastSelectedPaletteIndex() {
        return this.#lastSelectedPaletteIndex;
    }
    set lastSelectedPaletteIndex(value) {
        this.#lastSelectedPaletteIndex = value;
    }

    /**
     * Zoom level.
     */
    get lastZoomValue() {
        return this.#lastZoomValue;
    }
    set lastZoomValue(value) {
        this.#lastZoomValue = value;
    }


    /** @type {string} */
    #lastPaletteInput = '';
    /** @type {string} */
    #lastPaletteInputSystem = 'gg';
    /** @type {string} */
    #lastTileInput = '';
    /** @type {number} */
    #lastSelectedPaletteIndex = 0;
    /** @type {number} */
    #lastZoomValue = 10;


    constructor() {
    }


}
