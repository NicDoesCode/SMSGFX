import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import PersistentUIState from "./models/persistentUIState.js";
import PersistentUIStateFactory from "./factory/persistentUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/persistentUIStateJsonSerialiser.js";
import Project from "./models/project.js";
import ProjectFactory from "./factory/projectFactory.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappUi';
const LOCAL_STORAGE_PROJECT = 'smsgfxproject';

export default class State {


    /** Gets the static singleton instance. */
    static get instance() {
        if (!State.#instance) {
            State.#instance = new State();
        }
        return State.#instance;
    }

    /** @type {State} */
    static #instance = null;


    /**
     * Gets the UI elements.
     */
    get persistentUIState() {
        return this.#persistentUIState;
    }

    /**
     * Gets or sets the project.
     */
    get project() {
        return this.#project;
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


    /** @type {PersistentUIState} */
    #persistentUIState;
    /** @type {Project} */
    #project;


    constructor() {
        this.#persistentUIState = PersistentUIStateFactory.create();
        const project = ProjectFactory.create();
        this.setProject(project);
    }


    /**
     * Sets the project state.
     * @param {Project} project - Project to replace existing state.
     */
    setProject(project) {
        this.#project = project;
    }


    /**
     * Loads values from local storage.
     */
    loadFromLocalStorage() {
        // Load UI from local storage
        const serialisedAppUI = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (serialisedAppUI) {
            this.#persistentUIState = AppUIStateJsonSerialiser.deserialise(serialisedAppUI);
        }

        // Load the projedt
        const serialisedProject = localStorage.getItem(LOCAL_STORAGE_PROJECT);
        if (serialisedProject) {
            const project = ProjectJsonSerialiser.deserialise(serialisedProject);
            this.setProject(project);
        }
    }


    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.persistentUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);

        const serialisedProject = ProjectJsonSerialiser.serialise(this.project);
        localStorage.setItem(LOCAL_STORAGE_PROJECT, serialisedProject);
    }


}
