import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    title: 'title',
    projectNew: 'projectNew',
    projectLoadFromFile: 'projectLoadFromFile',
    projectSaveToFile: 'projectSaveToFile',
    exportCode: 'exportCode',
    exportImage: 'exportImage'
}

export default class HeaderBar {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * 
     * @param {HTMLElement} element Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                /** @type {HeaderBarCommandEventArgs} */
                const args = {
                    command: element.getAttribute('data-command'),
                    title: this.#element.querySelector(`[data-command=${commands.title}]`)?.value ?? null
                };
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        // Prevent pressing 'Enter' on the title field from submitting.
        this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
            element.onchange = () => {
                /** @type {HeaderBarCommandEventArgs} */
                const args = {
                    command: element.getAttribute('data-command'),
                    title: element.value
                };
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
            element.onkeydown = (keyEvent) => {
                if (keyEvent.code === 'Enter') {
                    element.onchange();
                    keyEvent.stopImmediatePropagation();
                    return false;
                }
            };
        });
    }


    /**
     * Updates the state of the header bar.
     * @param {HeaderBarState} state - State to set.
     */
    setState(state) {
        if (typeof state?.projectTitle === 'string' && state.projectTitle.length > 0 && state.projectTitle !== null) {
            this.#element.querySelectorAll(`[data-command=${commands.title}]`).forEach(element => {
                element.value = state.projectTitle;
            });
        }
        if (Array.isArray(state?.disabledCommands)) {
            const disabled = state.disabledCommands;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                if (disabled.includes(element.getAttribute('data-command'))) {
                    element.setAttribute('disabled', 'disabled');
                } else {
                    element.removeAttribute('disabled');
                }
            });
        }
    }


    /**
     * Registers a handler for a toolbar command.
     * @param {HeaderBarCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


}


/**
 * Header bar state.
 * @typedef {object} HeaderBarState
 * @property {string?} projectTitle - Project title to display.
 * @property {string[]?} disabledCommands - Array of commands that should be disabled.
 */

/**
 * Header bar callback.
 * @callback HeaderBarCommandCallback
 * @param {HeaderBarCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} HeaderBarCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string?} title - Project title.
 * @exports
 */

