import ProjectListJsonSerialiser from "./serialisers/projectListJsonSerialiser.js";
import PersistentUIState from "./models/persistentUIState.js";
import PersistentUIStateFactory from "./factory/persistentUIStateFactory.js";
import AppUIStateJsonSerialiser from "./serialisers/persistentUIStateJsonSerialiser.js";
import Project from "./models/project.js";
import ProjectList from "./models/projectList.js";
import ProjectEntry from "./models/projectEntry.js";
import ProjectEntryList from "./models/projectEntryList.js";
import GeneralUtil from "./util/generalUtil.js";
import ProjectJsonSerialiser from "./serialisers/projectJsonSerialiser.js";
import ProjectEntryListJsonSerialiser from "./serialisers/projectEntryListJsonSerialiser.js";
import EventDispatcher from "./components/eventDispatcher.js";
import ProjectUtil from "./util/projectUtil.js";


const LOCAL_STORAGE_APPUI = 'smsgfxappui';
const LOCAL_STORAGE_PROJECTS = 'smsgfxproject_';
const LOCAL_STORAGE_PROJECT_ENTRIES = 'smsgfxprojectentries';

const EVENT_OnEvent = 'EVENT_OnEvent';

const events = {
    projectChanged: 'projectChanged',
    projectUpdated: 'projectUpdated',
    projectListChanged: 'projectListUpdated',
    projectSaved: 'projectSaved'
};

