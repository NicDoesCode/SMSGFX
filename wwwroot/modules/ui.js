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
/** @type {HTMLLinkElement} */
const btnAddPalette = document.getElementById('btnAddPalette');
/** @type {HTMLLinkElement} */
const btnRemovePalette = document.getElementById('btnRemovePalette');
/** @type {HTMLButtonElement[]} */
const paletteButtons = [];
/** @type {HTMLTableRowElement[]} */
const paletteRows = [];

/** @type {HTMLLinkElement} */
const btnAddTileSet = document.getElementById('btnAddTileSet');
/** @type {HTMLSelectElement} */
const tbTileSetZoom = document.getElementById('tbTileSetZoom');

/** @type {HTMLCanvasElement} */
const tbCanvas = document.getElementById('tbCanvas');

export default class UI {

    /** @type {ImportPaletteCallback[]} */
    #importPaletteCallbacks;
    /** @type {ImportTileSetCallback[]} */
    #importTileSetCallbacks;
    /** @type {PaletteChangeCallback[]} */
    #onPaletteChangeCallbacks;
    /** @type {RemovePaletteCallback[]} */
    #onRemovePaletteCallbacks;
    /** @type {PaletteColourSelectCallback[]} */
    #onPaletteColourSelectCallbacks;
    /** @type {SelectedToolChangedCallback[]} */
    #onSelectedToolChangedCallbacks;
    /** @type {ZoomChangedCallback[]} */
    #onZoomChangedCallbacks;

    /** @type {CanvasMouseMoveCallback[]} */
    #canvasMouseMoveCallbacks;
    /** @type {CanvasMouseDownCallback[]} */
    #canvasMouseDownCallbacks;
    /** @type {boolean} */
    #canvasMouseIsDown;

    /** @type {number} */
    #lastSelectedPaletteIndex;
    /** @type {number} */
    #selectedPaletteColourIndex;

    #lastZoom = parseInt(tbTileSetZoom.value);

