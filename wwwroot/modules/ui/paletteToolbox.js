import Palette from "../palette.js";
import ColourUtil from "../util/colourUtil.js";

export default class PaletteToolbox {


    /** 
     * When a palette is to be imported.
     * @type {PaletteToolboxCallback} 
     */
    get onAddPalette() {
        return this.#onAddPaletteCallback;
    }
    set onAddPalette(value) {
        if (value && typeof value === 'function') {
            this.#onAddPaletteCallback = value;
        } else {
            this.#onAddPaletteCallback = () => { };
        }
    }

    /** @type {PaletteToolboxCallback} */
    #onAddPaletteCallback = () => { };

    /** 
     * When a new palette is to be created.
     * @type {PaletteToolboxCallback} 
     */
     get onNewPalette() {
        return this.#onNewPaletteCallback;
    }
    set onNewPalette(value) {
        if (value && typeof value === 'function') {
            this.#onNewPaletteCallback = value;
        } else {
            this.#onNewPaletteCallback = () => { };
        }
    }

    /** @type {PaletteToolboxCallback} */
    #onNewPaletteCallback = () => { };

    /** 
     * When a palette is to be deleted.
     * @type {PaletteToolboxCallback} 
     */
    get onDeleteSelectedPalette() {
        return this.#onDeleteSelectedPaletteCallback;
    }
    set onDeleteSelectedPalette(value) {
        if (value && typeof value === 'function') {
            this.#onDeleteSelectedPaletteCallback = value;
        } else {
            this.#onDeleteSelectedPaletteCallback = () => { };
        }
    }

    /** @type {PaletteToolboxCallback} */
    #onDeleteSelectedPaletteCallback = () => { };

    /** 
     * When selected palette is changed.
     * @type {PaletteToolboxCallback} 
     */
    get onSelectedPaletteChanged() {
        return this.#onSelectedPaletteChangedCallback;
    }
    set onSelectedPaletteChanged(value) {
        if (value && typeof value === 'function') {
            this.#onSelectedPaletteChangedCallback = value;
        } else {
            this.#onSelectedPaletteChangedCallback = () => { };
        }
    }

    /** @type {PaletteToolboxCallback} */
    #onSelectedPaletteChangedCallback = () => { };

    /** 
     * When selected palette is changed.
     * @type {PaletteToolboxSystemCallback} 
     */
    get onSelectedPaletteSystemChanged() {
        return this.#onSelectedPaletteSystemChangedCallback;
    }
    set onSelectedPaletteSystemChanged(value) {
        if (value && typeof value === 'function') {
            this.#onSelectedPaletteSystemChangedCallback = value;
        } else {
            this.#onSelectedPaletteSystemChangedCallback = () => { };
        }
    }

    /** @type {PaletteToolboxSystemCallback} */
    #onSelectedPaletteSystemChangedCallback = () => { };

    /** 
     * When a colour was selected.
     * @type {PaletteToolboxColourCallback} 
     */
    get onColourSelected() {
        return this.#onColourSelectedCallback;
    }
    set onColourSelected(value) {
        if (value && typeof value === 'function') {
            this.#onColourSelectedCallback = value;
        } else {
            this.#onColourSelectedCallback = () => { };
        }
    }

    /** @type {PaletteToolboxColourCallback} */
    #onColourSelectedCallback = () => { };

    /** 
     * When a colour is to be edited.
     * @type {PaletteToolboxColourCallback} 
     */
    get onColourEdit() {
        return this.#onColourEditCallback;
    }
    set onColourEdit(value) {
        if (value && typeof value === 'function') {
            this.#onColourEditCallback = value;
        } else {
            this.#onColourEditCallback = () => { };
        }
    }

    /** @type {PaletteToolboxColourCallback} */
    #onColourEditCallback = () => { };


    get selectedPaletteIndex() {
        return this.#tbPaletteSelect.selectedIndex;
    }
    set selectedPaletteIndex(value) {
        if (value < 0 || value > this.#tbPaletteSelect.options.length) {
            throw new Error('Palette at this index does not exist.');
        }
        this.#tbPaletteSelect.selectedIndex = value;
    }

