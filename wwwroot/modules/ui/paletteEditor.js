import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteList from "../models/paletteList.js";

const EVENT_NewPalette = 'EVENT_NewPalette';
const EVENT_ImportPaletteFromCode = 'EVENT_ImportPaletteFromCode';
const EVENT_PaletteDelete = 'EVENT_PaletteDelete';
const EVENT_PaletteChanged = 'EVENT_PaletteChanged';
const EVENT_PaletteSystemChanged = 'EVENT_PaletteSystemChanged';
const EVENT_RequestColourIndexChange = 'EVENT_RequestColourIndexChange';
const EVENT_RequestColourIndexEdit = 'EVENT_RequestColourIndexEdit';
const EVENT_RequestTitleChange = 'EVENT_RequestTitleChange';
const EVENT_RequestDisplayNativeChange = 'EVENT_RequestDisplayNativeChange';

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
    /** @type {HTMLUListElement} */
    #tbPaletteSelectDropDown;
    /** @type {HTMLInputElement} */
    #tbPaletteTitle;
    /** @type {HTMLSelectElement} */
    #tbPaletteSystemSelect;
    /** @type {HTMLInputElement} */
    #tbPaletteEditorDisplayNative;
    /** @type {HTMLButtonElement} */
    #btnPaletteTargetMasterSystem;
    /** @type {HTMLButtonElement} */
    #btnPaletteTargetGameGear;
    /** @type {number} */
    #currentColourIndex = 0;
    /** @type {EventDispatcher} */
    #dispatcher;


    /**
     * 
     * @param {HTMLElement} element Element that the toolbox is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();
        this.#createPaletteColourIndexButtons();

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

        this.#tbPaletteSelectDropDown = this.#element.querySelector('#tbPaletteSelectDropDown');

        this.#tbPaletteTitle = this.#element.querySelector('#tbPaletteTitle');
        this.#tbPaletteTitle.onchange = () => {
            /** @type {PaletteEditorTitleEventArgs} */
            const args = { title: this.#tbPaletteTitle.value };
            this.#dispatcher.dispatch(EVENT_RequestTitleChange, args);
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

        this.#btnPaletteTargetMasterSystem = this.#element.querySelector('#btnPaletteTargetMasterSystem');
        this.#btnPaletteTargetMasterSystem.onclick = () => {
            this.#tbPaletteSystemSelect.value = 'ms';
            this.#tbPaletteSystemSelect.onchange();
        }

        this.#btnPaletteTargetGameGear = this.#element.querySelector('#btnPaletteTargetGameGear');
        this.#btnPaletteTargetGameGear.onclick = () => {
            this.#tbPaletteSystemSelect.value = 'gg';
            this.#tbPaletteSystemSelect.onchange();
        }

        this.#tbPaletteEditorDisplayNative = this.#element.querySelector('#tbPaletteEditorDisplayNative');
        this.#tbPaletteEditorDisplayNative.onchange = () => {
            /** @type {PaletteEditorDisplayNativeEventArgs} */
            const args = {
                displayNativeEnabled: this.#tbPaletteEditorDisplayNative.checked
            };
            this.#dispatcher.dispatch(EVENT_RequestDisplayNativeChange, args);
        };
    }

    /**
     * Sets the state of the object.
     * @param {PaletteEditorState} state - State to set.
     */
    setState(state) {
        if (state) {
            /** @type {PaletteList} */
            let paletteList;
            let updateVirtualList = false;
            if (state.paletteList && typeof state.paletteList.getPalettes === 'function') {
                paletteList = state.paletteList;
                this.#refreshPaletteSelectList(state.paletteList);
                updateVirtualList = true;
            }
            if (typeof state.selectedPaletteIndex === 'number') {
                this.#tbPaletteSelect.selectedIndex = state.selectedPaletteIndex;
                updateVirtualList = true;
            }
            if (typeof state.displayNative === 'boolean') {
                this.#tbPaletteEditorDisplayNative.checked = state.displayNative;
            }
            if (paletteList) {
                const selectedPalette = paletteList.getPalette(this.#tbPaletteSelect.selectedIndex);
                this.#setPalette(selectedPalette);
            }
            if (typeof state.selectedColourIndex === 'number' && state.selectedColourIndex >= 0 && state.selectedColourIndex < 16) {
                this.#currentColourIndex = state.selectedColourIndex;
                this.#selectPaletteColour(state.selectedColourIndex);
            }
            if (typeof state.highlightedColourIndex === 'number' && state.highlightedColourIndex >= 0 && state.highlightedColourIndex < 16) {
                this.#highlightPaletteColour(state.highlightedColourIndex);
            }
            if (typeof state.title === 'string') {
                this.#tbPaletteTitle.value = state.title;
            }
            if (typeof state.selectedSystem === 'string') {
                this.#tbPaletteSystemSelect.value = state.selectedSystem;
                this.#updateSystemSelectVirtualList(state.selectedSystem);
            }
            // Refresh the virtual list if needed
            if (updateVirtualList) {
                this.#updatePaletteSelectVirtualList();
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
     * User changes the palette title.
     * @param {PaletteEditorTitleCallback} callback - Callback function.
     */
    addHandlerRequestTitleChange(callback) {
        this.#dispatcher.on(EVENT_RequestTitleChange, callback);
    }

    /**
     * User changes the selected system.
     * @param {PaletteEditorSystemChangedCallback} callback - Callback function.
     */
    addHandlerRequestSystemChange(callback) {
        this.#dispatcher.on(EVENT_PaletteSystemChanged, callback);
    }

    /**
     * User changes the display native option.
     * @param {PaletteEditorDisplayNativeCallback} callback - Callback function.
     */
    addHandlerRequestNativeChange(callback) {
        this.#dispatcher.on(EVENT_RequestDisplayNativeChange, callback);
    }

    /**
     * Request to change the selected colour index within the palette.
     * @param {PaletteEditorColourIndexCallback} callback - Callback function.
     */
    addHandlerRequestColourIndexChange(callback) {
        this.#dispatcher.on(EVENT_RequestColourIndexChange, callback);
    }

    /**
     * Request to edit a colour index with in the palette.
     * @param {PaletteEditorColourIndexCallback} callback - Callback function.
     */
    addHandlerRequestColourIndexEdit(callback) {
        this.#dispatcher.on(EVENT_RequestColourIndexEdit, callback);
    }


    /**
     * Handles colour click event, when the colour is not already selected we will select it
     * otherwise we will edit it.
     * @param {number} colourIndex Index of the colour that was clicked.
     */
    #handlePaletteColourButtonClicked(colourIndex) {
        /** @type {PaletteEditorColourIndexEventArgs} */
        const args = {
            paletteIndex: this.#tbPaletteSelect.selectedIndex,
            colourIndex: colourIndex
        }
        if (this.#currentColourIndex !== colourIndex) {
            this.#currentColourIndex = colourIndex;
            this.#dispatcher.dispatch(EVENT_RequestColourIndexChange, args);
        } else {
            this.#dispatcher.dispatch(EVENT_RequestColourIndexEdit, args);
        }
    }


    /**
     * Refreshes the list of palettes.
     * @param {PaletteList} paletteList - List of palettes.
     */
    #refreshPaletteSelectList(paletteList) {
        const lastSelectedIndex = this.#tbPaletteSelect.selectedIndex;
        const optionCount = this.#tbPaletteSelect.options.length;
        for (let i = 0; i < optionCount; i++) {
            this.#tbPaletteSelect.options.remove(0);
        }
        const palettes = paletteList.getPalettes();
        for (let i = 0; i < palettes.length; i++) {
            const option = document.createElement('option');
            option.innerText = `#${i} | ${palettes[i].title}`;
            option.value = i.toString();
            option.selected = lastSelectedIndex === i;
            this.#tbPaletteSelect.options.add(option);
        }
        if (this.#tbPaletteSelect.selectedIndex === -1) {
            this.#tbPaletteSelect.selectedIndex = 0;
        }
        this.#updatePaletteSelectVirtualList();
    }

    /**
     * Updates the fake dropdown list to mirror the real one.
     */
    #updatePaletteSelectVirtualList() {
        while (this.#tbPaletteSelectDropDown.childNodes.length > 0) {
            this.#tbPaletteSelectDropDown.childNodes.item(0).remove();
        }
        this.#tbPaletteSelect.querySelectorAll('option').forEach((option, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.classList.add('dropdown-item');
            if (index === this.#tbPaletteSelect.selectedIndex) {
                a.classList.add('active');
            } else {
                a.onclick = () => {
                    this.#tbPaletteSelect.selectedIndex = index;
                    this.#tbPaletteSelect.onchange();
                };
            }
            a.innerHTML = option.innerHTML;
            li.appendChild(a);
            this.#tbPaletteSelectDropDown.appendChild(li);
        });
    }

    /**
     * Updates the Master System and Game Gear palette select buttons to refelect the drop down.
     * @param {string} system - System to select.
     */
    #updateSystemSelectVirtualList(system) {
        this.#btnPaletteTargetMasterSystem.classList.remove('active');
        this.#btnPaletteTargetGameGear.classList.remove('active');
        if (system === 'ms') {
            this.#btnPaletteTargetMasterSystem.classList.add('active');

        } else if (system === 'gg') {
            this.#btnPaletteTargetGameGear.classList.add('active');
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
                const displayNative = this.#tbPaletteEditorDisplayNative.checked;
                const c = palette.getColour(i);
                if (displayNative) {
                    paletteButtons[i].style.backgroundColor = ColourUtil.toNativeHex(palette.system, c.r, c.g, c.b);
                } else {
                    paletteButtons[i].style.backgroundColor = ColourUtil.toHex(c.r, c.g, c.b);
                }
            } else {
                paletteButtons[i].style.backgroundColor = null;
            }
        }
        this.#tbPaletteTitle.value = palette.title;
        this.#tbPaletteSystemSelect.value = palette.system;
        this.#updateSystemSelectVirtualList(palette.system);
    }

    #createPaletteColourIndexButtons() {

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
            btnColour.onclick = () => this.#handlePaletteColourButtonClicked(i);
            td.appendChild(btnColour);

            const lblContent = document.createElement('span');
            lblContent.classList.add('position-absolute', 'translate-middle', 'badge');
            lblContent.innerHTML = `#${i}`;
            btnColour.appendChild(lblContent);

            this.#paletteCells.push(td);
            this.#paletteButtons.push(btnColour);
        }

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
                    cell.classList.add('sms-highlight');
                }
            } else {
                cell.classList.remove('sms-highlight');
            }
        });
    }

    #selectPaletteColour(colourIndex) {
        this.#paletteCells.forEach((cell, index) => {
            if (index !== null && index === colourIndex) {
                if (!cell.classList.contains('table-dark')) {
                    cell.classList.add('sms-selected');
                }
            } else {
                cell.classList.remove('sms-selected');
            }
        });
    }


}


/**
 * Palette editor state.
 * @typedef {object} PaletteEditorState
 * @property {PaletteList?} paletteList - Current list of palettes.
 * @property {string?} title - Title of the palette.
 * @property {string?} selectedSystem - Sets the selected system, either 'ms' or 'gg'.
 * @property {number?} selectedPaletteIndex - Sets the selected palette index.
 * @property {number?} selectedColourIndex - Sets the selected colour index.
 * @property {number?} highlightedColourIndex - Sets the selected colour index.
 * @property {boolean?} displayNative - Should the palette editor display native colours?
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

/**
 * Event callback with new palette title.
 * @callback PaletteEditorTitleCallback
 * @param {PaletteEditorTitleEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorTitleEventArgs
 * @type {object}
 * @property {number} title - Palette title.
 * @exports 
 */

/**
 * Event callback with new display native setting.
 * @callback PaletteEditorDisplayNativeCallback
 * @param {PaletteEditorDisplayNativeEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef PaletteEditorDisplayNativeEventArgs
 * @type {object}
 * @property {boolean} displayNativeEnabled - Whether to display native colours or not.
 * @exports 
 */