    constructor() {
        this.#importPaletteCallbacks = [];
        this.#importTileSetCallbacks = [];
        this.#onPaletteChangeCallbacks = [];
        this.#onRemovePaletteCallbacks = [];
        this.#onPaletteColourSelectCallbacks = [];
        this.#onSelectedToolChangedCallbacks = [];
        this.#onZoomChangedCallbacks = [];

        this.#canvasMouseMoveCallbacks = [];
        this.#canvasMouseDownCallbacks = [];
        this.#canvasMouseIsDown = false;

        this.#lastSelectedPaletteIndex = -1;
        this.#selectedPaletteColourIndex = -1;
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
        tbCanvas.onmousedown = (event) => {
            this.#canvasMouseIsDown = true;
            this.#canvasMouseDownCallbacks.forEach(callback => {
                callback({ canvas: tbCanvas, mouseEvent: event });
            });
        };
        tbCanvas.onmouseup = (event) => {
            this.#canvasMouseIsDown = false;
        };
        tbCanvas.onmouseleave = (event) => {
            this.#canvasMouseIsDown = false;
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

        tbTileSetZoom.onchange = () => {
            const newZoom = parseInt(tbTileSetZoom.value);
            if (newZoom !== this.#lastZoom) {
                this.#lastZoom = newZoom;
                this.#onZoomChangedCallbacks.forEach(callback => {
                    callback({ zoom: newZoom });
                });
            }
        };

        btnAddPalette.onclick = () => {
            this.showPaletteInputModal();
        }

        btnRemovePalette.onclick = () => {
            this.#onRemovePaletteCallbacks.forEach(callback => {
                callback({ index: ui.selectedPaletteIndex });
            });
        };

        btnAddTileSet.onclick = () => {
            this.showTileInputModal();
        };

        const toolButtons = document.querySelectorAll('button[data-tool-button]');
        toolButtons.forEach(toolButton => {
            toolButton.onclick = () => {
                this.#onSelectedToolChangedCallbacks.forEach(callback => {
                    callback({ tool: toolButton.getAttribute('data-tool-button') });
                });
            };
        });

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
            button.onclick = () => {
                this.#onPaletteColourSelectCallbacks.forEach(callback => {
                    callback({ index: i });
                });
            };
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

    get selectedPaletteColourIndex() {
        return this.#selectedPaletteColourIndex;
    }
    set selectedPaletteColourIndex(value) {
        if (value < -1 || value >= 16) {
            throw new Error('Invalid palette index.');
        }
        this.#selectedPaletteColourIndex = value;

        // Highlight the row
        paletteRows.forEach((row, index) => {
            if (index === value) {
                if (!row.classList.contains('table-dark')) {
                    row.classList.add('table-dark');
                }
            } else {
                row.classList.remove('table-dark');
            }
        });
    }

    /**
     * Gets whether the mouse is down on the canvas.
     */
    get canvasMouseIsDown() {
        return this.#canvasMouseIsDown;
    }

    /**
     * Gets the canvas for drawing the image.
     */
    get canvas() {
        return tbCanvas;
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
     * User selects a palette colour.
     * @param {PaletteColourSelectCallback} callback The function to execute.
     */
    onPaletteColourSelect(callback) {
        this.#onPaletteColourSelectCallbacks.push(callback);
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
     * Mouse is down on the canvas.
     * @param {CanvasMouseDownCallback} callback The function to execute the mouse is moved.
     */
    onCanvasMouseDown(callback) {
        this.#canvasMouseDownCallbacks.push(callback);
    }

    /**
     * When the selected palette is changed.
     * @param {PaletteChangeCallback} callback The function to execute when the palette is changed.
     */
    onPaletteChange(callback) {
        this.#onPaletteChangeCallbacks.push(callback);
    }

    /**
     * When the selected palette is removed.
     * @param {RemovePaletteCallback} callback The function to execute when the palette is removed.
     */
    onRemovePalette(callback) {
        this.#onRemovePaletteCallbacks.push(callback);
    }

    /**
     * When the selected tool is changed.
     * @param {SelectedToolChangedCallback} callback The function to execute.
     */
    onSelectedToolChanged(callback) {
        this.#onSelectedToolChangedCallbacks.push(callback);
    }

    /**
     * When the zoom is changed.
     * @param {ZoomChangedCallback} callback The function to execute.
     */
     onZoomChanged(callback) {
        this.#onZoomChangedCallbacks.push(callback);
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

    /**
     * Highlights selected tool.
     * @param {string} toolName Tool to highlight.
     */
    highlightTool(toolName) {
        const buttons = document.querySelectorAll('button[data-tool-button]');
        buttons.forEach(button => {
            if (button.getAttribute('data-tool-button') === toolName) {
                button.classList.remove('btn-outline-secondary');
                if (!button.classList.contains('btn-secondary')) {
                    button.classList.add('btn-secondary');
                }
            } else {
                button.classList.remove('btn-secondary');
                if (!button.classList.contains('btn-outline-secondary')) {
                    button.classList.add('btn-outline-secondary');
                }
            }
        });
    }
}



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

/**
 * Callback for when the mouse moves on the canvas.
 * @callback CanvasMouseMoveCallback
 * @param {CanvasMouseEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * Callback for when the mouse is clicked on the canvas.
 * @callback CanvasMouseDownCallback
 * @param {CanvasMouseEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef CanvasMouseEventData
 * @type {object}
 * @property {HTMLCanvasElement} canvas - The canvas that the event originated from.
 * @property {MouseEvent} mouseEvent - Mouse event data.
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

/**
 * Callback for when an remove palette is requested.
 * @callback RemovePaletteCallback
 * @param {RemovePaletteEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef RemovePaletteEventData
 * @type {object}
 * @property {number} index - Palette index.
 * @exports 
 */

/**
 * Callback for when palette colour change is requested.
 * @callback PaletteColourSelectCallback
 * @param {PaletteColourSelectEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef PaletteColourSelectEventData
 * @type {object}
 * @property {number} index - Palette colour index.
 * @exports 
 */

/**
 * Callback for when selected tool is changed.
 * @callback SelectedToolChangedCallback
 * @param {SelectedToolChangedEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef SelectedToolChangedEventData
 * @type {object}
 * @property {string} tool - Selected tool.
 * @exports 
 */

/**
 * Callback for when selected tool is changed.
 * @callback ZoomChangedCallback
 * @param {ZoomChangedEventData} eventData - Passes parameters.
 * @exports
 */
/**
 * @typedef ZoomChangedEventData
 * @type {object}
 * @property {number} zoom - Zoom level.
 * @exports 
 */
