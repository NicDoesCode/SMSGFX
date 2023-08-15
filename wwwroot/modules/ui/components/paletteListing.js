import ComponentBase from "../componentBase.js";
import EventDispatcher from "./../../components/eventDispatcher.js";
import TemplateUtil from "./../../util/templateUtil.js";
import PaletteList from './../../models/paletteList.js';
import Palette from "./../../models/palette.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    paletteSelect: 'paletteSelect'
}

export default class PaletteListing extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {PaletteList} */
    #paletteList;
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
     * @returns {Promise<PaletteListing>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/paletteListing', element);
        return new PaletteListing(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {PaletteListingState} state - State to set.
     */
    setState(state) {
        let dirty = false;

        if (state?.paletteList instanceof PaletteList) {
            this.#paletteList = state.paletteList;
            dirty = true;
        } else if (state?.paletteList === null) {
            this.#paletteList = null;
            dirty = true;
        }

        if (typeof state?.selectedPaletteId === 'string') {
            this.#selectedPaletteId = state.selectedPaletteId;
            dirty = true;
        } else if (state?.selectedPaletteId === null) {
            this.#selectedPaletteId = null;
            dirty = true;
        }

        if (dirty) {
            this.#displayPalettes(this.#paletteList?.getPalettes() ?? null);
        }
    }


    /**
     * Registers a handler for a command.
     * @param {PaletteListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }

    /**
     * @param {Palette[]} palettes
     */
    #displayPalettes(palettes) {
        const renderList = palettes.map((p) => {
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
                    button.classList.add('active');
                }
                /** @param {MouseEvent} ev */
                button.addEventListener('click', (ev) => {
                    /** @type {PaletteListingCommandEventArgs} */
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
 * @typedef {object} PaletteListingState
 * @property {PaletteList?} [paletteList] - Palette list to be displayed.
 * @property {string?} [selectedPaletteId] - Unique ID of the selected palette.
 */

/**
 * When a command is issued from the palette list.
 * @callback PaletteListingCommandCallback
 * @param {PaletteListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} PaletteListingCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} paletteId - Unique ID of the palette.
 * @exports
 */
