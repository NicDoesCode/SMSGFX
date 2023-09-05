import EventDispatcher from './eventDispatcher.js';


const EVENT_OnCommand = 'EVENT_OnCommand';

const types = {
    keyup: 'keyup',
    keydown: 'keydown'
}


export default class KeyboardManager {


    static get types() {
        return types;
    }


    get platform() {
        return this.#platform;
    }
    set platform(value) {
        if (value && typeof value === 'string') {
            this.#platform = value;
        } else {
            this.#platform = '';
        }
    }


    #dispatcher;
    /** @type {string} */
    #platform;
    /** @type {KeyHandler[]} */
    #keyHandlers = [];


    constructor(platform) {

        this.#dispatcher = new EventDispatcher();

        this.platform = platform;

        this.#dispatcher = new EventDispatcher();
        document.addEventListener('blur', (e) => {
            for (let i = 0; i < this.#keyHandlers.length; i++) {
                this.#keyHandlers[i].reset();
            }
        });
        document.addEventListener('keydown', (keyEvent) => {
            this.#keyHandlers.forEach((kh) => {
                if (kh.check(this.#platform, keyEvent)) {
                    this.#dispatcher.dispatch(EVENT_OnCommand, createArgs(types.keydown, kh, keyEvent));
                }
            });
        });
        document.addEventListener('keyup', (keyEvent) => {
            this.#keyHandlers.forEach((kh) => {
                if (kh.check(this.#platform, keyEvent)) {
                    this.#dispatcher.dispatch(EVENT_OnCommand, createArgs(types.keyup, kh, keyEvent));
                }
            });
        });
    }


    /**
     * Registers a handler for a command.
     * @param {KeyboardManagerCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * Adds a key event handler.
     * @param {KeyDownHandler|KeyUpHandler} handler - Handler for the key event.
     */
    addKeyHandler(handler) {
        if (handler instanceof KeyDownHandler || handler instanceof KeyUpHandler) {
            this.#keyHandlers.push(handler);
        }
    }


}

class KeyHandler {


    get command() {
        return this.#command;
    }


    #command;


    /**
     * @param {string} command - Name of the command.
     */
    constructor(command) {
        this.#command = command;
    }


    check(platform, keyEvent) {
        return false;
    }

    reset() {
    }


}

export class KeyDownHandler extends KeyHandler {

    /** @type {Object.<string, KeyDownEntry>} */
    #entries = {};
    #index = 0;

    /**
     * Initialises a new instance of the object.
     * @param {string} command - Name of the command.
     * @param {KeyDownEntry[]} entries - Key entries.
     */
    constructor(command, entries) {
        super(command);
        entries.forEach((entry) => {
            const platform = entry?.platform ?? '';
            const keySeriesAsArray = Array.isArray(entry?.keySeries) ? entry.keySeries : [entry?.keySeries ?? ''];
            this.#entries[platform] = {
                platform: platform,
                modifiers: entry?.modifiers ?? {},
                keySeries: keySeriesAsArray.map((k) => {
                    if (typeof k === 'string') {
                        return { key: k };
                    } else if (typeof k?.key === 'string' || Array.isArray(k?.key)) {
                        return { key: k.key };
                    } else if (typeof k?.code === 'string' || Array.isArray(k?.code)) {
                        return { code: k.code };
                    } else return {};
                })
            };
        });
    }


    /**
     * Checks to see whether the keyboard event triggers the handler.
     * @property {string?} platform - Platform to handle.
     * @param {KeyboardEvent} keyEvent - Event that was triggered.
     */
    check(platform, keyEvent) {
        if (!keyEvent instanceof KeyboardEvent) return false;

        if (keyEvent.type !== 'keydown') {
            if (wasModifierKey(keyEvent)) {
                this.reset();
            }
            return;
        };

        const entry = this.#entries[platform ?? ''];
        if (entry) {
            const modifiersMatch = allModifiersSatisfied(entry.modifiers, keyEvent);
            const nextKeyMatches = keyEventMatchesDefinition(keyEvent, entry.keySeries[this.#index]);
            if (modifiersMatch && nextKeyMatches) {
                this.#index++;
                const hasSatisfiedAllKeysInSeries = this.#index === entry.keySeries.length;
                if (hasSatisfiedAllKeysInSeries) {
                    this.reset();
                    return true;
                }
            } else {
                this.reset();
            }
        }

        return false;
    }


    reset() {
        this.#index = 0;
    }


}

export class KeyUpHandler extends KeyHandler {


    /** @type {Object.<string, KeyUpEntry>} */
    #entries = {};


    /**
     * Initialises a new instance of the object.
     * @param {string} command - Name of the command.
     * @param {KeyUpEntry[]} entries - Key entries.
     */
    constructor(command, entries) {
        super(command);
        entries.forEach((entry) => {
            const platform = entry?.platform ?? '';
            let key = {};
            if (typeof entry.key === 'string') {
                key.key = entry.key;
            } else if (typeof entry.key?.key === 'string' || Array.isArray(entry.key?.key)) {
                key.key = entry.key?.key;
            } else if (typeof entry.key?.code === 'string' || Array.isArray(entry.key?.code)) {
                key.code = entry.key?.code;
            }

            this.#entries[platform] = {
                platform: platform,
                modifiers: entry?.modifiers ?? {},
                key: key
            };
        });
    }


    /**
     * Checks to see whether the keyboard event triggers the handler.
     * @property {string?} platform - Platform to handle.
     * @param {KeyboardEvent} keyEvent - Event that was triggered.
     */
    check(platform, keyEvent) {
        if (!keyEvent instanceof KeyboardEvent) return false;

        if (keyEvent.type !== 'keyup') return;

        const entry = this.#entries[platform ?? ''];
        if (entry) {
            const modifiersMatch = allModifiersSatisfied(entry.modifiers, keyEvent);
            const keyMatches = keyEventMatchesDefinition(keyEvent, entry.key);
            if (modifiersMatch && keyMatches) {
                return true;
            }
        }

        return false;
    }


}

