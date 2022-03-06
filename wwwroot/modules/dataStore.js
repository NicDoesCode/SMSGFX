import PaletteList from "./paletteList.js";
import TileSetList from "./tileSetList.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PALETTES = 'smsgfxpalettes';
const LOCAL_STORAGE_TILES = 'smsgfxtiles';

export default class DataStore {

    /** @type {AppUI} */
    #appUI;
    /** @type {PaletteList} */
    #paletteList;
    /** @type {TileSetList} */
    #tileSetList;

    constructor() {
        this.#appUI = new AppUI();
        this.#paletteList = new PaletteList();
        this.#tileSetList = new TileSetList();
    }

    /**
     * Loads values from local storage.
     */
    loadFromLocalStorage() {
        // Load UI from local storage
        const serialisedAppUI = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (serialisedAppUI) {
            this.#appUI = AppUI.deserialise(serialisedAppUI);
        }

        // Load palettes from local storage
        const serialisedPalettes = localStorage.getItem(LOCAL_STORAGE_PALETTES);
        if (serialisedPalettes) {
            this.#paletteList = PaletteList.deserialise(serialisedPalettes);
        }

        // Load tile sets
        const serialisedTileSets = localStorage.getItem(LOCAL_STORAGE_TILES);
        if (serialisedTileSets) {
            this.#tileSetList = TileSetList.deserialise(serialisedTileSets);
        }
    }

    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_APPUI, this.#appUI.serialise());
        localStorage.setItem(LOCAL_STORAGE_TILES, this.#tileSetList.serialise());
        localStorage.setItem(LOCAL_STORAGE_PALETTES, this.#paletteList.serialise());
    }

    /**
     * Gets the UI elements.
     */
    get appUI() {
        return this.#appUI;
    }

    /**
     * Gets the palette list.
     */
    get paletteList() {
        return this.#paletteList;
    }

    /**
     * Gets the tile set list.
     */
    get tileSetList() {
        return this.#tileSetList;
    }
}

export class AppUI {

    /** @type {string} */
    #lastPaletteInput = '';
    /** @type {string} */
    #lastPaletteInputSystem = 'gg';
    /** @type {string} */
    #lastTileInput = '';
    /** @type {number} */
    #lastSelectedPaletteIndex = 0;

    constructor(initialValues) {
        if (initialValues) {
            if (initialValues.lastPaletteInput) {
                this.lastPaletteInput = initialValues.lastPaletteInput;
            }
            if (initialValues.lastPaletteInputSystem) {
                this.lastPaletteInputSystem = initialValues.lastPaletteInputSystem;
            }
            if (initialValues.lastTileInput) {
                this.lastTileInput = initialValues.lastTileInput;
            }
            if (initialValues.lastSelectedPaletteIndex) {
                this.lastSelectedPaletteIndex = initialValues.lastSelectedPaletteIndex;
            }
        }
    }

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
     * Serialises the class.
     * @returns {string}
     */
    serialise() {
        return JSON.stringify({
            lastPaletteInput: this.lastPaletteInput,
            lastPaletteInputSystem: this.lastPaletteInputSystem,
            lastTileInput: this.lastTileInput,
            lastSelectedPaletteIndex: this.lastSelectedPaletteIndex
        });
    }

    /**
     * Deserialises a JSON string into an AppUI object.
     * @param {string} value JSON string.
     * @returns {AppUI}
     */
    static deserialise(value) {
        const deserialisedObject = JSON.parse(value);
        return new AppUI(deserialisedObject);
    }
}
