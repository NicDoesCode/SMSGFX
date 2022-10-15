import PaletteListJsonSerialiser from "./serialisers/paletteListJsonSerialiser.js";
import TileSetJsonSerialiser from "./serialisers/tileSetJsonSerialiser.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import TileSetFactory from "./factory/tileSetFactory.js";
import TileSet from "./models/tileSet.js";
import AppUIState from "./models/appUIState.js";
import AppUIStateFactory from "./factory/appUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/appUIStateJsonSerialiser.js";
import PaletteList from "./models/paletteList.js";
import PaletteListFactory from "./factory/paletteListFactory.js";
import Project from "./models/project.js";
import ProjectFactory from "./factory/projectFactory.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PALETTES = 'smsgfxpalettes';
const LOCAL_STORAGE_TILES = 'smsgfxtiles';
const LOCAL_STORAGE_PROJECT = 'smsgfxproject';

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
        return this.project.paletteList;
    }
    set paletteList(value) {
        if (value && typeof value.getPalettes === 'function') {
            this.project.paletteList = value;
        } else {
            throw new Error('Please pass a palette list.');
        }
    }

    /**
     * Gets or sets the tile set.
     */
    get tileSet() {
        return this.project.tileSet;
    }
    set tileSet(value) {
        this.project.tileSet = value;
    }

    /**
     * Gets or sets the project.
     */
    get project() {
        return this.#project;
    }
    set project(value) {
        this.#project = value;
    }


    /** @type {AppUIState} */
    #appUIState;
    /** @type {Project} */
    #project;
    /** @type {Project[]} */
    #undoStates = [];
    /** @type {Project[]} */
    #redoStates = [];


    constructor() {
        this.#appUIState = AppUIStateFactory.create();
        this.project = ProjectFactory.create();
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

        // Load the projedt
        const serialisedProject = localStorage.getItem(LOCAL_STORAGE_PROJECT);
        if (serialisedProject) {
            this.project = ProjectJsonSerialiser.deserialise(serialisedProject);
        }
    }


    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.appUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);

        const serialisedProject = ProjectJsonSerialiser.serialise(this.project);
        localStorage.setItem(LOCAL_STORAGE_PROJECT, serialisedProject);
    }


    /**
     * Records the current palette and tile state to the undo cache.
     */
    recordUndoState() {
        this.clearRedoState();
        this.#undoStates.push(this.project);
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
        this.#redoStates.push(this.project);
        const undoStateProject = this.#undoStates.pop();
        if (undoStateProject) {
            this.project = undoStateProject;
        }
    }

    /**
     * Rolls forward to the last state added to the redo cache.
     * Stores the current state in the undo cache.
     */
    redo() {
        this.#undoStates.push(this.project);
        const redoStateProjedt = this.#redoStates.pop();
        if (redoStateProjedt) {
            this.project = redoStateProjedt;
        }
    }


}
