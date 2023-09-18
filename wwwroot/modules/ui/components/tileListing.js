import ComponentBase from "../componentBase.js";
import EventDispatcher from "./../../components/eventDispatcher.js";
import PaintUtil from "./../../util/paintUtil.js";
import TemplateUtil from "./../../util/templateUtil.js";
import TileSet from './../../models/tileSet.js';
import Palette from "./../../models/palette.js";
import TileSetJsonSerialiser from "../../serialisers/tileSetJsonSerialiser.js";
import PaletteJsonSerialiser from "../../serialisers/paletteJsonSerialiser.js";
import TileJsonSerialiser from "../../serialisers/tileJsonSerialiser.js";
import CacheUtil from "../../util/cacheUtil.js";


const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileSelect: 'tileSelect'
}


/**
 * UI component that displays a list of tiles.
 */
export default class TileListing extends ComponentBase {


    /**
     * Gets an enumeration of all the commands that may be invoked by this class.
     */
    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    /** @type {TileSet} */
    #tileSet;
    /** @type {Palette} */
    #palette;
    /** @type {string?} */
    #selectedTileId = null;
    /** @type {Object.<string, HTMLCanvasElement>} */
    #canvases = {};
    /** @type {Object.<string, HTMLButtonElement>} */
    #buttons = {};

    /** @type {Worker?} */
    #imageWorker = null;


    /**
     * Constructor for the class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#imageWorker = new Worker(`./modules/worker/tileImageWorker.js${CacheUtil.getCacheBuster() ?? ''}`, { type: 'module' });
        this.#imageWorker.addEventListener('message', (e) => {
        });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileListing>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/tileListing', element);
        return new TileListing(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {TileListingState} state - State to set.
     */
    setState(state) {
        let tileSetChanged = false;
        let paletteChanged = false;

        if (state?.tileSet instanceof TileSet) {
            this.#tileSet = state.tileSet;
            tileSetChanged = true;
        }

        if (state?.palette instanceof Palette) {
            this.#palette = state.palette;
            paletteChanged = true;
        }

        if (tileSetChanged) {
            this.#reset();
            this.#ensureButtons(this.#tileSet);
            this.#addButtonsToContainer(this.#tileSet);
            this.#configureTileImageWorker(this.#tileSet, this.#palette, this.#canvases);
        } else if (paletteChanged) {
            this.#updateTileImageWorkerPalette(this.#palette);
        } else if (state?.updatedTileIds && Array.isArray(state.updatedTileIds)) {
            this.#updateTileImageWorkerTileIds(state.updatedTileIds);
        }

        if (typeof state?.selectedTileId === 'string' || state.selectedTileId === null) {
            const changed = this.#selectedTileId !== state?.selectedTileId;
            this.#selectedTileId = state.selectedTileId;
            this.#selectTile(this.#selectedTileId, changed);
        }
    }


    /**
     * Registers a handler for a command.
     * @param {TileListingCommandCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }


    #reset() {
        this.#buttons = {};
        this.#canvases = {};
    }

    /**
     * @param {TileSet} tileSet
     */
    #ensureButtons(tileSet) {
        tileSet.getTiles().forEach((tile) => {
            let button = this.#buttons[tile.tileId];
            if (!button) {

                button = document.createElement('button');
                button.setAttribute('data-command', commands.tileSelect);
                button.setAttribute('data-tile-id', tile.tileId);
                button.classList.add('btn', 'btn-secondary');

                button.addEventListener('click', (ev) => {
                    this.#handleTileListingCommandButtonClicked(commands.tileSelect, tile.tileId);
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                });

                this.#buttons[tile.tileId] = button;
            }
            let canvas = this.#canvases[tile.tileId];
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                button.appendChild(canvas);
                this.#canvases[tile.tileId] = canvas;
            }
            button.style.width = `${canvas.width}px`;
            button.style.height = `${canvas.height}px`;
        });
    }

    #addButtonsToContainer() {
        this.#element.innerHTML = '';
        Object.keys(this.#buttons).forEach((tileId) => {
            const button = this.#buttons[tileId];
            if (this.#selectedTileId && this.#selectedTileId === tileId) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
            this.#element.appendChild(button);
        });
    }

    /**
     * @param {TileSet} tileSet
     * @param {Palette?} [palette]
     * @param {Object.<string, HTMLCanvasElement>} canvases
     */
    #configureTileImageWorker(tileSet, palette, canvases) {
        const canvasesToTransfer = [];
        /** @type {import('./../../worker/tileImageWorker.js').TileImageWorkerSetMessage} */
        const message = {
            messageType: 'set',
            clear: true,
            canvases: []
        }
        if (tileSet instanceof TileSet) {
            message.tileSet = TileSetJsonSerialiser.toSerialisable(tileSet);
        }
        if (palette instanceof Palette) {
            message.palette = PaletteJsonSerialiser.toSerialisable(palette);
        }
        Object.keys(canvases).forEach((tileId) => {
            const canvas = canvases[tileId];
            const offscreenCanvas = canvas.transferControlToOffscreen()
            message.canvases.push({
                tileId: tileId,
                canvas: offscreenCanvas
            });
            canvasesToTransfer.push(offscreenCanvas);
        });
        this.#imageWorker.postMessage(message, canvasesToTransfer);
    }

    /**
     * @param {Palette} palette
     */
    #updateTileImageWorkerPalette(palette) {
        /** @type {import('./../../worker/tileImageWorker.js').TileImageWorkerSetMessage} */
        const message = {
            messageType: 'set',
            palette: PaletteJsonSerialiser.toSerialisable(palette)
        };
        this.#imageWorker.postMessage(message);
    }

    /**
     * @param {string[]} arrayOfTileIds
     */
    #updateTileImageWorkerTileIds(arrayOfTileIds) {
        /** @type {import('./../../worker/tileImageWorker.js').TileImageWorkerUpdateMessage} */
        const message = {
            messageType: 'update',
            tiles: []
        };
        arrayOfTileIds.forEach((tileId) => {
            const tile = this.#tileSet.getTileById(tileId)
            if (tile) {
                message.tiles.push(TileJsonSerialiser.toSerialisable(tile));
            }
        });
        this.#imageWorker.postMessage(message);
    }

    #selectTile(tileId, scrollIntoView) {
        Object.keys(this.#buttons).forEach((buttonTileId) => {
            const button = this.#buttons[buttonTileId];
            if (tileId === buttonTileId) {
                button.classList.add('selected');
                if (scrollIntoView) {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }
            } else {
                button.classList.remove('selected');
            }
        });
    }


    /**
     * @param {string} command 
     * @param {string} tileId 
     */
    #handleTileListingCommandButtonClicked(command, tileId) {
        const args = this.#createArgs(command);
        args.tileId = tileId;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


    /**
     * @param {string} command
     * @returns {TileListingCommandEventArgs}
     */
    #createArgs(command) {
        return {
            command: command,
            projectId: null
        };
    }


}


/**
 * Tile manager state.
 * @typedef {Object} TileListingState
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {string?} [selectedTileId] - Unique ID of the selected tile.
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 */

/**
 * When a command is issued from the tile manager.
 * @callback TileListingCommandCallback
 * @param {TileListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} TileListingCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} tileId - Unique ID of the tile.
 * @exports
 */
