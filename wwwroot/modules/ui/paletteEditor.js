import ComponentBase from "./componentBase.js";
import UiPaletteListing from "./components/paletteListing.js";
import Palette from "../models/palette.js";
import ColourUtil from "../util/colourUtil.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteList from "../models/paletteList.js";
import PaletteEditorContextMenu from "./paletteEditorContextMenu.js";
import TemplateUtil from "../util/templateUtil.js";
import PaletteFactory from "../factory/paletteFactory.js";
import PaletteUtil from "../util/paletteUtil.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    paletteTitle: 'paletteTitle',
    paletteSelect: 'paletteSelect',
    paletteNew: 'paletteNew',
    paletteImport: 'paletteImport',
    paletteDelete: 'paletteDelete',
    paletteClone: 'paletteClone',
    paletteSystem: 'paletteSystem',
    displayNativeColours: 'displayNativeColours',
    colourIndexChange: 'colourIndexChange',
    colourIndexEdit: 'colourIndexEdit',
    colourIndexSwap: 'colourIndexSwap',
    colourIndexReplace: 'colourIndexReplace'
}


export default class PaletteEditor extends ComponentBase {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {PaletteList?} */
    #paletteList = null;
    /** @type {string?} */
    #selectedPaletteId = null;
    /** @type {HTMLButtonElement[]} */
    #paletteButtons = [];
    /** @type {HTMLTableCellElement[]} */
    #paletteCells = [];
    /** @type {HTMLInputElement} */
    #uiPaletteTitle;
    /** @type {HTMLButtonElement} */
    #btnPaletteTitle;
    /** @type {number} */
    #currentColourIndex = 0;
    /** @type {PaletteEditorContextMenu} */
    #contextMenu;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {UiPaletteListing?} */
    #paletteListComponent = null;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#btnPaletteTitle = this.#element.querySelector('[data-smsgfx-id=editPaletteTitle]');
        this.#btnPaletteTitle.addEventListener('click', () => this.#handlePaletteTitleEditClick());

        this.#uiPaletteTitle = this.#element.querySelector('[data-smsgfx-id=paletteTitle]');
        this.#uiPaletteTitle.addEventListener('blur', () => this.#handlePaletteTitleEditBlur());

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

        // this.#createPaletteColourIndexButtons();

