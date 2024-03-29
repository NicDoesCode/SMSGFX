import ComponentBase from "../componentBase.js";
import EventDispatcher from "../../components/eventDispatcher.js";
import ColourUtil from "../../util/colourUtil.js";
import TemplateUtil from "../../util/templateUtil.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    colourSelect: 'colourSelect'
}


/**
 * UI component that displays a list of colour palettes.
 */
export default class ColourPaletteListing extends ComponentBase {


    /**
     * Gets an enumeration of all the commands that may be invoked by this class.
     */
    static get Commands() {
        return commands;
    }


    #element;
    #dispatcher;
    /** @type {import("../../types.js").ColourInformation[]} */
    #colours;
    #direction = 'row';
    #buttonWidth = null;
    #buttonHeight = null;
    #coloursPerRow = 16;
    #enabled = true;


    /**
     * Constructor for the class.
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
     * @returns {Promise<ColourPaletteListing>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/colourPaletteListing', element);
        return new ColourPaletteListing(componentElement);
    }


    /**
     * Sets the state of the colour picker toolbox.
     * @param {ColourPaletteListingState} state - State to set.
     */
    setState(state) {
        let dirty = false;

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state.enabled;
            this.#element.querySelectorAll('input').forEach(element => {
                element.disabled = !this.#enabled;
            });
            this.#element.querySelectorAll('button').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }

        if (typeof state?.coloursPerRow === 'number') {
            this.#coloursPerRow = Math.max(Math.min(state.coloursPerRow, 256), 1);
            dirty = true;
        }

        if (typeof state?.direction !== 'undefined') {
            if (state.direction === null) {
                this.#direction = 'row';
            } else if (['row', 'row-reverse', 'column', 'column-reverse'].includes(state.direction)) {
                this.#direction = state.direction;
            }
            dirty = true;
        }

        if (typeof state?.buttonWidth !== 'undefined') {
            if (state.buttonWidth === null) {
                this.#buttonWidth = null;
            } else {
                this.#buttonWidth = state.buttonWidth;
            }
            dirty = true;
        }

        if (typeof state?.buttonHeight !== 'undefined') {
            if (state.buttonHeight === null) {
                this.#buttonHeight = null;
            } else {
                this.#buttonHeight = state.buttonHeight;
            }
            dirty = true;
        }

        if (typeof state?.colours !== 'undefined') {
            if (state.colours === null) {
                this.#colours = [];
                dirty = true;
            } else if (Array.isArray(state.colours)) {
                this.#colours = state.colours;
                dirty = true;
            }
        }

        if (dirty) {
            this.#makeColourButtons();
        }
    }


    /**
     * Registers a handler for a command.
     * @param {ColourPaletteListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @param {import("../../types.js").ColourInformation} colour 
     * @returns {ColourPaletteListingCommandEventArgs}
     */
    #createEventArgs(command, colour) {
        return {
            command: command,
            r: colour.r,
            g: colour.g,
            b: colour.b
        };
    }


    #makeColourButtons() {
        // Empty container
        const element = this.#element;
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }

        const perRow = this.#coloursPerRow;

        // Update flex direction class
        element.classList.add('d-flex', 'flex-wrap', 'w-100');
        element.classList.remove('d-flex-row', 'd-flex-row-reverse', 'd-flex-column', 'd-flex-column-reverse')
        switch (this.#direction) {
            case 'row': element.classList.add('flex-column'); break;
            case 'row-reverse': element.classList.add('flex-column'); break;
            case 'column': element.classList.add('flex-row'); break;
            case 'column-reverse': element.classList.add('flex-row'); break;
        }

        // Build the HTML elements
        /** @type {import("../../types.js").ColourInformation[]} */
        const colours = JSON.parse(JSON.stringify(this.#colours));
        if (this.#direction.endsWith('-reverse')) {
            colours.reverse();
        }
        let boxRow;
        colours.forEach((colour, index, array) => {
            if (index % perRow === 0) {
                boxRow = document.createElement('div');
                boxRow.classList.add('d-flex');
                switch (this.#direction) {
                    case 'row': boxRow.classList.add('flex-row', 'w-100'); break;
                    case 'row-reverse': boxRow.classList.add('flex-row', 'w-100'); break;
                    case 'column': boxRow.classList.add('flex-column'); break;
                    case 'column-reverse': boxRow.classList.add('flex-column'); break;
                }
                if (this.#direction.startsWith('column') && this.#buttonWidth === null) {
                    const cols = Math.floor(colours.length / perRow);
                    boxRow.style.width = `${Math.floor(100 / cols)}%`;
                } else {
                    boxRow.style.width = this.#buttonWidth;
                }
                element.appendChild(boxRow);
            }
            const colourHex = ColourUtil.toHex(colour.r, colour.g, colour.b);
            const btn = document.createElement('button');
            if (this.#direction.startsWith('row') && this.#buttonWidth === null) {
                btn.style.width = `${Math.floor(100 / perRow)}%`;
            } else {
                btn.style.width = this.#buttonWidth;
            }
            btn.style.backgroundColor = colourHex;
            btn.onclick = () => {
                if (this.#enabled) {
                    const args = this.#createEventArgs(commands.colourSelect, colour);
                    this.#dispatcher.dispatch(EVENT_OnCommand, args);
                }
            };
            boxRow.appendChild(btn);
        });
        element.querySelectorAll('button').forEach((btn) => {
            if (this.#buttonHeight === null) {
                btn.style.height = '20px';
            } else {
                btn.style.height = this.#buttonHeight;
            }
        });
    }


}


/**
 * Colour palette list state object.
 * @typedef {Object} ColourPaletteListingState
 * @property {boolean?} enabled - Is the toolbox enabled?
 * @property {import("../../types.js").ColourInformation[]?} colours - Colours to display in the picker list.
 * @property {number?} coloursPerRow - Number of colours to display per row, between 1 and 256.
 * @property {string?} direction - Either 'row', 'row-reverse', 'column' or 'column-reverse'.
 * @property {string?} buttonWidth - CSS button width declaration.
 * @property {string?} buttonHeight - CSS button height declaration.
 * @exports 
 */

/**
 * Colour palette list command callback.
 * @callback ColourPaletteListingCommandCallback
 * @param {ColourPaletteListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * Colour palette list on command event args.
 * @typedef {Object} ColourPaletteListingCommandEventArgs
 * @property {string} command - Command being issued.
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @exports
 */
