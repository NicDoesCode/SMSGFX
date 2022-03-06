import DataStore from "./dataStore.js";
import Handlers from "./handlers.js";
import Palette from "./palette.js";

/** @type {HTMLSelectElement} */
const tbPaletteInputSystem = document.getElementById('tbPaletteInputSystem');
/** @type {HTMLTextAreaElement} */
const tbPaletteInput = document.getElementById('tbPaletteInput');
/** @type {HTMLTextAreaElement} */
const tbLoadTiles = document.getElementById('tbLoadTiles');
/** @type {HTMLDivElement} */
const paletteModal = document.getElementById('smsgfx-palette-modal');
/** @type {HTMLDivElement} */
const tileModal = document.getElementById('smsgfx-tiles-modal');
/** @type {HTMLButtonElement[]} */
const paletteButtons = [];
/** @type {HTMLTableRowElement[]} */
const paletteRows = [];
/** @type {HTMLCanvasElement} */
const tbCanvas = document.getElementById('tbCanvas');
/** @type {HTMLSelectElement} */
const tbPaletteSelect = document.getElementById('tbPaletteSelect');

/**
 * Callback for when an import of palette is requested.
 * @callback ImportPaletteCallback
 * @param {ImportPaletteEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef ImportPaletteEventData
 * @type {object}
 * @property {string} value - Assembly formatted value of the palette to load.
 * @property {string} system - System the palette is for, either 'ms' or 'gg'.
 * @exports
 */

/**
 * Callback for when an import of tile set is requested.
 * @callback ImportTileSetCallback
 * @param {ImportTileSetEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef ImportTileSetEventData
 * @type {object}
 * @property {string} value - Assembly formatted value of the tile set to load.
 * @exports
 */

export default class UI {

    /** @type {ImportPaletteCallback[]} */
    #importPaletteCallbacks;
    /** @type {ImportTileSetCallback[]} */
    #importTileSetCallbacks;


    constructor() {
        this.#importPaletteCallbacks = [];
        this.#importTileSetCallbacks = [];
    }

    init() {

        this.createPaletteButtons();

        document.getElementById('btnPaletteInput').onclick = () => {
            const value = this.paletteInput;
            const system = this.paletteInputSystem;
            this.#importPaletteCallbacks.forEach(callback => {
                callback({ value, system });
            });
        }

        document.getElementById('btnTileInput').onclick = () => {
            const value = this.tileInput;
            this.#importTileSetCallbacks.forEach(callback => {
                callback({ value });
            });
        }

    }

    createPaletteButtons() {

        /** @type {HTMLTableElement} */
        const table = document.getElementById('smsgfx-palette-selector');
        /** @type {HTMLTableSectionElement} */
        const tbody = table.querySelector('tbody');


        for (let i = 0; i < 16; i++) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-colour-index', i.toString());
            // Numberexport
            let td = document.createElement('td');
            td.innerHTML = i.toString();
            tr.appendChild(td);
            // Button
            td = document.createElement('td');
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-outline-secondary', 'smsgfx-palette-button');
            button.setAttribute('data-colour-index', i.toString());
            td.appendChild(button);
            tr.appendChild(td);

            tbody.appendChild(tr);

            paletteRows.push(tr);
            paletteButtons.push(button);
        }

    }

    get paletteInputSystem() {
        return tbPaletteInputSystem.value;
    }
    set paletteInputSystem(value) {
        if (!value || (value !== 'ms' && value !== 'gg')) {
            throw new Error('System must be either "ms" or "gg".');
        }
        tbPaletteInputSystem.value = value;
    }

    get paletteInput() {
        return tbPaletteInput.value;
    }
    set paletteInput(value) {
        tbPaletteInput.value = value;
    }

    /**
     * Shows the modal that asks the user for the assembly formatted palette data.
     */
    showPaletteInputModal() {
        var modal = bootstrap.Modal.getOrCreateInstance(paletteModal);
        modal.show();
    }

    get tileInput() {
        return tbLoadTiles.value;
    }
    set tileInput(value) {
        tbLoadTiles.value = value;
    }

    /**
     * Shows the modal that asks the user for the assembly formatted tile set data.
     */
    showTileInputModal() {
        var modal = bootstrap.Modal.getOrCreateInstance(tileModal);
        modal.show();
    }

    get selectedPaletteIndex() {
        return tbPaletteSelect.selectedIndex;
    }
    set selectedPaletteIndex(value) {
        if (value < 0 || value > tbPaletteSelect.options.length) {
            throw new Error('Palette at this index does not exist.');
        }
        tbPaletteSelect.selectedIndex = value;
    }

    /**
     * Displays a given palette to the screen.
     * @param {Palette} palette The palette to show on the buttons.
     */
    displayPalette(palette) {
        for (let i = 0; i < 16; i++) {
            if (i < palette.colours.length) {
                paletteButtons[i].style.backgroundColor = palette.colours[i].hex;
            } else {
                paletteButtons[i].style.backgroundColor = null;
            }
        }
    }

    /**
     * User has entered a new palette.
     * @param {ImportPaletteCallback} callback The function to execute when a palette import is requested.
     */
    onImportPalette(callback) {
        this.#importPaletteCallbacks.push(callback);
    }

    /**
     * User has entered a new tile set.
     * @param {ImportTileSetCallback} callback The function to execute when a tile set import is requested.
     */
    onImportTileSet(callback) {
        this.#importTileSetCallbacks.push(callback);
    }

}
