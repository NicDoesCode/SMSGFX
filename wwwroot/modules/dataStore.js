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
    /** @type {UndoState[]} */
    #undoStates = [];
    /** @type {UndoState[]} */
    #redoStates = [];


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


    /**
     * Records the current palette and tile state to the undo cache.
     */
    recordUndoState() {
        this.clearRedoState();
        this.#undoStates.push(this.#createUndoState());
    }

    /**
     * Clears the redo state cache.
     */
    clearRedoState() {
        this.#redoStates = [];
    }

    /**
     * Clears the undo and redo state cache.
     */
    clearUndoState() {
        this.#undoStates = [];
        this.#redoStates = [];
    }

    /**
     * Rolls back to the previously recorded state in the undo cache. 
     * Stores the current state in the redo cache.
     */
    undo() {
        this.#redoStates.push(this.#createUndoState());
        const thisUndo = this.#undoStates.pop();
        if (thisUndo) {
            this.#paletteList = PaletteList.deserialise(thisUndo.palettes);
            this.#tileSetList = TileSetList.deserialise(thisUndo.tiles);
        }
    }

    /**
     * Rolls forward to the last state added to the redo cache.
     * Stores the current state in the undo cache.
     */
    redo() {
        this.#undoStates.push(this.#createUndoState());
        const thisRedo = this.#redoStates.pop();
        if (thisRedo) {
            this.#paletteList = PaletteList.deserialise(thisRedo.palettes);
            this.#tileSetList = TileSetList.deserialise(thisRedo.tiles);
        }
    }

    /**
     * Creates an undo state from the current data state.
     * @returns {UndoState}
     */
    #createUndoState() {
        return {
            palettes: this.#paletteList.serialise(),
            tiles: this.#tileSetList.serialise()
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

/**
 * Represents a palette and tile state that can be undone.
 * @typedef UndoState
 * @type {object}
 * @property {string[]} palettes - Palette data serialised to an array of strings.
 * @property {string[]} tiles - Tile data serialised to an array of strings.
 */
