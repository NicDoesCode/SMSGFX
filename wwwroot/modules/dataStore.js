import PaletteListJsonSerialiser from "./serialisers/paletteListJsonSerialiser.js";
import TileSetJsonSerialiser from "./serialisers/tileSetJsonSerialiser.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import TileSet from "./models/tileSet.js";
import AppUIState from "./models/appUIState.js";
import AppUIStateFactory from "./factory/appUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/appUIStateJsonSerialiser.js";
import PaletteList from "./models/paletteList.js";
import PaletteListFactory from "./factory/paletteListFactory.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PALETTES = 'smsgfxpalettes';
const LOCAL_STORAGE_TILES = 'smsgfxtiles';

export default class DataStore {


    /** Gets the static singleton instance. */
    static get instance() {
        if (!DataStore.#instance) {
            DataStore.#instance = new DataStore();
        }
        return DataStore.#instance;
    }

    /** @type {DataStore} */
    static #instance = null;


    /**
     * Gets the UI elements.
     */
    get appUIState() {
        return this.#appUIState;
    }

    /**
     * Gets the palette list.
     */
    get paletteList() {
        return this.#paletteList;
    }
    set paletteList(value) {
        if (value && typeof value.getPalettes === 'function') {
            this.#paletteList = value;
        } else {
            throw new Error('Please pass a palette list.');
        }
    }

    /**
     * Gets or sets the tile set.
     */
    get tileSet() {
        return this.#tileSet;
    }
    set tileSet(value) {
        this.#tileSet = value;
    }


    /** @type {AppUIState} */
    #appUIState;
    /** @type {PaletteList} */
    #paletteList;
    /** @type {TileSet} */
    #tileSet;
    /** @type {UndoState[]} */
    #undoStates = [];
    /** @type {UndoState[]} */
    #redoStates = [];


    constructor() {
        this.#appUIState = AppUIStateFactory.create();
        this.#paletteList = PaletteListFactory.create();
        this.#tileSet = TileSetFactory.create();
    }


    /**
     * Loads values from local storage.
     */
    loadFromLocalStorage() {
        // Load UI from local storage
        const serialisedAppUI = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (serialisedAppUI) {
            this.#appUIState = AppUIStateJsonSerialiser.deserialise(serialisedAppUI);
        }

        // Load palettes from local storage
        const serialisedPaletteList = localStorage.getItem(LOCAL_STORAGE_PALETTES);
        if (serialisedPaletteList) {
            this.#paletteList = PaletteListJsonSerialiser.deserialise(serialisedPaletteList);
        }

        // Load tile sets
        const serialisedTileSets = localStorage.getItem(LOCAL_STORAGE_TILES);
        if (serialisedTileSets) {
            this.#tileSet = TileSetJsonSerialiser.deserialise(serialisedTileSets);
        }
    }


    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.appUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);

        const serialisedTiles = TileSetJsonSerialiser.serialise(this.tileSet);
        localStorage.setItem(LOCAL_STORAGE_TILES, serialisedTiles);

        const serialisedPaletteList = PaletteListJsonSerialiser.serialise(this.paletteList);
        localStorage.setItem(LOCAL_STORAGE_PALETTES, serialisedPaletteList);
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
            this.#paletteList = PaletteListJsonSerialiser.deserialise(thisUndo.palettes);
            this.#tileSet = TileSetJsonSerialiser.deserialise(thisUndo.tiles);
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
            this.#paletteList = PaletteListJsonSerialiser.deserialise(thisRedo.palettes);
            this.#tileSet = TileSetJsonSerialiser.deserialise(thisRedo.tiles);
        }
    }

    /**
     * Creates an undo state from the current data state.
     * @returns {UndoState}
     */
    #createUndoState() {
        const palettes = PaletteListJsonSerialiser.serialise(this.paletteList);
        const tiles = TileSetJsonSerialiser.serialise(this.tileSet);
        return {
            palettes, tiles
        }
    }

}


/**
 * Represents a palette and tile state that can be undone.
 * @typedef UndoState
 * @type {object}
 * @property {string[]} palettes - Palette data serialised to an array of strings.
 * @property {string[]} tiles - Tile data serialised to an array of strings.
 */
