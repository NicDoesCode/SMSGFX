import ComponentBase from "./componentBase.js";
import EventDispatcher from "../components/eventDispatcher.js";
import Palette from "./../models/palette.js";
import TemplateUtil from "../util/templateUtil.js";
import TileMapList from "../models/tileMapList.js";
import PaletteList from "../models/paletteList.js";
import TileSet from "./../models/tileSet.js";
import TileListing from "./components/tileListing.js";
import TileMapListing from "./components/tileMapListing.js";
import PaletteUtil from "../util/paletteUtil.js";
import PaletteFactory from "../factory/paletteFactory.js";
import StackedListReorderHelper from "../engine/helpers/stackedListReorderHelper.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileMapNew: 'tileMapNew',
    tileSetSelect: 'tileSetSelect',
    tileMapSelect: 'tileMapSelect',
    tileMapDelete: 'tileMapDelete',
    tileMapClone: 'tileMapClone',
    tileMapCloneMirror: 'tileMapCloneMirror',
    tileMapMirror: 'tileMapMirror',
    tileMapFlip: 'tileMapFlip',
    tileMapChangePosition: 'tileMapChangePosition',
    tileSelect: 'tileSelect',
    tileHighlight: 'tileHighlight',
    tileMapChange: 'tileMapChange',
    tileMapReference: 'tileMapReference',
    tileSetChange: 'tileSetChange',
    tileSetToTileMap: 'tileSetToTileMap',
    assemblyImport: 'assemblyImport',
    sort: 'sort'
}

const fields = {
    tileMapTitle: 'tileMapTitle',
    tileMapOptimise: 'tileMapOptimise',
    tileMapIsSprite: 'tileMapIsSprite',
    tileMapPaletteId: 'tileMapPaletteId',
    tileWidth: 'tileWidth'
}

export const sortFields = {
    title: 'title'
}


/**
 * Manages the right side of the screen with the tile map selector, the tile set selector and tile palette.
 */
export default class TileManager extends ComponentBase {


    /**
     * Gets a list of commands this component can invoke.
     */
    static get Commands() {
        return commands;
    }

