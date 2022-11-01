import ProjectListJsonSerialiser from "./serialisers/projectListJsonSerialiser.js";
import PersistentUIState from "./models/persistentUIState.js";
import PersistentUIStateFactory from "./factory/persistentUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/persistentUIStateJsonSerialiser.js";
import Project from "./models/project.js";
import ProjectList from "./models/projectList.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import EventDispatcher from "./components/eventDispatcher.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappui';
const LOCAL_STORAGE_PROJECTS = 'smsgfxproject_';

const EVENT_OnEvent = 'EVENT_OnEvent';

const events = {
    projectChanged: 'projectChanged',
    projectListChanged: 'projectListUpdated'
};

const rxProjectId = /^[A-z0-9]+$/;

export default class State {


    static get Events() {
        return events;
    }

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
    /** @type {EventDispatcher} */
    #dispatcher;


    constructor() {
        this.#persistentUIState = PersistentUIStateFactory.create();
        this.#project = null;
        this.#dispatcher = new EventDispatcher();
    }


    /**
     * Adds a callback for when the loaded project changes.
     * @param {StateCallback} callback - Callback function.
     */
    addHandlerOnEvent(callback) {
        if (typeof callback === 'function') {
            this.#dispatcher.on(EVENT_OnEvent, callback);
        }
    }


    /**
     * Gets all projects from local storage.
     * @returns {ProjectList}
     */
    getProjectsFromLocalStorage() {
        const result = new ProjectList();
        for (const storageKey in localStorage) {
            if (storageKey.startsWith(LOCAL_STORAGE_PROJECTS)) {
                const projectId = storageKey.substring(LOCAL_STORAGE_PROJECTS.length);
                if (rxProjectId.test(projectId)) {
                    if (this.project && this.project.id === projectId) {
                        result.addProject(this.project);
                    } else {
                        const deserialised = ProjectJsonSerialiser.deserialise(localStorage.getItem(storageKey));
                        result.addProject(deserialised);
                    }
                }
            }
        }
        return result;
    }

    /**
     * Set the current project.
     * @param {Project|null} project - Project to set.
     */
    setProject(project) {
        if (project) {
            this.#project = project;
        } else {
            this.#project = null;
        }
        this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectChanged));
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
        this.setProject(project);
    }


    saveUIStateToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.persistentUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);
    }

    saveProjectToLocalStorage() {
        if (this.project) {
            ensureProjectHasId(this.project);
            const storageId = `${LOCAL_STORAGE_PROJECTS}${this.project.id}`;
            const serialised = ProjectJsonSerialiser.serialise(this.project);
            localStorage.setItem(storageId, serialised);
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged));
        }
    }

    /**
     * Saves to local storage.
     */
    saveToLocalStorage() {
        this.saveUIStateToLocalStorage();
        this.saveProjectToLocalStorage();
    }


    /**
     * Deletes a project from local storage.
     * @param {string?} projectId - Project ID to delete.
     */
    deleteProjectFromStorage(projectId) {
        if (projectId && rxProjectId.test(projectId)) {
            const storageId = `${LOCAL_STORAGE_PROJECTS}${this.project.id}`;
            localStorage.removeItem(storageId);
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged));

            if (this.project?.id === projectId) {
                this.setProject(null);
            }
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


/**
 * @param {string} event 
 * @returns {StateEventArgs}
 */
function createArgs(event) {
    return {
        event: event
    };
}


/**
 * State callback.
 * @callback StateCallback
 * @param {StateEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} StateEventArgs
 * @property {string} event - The event that occurred.
 * @exports
 */

