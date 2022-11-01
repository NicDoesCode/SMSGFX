import ProjectListJsonSerialiser from "./serialisers/projectListJsonSerialiser.js";
import PersistentUIState from "./models/persistentUIState.js";
import PersistentUIStateFactory from "./factory/persistentUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/persistentUIStateJsonSerialiser.js";
import Project from "./models/project.js";
import ProjectList from "./models/projectList.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappui';
const LOCAL_STORAGE_PROJECTS = 'smsgfxproject_';

const rxProjectId = /^[A-z0-9]+$/ig;

export default class State {


    /**
     * Gets the presistent state for UI elements.
     */
    get persistentUIState() {
        return this.#persistentUIState;
    }

    /**
     * Gets the project.
     */
    get project() {
        return this.#project;
    }


    /** @type {PersistentUIState} */
    #persistentUIState;
    /** @type {Object.<string, Project>} */
    #projects = {};
    /** @type {Project} */
    #project;


    constructor() {
        this.#persistentUIState = PersistentUIStateFactory.create();
        this.#project = null;
    }


    /**
     * Gets all projects from local storage.
     * @returns {ProjectList}
     */
    getProjectsFromLocalStorage() {
        const result = new ProjectList();
        for (const key in localStorage) {
            if (key.startsWith(LOCAL_STORAGE_PROJECTS)) {
                const id = key.substring(LOCAL_STORAGE_PROJECTS.length);
                if (id && rxProjectId.test(project.id)) {
                    if (this.project && this.project.id === id) {
                        result.addProject(this.project);
                    } else {
                        const deserialised = ProjectJsonSerialiser.deserialise(localStorage.getItem(key));
                        result.addProject(deserialised);
                    }
                }
            }
        }
        return result;
    }

    /**
     * Set the current project.
     * @param {Project} project - Project to set.
     */
    setProject(project) {
        if (!project) throw new Error('Index out of range for new project to insert.');
        this.#project = project;
    }


    /**
     * Loads persistent UI values from local storage.
     */
    loadFromLocalStorage() {
        // Load UI from local storage
        const serialisedAppUI = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (serialisedAppUI) {
            this.#persistentUIState = AppUIStateJsonSerialiser.deserialise(serialisedAppUI);
        }
    }

    /**
     * Loads values from local storage.
     * @param {string?} projectId - Project details to load.
     */
    loadProjectFromLocalStorage(projectId) {
        if (!projectId || !rxProjectId.test(projectId)) throw new Error('Invalid project ID given.');

        const storageId = `${LOCAL_STORAGE_PROJECTS}${projectId}`;
        const serialised = localStorage.getItem(storageId);

        if (!serialised) throw new Error('Project ID not found.');

        const project = ProjectJsonSerialiser.deserialise(serialised);
        ensureProjectHasId(project);
        this.#project = project;
    }


    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.persistentUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);

        if (this.project) {
            ensureProjectHasId(project);
            const storageId = `${LOCAL_STORAGE_PROJECTS}${project.id}`;
            const serialised = ProjectJsonSerialiser.serialise(project);
            localStorage.setItem(storageId, serialised);
        }
    }


}

/**
 * Makes sure that a project has an ID.
 * @param {Project} project - Project to check.
 */
function ensureProjectHasId(project) {
    if (!project.id || !rxProjectId.test(project.id)) {
        project.id = GeneralUtil.generateRandomString(16);
    }
}