/**
 * @param {ModifierKeys} modifiers 
 * @param {KeyboardEvent} keyEvent 
 */
function allModifiersSatisfied(modifiers, keyEvent) {
    if (modifiers) {
        if (modifiers.alt && !keyEvent.altKey) return false;
        if (keyEvent.altKey && !modifiers.alt) return false;
        if (modifiers.control && !keyEvent.ctrlKey) return false;
        if (keyEvent.ctrlKey && !modifiers.control) return false;
        if (modifiers.shift && !keyEvent.shiftKey) return false;
        if (keyEvent.shiftKey && !modifiers.shift) return false;
        if (modifiers.meta && !keyEvent.metaKey) return false;
        if (keyEvent.metaKey && !modifiers.meta) return false;
    } else if (atLeastOneModifier(keyEvent)) {
        return false;
    }
    return true;
}

/**
 * @param {KeyboardEvent} keyEvent 
 */
function atLeastOneModifier(keyEvent) {
    return keyEvent.altKey || keyEvent.ctrlKey || keyEvent.shiftKey || keyEvent.metaKey;
}

/**
 * @param {KeyboardEvent} keyEvent 
 */
function wasModifierKey(keyEvent) {
    return ['Meta', 'Control', 'Alt', 'Shift'].includes(keyEvent.key);
}

/**
 * @param {KeyboardEvent} keyEvent 
 * @param {string|KeyDefinition} key 
 */
function keyEventMatchesDefinition(keyEvent, key) {
    if (typeof key === 'string') {
        return keyEvent.key === key;
    } else if (typeof key?.key === 'string') {
        return keyEvent.key === key.key;
    } else if (Array.isArray(key?.key)) {
        return key.key.includes(keyEvent.key);
    } else if (typeof key?.code === 'string') {
        return keyEvent.code === key.code;
    } else if (Array.isArray(key?.code)) {
        return key.code.includes(keyEvent.code);
    }
}

/**
 * @property {string} type - Either 'keyUp' or 'keyDown'.
 * @param {KeyHandler} keyHandler 
 * @param {KeyboardEvent} keyEvent 
 * @returns {KeyboardManagerEventArgs}
 */
function createArgs(type, keyHandler, keyEvent) {
    return {
        command: keyHandler.command,
        type: type,
        keyboardEvent: keyEvent,
        preventDefault: () => { keyEvent.preventDefault() },
        stopImmediatePropagation: () => { keyEvent.stopImmediatePropagation() }
    };
}


/**
 * Command callback function.
 * @callback KeyboardManagerCommandCallback
 * @param {KeyboardManagerEventArgs} args - Arguments.
 * @exports
 */

/**
 * @typedef {Object} KeyboardManagerEventArgs
 * @property {string?} command - Command that was invoked.
 * @property {string} type - Either 'keyUp' or 'keyDown'.
 * @property {KeyboardEvent} keyboardEvent - Keyboard event that occurred.
 * @property {Function} preventDefault - If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.
 * @property {Function} stopImmediatePropagation - Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
 * @exports
 */

/**
 * @typedef {Object} ModifierKeys
 * @property {boolean} shift - Shift key.
 * @property {boolean} control - Control key.
 * @property {boolean} alt - Alt key.
 * @property {boolean} meta - Meta key.
 * @exports
 */

/**
 * @typedef {Object} KeyDownEntry
 * @property {string?} platform - Platform to handle.
 * @property {ModifierKeys?} modifiers - Modifier keys.
 * @property {string|string[]|KeyDefinition|KeyDefinition[]} keySeries - Array of sequential key strokes that comprise this shortcut.
 * @exports
 */

/**
 * @typedef {Object} KeyUpEntry
 * @property {string?} platform - Platform to handle.
 * @property {ModifierKeys?} modifiers - Modifier keys.
 * @property {string|KeyDefinition} key - Key that activates this command.
 * @exports
 */

/**
 * @typedef {Object} KeyDefinition
 * @property {string?} code - Platform to handle.
 * @property {string|string[]|null} key - Platform to handle.
 * @exports
 */
