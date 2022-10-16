import EventDispatcher from "../components/eventDispatcher.js";

const EVENT_RequestRemoveTile = 'EVENT_RequestRemoveTile';
const EVENT_RequestInsertTileBefore = 'EVENT_RequestInsertTileBefore';
const EVENT_RequestInsertTileAfter = 'EVENT_RequestInsertTileAfter';

export default class TileEditorContextMenu {


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLButtonElement} */
    #btnTileEditorMenu;
    /** @type {EventDispatcher} */
    #dispatcher;


    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#btnTileEditorMenu = element.querySelector('#btnTileEditorMenu');
        this.#element.querySelector('button[data-command=remove]').onclick = (event) => this.#handleTileContext(event);
        this.#element.querySelector('button[data-command=insert-before]').onclick = (event) => this.#handleTileContext(event);
        this.#element.querySelector('button[data-command=insert-after]').onclick = (event) => this.#handleTileContext(event);
    }


    /**
     * Shows the context menu.
     * @param {number} clientX - X coordinate relative to the client viewport.
     * @param {number} clientY - Y coordinate relative to the client viewport.
     * @param {number} tileSetX - Corresponding X pixel in the tile set.
     * @param {number} tileSetY - Corresponding Y pixel in the tile set.
     * @returns {boolean}
     */
    show(clientX, clientY, tileSetX, tileSetY) {
        // Record related pixel
        /** @type {TileEditorContextMenuPixelEventArgs} */
        const args = { x: tileSetX, y: tileSetY };
        this.#btnTileEditorMenu.setAttribute('data-tile-set-coords', JSON.stringify(args));

        // Position menu to mouse pointer
        const rect = this.#element.getBoundingClientRect();
        this.#btnTileEditorMenu.style.top = `${(clientY - rect.top - 5)}px`;
        this.#btnTileEditorMenu.style.left = `${(clientX - rect.left - 5)}px`;

        // Launch menu
        this.#btnTileEditorMenu.click();

        // Prevent default action of Boostrap context menu.
        return false;
    }


    /**
     * Request to remove a tile from a tile set.
     * @param {TileEditorContextMenuPixelCallback} callback - Callback function.
     */
    addHandlerRequestRemoveTile(callback) {
        this.#dispatcher.on(EVENT_RequestRemoveTile, callback);
    }

    /**
     * Request to insert a tile before another in a tile set.
     * @param {TileEditorContextMenuPixelCallback} callback - Callback function.
     */
    addHandlerRequestInsertTileBefore(callback) {
        this.#dispatcher.on(EVENT_RequestInsertTileBefore, callback);
    }

    /**
     * Request to insert a tile before another in a tile set.
     * @param {TileEditorContextMenuPixelCallback} callback - Callback function.
     */
    addHandlerRequestInsertTileAfter(callback) {
        this.#dispatcher.on(EVENT_RequestInsertTileAfter, callback);
    }


    /**
     * @param {MouseEvent} event 
     */
    #handleTileContext(event) {
        // Extract the coordinates from the element
        /** @type {TileEditorContextMenuPixelEventArgs} */
        const args = JSON.parse(this.#btnTileEditorMenu.getAttribute('data-tile-set-coords'));

        // Get the command and act on it
        const command = event.target.getAttribute('data-command');
        if (command === 'remove') {
            this.#dispatcher.dispatch(EVENT_RequestRemoveTile, args);
        } else if (command === 'insert-before') {
            this.#dispatcher.dispatch(EVENT_RequestInsertTileBefore, args);
        } else if (command === 'insert-after') {
            this.#dispatcher.dispatch(EVENT_RequestInsertTileAfter, args);
        }
    }


}


/**
 * Tile editor context menu callback.
 * @callback TileEditorContextMenuPixelCallback
 * @param {TileEditorContextMenuPixelEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorContextMenuPixelEventArgs
 * @property {number} x - X tile map pixel.
 * @property {number} y - Y tile map pixel.
 * @exports
 */

