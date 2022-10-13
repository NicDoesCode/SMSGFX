import PaletteList from "./paletteList.js";
import TileSetList from "./tileSetList.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PALETTES = 'smsgfxpalettes';
const LOCAL_STORAGE_TILES = 'smsgfxtiles';

export default class DataStore {


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


    /** @type {DataStoreUIData} */
    #appUI;
    /** @type {PaletteList} */
    #paletteList;
    /** @type {TileSetList} */
    #tileSetList;


    constructor() {
        this.#appUI = new DataStoreUIData();
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
            this.#appUI = DataStoreUIData.deserialise(serialisedAppUI);
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


    #undoStates = [];
    #redoStates = [];

    recordUndoState() {
        this.clearRedoState();
        this.#undoStates.push({
            palettes: this.#paletteList.serialise(),
            tiles: this.#tileSetList.serialise()
        });
    }

    clearRedoState() {
        this.#redoStates = [];
    }

    clearUndoState() {
        this.#undoStates = [];
        this.#redoStates = [];
    }

    undo() {
        this.#redoStates.push({
            palettes: this.#paletteList.serialise(),
            tiles: this.#tileSetList.serialise()
        });
        const thisUndo = this.#undoStates.pop();
        if (thisUndo) {
            this.#paletteList = PaletteList.deserialise(thisUndo.palettes);
            this.#tileSetList = TileSetList.deserialise(thisUndo.tiles);
        }
    }

    redo() {
        this.#undoStates.push({
            palettes: this.#paletteList.serialise(),
            tiles: this.#tileSetList.serialise()
        });
        const thisRedo = this.#redoStates.pop();
        if (thisRedo) {
            this.#paletteList = PaletteList.deserialise(thisRedo.palettes);
            this.#tileSetList = TileSetList.deserialise(thisRedo.tiles);
        }
    }

}

export class DataStoreUIData {


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
            if (initialValues.lastZoomValue) {
                this.lastZoomValue = initialValues.lastZoomValue;
            }
        }
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
            lastSelectedPaletteIndex: this.lastSelectedPaletteIndex,
            lastZoomValue: this.lastZoomValue
        });
    }

    /**
     * Deserialises a JSON string into an AppUI object.
     * @param {string} value JSON string.
     * @returns {DataStoreUIData}
     */
    static deserialise(value) {
        const deserialisedObject = JSON.parse(value);
        return new DataStoreUIData(deserialisedObject);
    }


}
