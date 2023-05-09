import ModalDialogue from "./../modalDialogue.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import TemplateUtil from "../../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    valueChanged: 'valueChanged'
}

export default class ExportModalDialogue extends ModalDialogue {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLElement} */
    #element;
    #dispatcher;
    /** @type {HTMLTextAreaElement} */
    #tbExport;
    /** @type {HTMLInputElement} */
    #tbOptimiseTileMap;
    /** @type {HTMLSelectElement} */
    #tbPaletteIndex;
    /** @type {HTMLInputElement} */
    #tbMemoryOffset;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbExport = this.#element.querySelector('[data-smsgfx-id=export-text]');
        this.#tbOptimiseTileMap = this.#element.querySelector('[data-smsgfx-id=optimise-tile-map]');
        this.#tbPaletteIndex = this.#element.querySelector('[data-smsgfx-id=palette-index]');
        this.#tbMemoryOffset = this.#element.querySelector('[data-smsgfx-id=memory-offset]');

        this.#element.querySelectorAll('[data-command]').forEach((i) => {
            i.onchange = () => {
                const args = this.#createArgs(i.getAttribute('data-command'));
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
        });

    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<ExportModalDialogue>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('dialogues/exportModalDialogue', element);
        return new ExportModalDialogue(componentElement);
    }


    /**
     * Shows the dialogue with assembly data.
     * @param {string} code - Assembly code to show.
     */
    show(code) {
        this.#tbExport.value = code
        super.show();
    }


    /**
     * Sets the state.
     * @param {ExportDialogueState} state - State object.
     */
    setState(state) {
        if (typeof state?.optimiseTileMap === 'boolean') {
            this.#tbOptimiseTileMap.checked = state.optimiseTileMap;
        }
        if (typeof state?.paletteIndex === 'number') {
            if (state.paletteIndex === 0 || state.paletteIndex === 1) {
                this.#tbPaletteIndex.value = state.paletteIndex;
            }
        }
        if (typeof state?.vramOffset === 'number') {
            this.#tbMemoryOffset.value = state.vramOffset;
        }
    }


    /**
     * Register a callback for when a command is invoked.
     * @param {ExportDialogueCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {HTMLElement} element 
     * @returns {ExportDialogueCommandEventArgs}
     */
    #createArgs(command) {
        /** @type {ExportDialogueCommandEventArgs} */
        return {
            command: command,
            optimiseTileMap: this.#tbOptimiseTileMap.checked,
            paletteIndex: parseInt(this.#tbPaletteIndex.selectedIndex),
            vramOffset: parseInt(this.#tbMemoryOffset.value)
        };
    }


}


/**
 * State object.
 * @typedef {object} ExportDialogueState
 * @property {boolean?} optimiseTileMap - Do we optimise the tile map?
 * @property {number?} paletteIndex - Index of the palette to use.
 * @property {number?} vramOffset - Offset of the tiles in the tile map in bytes.
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback ExportDialogueCommandCallback
 * @argument {ExportDialogueCommandEventArgs} data - Arguments.
 * @exports
 */
/**
 * @typedef {object} ExportDialogueCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {boolean} optimiseTileMap - Do we optimise the tile map? 
 * @property {number} paletteIndex - Index of the palette to use.
 * @property {number} vramOffset - Offset of the tiles in the tile map in bytes.
 * @exports
 */