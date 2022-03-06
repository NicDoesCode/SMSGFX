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

export default class UI {

    init() {

        document.getElementById('btnPaletteInput').onclick = () => {
            Handlers.handleLoadPalette(UI.getPaletteSystem(), UI.getPaletteValue());
        }

        document.getElementById('btnTileInput').onclick = () => {
            Handlers.handleLoadTiles(UI.getTileInput());
        }

    }

    static createPaletteButtons() {

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
                button.style.backgroundColor = palette.colours[i].hex;
            } else {
                button.style.backgroundColor = null;
            }
        }
    }

}
