import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteList from "../models/paletteList.js";

const EVENT_NewPalette = 'EVENT_NewPalette';
const EVENT_ImportPaletteFromCode = 'EVENT_ImportPaletteFromCode';
const EVENT_PaletteDelete = 'EVENT_PaletteDelete';
const EVENT_PaletteChanged = 'EVENT_PaletteChanged';
const EVENT_PaletteSystemChanged = 'EVENT_PaletteSystemChanged';
const EVENT_ColourSelected = 'EVENT_ColourSelected';
const EVENT_ColourEdit = 'EVENT_ColourEdit';

export default class PaletteEditor {


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement[]} */
    #paletteButtons = [];
    /** @type {HTMLTableCellElement[]} */
    #paletteCells = [];
    /** @type {HTMLButtonElement} */
    #btnNewPalette;
    /** @type {HTMLButtonElement} */
    #btnImportPaletteFromCode;
    /** @type {HTMLButtonElement} */
    #btnRemovePalette;
    /** @type {HTMLSelectElement} */
    #tbPaletteSelect;
    /** @type {HTMLSelectElement} */
    #tbPaletteSystemSelect;
    /** @type {number} */
    #currentColourIndex = 0;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {PaletteList} */
    #paletteList;


    /**
     * 
     * @param {HTMLElement} element Element that the toolbox is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();
        this.#createPaletteButtons();

        this.#btnNewPalette = this.#element.querySelector('#btnNewPalette');
        this.#btnNewPalette.onclick = () => this.#dispatcher.dispatch(EVENT_NewPalette, {});

        this.#btnImportPaletteFromCode = this.#element.querySelector('#btnImportPaletteFromCode');
        this.#btnImportPaletteFromCode.onclick = () => this.#dispatcher.dispatch(EVENT_ImportPaletteFromCode, {});

        this.#btnRemovePalette = this.#element.querySelector('#btnRemovePalette');
        this.#btnRemovePalette.onclick = () => {
            /** @type {PaletteEditorPaletteEventArgs} */
            const args = { paletteIndex: this.#tbPaletteSelect.selectedIndex };
            this.#dispatcher.dispatch(EVENT_PaletteDelete, args);
        };

        this.#tbPaletteSelect = this.#element.querySelector('#tbPaletteSelect');
        this.#tbPaletteSelect.onchange = () => {
            /** @type {PaletteEditorPaletteChangeEventArgs} */
            const args = {
                paletteIndex: this.#tbPaletteSelect.selectedIndex,
                oldPaletteIndex: this.#currentColourIndex
            };
            this.#dispatcher.dispatch(EVENT_PaletteChanged, args);
            this.#currentColourIndex = this.#tbPaletteSelect.selectedIndex;
        };

        this.#tbPaletteSystemSelect = this.#element.querySelector('#tbPaletteSystemSelect');
        this.#tbPaletteSystemSelect.onchange = () => {
            /** @type {PaletteEditorSystemChangedEventArgs} */
            const args = {
                paletteIndex: this.#tbPaletteSelect.selectedIndex,
                system: this.#tbPaletteSystemSelect.value
            };
            this.#dispatcher.dispatch(EVENT_PaletteSystemChanged, args);
        };
    }


    /**
     * Sets the state of the object.
     * @param {PaletteEditorState} state - State to set.
     */
    setState(state) {
        if (state) {
            if (state.paletteList && typeof state.paletteList.getPalettes === 'function') {
                this.#paletteList = state.paletteList;
                this.#refreshPalettes(this.#paletteList);
            }
            if (typeof state.selectedPaletteIndex === 'number') {
                this.#tbPaletteSelect.selectedIndex = state.selectedPaletteIndex;
            }
            if (this.#paletteList) {
                const selectedPalette = this.#paletteList.getPalette(this.#tbPaletteSelect.selectedIndex);
                this.#setPalette(selectedPalette);
            }
            if (state.selectedColourIndex && state.selectedColourIndex >= 0 && state.selectedColourIndex < 16) {
                this.#currentColourIndex = state.selectedColourIndex;
                this.#selectPaletteColour(state.selectedColourIndex);
            }
            if (state.highlightedColourIndex && state.highlightedColourIndex >= 0 && state.highlightedColourIndex < 16) {
                this.#highlightPaletteColour(state.highlightedColourIndex);
            }
            if (state.selectedSystem) {
                this.#tbPaletteSystemSelect.value = state.selectedSystem;
            }
        }
    }


    /**
     * User requests a new palette.
     * @param {PaletteEditorCallback} callback - Callback function.
     */
    addHandlerRequestNewPalette(callback) {
        this.#dispatcher.on(EVENT_NewPalette, callback);
    }

    /**
     * User requests to import a new palette.
     * @param {PaletteEditorCallback} callback - Callback function.
     */
    addHandlerRequestImportPaletteFromCode(callback) {
        this.#dispatcher.on(EVENT_ImportPaletteFromCode, callback);
    }

    /**
     * User requests to delete a palette.
     * @param {PaletteEditorPaletteCallback} callback - Callback function.
     */
    addHandlerRequestDeletePalette(callback) {
        this.#dispatcher.on(EVENT_PaletteDelete, callback);
    }

    /**
     * User changes the selected palette.
     * @param {PaletteEditorPaletteChangeCallback} callback - Callback function.
     */
    addHandlerRequestSelectedPaletteChange(callback) {
        this.#dispatcher.on(EVENT_PaletteChanged, callback);
    }

    /**
     * User changes the selected system.
     * @param {PaletteEditorSystemChangedCallback} callback - Callback function.
     */
    addHandlerRequestChangeSystem(callback) {
        this.#dispatcher.on(EVENT_PaletteSystemChanged, callback);
    }

    /**
     * User changes the selected colour.
     * @param {PaletteEditorColourIndexCallback} callback - Callback function.
     */
    addHandlerRequestChangeColourIndex(callback) {
        this.#dispatcher.on(EVENT_ColourSelected, callback);
    }

    /**
     * User wants to edit the selected colour.
     * @param {PaletteEditorColourIndexCallback} callback - Callback function.
     */
    addHandlerRequestColourEdit(callback) {
        this.#dispatcher.on(EVENT_ColourEdit, callback);
    }


    /**
     * Refreshes the list of palettes.
     * @param {PaletteList} paletteList - List of palettes.
     */
    #refreshPalettes(paletteList) {
        const lastSelectedIndex = this.#tbPaletteSelect.selectedIndex;
        const optionCount = this.#tbPaletteSelect.options.length;
        for (let i = 0; i < optionCount; i++) {
            this.#tbPaletteSelect.options.remove(0);
        }
        const palettes = paletteList.getPalettes();
        for (let i = 0; i < palettes.length; i++) {
            const option = document.createElement('option');
            option.innerText = `${i}`;
            option.value = i.toString();
            option.selected = lastSelectedIndex === i;
            this.#tbPaletteSelect.options.add(option);
        }
        if (this.#tbPaletteSelect.selectedIndex === -1) {
            this.#tbPaletteSelect.selectedIndex = 0;
        }
    }

    #createPaletteButtons() {

        /** @type {HTMLTableElement} */
        const table = this.#element.querySelector('#tbPalette');
        /** @type {HTMLTableSectionElement} */
        const tbody = table.querySelector('tbody');

        let tr, td;
        for (let i = 0; i < 16; i++) {

            if (i % 4 === 0) {
                tr = document.createElement('tr');
                tbody.appendChild(tr);
            }

            // Colour button
            td = document.createElement('td');
            td.setAttribute('data-colour-index', i.toString());
            td.classList.add('text-center');
            tr.appendChild(td);

            const btnColour = document.createElement('button');
            btnColour.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'position-relative', 'sms-palette-button');
            btnColour.setAttribute('data-colour-index', i.toString());
            btnColour.onclick = () => this.#handleColourClicked(i);
            td.appendChild(btnColour);

            const lblContent = document.createElement('span');
            lblContent.classList.add('position-absolute', 'translate-middle', 'badge', 'bg-dark');
            lblContent.innerHTML = `#${i}`;
            btnColour.appendChild(lblContent);

            this.#paletteCells.push(td);
            this.#paletteButtons.push(btnColour);
        }

    }

    /**
     * Handles colour click event, when the colour is not already selected we will select it
     * otherwise we will edit it.
     * @param {number} colourIndex Index of the colour that was clicked.
     */
    #handleColourClicked(colourIndex) {
        /** @type {PaletteEditorColourIndexEventArgs} */
        const args = {
            paletteIndex: this.#tbPaletteSelect.selectedIndex,
            colourIndex: colourIndex
        }
        if (this.#currentColourIndex !== colourIndex) {
            this.#currentColourIndex = colourIndex;
            this.#dispatcher.dispatch(EVENT_ColourSelected, args);
        } else {
            this.#dispatcher.dispatch(EVENT_ColourEdit, args);
        }
    }

    /**
     * Displays a given palette to the screen.
     * @param {Palette} palette The palette to show on the buttons.
     */
    #setPalette(palette) {
        const paletteButtons = this.#paletteButtons;
        for (let i = 0; i < 16; i++) {
            if (i < palette.getColours().length) {
                const c = palette.getColour(i);
                paletteButtons[i].style.backgroundColor = ColourUtil.toHex(c.r, c.g, c.b);
            } else {
                paletteButtons[i].style.backgroundColor = null;
            }
        }
        this.#tbPaletteSystemSelect.value = palette.system;
    }

    /**
     * Highlights a palette item on the UI.
     * @param {number} paletteIndex Palette colour index.
     */
    #highlightPaletteColour(paletteIndex) {
        const paletteCells = this.#paletteCells;
        paletteCells.forEach((cell, index) => {
            if (index === paletteIndex) {
                if (!cell.classList.contains('table-secondary')) {
                    cell.classList.add('table-secondary');
                }
            } else {
                cell.classList.remove('table-secondary');
            }
        });
    }

    #selectPaletteColour(colourIndex) {
        this.#paletteCells.forEach((cell, index) => {
            if (index !== null && index === colourIndex) {
                if (!cell.classList.contains('table-dark')) {
                    cell.classList.add('table-dark');
                }
            } else {
                cell.classList.remove('table-dark');
            }
        });
    }


}