        PaletteEditorContextMenu.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=palette-editor-context-menu]'))
            .then((component) => {
                this.#contextMenu = component;
                this.#contextMenu.addHandlerOnCommand((args) => this.#handlePaletteEditorContextMenuOnCommand(args));
            });

        UiPaletteListing.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=palette-list]'))
            .then((component) => {
                this.#paletteListComponent = component;
                this.#paletteListComponent.addHandlerOnCommand((args) => this.#handlePaletteListOnCommand(args));
            });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<PaletteEditor>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('paletteEditor', element);
        return new PaletteEditor(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {PaletteEditorState} state - State to set.
     */
    setState(state) {
        let updateVirtualList = false;
        let paletteListDirty = false;
        let paletteChanged = false;

        if (state?.paletteList instanceof PaletteList || state.paletteList === null) {
            this.#paletteList = state.paletteList;
            this.#refreshPaletteSelectList(this.#paletteList);
            updateVirtualList = true;
            paletteListDirty = true;
        }

        // Select a palette by index or ID
        if (typeof state?.selectedPaletteIndex === 'number' || typeof state?.selectedPaletteId === 'string') {
            let index = null;
            if (this.#paletteList) {
                if (typeof state?.selectedPaletteIndex === 'number') {
                    index = state.selectedPaletteIndex;
                } else if (typeof state?.selectedPaletteId === 'string') {
                    index = this.#paletteList.indexOf(state?.selectedPaletteId);
                }

                if (index < 0 || index >= this.#paletteList.length) index = 0;

                const palette = this.#paletteList.getPalette(index);
                this.#selectedPaletteId = palette.paletteId;

                this.#element.querySelectorAll(`[data-command=${commands.paletteSelect}]`).forEach((element) => {
                    element.selectedIndex = index;
                });

                this.#setPalette(palette);
            } else {
                index = 0;
                this.#setPalette(null);
            }

            paletteChanged = true;
            updateVirtualList = true;
        }

        if (typeof state?.displayNative === 'boolean') {
            this.#element.querySelectorAll(`[data-command=${commands.displayNativeColours}]`).forEach(element => {
                element.checked = state.displayNative;
            });
        }

        if (typeof state?.selectedColourIndex === 'number' && state?.selectedColourIndex >= 0 && state?.selectedColourIndex < 16) {
            this.#currentColourIndex = state.selectedColourIndex;
            this.#selectPaletteColour(state.selectedColourIndex);
        }
        if (typeof state?.highlightedColourIndex === 'number' && state?.highlightedColourIndex >= 0 && state?.highlightedColourIndex < 16) {
            this.#highlightPaletteColour(state.highlightedColourIndex);
        } else if (state.highlightedColourIndex === null) {
            this.#highlightPaletteColour(-1);
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

        // Refresh the palette stack
        if ((paletteListDirty || paletteChanged) && this.#paletteList) {
            this.#paletteListComponent.setState({
                paletteList: this.#paletteList,
                selectedPaletteId: this.#selectedPaletteId
            });
            this.#shufflePaletteList();
            const palette = this.#paletteList.getPaletteById(this.#selectedPaletteId);
            if (palette) {
                this.#setPalette(palette);
                this.#updatePaletteColourIndexButtonColour(palette);
            }
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
            paletteIndex: this.#element.querySelector(`select[data-command=${commands.paletteSelect}]`)?.selectedIndex,
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


    #handlePaletteTitleEditClick() {
        this.#uiPaletteTitle.classList.remove('visually-hidden');
        this.#btnPaletteTitle.classList.add('visually-hidden');
        this.#uiPaletteTitle.focus();
    }

    #handlePaletteTitleEditBlur() {
        this.#uiPaletteTitle.classList.add('visually-hidden');
        this.#btnPaletteTitle.classList.remove('visually-hidden');
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
     * @param {import("./components/paletteListing.js").PaletteListCommandEventArgs} args - Arguments.
     */
    #handlePaletteListOnCommand(args) {
        if (args.command === UiPaletteListing.Commands.paletteSelect) {
            const thisArgs = this.#createEventArgs(commands.paletteSelect);
            thisArgs.paletteId = args.paletteId;
            this.#dispatcher.dispatch(EVENT_OnCommand, thisArgs);
        }
    }


    /**
     * Refreshes the list of palettes.
     * @param {PaletteList?} paletteList - List of palettes, or null.
     */
    #refreshPaletteSelectList(paletteList) {
        const select = this.#element.querySelector(`select[data-command=${commands.paletteSelect}]`);
        if (select) {
            const lastSelectedIndex = select.selectedIndex;
            const optionCount = select.options.length;
            for (let i = 0; i < optionCount; i++) {
                select.options.remove(0);
            }
            if (paletteList) {
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
     * @param {Palette?} palette - The palette to show on the buttons, or null to hide.
     */
    #setPalette(palette) {
        this.#setUI(palette);
        if (palette) {
            this.#btnPaletteTitle.querySelector('label').innerText = palette.title;
            this.#getElements(commands.paletteTitle).forEach((element) => {
                element.value = palette.title
            });
            this.#getElements(commands.paletteSystem).forEach((element) => {
                element.value = palette.system;
            });
            this.#updateSystemSelectVirtualList(palette.system);
            this.#createPaletteColourIndexButtons(palette);
            this.#updatePaletteColourIndexButtonColour(palette);
        }
    }

    #shufflePaletteList() {
        if (this.#selectedPaletteId) {
            const listTop = this.#element.querySelector('[data-smsgfx-id=palette-list-top] div.list-group');
            const listBottom = this.#element.querySelector('[data-smsgfx-id=palette-list-bottom] div.list-group');
            if (listTop && listBottom) {
                listBottom.innerHTML = '';
                let move = false;
                this.#paletteList.getPalettes().forEach((palette, index) => {
                    if (move) {
                        const paletteButton = listTop.querySelector(`button[data-palette-id=${CSS.escape(palette.paletteId)}]`);
                        if (paletteButton) {
                            listBottom.appendChild(paletteButton);
                        }
                    }
                    if (palette.paletteId === this.#selectedPaletteId) {
                        move = true;
                    }
                });
            }
        }
    }

    /**
     * @param {Palette?} palette - The palette to show on the buttons, or null.
     */
    #setUI(palette) {
        if (palette) {
            this.#element.querySelector('[data-smsgfx-id=palette-properties]').style.display = null;
            document.querySelectorAll('[data-smsgfx-id=system-select]').forEach(elm => {
                switch (palette.system) {
                    case 'ms': case 'gg': elm.style.display = null; break;
                    case 'gb': elm.style.display = 'none'; break;
                    case 'nes': elm.style.display = 'none'; break;
                }
            });
            if (palette.system === 'nes') {
                this.#element.querySelector('[data-smsgfx-id=emulate-system-colours]').style.display = 'none';
            } else {
                this.#element.querySelector('[data-smsgfx-id=emulate-system-colours]').style.display = null;
            }
        } else {
            this.#element.querySelector('[data-smsgfx-id=palette-properties]').style.display = 'none';
        }
    }

    /**
     * @param {Palette} palette
     */
    #createPaletteColourIndexButtons(palette) {

        const renderPalette = this.#getPaletteInRegularOrNative(palette);
        const data = renderPalette.getColours().map((colour, index) => {
            return {
                colourIndex: index,
                hex: ColourUtil.toHex(colour.r, colour.g, colour.b),
                r: colour.r,
                g: colour.g,
                b: colour.b,
            };
        });

        const element = this.#element.querySelector('[data-smsgfx-id=palette-colours]');
        this.renderTemplateToElement(element, 'palette-colour-template', data);

        element.querySelectorAll('button[data-colour-index]').forEach((/** @type {HTMLButtonElement} */ button) => {
            const colourIndex = parseInt(button.getAttribute('data-colour-index'));
            button.style.backgroundColor = button.getAttribute('data-colour-hex');
            button.addEventListener('click', () => {
                const isSelected = this.#currentColourIndex === colourIndex;
                const args = this.#createEventArgs(isSelected ? commands.colourIndexEdit : commands.colourIndexChange);
                args.colourIndex = colourIndex;
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            });
            button.addEventListener('contextmenu', (event) => {
                this.#contextMenu.setState({
                    colourIndex: colourIndex,
                    visible: true,
                    position: {
                        x: event.clientX,
                        y: event.clientY
                    }
                });
                event.stopImmediatePropagation();
                event.preventDefault();
                return false;
            });
            if (colourIndex === this.#currentColourIndex) {
                button.classList.add('active');
            }
        });

    }

    /**
     * @param {Palette} palette
     */
    #updatePaletteColourIndexButtonColour(palette) {
        const renderPalette = this.#getPaletteInRegularOrNative(palette);
        const element = this.#element.querySelector('[data-smsgfx-id=palette-colours]');
        element.querySelectorAll('button[data-colour-index]').forEach((/** @type {HTMLButtonElement} */ button) => {
            const colourIndex = parseInt(button.getAttribute('data-colour-index'));
            const paletteColour = renderPalette.getColour(colourIndex);
            const colourHex = ColourUtil.toHex(paletteColour.r, paletteColour.g, paletteColour.b);
            button.setAttribute('data-colour-hex', colourHex);
            button.style.backgroundColor = colourHex
            if (colourIndex === this.#currentColourIndex) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * @param {number} colourIndex
     */
    #selectPaletteColour(colourIndex) {
        const element = this.#element.querySelector('[data-smsgfx-id=palette-colours]');
        element.querySelectorAll('button[data-colour-index]').forEach((/** @type {HTMLButtonElement} */ button) => {
            const buttonColourIndex = parseInt(button.getAttribute('data-colour-index'));
            button.classList.remove('active');
            if (colourIndex === buttonColourIndex) {
                button.classList.add('active');
            }
        });
    }

    /**
     * @param {number} colourIndex
     */
    #highlightPaletteColour(colourIndex) {
        const element = this.#element.querySelector('[data-smsgfx-id=palette-colours]');
        element.querySelectorAll('button[data-colour-index]').forEach((/** @type {HTMLButtonElement} */ button) => {
            const buttonColourIndex = parseInt(button.getAttribute('data-colour-index'));
            button.classList.remove('highlighted');
            if (colourIndex === buttonColourIndex) {
                button.classList.add('highlighted');
            }
        });
    }

    /**
     * @param {Palette} palette - Palette to query.
     * @returns {Palette}
     */
    #getPaletteInRegularOrNative(palette) {
        const displayNative = this.#getElement(commands.displayNativeColours)?.checked ?? false;
        if (displayNative) {
            return PaletteUtil.clonePaletteWithNativeColours(palette, { preserveIds: true });
        } else {
            return palette;
        }
    }


}


/**
 * Palette editor state.
 * @typedef {Object} PaletteEditorState
 * @property {PaletteList?} paletteList - Current list of palettes, null for no palettes.
 * @property {string?} title - Title of the palette.
 * @property {string?} selectedSystem - Sets the selected system, either 'ms', 'gg', 'gb' or 'nes'.
 * @property {number?} selectedPaletteIndex - Sets the selected palette index.
 * @property {number?} selectedPaletteId - Sets the unique ID of the selected palette.
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
 * @typedef {Object} PaletteEditorCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {number?} paletteIndex - Index of the selected palette.
 * @property {number?} paletteId - Unique ID of the selected palette.
 * @property {string?} paletteTitle - Title value for the selected palette.
 * @property {string?} paletteSystem - Selected system value for the selected palette, either 'ms', 'gg', 'gb' or 'nes'.
 * @property {number?} colourIndex - Index from 0 to 15 for the given colour.
 * @property {number?} targetColourIndex - Target palette colour index from 0 to 15 for 'ms' and 'gg', 0 to 3 for 'gb' or 'nes'.
 * @property {boolean?} displayNative - Display native colours for system?
 * @exports
 */
