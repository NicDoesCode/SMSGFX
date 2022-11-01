import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteList from "../models/paletteList.js";
import PaletteEditorContextMenu from "./paletteEditorContextMenu.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    paletteTitle: 'paletteTitle',
    paletteSelect: 'paletteSelect',
    paletteNew: 'paletteNew',
    paletteCodeImport: 'paletteCodeImport',
    paletteDelete: 'paletteDelete',
    paletteClone: 'paletteClone',
    paletteSystem: 'paletteSystem',
    displayNativeColours: 'displayNativeColours',
    colourIndexChange: 'colourIndexChange',
    colourIndexEdit: 'colourIndexEdit',
    colourIndexSwap: 'colourIndexSwap',
    colourIndexReplace: 'colourIndexReplace'
}

export default class PaletteEditor {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement[]} */
    #paletteButtons = [];
    /** @type {HTMLTableCellElement[]} */
    #paletteCells = [];
    /** @type {number} */
    #currentColourIndex = 0;
    /** @type {PaletteEditorContextMenu} */
    #contextMenu;
    /** @type {EventDispatcher} */
    #dispatcher;
    #enabled = true;


    /**
     * 
     * @param {HTMLElement} element Element that the toolbox is to be initialised from.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#element.querySelectorAll('button[data-command]').forEach(element => {
            element.onclick = () => {
                const command = element.getAttribute('data-command');
                const args = this.#createEventArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        this.#element.querySelectorAll(`input[type=text][data-command=${commands.paletteTitle}]`).forEach(element => {
            element.onchange = () => {
                const command = element.getAttribute('data-command');
                const args = this.#createEventArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        this.#element.querySelectorAll(`select[data-command]`).forEach(element => {
            element.onchange = () => {
                const command = element.getAttribute('data-command');
                const args = this.#createEventArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        this.#element.querySelectorAll(`[data-linked-command=${commands.paletteSystem}]`).forEach(element => {
            element.onclick = () => {
                const system = element.getAttribute('data-value');
                this.#element.querySelectorAll(`[data-command=${commands.paletteSystem}]`).forEach(systemElement => {
                    systemElement.value = system;
                    systemElement.onchange();
                });
            }
        });

        this.#element.querySelectorAll('input[type=checkbox][data-command]').forEach(element => {
            element.onchange = () => {
                const command = element.getAttribute('data-command');
                const args = this.#createEventArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

        this.#createPaletteColourIndexButtons();

        this.#contextMenu = new PaletteEditorContextMenu(element.querySelector('[data-smsgfx-component-id=palette-editor-context-menu]'));
        this.#contextMenu.addHandlerOnCommand((args) => this.#handlePaletteEditorContextMenuOnCommand(args));
    }


    /**
     * Sets the state of the object.
     * @param {PaletteEditorState} state - State to set.
     */
    setState(state) {
        /** @type {PaletteList} */
        let paletteList;
        let updateVirtualList = false;
        if (state?.paletteList && typeof state?.paletteList.getPalettes === 'function') {
            paletteList = state.paletteList;
            this.#refreshPaletteSelectList(state.paletteList);
            updateVirtualList = true;
        }
        if (typeof state?.selectedPaletteIndex === 'number') {
            this.#element.querySelectorAll(`[data-command=${commands.paletteSelect}]`).forEach(element => {
                element.selectedIndex = state.selectedPaletteIndex;
                updateVirtualList = true;
            });
        }
        if (typeof state?.displayNative === 'boolean') {
            this.#element.querySelectorAll(`[data-command=${commands.displayNativeColours}]`).forEach(element => {
                element.checked = state.displayNative;
            });
        }
        if (paletteList) {
            const select = this.#element.querySelector(`[data-command=${commands.paletteSelect}]`);
            if (select) {
                const selectedPalette = paletteList.getPalette(select.selectedIndex);
                this.#setPalette(selectedPalette);
            }
        }
        if (typeof state?.selectedColourIndex === 'number' && state?.selectedColourIndex >= 0 && state?.selectedColourIndex < 16) {
            this.#currentColourIndex = state.selectedColourIndex;
            this.#selectPaletteColour(state.selectedColourIndex);
        }
        if (typeof state?.highlightedColourIndex === 'number' && state?.highlightedColourIndex >= 0 && state?.highlightedColourIndex < 16) {
            this.#highlightPaletteColour(state.highlightedColourIndex);
        }
        if (typeof state?.title === 'string') {
            this.#element.querySelectorAll(`[data-command=${commands.paletteTitle}]`).forEach(element => {
                element.value = state.title;
            });
        }
        if (typeof state?.selectedSystem === 'string') {
            this.#element.querySelectorAll(`[data-command=${commands.paletteSystem}]`).forEach(element => {
                element.value = state.selectedSystem;
            });
            this.#updateSystemSelectVirtualList(state.selectedSystem);
        }
        // Refresh the virtual list if needed
        if (updateVirtualList) {
            this.#updatePaletteSelectVirtualList();
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
            this.#element.querySelectorAll('[data-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
            this.#paletteButtons.forEach(button => {
                button.disabled = !this.#enabled;
            });
            this.#element.querySelectorAll('[data-linked-command]').forEach(element => {
                element.disabled = !this.#enabled;
            });
            this.#element.querySelectorAll('button[data-bs-toggle=dropdown]').forEach(element => {
                element.disabled = !this.#enabled;
            });
        }
    }


    /**
     * Registers a handler for a command.
     * @param {PaletteEditorCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command 
     * @returns {PaletteEditorCommandEventArgs} 
     * */
    #createEventArgs(command) {
        return {
            command: command,
            paletteIndex: this.#element.querySelector(`select[data-command=${commands.paletteSelect}]`)?.selectedIndex ?? -1,
            paletteTitle: this.#element.querySelector(`input[type=text][data-command=${commands.paletteTitle}]`)?.value ?? null,
            paletteSystem: this.#element.querySelector(`select[data-command=${commands.paletteSystem}]`)?.value ?? null,
            displayNative: this.#element.querySelector(`[data-command=${commands.displayNativeColours}]`)?.checked ?? null,
            colourIndex: -1,
            targetColourIndex: -1
        };
    }


    #getElement(command) {
        return this.#element.querySelector(`[data-command=${command}]`);
    }

    #getElements(command) {
        return this.#element.querySelectorAll(`[data-command=${command}]`);
    }


    /**
     * When a command is received from the context menu.
     * @param {import("./paletteEditorContextMenu.js").PaletteEditorContextMenuCommandEventArgs} args - Arguments.
     */
    #handlePaletteEditorContextMenuOnCommand(args) {
        let a;

        switch (args.command) {

            case PaletteEditorContextMenu.Commands.swapColour:
                a = this.#createEventArgs(commands.colourIndexSwap);
                a.colourIndex = args.sourceColourIndex;
                a.targetColourIndex = args.targetColourIndex;
                this.#dispatcher.dispatch(EVENT_OnCommand, a);
                this.#contextMenu.setState({ visible: false });
                break;

            case PaletteEditorContextMenu.Commands.replaceColour:
                a = this.#createEventArgs(commands.colourIndexReplace);
                a.colourIndex = args.sourceColourIndex;
                a.targetColourIndex = args.targetColourIndex;
                this.#dispatcher.dispatch(EVENT_OnCommand, a);
                this.#contextMenu.setState({ visible: false });
                break;

        }
    }


    /**
     * Refreshes the list of palettes.
     * @param {PaletteList} paletteList - List of palettes.
     */
    #refreshPaletteSelectList(paletteList) {
        const select = this.#element.querySelector(`select[data-command=${commands.paletteSelect}]`);
        if (select) {
            const lastSelectedIndex = select.selectedIndex;
            const optionCount = select.options.length;
            for (let i = 0; i < optionCount; i++) {
                select.options.remove(0);
            }
            const palettes = paletteList.getPalettes();
            for (let i = 0; i < palettes.length; i++) {
                const option = document.createElement('option');
                option.innerText = `#${i} | ${palettes[i].title}`;
                option.value = i.toString();
                option.selected = lastSelectedIndex === i;
                select.options.add(option);
            }
            if (select.selectedIndex === -1) {
                select.selectedIndex = 0;
            }
            this.#updatePaletteSelectVirtualList();
        }
    }

    /**
     * Updates the fake dropdown list to mirror the real one.
     */
    #updatePaletteSelectVirtualList() {
        const virtualList = this.#element.querySelector(`[data-linked-command=${commands.paletteSelect}]`);
        const select = this.#element.querySelector(`select[data-command=${commands.paletteSelect}]`);
        if (virtualList && select) {
            while (virtualList.childNodes.length > 0) {
                virtualList.childNodes.item(0).remove();
            }
            select.querySelectorAll('option').forEach((option, index) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.classList.add('dropdown-item');
                if (index === select.selectedIndex) {
                    a.classList.add('active');
                } else {
                    a.onclick = () => {
                        select.selectedIndex = index;
                        select.onchange();
                    };
                }
                a.innerHTML = option.innerHTML;
                li.appendChild(a);
                virtualList.appendChild(li);
            });
        }
    }

    /**
     * Updates the Master System and Game Gear palette select buttons to refelect the drop down.
     * @param {string} system - System to select.
     */
    #updateSystemSelectVirtualList(system) {
        const buttons = this.#element.querySelectorAll(`[data-linked-command=${commands.paletteSystem}]`);
        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-value') === system) {
                button.classList.add('active');
            }
        });
    }

    /**
     * Displays a given palette to the screen.
     * @param {Palette} palette The palette to show on the buttons.
     */
    #setPalette(palette) {
        const paletteButtons = this.#paletteButtons;
        for (let i = 0; i < 16; i++) {
            if (i < palette.getColours().length) {
                const displayNative = this.#getElement(commands.displayNativeColours)?.checked ?? false;
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
        this.#getElements(commands.paletteTitle).forEach(element => element.value = palette.title);
        this.#getElements(commands.paletteSystem).forEach(element => element.value = palette.system);
        this.#updateSystemSelectVirtualList(palette.system);
    }

    #createPaletteColourIndexButtons() {

        /** @type {HTMLTableElement} */
        const table = this.#element.querySelector('#tbPalette');
        /** @type {HTMLTableSectionElement} */
        const tbody = table.querySelector('tbody');

        let tr, td;
        for (let idx = 0; idx < 16; idx++) {

            if (idx % 4 === 0) {
                tr = document.createElement('tr');
                tbody.appendChild(tr);
            }

            // Colour button
            td = document.createElement('td');
            td.setAttribute('data-colour-index', idx.toString());
            td.classList.add('text-center');
            tr.appendChild(td);

            const btnColour = document.createElement('button');
            btnColour.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'position-relative', 'sms-palette-button');
            btnColour.setAttribute('data-colour-index', idx.toString());
            btnColour.onclick = () => {
                const colourCurrentlySelected = this.#currentColourIndex === idx;
                const args = this.#createEventArgs(colourCurrentlySelected ? commands.colourIndexEdit : commands.colourIndexChange);
                args.colourIndex = idx;
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
            btnColour.oncontextmenu = (event) => {
                this.#contextMenu.setState({
                    colourIndex: idx, visible: true,
                    position: { x: event.clientX, y: event.clientY }
                });
                return false;
            };
            td.appendChild(btnColour);

            const lblContent = document.createElement('span');
            lblContent.classList.add('position-absolute', 'translate-middle', 'badge');
            lblContent.innerHTML = `#${idx}`;
            btnColour.appendChild(lblContent);

            this.#paletteCells.push(td);
            this.#paletteButtons.push(btnColour);
        }

    }

    /**
     * @param {number} colourIndex
     */
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

    /**
     * @param {number} colourIndex
     */
    #highlightPaletteColour(colourIndex) {
        const paletteCells = this.#paletteCells;
        paletteCells.forEach((cell, index) => {
            if (index === colourIndex) {
                if (!cell.classList.contains('table-secondary')) {
                    cell.classList.add('sms-highlight');
                }
            } else {
                cell.classList.remove('sms-highlight');
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
 * @property {boolean?} enabled - Is the control enabled or disabled?
 */

/**
 * When a command is issued from the palette editor.
 * @callback PaletteEditorCommandCallback
 * @param {PaletteEditorCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} PaletteEditorCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {number?} paletteIndex - Index of the selected palette.
 * @property {string?} paletteTitle - Title value for the selected palette.
 * @property {string?} paletteSystem - Selected system value for the selected palette, either 'ms' or 'gg'.
 * @property {number?} colourIndex - Index from 0 to 15 for the given colour.
 * @property {number?} targetColourIndex - Target palette colour index from 0 to 15.
 * @property {boolean?} displayNative - Display native colours for system?
 * @exports
 */