    get selectedPaletteColourIndex() {
        return this.#selectedPaletteColourIndex;
    }
    set selectedPaletteColourIndex(value) {
        if (value !== null && (value < 0 || value >= 16)) {
            throw new Error('Invalid palette index.');
        }
        this.#selectedPaletteColourIndex = value;

        // Highlight the row
        this.#paletteCells.forEach((cell, index) => {
            if (index !== null && index === value) {
                if (!cell.classList.contains('table-dark')) {
                    cell.classList.add('table-dark');
                }
            } else {
                cell.classList.remove('table-dark');
            }
        });
    }

    get selectedPaletteSystem() {
        return this.#tbPaletteSystemSelect.value;
    }
    set selectedPaletteSystem(value) {
        if (value && value == 'gg') {
            this.#tbPaletteSystemSelect.value = 'gg';
        } else {
            this.#tbPaletteSystemSelect.value = 'ms';
        }
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement[]} */
    #paletteButtons = [];
    /** @type {HTMLTableCellElement[]} */
    #paletteCells = [];
    /** @type {HTMLButtonElement} */
    #btnNewPalette;
    /** @type {HTMLButtonElement} */
    #btnAddPalette;
    /** @type {HTMLButtonElement} */
    #btnRemovePalette;
    /** @type {HTMLSelectElement} */
    #tbPaletteSelect;
    /** @type {HTMLSelectElement} */
    #tbPaletteSystemSelect;
    /** @type {number} */
    #lastSelectedPaletteIndex;
    /** @type {number|null} */
    #selectedPaletteColourIndex = null;

    /**
     * 
     * @param {HTMLElement} element Element that the toolbox is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#createPaletteButtons();

        this.#btnNewPalette = this.#element.querySelector('#btnNewPalette');
        this.#btnNewPalette.onclick = () => this.onNewPalette(this, {});

        this.#btnAddPalette = this.#element.querySelector('#btnAddPalette');
        this.#btnAddPalette.onclick = () => this.onAddPalette(this, {});

        this.#btnRemovePalette = this.#element.querySelector('#btnRemovePalette');
        this.#btnRemovePalette.onclick = () => this.onDeleteSelectedPalette(this, {});

        this.#tbPaletteSelect = this.#element.querySelector('#tbPaletteSelect');
        this.#tbPaletteSelect.onchange = () => this.onSelectedPaletteChanged(this, {});

        this.#tbPaletteSystemSelect = this.#element.querySelector('#tbPaletteSystemSelect');
        this.#tbPaletteSystemSelect.onchange = () => this.onSelectedPaletteSystemChanged(this, { system: this.selectedPaletteSystem });
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
        if (this.#lastSelectedPaletteIndex !== colourIndex) {
            this.#lastSelectedPaletteIndex = colourIndex;
            this.onColourSelected(this, { index: colourIndex });
        } else {
            this.onColourEdit(this, { index: colourIndex });
        }
    }

    /**
     * Refreshes the list of palettes.
     * @param {palettes[]} palettes List of palettes.
     */
    refreshPalettes(palettes) {
        let lastSelectedIndex = this.selectedPaletteIndex;
        let optionCount = this.#tbPaletteSelect.options.length;
        for (let i = 0; i < optionCount; i++) {
            this.#tbPaletteSelect.options.remove(0);
        }
        for (let i = 0; i < palettes.length; i++) {
            const option = document.createElement('option');
            option.innerText = `${i}`;
            option.value = i.toString();
            option.selected = lastSelectedIndex === i;
            this.#tbPaletteSelect.options.add(option);
        }
        if (this.selectedPaletteIndex === -1) {
            this.selectedPaletteIndex = 0;
        }
    }

    /**
     * Displays a given palette to the screen.
     * @param {Palette} palette The palette to show on the buttons.
     */
    setPalette(palette) {
        const paletteButtons = this.#paletteButtons;
        for (let i = 0; i < 16; i++) {
            if (i < palette.getColours().length) {
                const c = palette.getColour(i);
                paletteButtons[i].style.backgroundColor = ColourUtil.toHex(c.r, c.g, c.b);
            } else {
                paletteButtons[i].style.backgroundColor = null;
            }
        }
        this.selectedPaletteSystem = palette.system;
    }

    /**
     * Highlights a palette item on the UI.
     * @param {number} paletteIndex Palette colour index.
     */
    highlightPaletteItem(paletteIndex) {
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
}

/**
 * Event callback.
 * @callback PaletteToolboxCallback
 * @param {PaletteToolbox} sender - Originating palette toolbox.
 * @param {object} e - Event args.
 * @exports
 */

/**
 * Event callback.
 * @callback PaletteToolboxColourCallback
 * @param {PaletteToolbox} sender - Originating palette toolbox.
 * @param {PaletteToolboxColourEventData} e - Event args.
 * @exports
 */
/**
 * @typedef PaletteToolboxColourEventData
 * @type {object}
 * @property {number} index - Colour index.
 * @exports 
 */

/**
 * Event callback.
 * @callback PaletteToolboxSystemCallback
 * @param {PaletteToolbox} sender - Originating palette toolbox.
 * @param {PaletteToolboxSystemEventData} e - Event args.
 * @exports
 */
/**
 * @typedef PaletteToolboxSystemEventData
 * @type {object}
 * @property {string} system - System that the palette belongs to.
 * @exports 
 */
