import Project from "../models/project.js";
import ProjectJsonSerialiser from "../serialisers/projectJsonSerialiser.js";
import EventDispatcher from "./eventDispatcher.js";

const CHANNEL_NAME = 'smsgfxprojectupdate';
const EVENT_OnUpdate = 'EVENT_OnUpdate';

const events = {
    projectChanged: 'projectChanged',
    projectListChanged: 'projectListChanged'
};

export default class ProjectWatcher {


    static get Events() {
        return events;
    }


    get sessionId() {
        return this.#sessionId;
    }


    /** @type {string} */
    #sessionId = null;
    /** @type {BroadcastChannel} */
    #channel;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * Initialises a new instance of a session watcher.
     * @param {string} sessionId - Session ID to watch.
     */
    constructor(sessionId) {
        if (!sessionId) throw new Error('Must provide a session ID.');
        this.#dispatcher = new EventDispatcher();
        this.#sessionId = sessionId;
        this.#channel = new BroadcastChannel(CHANNEL_NAME);
        this.#channel.addEventListener('message', (event) => {
            this.#getUpdate(event.data);
        });
    }


    /**
     * Adds a callback for when a message is received.
     * @param {ProjectWatcherCallback} callback - Callback function.
     */
    addHandlerOnEvent(callback) {
        if (typeof callback === 'function') {
            this.#dispatcher.on(EVENT_OnUpdate, callback);
        }
    }


    /**
     * Sends a message that a project was changed, along with the data from the project.
     * @param {Project} project - Project that was changed.
     */
    sendProjectChanged(project) {
        /** @type {ProjectBroadcastMessage} */
        const data = {
            event: events.projectChanged,
            sessionId: this.#sessionId,
            projectJson: ProjectJsonSerialiser.serialise(project)
        };
        this.#channel.postMessage(data);
    }


    /**
     * Sends a message that the project list was updated.
     */
    sendProjectListChanged() {
        /** @type {ProjectBroadcastMessage} */
        const data = {
            event: events.projectListChanged,
            sessionId: this.#sessionId,
            projectJson: null
        };
        this.#channel.postMessage(data);
    }


    /**
     * @param {ProjectBroadcastMessage} data 
     */
    #getUpdate(data) {
        /** @type {ProjectWatcherEventArgs} */
        const args = {
            event: data.event,
            sessionId: data.sessionId,
            project: data.projectJson ? ProjectJsonSerialiser.deserialise(data.projectJson) : null
        };
        this.#dispatcher.dispatch(EVENT_OnUpdate, args);
    }


}

/**
 * Project broadcast message.
 * @typedef {object} ProjectBroadcastMessage
 * @property {string} event - The event that occurred.
 * @property {string} sessionId - Session that generated the message.
 * @property {string} projectJson - Project that the message related to.
 */

/**
 * Project watcher callback.
 * @callback ProjectWatcherCallback
 * @param {ProjectWatcherEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} ProjectWatcherEventArgs
 * @property {string} event - The event that occurred.
 * @property {string} sessionId - Session ID.
 * @property {Project} project - Project that the message related to.
 * @exports
 */