/**
 * Palette editor state.
 * @typedef {object} PaletteEditorState
 * @property {PaletteList?} paletteList - Current list of palettes.
 * @property {string?} selectedSystem - Sets the selected system, either 'ms' or 'gg'.
 * @property {number?} selectedPaletteIndex - Sets the selected palette index.
 * @property {number?} selectedColourIndex - Sets the selected colour index.
 * @property {number?} highlightedColourIndex - Sets the selected colour index.
 */

/**
 * Event callback.
 * @callback PaletteEditorCallback
 * @param {object} args - Arguments.
 * @exports
 */

/**
 * Event callback with palette index.
 * @callback PaletteEditorPaletteCallback
 * @param {PaletteEditorPaletteEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorPaletteEventArgs
 * @type {object}
 * @property {number} paletteIndex - Palette index.
 * @exports 
 */

/**
 * Event callback with old and new palette index.
 * @callback PaletteEditorPaletteChangeCallback
 * @param {PaletteEditorPaletteChangeEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorPaletteChangeEventArgs
 * @type {object}
 * @property {number} paletteIndex - New palette index.
 * @property {number} oldPaletteIndex - Old palette index.
 * @exports 
 */

/**
 * Event callback for when the system is changed.
 * @callback PaletteEditorSystemChangedCallback
 * @param {PaletteEditorSystemChangedEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorSystemChangedEventArgs
 * @type {object}
 * @property {number} paletteIndex - Palette index.
 * @property {string} system - Either 'ms' or 'gg'.
 * @exports 
 */

/**
 * Event callback with colour index.
 * @callback PaletteEditorColourIndexCallback
 * @param {PaletteEditorColourIndexEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorColourIndexEventArgs
 * @type {object}
 * @property {number} paletteIndex - Palette index.
 * @property {number} colourIndex - Colour index within the palette.
 * @exports 
 */