const contexts = {
    deleted: 'deleted',
    init: 'init',
    history: 'history'
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
     * Gets a list of sources that may trigger an event.
     */
    static get EventSources() {
        return eventSources;
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
        return this.#projectState;
    }


    /** @type {PersistentUIState} */
    #persistentUIState;
    /** @type {Project} */
    #project;
    /** @type {import("./models/persistentUIState.js").ProjectState?} */
    #projectState;
    /** @type {ProjectEntryList} */
    #projectEntries;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {Map<string, Project>} */
    #projects = new Map();


    /**
     * Constructor for the class.
     */
    constructor() {
        this.#persistentUIState = PersistentUIStateFactory.create();
        this.#project = null;
        this.#projectEntries = new ProjectEntryList();
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
     * @param {string?} [context=null] - Context on what triggered the project change.
     */
    setProject(project, context) {
        let lastProjectId = this.project?.id ?? null;
        if (project instanceof Project) {
            this.#project = project;
        } else {
            this.#project = null;
        }
        let thisProjectId = this.project?.id ?? null;

        if (lastProjectId !== thisProjectId) {
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectChanged, {
                projectId: thisProjectId,
                lastProjectId: lastProjectId,
                context: context ?? null
            }));
        } else {
            this.#dispatcher.dispatch(EVENT_OnEvent, createArgs(events.projectUpdated, {
                projectId: thisProjectId
            }));
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
     * @param {string?} [context=null] - Context on what triggered the project change.
     */
    setProjectFromLocalStorage(projectId, context) {
        const project = this.getProjectFromLocalStorage(projectId);
        ensureProjectHasId(project);
        this.setProject(project, context);
    }

    /**
     * Loads a project, favouring any cached project, otherwise from local storage, sets it as the current project.
     * @param {string?} projectId - Unique ID of the project to load.
     * @param {string?} [context=null] - Context on what triggered the project change.
     */
    setProjectById(projectId, context) {
        const project = this.getProjectById(projectId);
        this.setProject(project, context);
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

        const result = ProjectJsonSerialiser.deserialise(serialised);
        this.#projects.set(result.id, result);
        return result;
    }

    /**
     * Gets a project from the cache first, falling back to local storage.
     * @param {string} projectId - ID of the project to get.
     * @returns {Project}
     */
    getProjectById(projectId) {
        if (this.#projects.has(projectId)) {
            return this.#projects.get(projectId);
        } else {
            return this.getProjectFromLocalStorage(projectId);
        }
    }

    /**
     * Saves the current UI state variables to local storage.
     */
    savePersistentUIStateToLocalStorage() {
        const serialisedUIState = AppUIStateJsonSerialiser.serialise(this.persistentUIState);
        localStorage.setItem(LOCAL_STORAGE_APPUI, serialisedUIState);
    }

    /**
     * Gets the project entry list.
     * @returns {ProjectEntry[]}
     */
    getProjectEntries() {
        addOrRemoveProjectEntriesBasedOnLocalStorage(this.#projectEntries, this);
        updateProjectEntriesFromProjects(this.#projectEntries, this.#projects);
        if (this.#projectEntries instanceof ProjectEntryList) {
            return this.#projectEntries.getProjectEntries();
        }
        return [];
    }

    /**
     * Loads the project entry list from local storage.
     */
    loadProjectEntriesFromLocalStorage() {
        // Load the actual object
        const entriesJson = localStorage.getItem(LOCAL_STORAGE_PROJECT_ENTRIES);
        if (entriesJson && entriesJson.length > 0) {
            this.#projectEntries = ProjectEntryListJsonSerialiser.deserialise(entriesJson);
        } else {
            this.#projectEntries = new ProjectEntryList();
        }
        addOrRemoveProjectEntriesBasedOnLocalStorage(this.#projectEntries, this);
    }

    /**
     * Saves the project entry list to local storage.
     */
    saveProjectEntriesToLocalStorage() {
        if (this.#projectEntries) {
            const serialisedEntries = ProjectEntryListJsonSerialiser.serialise(this.#projectEntries);
            localStorage.setItem(LOCAL_STORAGE_PROJECT_ENTRIES, serialisedEntries);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_PROJECT_ENTRIES);
        }
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
        addOrRemoveProjectEntriesBasedOnLocalStorage(this.#projectEntries, this);
    }

    /**
     * Saves the persistent UI values and current project to local storage.
     */
    saveToLocalStorage() {
        this.savePersistentUIStateToLocalStorage();
        this.saveProjectToLocalStorage();
        this.saveProjectEntriesToLocalStorage();
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
                this.setProject(null, eventSources.none);
            }
        }
        addOrRemoveProjectEntriesBasedOnLocalStorage(this.#projectEntries, this);
    }

    /**
     * Ensures that the given project has a unique ID.
     * @param {string?} preferredProjectId - If possible use this project ID, if it exists then new one will be generated.
     */
    generateUniqueProjectId(preferredProjectId) {
        if (typeof preferredProjectId === 'string' && preferredProjectId !== '' && !projectIdExistsInLocalStorage(preferredProjectId)) {
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
function projectIdExistsInLocalStorage(projectId) {
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
    } while (projectIdExistsInLocalStorage(result))
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
        previousProjectId: args?.lastProjectId ?? null
    };
}

/**
 * Adds and removes project entries if they exist or don't exist in local storage.
 * @param {ProjectEntryList} entries - Project entries.
 * @param {State} state
 * @returns 
 */
function addOrRemoveProjectEntriesBasedOnLocalStorage(entries, state) {
    if (!entries) return;
    // Search for new projects
    for (const storageKey in localStorage) {
        if (storageKey.startsWith(LOCAL_STORAGE_PROJECTS)) {
            const projectId = storageKey.substring(LOCAL_STORAGE_PROJECTS.length);
            if (!entries.containsProjectEntryById(projectId)) {
                const project = state.getProjectFromLocalStorage(projectId);
                entries.addOrUpdateFromProject(project);
            }
        }
    }
    // Search for deleted projects
    const projectEntryArray = entries.getProjectEntries();
    for (let projectEntry of projectEntryArray) {
        const key = `${LOCAL_STORAGE_PROJECTS}${projectEntry.id}`;
        if (!localStorage.getItem(key)) {
            const index = entries.indexById(projectEntry.id);
            entries.removeAt(index);
        }
    }
}

/**
 * Updates project entries from a list of projects.
 * @param {ProjectEntryList} projectEntryList - List of project entries to update.
 * @param {Map<string, Project>} projects - Projects to update from.
 */
function updateProjectEntriesFromProjects(projectEntryList, projects) {
    projectEntryList.getProjectEntries().forEach((entry) => {
        if (projects.has(entry.id)) {
            const project = projects.get(entry.id);
            entry.title = project.title;
            entry.systemType = project.systemType;
            entry.dateLastModified = project.dateLastModified;
        }
    });
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
 * @property {string} eventSource - Context on what triggered the event.
 * @property {string} context - Context about the event that occurred.
 * @property {string} projectId - Project ID from the current project.
 * @property {string} previousProjectId - Project ID from the last loaded project.
 * @exports
 */

