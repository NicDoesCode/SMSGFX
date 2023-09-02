import ProjectListJsonSerialiser from "./serialisers/projectListJsonSerialiser.js";
import PersistentUIState from "./models/persistentUIState.js";
import PersistentUIStateFactory from "./factory/persistentUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/persistentUIStateJsonSerialiser.js";
import Project from "./models/project.js";
import ProjectList from "./models/projectList.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import EventDispatcher from "./components/eventDispatcher.js";
import ProjectUtil from "./util/projectUtil.js";

const LOCAL_STORAGE_APPUI = 'smsgfxappui';
const LOCAL_STORAGE_PROJECTS = 'smsgfxproject_';

const EVENT_OnEvent = 'EVENT_OnEvent';

const events = {
    projectChanged: 'projectChanged',
    projectListChanged: 'projectListUpdated',
    projectSaved: 'projectSaved'
};

const contexts = {
    deleted: 'deleted'
};

const rxProjectId = /^[A-z0-9]+$/;

export default class State {


    static get Events() {
        return events;
    }

    static get Contexts() {
        return contexts;
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

    /**
     * Saves the current UI state variables to local storage.
     */
    saveUIStateToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.persistentUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);
    }

    /**
     * Saves a project to local storage, if a project with the same ID exists it will be overwritten.
     * @param {Project?} [projectToSave] - Project to save to local storage, or null or undefined if to save the currently selected project.
     * @param {boolean?} [raiseEvent] - Raise events that the project was changed? Defaults to true.
     */
    saveProjectToLocalStorage(projectToSave, raiseEvent) {
        const project = projectToSave ?? this.project;
        const raise = typeof raiseEvent === 'boolean' ? raiseEvent : true;
        if (project instanceof Project) {
            ensureProjectHasId(project);
            const storageId = `${LOCAL_STORAGE_PROJECTS}${project.id}`;
            const serialised = ProjectJsonSerialiser.serialise(project);
            localStorage.setItem(storageId, serialised);
            if (raise) {
                this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectSaved, project.id));
                this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged));
            }
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
            const storageId = `${LOCAL_STORAGE_PROJECTS}${projectId}`;
            localStorage.removeItem(storageId);
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged, projectId, contexts.deleted));

            if (this.project?.id === projectId) {
                this.setProject(null);
            }
        }
    }

    /**
     * Ensures that the given project has a unique ID.
     * @param {string?} preferredProjectId - If possible use this project ID, if it exists then new one will be generated.
     */
    getProjectIdThatDoesntCollide(preferredProjectId) {
        if (typeof preferredProjectId === 'string' && preferredProjectId !== '' && !projectIdExists(preferredProjectId)) {
            return preferredProjectId;
        } 
        return generateUniqueProjectId();
    }


}

/**
 * Makes sure that a project has an ID.
 * @param {Project} project - Project to check.
 */
function ensureProjectHasId(project) {
    if (!project.id || !rxProjectId.test(project.id)) {
        project.id = ProjectUtil.generateProjectId();
    }
    return project;
}

/**
 * Returns a boolean value on whether a project exists or not.
 * @param {string} projectId - Project ID to check.
 */
function projectIdExists(projectId) {
    if (typeof projectId !== 'string' || projectId === '') throw new Error('Project ID was not valid.');
    const storageId = `${LOCAL_STORAGE_PROJECTS}${projectId}`;
    return localStorage.getItem(storageId) !== null;
}

/**
 * Returns a unique project ID that doesn't exist in local storage.
 */
function generateUniqueProjectId() {
    let result;
    do {
        result = ProjectUtil.generateProjectId();
    } while (projectIdExists(result))
    return result;
}

/**
 * @param {string} event 
 * @param {string|null} projectId 
 * @param {string|null} context 
 * @returns {StateEventArgs}
 */
function createArgs(event, projectId, context) {
    return {
        event: event,
        context: context ?? null,
        projectId: projectId ?? null
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
 * @property {string} context - Context about the event that occurred.
 * @property {string} projectId - Associated project ID.
 * @exports
 */

