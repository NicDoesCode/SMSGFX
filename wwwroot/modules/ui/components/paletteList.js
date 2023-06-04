import ComponentBase from "../componentBase.js";
import EventDispatcher from "./../../components/eventDispatcher.js";
import TemplateUtil from "./../../util/templateUtil.js";
import PaletteListObj from './../../models/paletteList.js';
import Palette from "./../../models/palette.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    paletteSelect: 'paletteSelect'
}

export default class PaletteList extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {PaletteListObj} */
    #sourcePaletteList;
    /** @type {string?} */
    #selectedPaletteId = null;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<PaletteList>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/paletteList', element);
        return new PaletteList(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {PaletteListState} state - State to set.
     */
    setState(state) {
        let dirty = false;

        if (state?.paletteList instanceof PaletteListObj) {
            this.#sourcePaletteList = state.paletteList;
            dirty = true;
        }

        if (typeof state?.selectedPaletteId === 'string') {
            this.#selectedPaletteId = state.selectedPaletteId;
            dirty = true;
        } else if (typeof state?.selectedPaletteId === 'object' && state.selectedPaletteId === null) {
            this.#selectedPaletteId = null;
            dirty = true;
        }

        if (dirty && this.#sourcePaletteList) {
            this.#displayPalettes(this.#sourcePaletteList);
        }
    }


    /**
     * Registers a handler for a command.
     * @param {PaletteListCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }

    /**
     * @param {PaletteListObj} paletteList
     */
    #displayPalettes(paletteList) {
        const renderList = paletteList.getPalettes().map((p) => {
            return {
                paletteId: p.paletteId,
                title: p.title,
                system: p.system
            };
        });

        this.renderTemplateToElement(this.#element, 'item-template', renderList);

        this.#element.querySelectorAll('[data-command]').forEach((button) => {
            const command = button.getAttribute('data-command');
            const paletteId = button.getAttribute('data-palette-id');
            if (command && paletteId) {
                if (paletteId === this.#selectedPaletteId) {
                    button.classList.add('selected');
                }
                /** @param {MouseEvent} ev */
                button.addEventListener('click', (ev) => {
                    /** @type {PaletteListCommandEventArgs} */
                    const args = {
                        command: command,
                        paletteId: paletteId
                    }
                    this.#dispatcher.dispatch(EVENT_OnCommand, args);
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                });
            }
        });
    }


}


/**
 * Palette list state.
 * @typedef {object} PaletteListState
 * @property {PaletteListObj?} [paletteList] - Palette list to be displayed.
 * @property {string?} [selectedPaletteId] - Unique ID of the selected palette.
 */

/**
 * When a command is issued from the palette list.
 * @callback PaletteListCommandCallback
 * @param {PaletteListCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} PaletteListCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} paletteId - Unique ID of the palette.
 * @exports
 */
