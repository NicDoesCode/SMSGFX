import EventDispatcher from "../components/eventDispatcher.js";
import Palette from "./../models/palette.js";
import TemplateUtil from "../util/templateUtil.js";
import TileMapList from "../models/tileMapList.js";
import PaletteList from "../models/paletteList.js";
import TileSet from "./../models/tileSet.js";
import UiTileMapListing from "./components/tileMapListing.js";
import UiTileSetList from "./components/tileSetList.js";
import TileMapListing from "./components/tileMapListing.js";
import TileSetList from "./components/tileSetList.js";
import TileGridProvider from "../models/tileGridProvider.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileMapNew: 'tileMapNew',
    tileSetSelect: 'tileSetSelect',
    tileMapSelect: 'tileMapSelect',
    tileMapDelete: 'tileMapDelete',
    tileSelect: 'tileSelect',
    tileMapChange: 'tileMapChange'
}

const fields = {
    tileMapTitle: 'tileMapTitle',
    tileMapOptimise: 'tileMapOptimise',
    tileMapPaletteId: 'tileMapPaletteId'
}

export default class TileManager {


    static get Commands() {
        return commands;
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
    /** @type {HTMLInputElement} */
    #uiTileMapTitle;
    /** @type {HTMLInputElement} */
    #uiTileSetOptimise;
    /** @type {UiTileMapListing} */
    #uiTileMapListing;
    /** @type {UiTileSetList} */
    #uiTileSetList;
    /** @type {HTMLElement} */
    #paletteSelectorElement;
    /** @type {number} */
    #numberOfPaletteSlots = 0;
    /** @type {string?} */
    #selectedTileMapId = null;
    /** @type {PaletteList?} */
    #paletteList = null;
    #paletteSelectorTemplate;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        // Compile handlebars template
        const source = this.#element.querySelector('[data-smsgfx-id=palette-selector-template]').innerHTML;
        this.#paletteSelectorTemplate = Handlebars.compile(source);

        this.#paletteSelectorElement = this.#element.querySelector('[data-smsgfx-id=palette-selectors]');

        this.#uiTileMapTitle = this.#element.querySelector('[data-command=tileMapChange][data-field=title]');
        this.#uiTileSetOptimise = this.#element.querySelector('[data-command=tileMapChange][data-field=optimise]');

        this.#wireAutoEvents(this.#element);

        UiTileMapListing.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-map-listing]'))
            .then((obj) => {
                this.#uiTileMapListing = obj;
                this.#uiTileMapListing.addHandlerOnCommand((args) => this.#handleTileMapListingOnCommand(args));
            });

