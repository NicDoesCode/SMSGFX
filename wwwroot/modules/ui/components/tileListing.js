import ComponentBase from "../componentBase.js";
import EventDispatcher from "./../../components/eventDispatcher.js";
import PaintUtil from "./../../util/paintUtil.js";
import TemplateUtil from "./../../util/templateUtil.js";
import TileSet from './../../models/tileSet.js';
import Palette from "./../../models/palette.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileSelect: 'tileSelect'
}

export default class TileListing extends ComponentBase {


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


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;

        this.#dispatcher = new EventDispatcher();
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

        if (typeof state?.tileSet?.getTile === 'function') {
            this.#tileSet = state.tileSet;
            dirty = true;
        }

        if (typeof state?.palette?.getColour === 'function') {
            this.#palette = state.palette;
            dirty = true;
        }

        if (typeof state?.selectedTileId === 'string') {
            this.#selectedTileId = state.selectedTileId;
            selectTile(this.#selectedTileId, this.#element);
        } else if (typeof state?.selectedTileId === 'object' && state.selectedTileId === null) {
            this.#selectedTileId = null;
            selectTile(this.#selectedTileId, this.#element);
        }

        if (dirty && this.#tileSet && this.#palette) {
            this.#refreshCanvases(this.#tileSet, this.#palette);
            this.#displayTiles(this.#tileSet);
        }

        if (state?.updatedTileIds && Array.isArray(state.updatedTileIds)) {
            this.#updateTileImages(state.updatedTileIds);
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
     * @param {TileSet} tileSet
     * @param {Palette} palette
     */
    #refreshCanvases(tileSet, palette) {
        tileSet.getTiles().forEach((tile) => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;

            PaintUtil.drawTile(canvas, tile, palette);

            this.#canvases[tile.tileId] = canvas;
        });
    }

    /**
     * @param {TileSet} tileSet
     */
    #displayTiles(tileSet) {
        const renderList = tileSet.getTiles().map((t) => {
            return {
                tileId: t.tileId
            };
        });

        const dom = document.createElement('div');
        this.renderTemplateToElement(dom, 'item-template', renderList);

        this.#element.querySelectorAll('[data-command]').forEach((button) => {
            button.remove();
        });

        dom.querySelectorAll('[data-command]').forEach((button) => {
            this.#element.appendChild(button);
            const command = button.getAttribute('data-command');
            const tileId = button.getAttribute('data-tile-id');
            if (command && tileId) {
                if (tileId === this.#selectedTileId) {
                    button.classList.add('selected');
                }
                const canvas = this.#canvases[tileId];
                if (canvas) {
                    while (button.hasChildNodes()) button.firstChild.remove();
                    button.appendChild(canvas);
                    button.style.height = `${canvas.getBoundingClientRect().height}px`;
                }
                /** @param {MouseEvent} ev */
                button.onclick = (ev) => {
                    this.#handleTileListingCommandButtonClicked(command, tileId);
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                }
            }
        });

        selectTile(this.#selectedTileId, this.#element);
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

/**
 * @param {string} tileIds - Tile ID to select.
 * @param {HTMLElement} element - HTML element that contains the buttons.
 */
function selectTile(tileId, element) {
    /** @type {HTMLButtonElement} */
    let selectedButton = null;
    element.querySelectorAll(`button[data-command=${commands.tileSelect}][data-tile-id]`).forEach((button) => {
        const thisTileId = button.getAttribute('data-tile-id');
        button.classList.remove('selected');
        if (thisTileId === tileId) {
            button.classList.add('selected');
            selectedButton = button;
        }
    });

    if (selectedButton) {
        selectedButton.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
    }
}
