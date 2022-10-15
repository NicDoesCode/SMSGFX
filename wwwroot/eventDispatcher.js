/**
 * Represents an event dispatcher.
 * @class
 */
export default class EventDispatcher {


    /** @type {object.<DispatcherEvent>} */
    #events;


    /**
     * Initialises a new instance of the EventDispatcher class.
     */
    constructor() {
        this.#events = {};
    }


    /**
     * Dispatches an event.
     * @param {string} eventName - Name of the event to dispatch.
     * @param {object} data - Data associated with the object.
     */
    dispatch(eventName, data) {
        /** @type {DispatcherEvent} */
        const event = this.#events[eventName];
        if (event) {
            event.fire(data);
        }
    }

    /**
     * Registers a listener for an event.
     * @param {string} eventName - Name of the event to dispatch.
     * @param {function} callback - Callback to be executed when the event fires.
     */
    on(eventName, callback) {
        /** @type {DispatcherEvent} */
        let event = this.#events[eventName];
        if (!event) {
            event = new DispatcherEvent(eventName);
            this.#events[eventName] = event;
        }
        event.registerCallback(callback);
    }

    /**
     * Deregisters an event callback.
     * @param {string} eventName - Name of the event to dispatch.
     * @param {function} callback - Callback to be deregistered.
     */
    off(eventName, callback) {
        /** @type {DispatcherEvent} */
        let event = this.#events[eventName];
        if (event) {
            // Un-register
            event.unregisterCallback(callback);
            // Delete the event if it's no longer needed
            if (event.callbackCount === 0) {
                delete this.#events[eventName];
            }
        }
    }


}


/**
 * Represents a dispatcher event.
 * @class
 */
class DispatcherEvent {


    /** Gets the amount of callbacks. */
    get callbackCount() {
        return this.#callbacks.length;
    }


    /** @type {string} */
    #eventName;
    /** @type {function[]} */
    #callbacks;


    /**
     * Creates a new instanve of a dispatcher event.
     * @param {string} eventName - Name of the event.
     */
    constructor(eventName) {
        this.#eventName = eventName;
        this.#callbacks = [];
    }


    /**
     * Registers this callback.
     * @param {function} callback - Callback function to be registered.
     */
    registerCallback(callback) {
        this.#callbacks.push(callback);
    }

    /**
     * Unregisters a callback.
     * @param {function} callback - Callback function to be deregistered.
     */
    unregisterCallback(callback) {
        for (let i = this.#callbacks.length - 1; i >= 0; i++) {
            if (this.#callbacks[i] === callback) {
                this.#callbacks.splice(i, 1);
            }
        }
    }

    /**
     * Fires the event.
     * @param {object} data - Data associated with the event.
     */
    fire(data) {
        const callbacks = this.#callbacks.slice(0);
        callbacks.forEach(cb => {
            if (cb && typeof cb === 'function') {
                cb(data);
            }
        });
    }


}