import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    title: 'title',
    projectNew: 'projectNew',
    projectLoad: 'projectLoad',
    projectSave: 'projectSave',
    codeExport: 'codeExport'
}

export default class HeaderBar {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLInputElement} */
    #tbProjectTitle;
    /** @type {HTMLButtonElement} */
    #btnProjectNew;
    /** @type {HTMLButtonElement} */
    #btnProjectLoad;
    /** @type {HTMLButtonElement} */
    #btnProjectSave;
    /** @type {HTMLButtonElement} */
    #btnCodeExport;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * 
     * @param {HTMLElement} element Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#tbProjectTitle = this.#element.querySelector('[data-smsgfx-id=textbox-project-title]');
        this.#tbProjectTitle.onchange = () => {
            /** @type {HeaderBarCommandEventArgs} */
            const args = { command: commands.title, title: this.#tbProjectTitle.value };
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };
        this.#tbProjectTitle.onkeydown = (evt) => {
            // Prevent the enter key from triggering the 'load project' button
            // instead make it trigger the onchange event.
            if (evt.key.toLowerCase() === 'enter') {
                this.#tbProjectTitle.onchange();
                evt.stopImmediatePropagation();
                return false;
            }
        };

        this.#btnProjectNew = this.#element.querySelector('[data-smsgfx-id=button-project-new]');
        this.#btnProjectNew.onclick = () => {
            /** @type {HeaderBarCommandEventArgs} */
            const args = { command: commands.projectNew }
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };

        this.#btnProjectLoad = this.#element.querySelector('[data-smsgfx-id=button-project-load]');
        this.#btnProjectLoad.onclick = () => {
            /** @type {HeaderBarCommandEventArgs} */
            const args = { command: commands.projectLoad }
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };

        this.#btnProjectSave = this.#element.querySelector('[data-smsgfx-id=button-project-save]');
        this.#btnProjectSave.onclick = () => {
            /** @type {HeaderBarCommandEventArgs} */
            const args = { command: commands.projectSave }
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };

        this.#btnCodeExport = this.#element.querySelector('[data-smsgfx-id=button-code-export]');
        this.#btnCodeExport.onclick = () => {
            /** @type {HeaderBarCommandEventArgs} */
            const args = { command: commands.codeExport }
            this.#dispatcher.dispatch(EVENT_OnCommand, args);
        };
    }


    /**
     * Updates the state of the header bar.
     * @param {HeaderBarState} state - State to set.
     */
    setState(state) {
        if (state) {
            if (typeof state.projectTitle === 'string' && state.projectTitle.length > 0 && state.projectTitle !== null) {
                this.#tbProjectTitle.value = state.projectTitle;
            }
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

