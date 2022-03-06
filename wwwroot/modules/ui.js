import DataStore from "./dataStore.js";
import Handlers from "./handlers.js";
import Palette from "./palette.js";

/** @type {HTMLSelectElement} */
const tbPaletteInputSystem = document.getElementById('tbPaletteInputSystem');
/** @type {HTMLTextAreaElement} */
const tbPaletteInput = document.getElementById('tbPaletteInput');
/** @type {HTMLButtonElement} */
const btnPaletteInput = document.getElementById('btnPaletteInput');
/** @type {HTMLDivElement} */
const paletteModal = document.getElementById('smsgfx-palette-modal');

/** @type {HTMLTextAreaElement} */
const tbLoadTiles = document.getElementById('tbLoadTiles');
/** @type {HTMLButtonElement} */
const btnTileInput = document.getElementById('btnTileInput');
/** @type {HTMLDivElement} */
const tileModal = document.getElementById('smsgfx-tiles-modal');

/** @type {HTMLSelectElement} */
const tbPaletteSelect = document.getElementById('tbPaletteSelect');
/** @type {HTMLButtonElement[]} */
const paletteButtons = [];
/** @type {HTMLTableRowElement[]} */
const paletteRows = [];

/** @type {HTMLCanvasElement} */
const tbCanvas = document.getElementById('tbCanvas');
const canvasContext = tbCanvas.getContext('2d');

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
 * @exportsdocument.getElementById('btnPaletteInput')
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

/**
 * Callback for when an import of tile set is requested.
 * @callback CanvasMouseMoveCallback
 * @param {CanvasMouseMoveEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef CanvasMouseMoveEventData
 * @type {object}
 * @property {HTMLCanvasElement} canvas - The canvas that the event originated from.
 * @property {MouseEvent} mouseEvent - Mouse move event data.
 * @exports 
 */

/**
 * Callback for when an import of tile set is requested.
 * @callback PaletteChangeCallback
 * @param {PaletteChangeEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef PaletteChangeEventData
 * @type {object}
 * @property {number} newIndex - New palette index.
 * @property {number} oldIndex - Previous palette index.
 * @exports 
 */

export default class UI {

    /** @type {ImportPaletteCallback[]} */
    #importPaletteCallbacks;
    /** @type {ImportTileSetCallback[]} */
    #importTileSetCallbacks;
    /** @type {CanvasMouseMoveCallback[]} */
    #canvasMouseMoveCallbacks;
    /** @type {PaletteChangeCallback[]} */
    #onPaletteChangeCallbacks;

    /** @type {number} */
    #lastSelectedPaletteIndex;

    constructor() {
        this.#importPaletteCallbacks = [];
        this.#importTileSetCallbacks = [];
        this.#canvasMouseMoveCallbacks = [];
        this.#onPaletteChangeCallbacks = [];
        this.#lastSelectedPaletteIndex = -1;
    }

    init() {

        this.createPaletteButtons();

        const ui = this;

        btnPaletteInput.onclick = () => {
            const value = this.paletteInput;
            const system = this.paletteInputSystem;
            this.#importPaletteCallbacks.forEach(callback => {
                callback({ value, system });
            });
        }

        btnTileInput.onclick = () => {
            const value = this.tileInput;
            this.#importTileSetCallbacks.forEach(callback => {
                callback({ value });
            });
        }

        tbCanvas.onmousemove = (event) => {
            this.#canvasMouseMoveCallbacks.forEach(callback => {
                callback({ canvas: tbCanvas, mouseEvent: event });
            });
        };

        tbPaletteSelect.onchange = () => {
            this.#onPaletteChangeCallbacks.forEach(callback => {
                callback({
                    newIndex: ui.selectedPaletteIndex,
                    oldIndex: ui.#lastSelectedPaletteIndex
                });
            });
            ui.#lastSelectedPaletteIndex = ui.selectedPaletteIndex;
        };

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

    /**
     * Mouse moved on the canvas.
     * @param {CanvasMouseMoveCallback} callback The function to execute the mouse is moved.
     */
    onCanvasMouseMove(callback) {
        this.#canvasMouseMoveCallbacks.push(callback);
    }

    /**
     * When the selected palette is changed.
     * @param {PaletteChangeCallback} callback The function to execute when the palette is changed.
     */
    onPaletteChange(callback) {
        this.#onPaletteChangeCallbacks.push(callback);
    }

    /**
     * Draws the given canvas image to the display.
     * @param {Image} image Canvas image.
     */
    drawCanvasImage(image) {
        if (image.width !== 0 && image.height !== 0) {
            tbCanvas.width = Math.max(image.width, 100);
            tbCanvas.height = Math.max(image.height, 100);
            canvasContext.moveTo(0, 0);
            canvasContext.drawImage(image, 0, 0);
        }
    }

    /**
     * Highlights a palette item on the UI.
     * @param {number} paletteIndex Palette colour index.
     */
    highlightPaletteItem(paletteIndex) {
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

    /**
     * Populates the list of palettes.
     * @param {Palette[]} palettes Displays palettes in the selector list.
     */
    populatePaletteSelector(palettes) {
        let lastSelectedIndex = this.selectedPaletteIndex;
        let optionCount = tbPaletteSelect.options.length;
        for (let i = 0; i < optionCount; i++) {
            tbPaletteSelect.options.remove(0);
        }
        for (let i = 0; i < palettes.length; i++) {
            const system = palettes[i].system === "gg" ? "Game Gear" : "Master System";
            const option = document.createElement('option');
            option.innerText = `#${i} - ${system}`;
            option.value = i.toString();
            option.selected = lastSelectedIndex === i;
            tbPaletteSelect.options.add(option);
        }
        if (this.selectedPaletteIndex === -1) {
            this.selectedPaletteIndex = 0;
        }
    }
}
