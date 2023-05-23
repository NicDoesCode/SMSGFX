import EventDispatcher from "../components/eventDispatcher.js";
import Palette from "./../models/palette.js";
import TemplateUtil from "../util/templateUtil.js";
import TileMapList from "../models/tileMapList.js";
import TileSet from "./../models/tileSet.js";
import UiTileMapListing from "./components/tileMapListing.js";
import UiTileSetList from "./components/tileSetList.js";
import TileMapListing from "./components/tileMapListing.js";
import TileSetList from "./components/tileSetList.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileMapNew: 'tileMapNew',
    tileSetSelect: 'tileSetSelect',
    tileMapSelect: 'tileMapSelect',
    tileMapDelete: 'tileMapDelete',
    tileSelect: 'tileSelect'
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

        this.#element.querySelectorAll('[data-command]').forEach(element => {
            element.onclick = () => {
                const command = element.getAttribute('data-command');
                const args = this.#createArgs(command);
                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            };
        });

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

        if (typeof state?.selectedTileMapId !== 'undefined') {
            this.#uiTileMapListing.setState({
                selectedTileMapId: state.selectedTileMapId
            });
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
     * @returns {TileManagerCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command
        };
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


}


/**
 * Tile manager state.
 * @typedef {object} TileManagerState
 * @property {TileMapList?} [tileMapList] - Tile map list to be displayed in the listing.
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {string?} [selectedTileMapId] - Unique ID of the selected tile map.
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
 * @exports
 */