        UiTileSetList.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-set-list]'))
            .then((obj) => {
                this.#uiTileSetList = obj;
                this.#uiTileSetList.addHandlerOnCommand((args) => this.#handleTileSetListOnCommand(args));
            });
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

        if (state?.tileMapList && typeof state.tileMapList.addTileMap === 'function') {
            this.#tileMapList = state.tileMapList;
            tileMapListingDirty = true;
            paletteSlotsDirty = true;
        }

        if (state?.tileSet && typeof state.tileSet.addTile === 'function') {
            this.#tileSet = state.tileSet;
            tileMapListingDirty = true;
            tileListDirty = true;
        }

        if (state?.palette && typeof state.palette.getColour === 'function') {
            this.#palette = state.palette;
            tileListDirty = true;
        }

        if (typeof state?.selectedTileMapId !== 'undefined') {
            this.#selectedTileMapId = state.selectedTileMapId;
            this.#populateTileMapDetails();
            this.#uiTileMapListing.setState({
                selectedTileMapId: state.selectedTileMapId
            });
        }

        if (typeof state?.numberOfPaletteSlots === 'number') {
            this.#numberOfPaletteSlots = state.numberOfPaletteSlots;
            paletteSlotsDirty = true;
        } else if (state?.numberOfPaletteSlots === null) {
            this.#numberOfPaletteSlots = 0;
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
            this.#uiTileMapListing.setState({
                showTileSet: this.#tileSet ? true : false,
                tileMapList: this.#tileMapList,
                showDelete: true
            });
        }

        if (tileListDirty) {
            this.#uiTileSetList.setState({
                tileSet: this.#tileSet ?? undefined,
                palette: this.#palette ?? undefined
            });
        }

        if (paletteSlotsDirty) {
            this.#populatePaletteSelectors();
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
        if (command === TileManager.Commands.tileMapChange) {
            result.tileMapId = this.#selectedTileMapId;
            result.title = this.#uiTileMapTitle.value;
            result.optimise = this.#uiTileSetOptimise.checked;
            result.paletteSlots = [];
            for (let i = 0; i < this.#numberOfPaletteSlots; i++) {
                const select = this.#element.querySelector(`[data-command='tileMapChange'][data-field='paletteId'][data-palette-slot='${i}']`);
                result.paletteSlots.push(select.value);
            }
        }
        return result;
    }


    /**
     * @param {HTMLElement} parentElement 
     */
    #wireAutoEvents(parentElement) {
        parentElement.querySelectorAll('[data-command][data-auto-event]').forEach((element) => {
            const event = element.getAttribute('data-auto-event');
            element.addEventListener(event, () => {
                const command = element.getAttribute('data-command');
                const args = this.#createArgs(command, element);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            });
        });
    }


    /**
     * When a command is received from the tile map listing.
     * @param {import("./components/tileMapListing.js").TileMapListingCommandEventArgs} args - Arguments.
     */
    #handleTileMapListingOnCommand(args) {
        switch (args.command) {
            case TileMapListing.Commands.tileSetSelect:
                const args1 = this.#createArgs(commands.tileSetSelect);
                this.#dispatcher.dispatch(EVENT_OnCommand, args1);
                break;
            case TileMapListing.Commands.tileMapSelect:
                const args2 = this.#createArgs(commands.tileMapSelect);
                args2.tileMapId = args.tileMapId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args2);
                break;
            case TileMapListing.Commands.tileMapDelete:
                const args3 = this.#createArgs(commands.tileMapDelete);
                args3.tileMapId = args.tileMapId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args3);
                break;
        }
    }


    /**
     * When a command is received from the tile set list.
     * @param {import("./components/tileSetList.js").TileSetListCommandEventArgs} args - Arguments.
     */
    #handleTileSetListOnCommand(args) {
        switch (args.command) {
            case TileSetList.Commands.tileSelect:
                const args1 = this.#createArgs(commands.tileSelect);
                args1.tileId = args.tileId;
                this.#dispatcher.dispatch(EVENT_OnCommand, args1);
                break;
        }
    }


    #populateTileMapDetails() {
        const tileMap = this.#tileMapList.getTileMapById(this.#selectedTileMapId);
        if (tileMap) {
            this.#uiTileMapTitle.disabled = false;
            this.#uiTileMapTitle.value = tileMap.title;
            this.#uiTileSetOptimise.disabled = false;
            this.#uiTileSetOptimise.checked = tileMap.optimise;
        } else {
            this.#uiTileMapTitle.disabled = true;
            this.#uiTileMapTitle.value = 'Tile set';
            this.#uiTileSetOptimise.disabled = true;
            this.#uiTileSetOptimise.checked = false;
        }
    }


    #populatePaletteSelectors() {
        const paletteList = this.#paletteList;
        const numberOfPaletteSlots = this.#numberOfPaletteSlots;
        const tileMap = this.#tileMapList.getTileMapById(this.#selectedTileMapId);

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

        this.#paletteSelectorElement.innerHTML = this.#paletteSelectorTemplate(renderList);

        this.#paletteSelectorElement.querySelectorAll('select[data-field=paletteId]').forEach((/** @type {HTMLSelectElement} */ select) => {
            const slotNumber = parseInt(select.getAttribute('data-palette-slot'));
            const selectedPaletteId = tileMap.getPalette(slotNumber);
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
        const paletteList = this.#paletteList;
        this.#paletteSelectorElement.querySelectorAll('[data-smsgfx-id=palette-selector]').forEach((/** @type {HTMLElement} */ elm) => {
            const selectedPaletteId = elm.querySelector('select').value;
            const palette = paletteList.getPaletteById(selectedPaletteId);

            const colourElm = elm.querySelector('[data-smsgfx-id=palette-colours]');
            while (colourElm.hasChildNodes()) {
                colourElm.firstChild.remove();
            }
            palette.getColours().forEach((colour) => {
                const colourSampleElm = document.createElement('div');
                colourSampleElm.style.backgroundColor = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
                colourElm.appendChild(colourSampleElm);
            });
        });
    }


}


/**
 * Tile manager state.
 * @typedef {object} TileManagerState
 * @property {TileMapList?} [tileMapList] - Tile map list to be displayed in the listing.
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {PaletteList?} [paletteList] - Available palettes for the palette slots.
 * @property {string?} [selectedTileMapId] - Unique ID of the selected tile map.
 * @property {number?} [numberOfPaletteSlots] - Amount of palette slots that the tile map provides.
 */

/**
 * When a command is issued from the tile manager.
 * @callback TileManagerCommandCallback
 * @param {TileManagerCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileManagerCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} tileMapId - Unique ID of the tile map.
 * @property {string} tileId - Unique ID of the tile.
 * @property {string?} [title] - Title for the tile map.
 * @property {number?} [paletteSlotNumber] - Slot number for the palette.
 * @property {string[]?} [paletteSlots] - Unique ID of the palette.
 * @property {boolean?} [optimise] - Optimise the tile map?
 * @exports
 */
