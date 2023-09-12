import ComponentBase from "../componentBase.js";
import EventDispatcher from "./../../components/eventDispatcher.js";
import PaintUtil from "./../../util/paintUtil.js";
import TemplateUtil from "./../../util/templateUtil.js";
import TileSet from './../../models/tileSet.js';
import Palette from "./../../models/palette.js";
import TileImageManager from "../../components/tileImageManager.js";


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
    /** @type {TileImageManager} */
    #tileImageManager;
    /** @type {Object.<string, HTMLButtonElement>} */
    #buttons = {};


    /**
     * Constructor for the class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        this.#tileImageManager = new TileImageManager();
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
        let dirty = false;

        if (state?.tileSet instanceof TileSet) {
            this.#tileSet = state.tileSet;
            dirty = true;
        }

        if (state?.palette instanceof Palette) {
            this.#palette = state.palette;
            dirty = true;
        }

        if (state?.updatedTileIds && Array.isArray(state.updatedTileIds)) {
            // If any of the updated tile IDs don't have images, then we should refresh everything
            state.updatedTileIds.forEach((tileId) => {
                if (!this.#buttons[tileId]) dirty = true;
            });
            // Otherwise we can get away with simply updating the affected tiles
            if (!dirty) {
                this.#updateTileImages(state.updatedTileIds);
            }
        }

        if (dirty && this.#tileSet && this.#palette) {
            this.#refreshCanvases(this.#tileSet, this.#palette);
            this.#displayTiles(this.#tileSet);
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


    /**
     * Sets or clears the tile image manager.
     * @param {TileImageManager?} tileImageManager - Tile image manager to set.
     */
    setTileImageManager(tileImageManager) {
        if (tileImageManager && tileImageManager instanceof TileImageManager) {
            this.#tileImageManager = tileImageManager;
        } else {
            this.#tileImageManager = new TileImageManager();
        }
    }


    /**
     * @param {TileSet} tileSet
     * @param {Palette} palette
     */
    #refreshCanvases(tileSet, palette) {
        tileSet.getTiles().forEach((tile) => {
            let canvas = this.#canvases[tile.tileId];
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                this.#canvases[tile.tileId] = canvas;
            }

            const context = canvas.getContext('2d');
            context.imageSmoothingEnabled = false;

            const tileCanvas = this.#tileImageManager.getTileImage(tile, palette, []);
            context.drawImage(tileCanvas, 0, 0, 32, 32);
        });
    }

    /**
     * @param {TileSet} tileSet
     */
    #displayTiles(tileSet) {
        this.#ensureButtons(tileSet);
        this.#element.innerHTML = '';
        tileSet.getTiles().forEach((tile) => {
            const button = this.#buttons[tile.tileId];
            if (this.#selectedTileId && this.#selectedTileId === tile.tileId) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
            this.#element.appendChild(button);
        });
    }

    /**
     * @param {TileSet} tileSet
     */
    #ensureButtons(tileSet) {
        tileSet.getTiles().forEach((tile) => {
            if (!this.#buttons[tile.tileId]) {

                const button = document.createElement('button');
                button.setAttribute('data-command', commands.tileSelect);
                button.setAttribute('data-tile-id', tile.tileId);
                button.classList.add('btn', 'btn-secondary');

                const canvas = this.#canvases[tile.tileId];
                if (canvas) {
                    button.appendChild(canvas);
                    button.style.width = `${canvas.width}px`;
                    button.style.height = `${canvas.height}px`;
                }
                button.addEventListener('click', (ev) => {
                    this.#handleTileListingCommandButtonClicked(commands.tileSelect, tile.tileId);
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                });

                this.#buttons[tile.tileId] = button;
            }
        });
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

    /**
     * @param {string[]} updateTileIds - Array of tile IDs to be updated.
     */
    #updateTileImages(updateTileIds) {
        if (!this.#tileSet) return;
        updateTileIds.forEach((tileId) => {
            const canvas = this.#canvases[tileId];
            const tile = this.#tileSet.getTileById(tileId);
            const palette = this.#palette;
            if (canvas && tile && palette) {
                PaintUtil.drawTile(canvas, tile, palette);
            }
        });
    }


}


/**
 * Tile manager state.
 * @typedef {object} TileListingState
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {string?} [selectedTileId] - Unique ID of the selected tile.
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 * @property {TileImageManager?} [tileImageManager] - Tile image manager to use for rendering tiles.
 */

/**
 * When a command is issued from the tile manager.
 * @callback TileListingCommandCallback
 * @param {TileListingCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileListingCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} tileId - Unique ID of the tile.
 * @exports
 */
