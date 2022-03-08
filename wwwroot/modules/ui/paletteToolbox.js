import Palette from "../palette.js";

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

    /** @type {PaletteToolboxColourCallback} */
    #onSelectedPaletteChangedCallback = () => { };

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
        this.#paletteRows.forEach((row, index) => {
            if (index !== null && index === value) {
                if (!row.classList.contains('table-dark')) {
                    row.classList.add('table-dark');
                }
            } else {
                row.classList.remove('table-dark');
            }
        });
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement[]} */
    #paletteButtons = [];
    /** @type {HTMLTableRowElement[]} */
    #paletteRows = [];
    /** @type {HTMLButtonElement} */
    #btnAddPalette;
    /** @type {HTMLButtonElement} */
    #btnRemovePalette;
    /** @type {HTMLSelectElement} */
    #tbPaletteSelect;
    /** @type {number|null} */
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

        this.#btnAddPalette = this.#element.querySelector('#btnAddPalette');
        this.#btnAddPalette.onclick = () => this.onAddPalette(this, {});

        this.#btnRemovePalette = this.#element.querySelector('#btnRemovePalette');
        this.#btnRemovePalette.onclick = () => this.onDeleteSelectedPalette(this, {});

        this.#tbPaletteSelect = this.#element.querySelector('#tbPaletteSelect');
        this.#tbPaletteSelect.onchange = () => this.onSelectedPaletteChanged(this, {});
    }

    #createPaletteButtons() {

        /** @type {HTMLTableElement} */
        const table = this.#element.querySelector('#smsgfx-palette-selector');
        /** @type {HTMLTableSectionElement} */
        const tbody = table.querySelector('tbody');


        for (let i = 0; i < 16; i++) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-colour-index', i.toString());

            // Number
            let td = document.createElement('td');
            td.innerHTML = i.toString();
            tr.appendChild(td);

            // Colour button
            td = document.createElement('td');
            const btnColour = document.createElement('button');
            btnColour.classList.add('btn', 'btn-outline-secondary', 'smsgfx-palette-button');
            btnColour.setAttribute('data-colour-index', i.toString());
            btnColour.onclick = () => this.onColourSelected(this, { index: i });
            btnColour.innerHTML = '&nbsp;';
            td.appendChild(btnColour);
            tr.appendChild(td);

            // Edit button
            td = document.createElement('td');
            const btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'smsgfx-palette-edit-button');
            btnEdit.setAttribute('data-colour-index', i.toString());
            btnEdit.onclick = () => this.onColourEdit(this, { index: i });
            const icon = document.createElement('i');
            icon.classList.add('bi', 'bi-pencil-square');
            btnEdit.appendChild(icon);
            td.appendChild(btnEdit);
            tr.appendChild(td);

            tbody.appendChild(tr);

            this.#paletteRows.push(tr);
            this.#paletteButtons.push(btnColour);
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
            const system = palettes[i].system === "gg" ? "Game Gear" : "Master System";
            const option = document.createElement('option');
            option.innerText = `#${i} - ${system}`;
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
            if (i < palette.colours.length) {
                paletteButtons[i].style.backgroundColor = palette.colours[i].hex;
            } else {
                paletteButtons[i].style.backgroundColor = null;
            }
        }
    }

    /**
     * Highlights a palette item on the UI.
     * @param {number} paletteIndex Palette colour index.
     */
    highlightPaletteItem(paletteIndex) {
        const paletteRows = this.#paletteRows;
        paletteRows.forEach((row, index) => {
            if (index === paletteIndex) {
                if (!row.classList.contains('table-secondary')) {
                    row.classList.add('table-secondary');
                }
            } else {
                row.classList.remove('table-secondary');
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
 * @property {string} index - Colour index.
 * @exports 
 */
