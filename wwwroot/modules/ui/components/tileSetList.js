import EventDispatcher from "./../../components/eventDispatcher.js";
import PaintUtil from "./../../util/paintUtil.js";
import TemplateUtil from "./../../util/templateUtil.js";
import TileSet from './../../models/tileSet.js';
import Palette from "./../../models/palette.js";

const EVENT_OnCommand = 'EVENT_OnCommand';

const commands = {
    tileSelect: 'tileSelect'
}

export default class TileSetList {


    static get Commands() {
        return commands;
    }


    /** @type {HTMLDivElement} */
    #element;
    /** @type {EventDispatcher} */
    #dispatcher;
    #tileSetListTemplate;
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
        this.#element = element;

        this.#dispatcher = new EventDispatcher();

        // Compile handlebars template
        const templateElement = this.#element.querySelector('[data-smsgfx-id=tile-set-list-template]');
        const source = templateElement.innerHTML;
        templateElement.remove();
        this.#tileSetListTemplate = Handlebars.compile(source);
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileSetList>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('components/tileSetList', element);
        return new TileSetList(componentElement);
    }


    /**
     * Sets the state of the object.
     * @param {TileSetListState} state - State to set.
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
            dirty = true;
        } else if (typeof state?.selectedTileId === 'object' && state.selectedTileId === null) {
            this.#selectedTileId = null;
            dirty = true;
        }

        if (dirty && this.#tileSet && this.#palette) {
            this.#refreshCanvases(this.#tileSet, this.#palette);
            this.#displayTiles(this.#tileSet);
        }
    }


    /**
     * Registers a handler for a command.
     * @param {TileSetListCommandCallback} callback - Callback that will receive the command.
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
        const html = this.#tileSetListTemplate(renderList);
        const dom = document.createElement('div');
        dom.innerHTML = html;

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
                    this.#handleTileSetListCommandButtonClicked(command, tileId);
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                }
            }
        });
    }


    /**
     * @param {string} command 
     * @param {string} tileId 
     */
    #handleTileSetListCommandButtonClicked(command, tileId) {
        const args = this.#createArgs(command);
        args.tileId = tileId;
        this.#dispatcher.dispatch(EVENT_OnCommand, args);
    }


    /**
     * @param {string} command
     * @returns {TileSetListCommandEventArgs}
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
 * @typedef {object} TileSetListState
 * @property {TileSet?} [tileSet] - Tile set to be displayed.
 * @property {Palette?} [palette] - Palette to use to render the tiles.
 * @property {string?} [selectedTileId] - Unique ID of the selected tile.
 */

/**
 * When a command is issued from the tile manager.
 * @callback TileSetListCommandCallback
 * @param {TileSetListCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileSetListCommandEventArgs
 * @property {string} command - The command being invoked.
 * @property {string} tileId - Unique ID of the tile.
 * @exports
 */