    /**
     * Gets a list of fields that can be sorted.
     */
    static get SortFields() {
        return sortFields;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {Palette} */
    #palette = null;
    /** @type {TileMapList} */
    #tileMapList = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {HTMLElement} */
    #uiTileMapProperties;
    /** @type {HTMLElement} */
    #uiTileSetProperties;
    /** @type {HTMLInputElement} */
    #uiTileSetTileWidth;
    /** @type {HTMLInputElement} */
    #uiTileMapTitle;
    /** @type {HTMLInputElement} */
    #uiTileSetOptimise;
    /** @type {HTMLInputElement} */
    #uiTileSetIsSprite;
    /** @type {HTMLButtonElement} */
    #btnTileSetSelect;
    /** @type {HTMLButtonElement} */
    #btnTileMapTitle;
    /** @type {TileListing} */
    #tileListing;
    /** @type {TileMapListing} */
    #tileMapListing;
    /** @type {HTMLElement} */
    #paletteSelectorElement;
    /** @type {number} */
    #numberOfPaletteSlots = 0;
    /** @type {number?} */
    #lockedPaletteSlotIndex = null;
    /** @type {string?} */
    #selectedTileMapId = null;
    /** @type {PaletteList?} */
    #paletteList = null;
    /** @type {StackedListReorderHelper} */
    #reorderHelper;


    /**
     * Constructor for the class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);

        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        TemplateUtil.wireUpLabels(this.#element);

        this.#reorderHelper = new StackedListReorderHelper(
            this.#element.querySelector('[data-smsgfx-id=tile-map-list-container]'),
            'data-tile-map-id'
        );
        this.#reorderHelper.addHandlerOnCommand((args) => {
            if (args.command === StackedListReorderHelper.Commands.reorder) {
                /** @type {TileManagerCommandEventArgs} */
                const eArgs = {
                    command: commands.tileMapChangePosition,
                    tileMapId: args.originItemId,
                    targetTileMapId: args.targetItemId,
                    targetPosition: args.targetItemPosition
                };
                this.#dispatcher.dispatch(EVENT_OnCommand, eArgs);
            }
        });

        this.#uiTileMapProperties = this.#element.querySelector('[data-smsgfx-id=tile-map-properties]');
        this.#uiTileSetProperties = this.#element.querySelector('[data-smsgfx-id=tile-set-properties]');

        this.#paletteSelectorElement = this.#element.querySelector('[data-smsgfx-id=palette-selectors]');

        this.#uiTileSetTileWidth = this.#element.querySelector('[data-command=tileSetChange][data-field=tileWidth]');
        this.#uiTileSetOptimise = this.#element.querySelector('[data-command=tileMapChange][data-field=optimise]');
        this.#uiTileSetIsSprite = this.#element.querySelector('[data-command=tileMapChange][data-field=isSprite]');

        this.#uiTileMapTitle = this.#element.querySelector('[data-command=tileMapChange][data-field=title]');
        this.#uiTileMapTitle.addEventListener('blur', () => this.#handleTileMapTitleEditBlur());

        this.#btnTileSetSelect = this.#element.querySelector('[data-command=tileSetSelect]');
        this.#btnTileSetSelect.addEventListener('click', () => this.#handleTileMapListingOnCommand({ command: commands.tileSetSelect }));

        this.#btnTileMapTitle = this.#element.querySelector('[data-smsgfx-id=editTileMapTitle]');
        this.#btnTileMapTitle.addEventListener('click', () => this.#handleTileMapTitleEditClick());

        this.#wireAutoEvents(this.#element);

        TileListing.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-set-list]'))
            .then((component) => {
                this.#tileListing = component;
                this.#tileListing.addHandlerOnCommand((args) => this.#handleTileListingOnCommand(args));
            });

        TileMapListing.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-map-listing]'))
            .then((component) => {
                this.#tileMapListing = component;
                this.#tileMapListing.addHandlerOnCommand((args) => this.#handleTileMapListingOnCommand(args));
            });

        this.#populateTileMapDetails();
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileManager>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('tileManager', element);
        return new TileManager(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {TileManagerState} state - State to set.
     */
    setState(state) {
        let tileMapListingDirty = false;
        let tileListDirty = false;
        let paletteSlotsDirty = false;
        let paletteDirty = false;
        let updatedTileIds = null;

        if (state?.tileMapList && state.tileMapList instanceof TileMapList) {
            this.#tileMapList = state.tileMapList;
            tileMapListingDirty = true;
            paletteSlotsDirty = true;
        }

        if (state?.tileSet && state.tileSet instanceof TileSet) {
            this.#tileSet = state.tileSet;
            this.#element.querySelector('[data-smsgfx-id=tileSetTileWidth]').value = this.#tileSet.tileWidth;
            tileMapListingDirty = true;
            tileListDirty = true;
        }

        if (state?.palette && state.palette instanceof Palette) {
            this.#palette = state.palette;
            paletteDirty = true;
            tileListDirty = true;
        }

        if (typeof state?.selectedTileMapId !== 'undefined') {
            this.#selectedTileMapId = state.selectedTileMapId;
            this.#populateTileMapDetails();
            tileMapListingDirty = true;
        }

        if (typeof state?.selectedTileId !== 'undefined') {
            this.#tileListing.setState({
                selectedTileId: state?.selectedTileId
            });
        }

        if (state?.updatedTileIds && Array.isArray(state?.updatedTileIds)) {
            updatedTileIds = state.updatedTileIds;
        }

        if (typeof state?.numberOfPaletteSlots === 'number') {
            this.#numberOfPaletteSlots = state.numberOfPaletteSlots;
            paletteSlotsDirty = true;
        } else if (state?.numberOfPaletteSlots === null) {
            this.#numberOfPaletteSlots = 0;
            paletteSlotsDirty = true;
        }

        if (typeof state?.lockedPaletteSlotIndex === 'number' || state?.lockedPaletteSlotIndex === null) {
            this.#lockedPaletteSlotIndex = state.lockedPaletteSlotIndex;
            paletteSlotsDirty = true;
        }

        if (state?.paletteList instanceof PaletteList) {
            this.#paletteList = state.paletteList;
            paletteSlotsDirty = true;
        } else if (state?.paletteList === null) {
            this.#paletteList = null;
            paletteSlotsDirty = true;
        }

        if (tileMapListingDirty) {
            this.#updateTileMapSelectList();
            this.#tileMapListing.setState({
                tileMapList: this.#tileMapList,
                selectedTileMapId: this.#selectedTileMapId
            });
            this.#reorderHelper.wireUpItems();
            this.#showPropertiesPanelInList();
        }

        if (tileMapListingDirty && paletteDirty) {
            this.#tileListing.setState({
                tileSet: this.#tileSet ?? undefined,
                palette: this.#palette ?? undefined
            });
        } else if (tileMapListingDirty) {
            this.#tileListing.setState({
                tileSet: this.#tileSet ?? undefined
            });
        } else if (paletteDirty) {
            this.#tileListing.setState({
                palette: this.#palette ?? undefined
            });
        }

        if (updatedTileIds) {
            this.#tileListing.setState({
                updatedTileIds: updatedTileIds,
                palette: paletteDirty ? this.#palette ?? undefined : undefined
            });
        }

        if (paletteSlotsDirty) {
            this.#populatePaletteSelectors();
            this.#populatePaletteColours();
        }
    }


    /**
     * Registers a handler for a command.
     * @param {TileManagerCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    /**
     * @param {string} command
     * @param {HTMLElement} element
     * @returns {TileManagerCommandEventArgs}
     */
    #createArgs(command, element) {
        /** @type {TileManagerCommandEventArgs} */
        const result = { command: command };
        const field = element?.getAttribute('data-field') ?? null;
        if (command === TileManager.Commands.tileMapChange) {
            result.tileMapId = this.#selectedTileMapId;
            result.title = this.#uiTileMapTitle.value;
            result.optimise = this.#uiTileSetOptimise.checked;
            result.isSprite = this.#uiTileSetIsSprite.checked;
            result.paletteSlots = [];
            for (let i = 0; i < this.#numberOfPaletteSlots; i++) {
                const select = this.#element.querySelector(`[data-command='tileMapChange'][data-field='paletteId'][data-palette-slot='${i}']`);
                result.paletteSlots.push(select.value);
            }
        }
        if (command === TileManager.Commands.tileMapSelect) {
            result.tileMapId = this.#selectedTileMapId;
        }
        if (command === TileManager.Commands.tileMapDelete) {
            result.tileMapId = this.#selectedTileMapId;
        }
        if (command === TileManager.Commands.tileMapClone) {
            result.tileMapId = this.#selectedTileMapId;
        }
        if (command === TileManager.Commands.tileSetChange && field === fields.tileWidth) {
            result.tileWidth = parseInt(this.#uiTileSetTileWidth.value);
        }
        return result;
    }


    /**
     * @param {HTMLElement} parentElement 
     */
    #wireAutoEvents(parentElement) {
        TemplateUtil.wireUpCommandAutoEvents(parentElement, (sender, ev, command, event) => {
            if (command === commands.tileSetSelect) {
                // Tile set select
                const args = this.#createArgs(TileManager.Commands.tileSetSelect);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
            else if (command === commands.sort) {
                // Sort
                const args = this.#createArgs(TileManager.Commands.sort);
                args.field = sender.getAttribute('data-field');
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            } else {
                // Generic
                const args = this.#createArgs(command, sender);
                args.tileMapId = this.#selectedTileMapId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
        });
    }


    /**
     * When a command is received from the tile set list.
     * @param {import("./components/tileListing.js").TileSetListCommandEventArgs} args - Arguments.
     */
    #handleTileListingOnCommand(args) {
        switch (args.command) {
            case TileListing.Commands.tileSelect:
                const args1 = this.#createArgs(commands.tileSelect);
                args1.tileId = args.tileId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args1);
                break;
            case TileListing.Commands.tileHighlight:
                const args2 = this.#createArgs(commands.tileHighlight);
                args2.tileId = args.tileId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args2);
                break;
        }
    }

    /**
     * When a command is received from the tile map list.
     * @param {import("./components/tileMapListing.js").TileMapListingCommandEventArgs} args - Arguments.
     */
    #handleTileMapListingOnCommand(args) {
        if (args.command === TileMapListing.Commands.tileMapSelect) {
            /** @type {TileManagerCommandEventArgs} */
            const thisArgs = {
                command: args.command,
                tileMapId: args.tileMapId
            }
            this.#dispatcher.dispatch(EVENT_OnCommand, thisArgs);
        } else if (args.command === TileMapListing.Commands.tileSetSelect) {
            /** @type {TileManagerCommandEventArgs} */
            const thisArgs = {
                command: args.command
            }
            this.#dispatcher.dispatch(EVENT_OnCommand, thisArgs);
        }
    }

    #handleTileMapTitleEditClick() {
        this.#uiTileMapTitle.classList.remove('visually-hidden');
        this.#btnTileMapTitle.classList.add('visually-hidden');
        this.#uiTileMapTitle.focus();
    }

    #handleTileMapTitleEditBlur() {
        this.#uiTileMapTitle.classList.add('visually-hidden');
        this.#btnTileMapTitle.classList.remove('visually-hidden');
    }


    #populateTileMapDetails() {
        const tileMap = this.#tileMapList?.getTileMapById(this.#selectedTileMapId) ?? null;
        this.#uiTileMapTitle.classList.add('visually-hidden');
        this.#btnTileMapTitle.classList.remove('visually-hidden');
        this.#btnTileMapTitle.querySelector('label').innerText = '';
        if (tileMap) {
            this.#uiTileSetProperties.classList.add('visually-hidden');
            this.#uiTileMapProperties.classList.remove('visually-hidden');
            this.#uiTileMapTitle.disabled = false;
            this.#uiTileMapTitle.value = tileMap.title;
            this.#btnTileMapTitle.querySelector('label').innerText = tileMap.title;
            this.#uiTileSetOptimise.checked = tileMap.optimise;
            this.#uiTileSetIsSprite.checked = tileMap.isSprite;
        } else {
            this.#uiTileSetProperties.classList.remove('visually-hidden');
            this.#uiTileMapProperties.classList.add('visually-hidden');
            this.#uiTileMapTitle.disabled = true;
            this.#uiTileMapTitle.value = 'Tile set';
        }
    }


    #populatePaletteSelectors() {
        const paletteList = this.#paletteList;
        const numberOfPaletteSlots = this.#numberOfPaletteSlots;
        const tileMap = this.#tileMapList?.getTileMapById(this.#selectedTileMapId);

        while (this.#paletteSelectorElement.hasChildNodes()) {
            this.#paletteSelectorElement.firstChild.remove();
        }

        if (numberOfPaletteSlots === 0 || !tileMap) {
            return;
        }

        const renderList = new Array();
        for (let i = 0; i < this.#numberOfPaletteSlots; i++) {
            renderList.push({ slotNumber: i });
        }

        this.renderTemplateToElement(this.#paletteSelectorElement, 'palette-selector-template', renderList);

        this.#paletteSelectorElement.querySelectorAll('select[data-field=paletteId]').forEach((/** @type {HTMLSelectElement} */ select) => {
            const slotNumber = parseInt(select.getAttribute('data-palette-slot'));
            const selectedPaletteId = tileMap.getPaletteByIndex(slotNumber);
            paletteList.getPalettes().forEach((palette, paletteIndex) => {
                const option = document.createElement('option');
                option.value = palette.paletteId;
                option.text = palette.title;
                option.selected = ((paletteIndex === 0 && !selectedPaletteId) || (palette.paletteId === selectedPaletteId));
                select.options.add(option);
            });
            select.addEventListener('change', (s, ev) => {
                this.#populatePaletteColours();
            });
        });

        this.#populatePaletteColours();

        this.#wireAutoEvents(this.#paletteSelectorElement);
    }

    #populatePaletteColours() {
        if (!this.#tileMapList || !this.#paletteList) return;

        const paletteList = this.#paletteList;
        const tileMap = this.#tileMapList.getTileMapById(this.#selectedTileMapId);

        if (!tileMap) return;

        // Build a list of palettes based on whats selected for the tile map
        /** @type {Palette[]} */
        const renderPalettes = new Array(this.#numberOfPaletteSlots);
        for (let i = 0; i < this.#numberOfPaletteSlots; i++) {
            const paletteId = tileMap.getPaletteByIndex(i);
            const palette = paletteList.getPaletteById(paletteId);
            if (paletteId && palette) {
                renderPalettes[i] = PaletteFactory.clone(palette);
            } else {
                renderPalettes[i] = null;
            }
        }

        // If there is a locked colour, then take the locked colour index from the first palette and
        // apply that colour to all other colours
        const firstPalette = renderPalettes[0];
        if (firstPalette && this.#lockedPaletteSlotIndex !== null) {
            if (this.#lockedPaletteSlotIndex >= 0 && this.#lockedPaletteSlotIndex < firstPalette.getColours().length) {
                const lockedColour = firstPalette.getColour(this.#lockedPaletteSlotIndex);
                renderPalettes.forEach((p, idx) => {
                    if (p && idx > 0) {
                        const colour = p.getColour(this.#lockedPaletteSlotIndex);
                        colour.r = lockedColour.r;
                        colour.g = lockedColour.g;
                        colour.b = lockedColour.b;
                    }
                });
            }
        }

        // Display the palette colours
        this.#paletteSelectorElement.querySelectorAll('[data-smsgfx-id=palette-selector]').forEach((/** @type {HTMLElement} */ elm, i) => {

            const colourElm = elm.querySelector('[data-smsgfx-id=palette-colours]');
            const slotNum = parseInt(colourElm.getAttribute('data-palette-slot'));
            const palette = renderPalettes[slotNum];

            while (colourElm.hasChildNodes()) {
                colourElm.firstChild.remove();
            }

            if (palette) {
                palette.getColours().forEach((colour) => {
                    const colourSampleElm = document.createElement('div');
                    colourSampleElm.style.backgroundColor = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
                    colourElm.appendChild(colourSampleElm);
                });
            }
        });
    }


    #updateTileMapSelectList() {
        const dropList = this.#element.querySelector('[data-smsgfx-id=tileMapSelectDropDown]');
        const tileMapList = this.#tileMapList;

        // Clear existing options
        ['li[data-tile-set]', 'li[data-tile-map-id]'].forEach((selector) => {
            const virtualNodes = dropList.querySelectorAll(selector);
            virtualNodes.forEach((node) => {
                node.remove();
            });
        });

        // Add tile maps to list
        if (tileMapList) {
            tileMapList.getTileMaps().forEach((tileMap) => {
                const li = document.createElement('li');
                li.setAttribute('data-tile-map-id', tileMap.tileMapId);
                const a = document.createElement('a');
                a.classList.add('dropdown-item');
                a.href = '#';
                a.innerText = tileMap.title;
                a.setAttribute('data-tile-map-id', tileMap.tileMapId);
                a.addEventListener('click', (ev) => {
                    // Fire tile selected event on click
                    const args = this.#createArgs(TileManager.Commands.tileMapSelect);
                    args.tileMapId = tileMap.tileMapId;
                    this.#dispatcher.dispatch(EVENT_OnCommand, args);
                });
                li.appendChild(a);
                dropList.appendChild(li);
            });
        }
    }


    #showPropertiesPanelInList() {
        const listElm = this.#element.querySelector('[data-smsgfx-id=tile-map-list] div.list-group');
        const propsElm = this.#uiTileMapProperties;

        if (this.#selectedTileMapId) {
            const palContElm = listElm.querySelector(`div[data-list-item][data-tile-map-id=${CSS.escape(this.#selectedTileMapId)}]`);
            if (palContElm) {
                propsElm.style.display = 'block';
                palContElm.appendChild(propsElm);
            }
        } else {
            propsElm.style.display = 'none';
        }
    }


}


