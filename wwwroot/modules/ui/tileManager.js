import EventDispatcher from "../components/eventDispatcher.js";
import Palette from "./../models/palette.js";
import TemplateUtil from "../util/templateUtil.js";
import TileMapList from "../models/tileMapList.js";
import TileSet from "./../models/tileSet.js";
import UiTileMapListing from "./components/tileMapListing.js";
import UiTileSetList from "./components/tileSetList.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
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
    /** @type {UiTileMapListing} */
    #uiTileMapListing;
    /** @type {UiTileSetList} */
    #uiTileSetList;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

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

        if (state?.tileMapList && typeof state.tileMapList.addTileMap === 'function') {
            this.#tileMapList = state.tileMapList;
            tileMapListingDirty = true;
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

        if (tileMapListingDirty) {
            this.#uiTileMapListing.setState({
                showTileSet: this.#tileSet ? true : false,
                tileMapList: this.#tileMapList
            });
        }

        if (tileListDirty) {
            this.#uiTileSetList.setState({
                tileSet: this.#tileSet ?? undefined,
                palette: this.#palette ?? undefined
            });
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
     * When a command is received from the tile map listing.
     * @param {import("./components/tileMapListing.js").TileMapListingCommandEventArgs} args - Arguments.
     */
    #handleTileMapListingOnCommand(args) {
        switch (args.command) {
        }
    }


    /**
     * When a command is received from the tile set list.
     * @param {import("./components/tileSetList.js").TileSetListCommandEventArgs} args - Arguments.
     */
    #handleTileSetListOnCommand(args) {
        switch (args.command) {
        }
    }


}


/**
 * Tile manager state.
 * @typedef {object} TileManagerState
 * @property {TileMapList?} [tileMapList] - Tile map list to be displayed in the listing.
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
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
 * @exports
 */
