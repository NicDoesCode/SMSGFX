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
    projectUpdated: 'projectUpdated',
    projectListChanged: 'projectListUpdated',
    projectSaved: 'projectSaved'
};

const contexts = {
    deleted: 'deleted'
};


const rxProjectId = /^[A-z0-9]+$/;


/**
 * This class handles the application state such as the current loaded project, as well as management of local storage.
 */
export default class State {


    /**
     * Gets a list of events that can occur.
     */
    static get Events() {
        return events;
    }

    /**
     * Gets a list of event contexts that can occur.
     */
    static get Contexts() {
        return contexts;
    }


    /**
     * Gets the presistent UI state (must call the 'loadPersistentUIStateFromLocalStorage()' method before accessing).
     */
    get persistentUIState() {
        return this.#persistentUIState;
    }

    /**
     * Gets the current project.
     */
    get project() {
        return this.#project;
    }

    /**
     * Gets the current project state.
     */
    get projectState() {
        return this.#project;
    }


    /** @type {PersistentUIState} */
    #persistentUIState;
    /** @type {Project} */
    #project;
    /** @type {import("./models/persistentUIState.js").ProjectState?} */
    #projectState;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * Constructor for the class.
     */
    constructor() {
        this.#persistentUIState = PersistentUIStateFactory.create();
        this.#project = null;
        this.#dispatcher = new EventDispatcher();
    }


    /**
     * Adds a callback for when an event occurs.
     * @param {StateCallback} callback - Callback function.
     */
    addHandlerOnEvent(callback) {
        if (typeof callback === 'function') {
            this.#dispatcher.on(EVENT_OnEvent, callback);
        }
    }


    /**
     * Gets a list containing all projects found in local storage.
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
     * @param {Project?} project - Project to set, or null if no project.
     */
    setProject(project) {
        let lastProjectId = this.project?.id ?? null;
        if (project) {
            this.#project = project;
        } else {
            this.#project = null;
        }
        let thisProjectId = this.project?.id ?? null;

        if (lastProjectId !== thisProjectId) {
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectChanged, { projectId: thisProjectId, lastProjectId: lastProjectId }));
        } else {
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectUpdated, { projectId: thisProjectId }));
        }
    }


    /**
     * Loads persistent UI values from local storage.
     */
    loadPersistentUIStateFromLocalStorage() {
        // Load UI from local storage
        const serialisedAppUI = localStorage.getItem(LOCAL_STORAGE_APPUI);
        if (serialisedAppUI) {
            this.#persistentUIState = AppUIStateJsonSerialiser.deserialise(serialisedAppUI);
        }
    }

    /**
     * Loads a project from local storage and sets it as the current project.
     * @param {string?} projectId - Unique ID of the project to load from local storage.
     */
    setProjectFromLocalStorage(projectId) {
        const project = getProjectFromLocalStorage(projectId);
        ensureProjectHasId(project);
        this.setProject(project);
    }

    /**
     * Gets a project from local storage.
     * @param {string?} projectId - Unique ID of the project to load from local storage.
     */
    getProjectFromLocalStorage(projectId) {
        if (!projectId || !rxProjectId.test(projectId)) throw new Error('Invalid project ID given.');

        const storageId = `${LOCAL_STORAGE_PROJECTS}${projectId}`;
        const serialised = localStorage.getItem(storageId);

        if (!serialised) throw new Error('Project ID not found.');

        return ProjectJsonSerialiser.deserialise(serialised);
    }

    /**
     * Saves the current UI state variables to local storage.
     */
    savePersistentUIStateToLocalStorage() {
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
            project.dateLastModified = new Date();
            const storageId = `${LOCAL_STORAGE_PROJECTS}${project.id}`;
            const serialised = ProjectJsonSerialiser.serialise(project);
            localStorage.setItem(storageId, serialised);
            if (raise) {
                this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectSaved, { projectId: project.id }));
                this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged));
            }
        }
    }

    /**
     * Saves the persistent UI values and current project to local storage.
     */
    saveToLocalStorage() {
        this.savePersistentUIStateToLocalStorage();
        this.saveProjectToLocalStorage();
    }


    /**
     * Deletes a project from local storage.
     * @param {string?} projectId - Unique ID of the project to delete.
     */
    deleteProjectFromStorage(projectId) {
        if (projectId && rxProjectId.test(projectId)) {
            const storageId = `${LOCAL_STORAGE_PROJECTS}${projectId}`;
            localStorage.removeItem(storageId);
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectListChanged, { context: contexts.deleted, projectId: projectId }));

            if (this.project?.id === projectId) {
                this.setProject(null);
            }
        }
    }

    /**
     * Ensures that the given project has a unique ID.
     * @param {string?} preferredProjectId - If possible use this project ID, if it exists then new one will be generated.
     */
    generateUniqueProjectId(preferredProjectId) {
        if (typeof preferredProjectId === 'string' && preferredProjectId !== '' && !projectIdExistsInLocalSTorage(preferredProjectId)) {
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
 * Returns a boolean value on whether there is an antry for a project ID in local storage.
 * @param {string} projectId - Project ID to check.
 */
function projectIdExistsInLocalSTorage(projectId) {
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
    } while (projectIdExistsInLocalSTorage(result))
    return result;
}

/**
 * @param {string} event 
 * @param {{ context?: string?, projectId?: string?, lastProjectId?: string?}} args 
 * @returns {StateEventArgs}
 */
function createArgs(event, args) {
    return {
        event: event,
        context: args?.context ?? null,
        projectId: args?.projectId ?? null,
        lastProjectId: args?.lastProjectId ?? null
    };
}


/**
 * State callback.
 * @callback StateCallback
 * @param {StateEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} StateEventArgs
 * @property {string} event - The event that occurred.
 * @property {string} context - Context about the event that occurred.
 * @property {string} projectId - Associated project ID.
 * @exports
 */