/**
 * Tile manager state.
 * @typedef {Object} TileManagerState
 * @property {TileMapList?} [tileMapList] - Tile map list to be displayed in the listing.
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {PaletteList?} [paletteList] - Available palettes for the palette slots.
 * @property {string?} [selectedTileMapId] - Unique ID of the selected tile map.
 * @property {string?} [selectedTileId] - Unique ID of the selected tile.
 * @property {string[]?} [selectedTileIds] - Array of unique IDs of selected tiles.
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 * @property {number?} [numberOfPaletteSlots] - Amount of palette slots that the tile map provides.
 * @property {number?} [lockedPaletteSlotIndex] - When not null, the palette slot index specified here will be repeated from palette 0 across all palettes.
 * @property {number?} [tileWidth] - Display tile width for the tile set.
 */

/**
 * When a command is issued from the tile manager.
 * @callback TileManagerCommandCallback
 * @param {TileManagerCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} TileManagerCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} tileMapId - Unique ID of the tile map.
 * @property {string} tileId - Unique ID of the tile.
 * @property {string?} [title] - Title for the tile map.
 * @property {number?} [paletteSlotNumber] - Slot number for the palette.
 * @property {string[]?} [paletteSlots] - Unique ID of the palette.
 * @property {boolean?} [optimise] - Optimise the tile map?
 * @property {boolean?} [isSprite] - Is this tile map a sprite?
 * @property {number?} [tileWidth] - Display tile width for the tile set.
 * @property {string?} [field] - Field to sort by.
 * @property {string?} [targetTileMapId] - Unique ID of the target tile map.
 * @property {string?} [targetPosition] - Position where to place the tile map.
 * @property {boolean?} [shiftIsDown] - Is the shift key being held down?
 * @exports
 */
