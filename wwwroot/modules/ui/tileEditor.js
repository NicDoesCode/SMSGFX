import CanvasManager from "../components/canvasManager.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteFactory from "../factory/paletteFactory.js";
import Palette from "../models/palette.js";
import Tile from "../models/tile.js";
import TileSet from "../models/tileSet.js";
import TileEditorContextMenu from "./tileEditorContextMenu.js";

const EVENT_PixelMouseOver = 'EVENT_PixelMouseOver';
const EVENT_PixelMouseDown = 'EVENT_PixelMouseDown';
const EVENT_PixelMouseUp = 'EVENT_PixelMouseUp';
const EVENT_RequestRemoveTile = 'EVENT_RequestRemoveTile';
const EVENT_RequestInsertTileBefore = 'EVENT_RequestInsertTileBefore';
const EVENT_RequestInsertTileAfter = 'EVENT_RequestInsertTileAfter';
const EVENT_RequestCloneTile = 'EVENT_RequestCloneTile';
const EVENT_RequestMoveTileLeft = 'EVENT_RequestMoveTileLeft';
const EVENT_RequestMoveTileRight = 'EVENT_RequestMoveTileRight';
const EVENT_RequestMirrorHorizontal = 'EVENT_RequestMirrorHorizontal';
const EVENT_RequestMirrorVertical = 'EVENT_RequestMirrorVertical';

export default class TileEditor {


    /** @type {HTMLDivElement} */
    #element;
    /** @type {HTMLCanvasElement} */
    #tbCanvas;
    /** @type {TileEditorContextMenu} */
    #tileEditorContextMenu;
    /** @type {Palette} */
    #palette = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {Coordinates} */
    #lastCoords;
    #scale = 1;
    #canvasManager;
    #canvasMouseIsDown = false;
    #displayNative = true;
    #dispatcher;


    /**
     * Initialises a new instance of the tile manager.
     * @param {HTMLElement} element - Element that the tile editor is to be initialised from.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbCanvas = this.#element.querySelector('#tbCanvas');
        this.#canvasManager = new CanvasManager();

        this.#tbCanvas.onmousemove = (e) => this.#handleCanvasMouseMove(e);
        this.#tbCanvas.onmousedown = (e) => this.#handleCanvasMouseDown(e);
        this.#tbCanvas.onmouseup = (e) => this.#handleCanvasMouseUp(e);
        this.#tbCanvas.onmouseleave = (e) => this.#handleCanvasMouseLeave(e);
        this.#tbCanvas.oncontextmenu = (e) => this.#handleCanvasContextMenu(e);

        this.#tileEditorContextMenu = new TileEditorContextMenu(element.querySelector('#tbTileEditorMenu'));
        this.#tileEditorContextMenu.addHandlerRequestRemoveTile((args) => this.#bubbleContextEvent(EVENT_RequestRemoveTile, args));
        this.#tileEditorContextMenu.addHandlerRequestInsertTileBefore((args) => this.#bubbleContextEvent(EVENT_RequestInsertTileBefore, args));
        this.#tileEditorContextMenu.addHandlerRequestInsertTileAfter((args) => this.#bubbleContextEvent(EVENT_RequestInsertTileAfter, args));
        this.#tileEditorContextMenu.addHandlerRequestCloneTile((args) => this.#bubbleContextEvent(EVENT_RequestCloneTile, args));
        this.#tileEditorContextMenu.addHandlerRequestMoveTileLeft((args) => this.#bubbleContextEvent(EVENT_RequestMoveTileLeft, args));
        this.#tileEditorContextMenu.addHandlerRequestMoveTileRight((args) => this.#bubbleContextEvent(EVENT_RequestMoveTileRight, args));
        this.#tileEditorContextMenu.addHandlerRequestMirrorTileHorizontal((args) => this.#bubbleContextEvent(EVENT_RequestMirrorHorizontal, args));
        this.#tileEditorContextMenu.addHandlerRequestMirrorTileVertical((args) => this.#bubbleContextEvent(EVENT_RequestMirrorVertical, args));
    }


    /**
     * Sets the state of the tile editor.
     * @param {TileEditorState} state - State object.
     */
    setState(state) {
        let dirty = false;
        // Change palette?
        const palette = state.palette;
        if (palette && typeof palette.getColour === 'function') {
            this.#canvasManager.invalidateImage();
            this.#palette = palette;
            dirty = true;
        }
        // Changing tile set
        const tileSet = state.tileSet;
        if (tileSet && typeof tileSet.getPixelAt === 'function') {
            this.#canvasManager.invalidateImage();
            this.#tileSet = tileSet;
            dirty = true;
        }
        // Changing scale?
        if (typeof state.scale === 'number') {
            const scale = state.scale;
            if (scale > 0 && scale <= 50 && scale !== this.#scale) {
                this.#scale = state.scale;
                this.#canvasManager.invalidateImage();
                dirty = true;
            } else {
                throw new Error('Scale must be between 1 and 50.');
            }
        }
        // Display native?
        if (typeof state.displayNative === 'boolean') {
            this.#displayNative = state.displayNative;
            dirty = true;
        }
        // Selected tile index?
        if (typeof state.selectedTileIndex === 'number') {
            this.#canvasManager.selectedTileIndex = state.selectedTileIndex;
            dirty = true;
        }
        // Refresh image?
        if (dirty && this.#palette && this.#tileSet) {
            let palette = !this.#displayNative ? this.#palette : PaletteFactory.convertToNative(this.#palette);
            this.#canvasManager.palette = palette;
            this.#canvasManager.tileSet = this.#tileSet;
            this.#canvasManager.scale = this.#scale;
            if (this.#lastCoords) {
                this.#canvasManager.drawUI(this.#tbCanvas, this.#lastCoords.x, this.#lastCoords.y);
            } else {
                this.#canvasManager.drawUI(this.#tbCanvas, 0, 0);
            }
        }
    }


    /**
     * Mouse moves over a tile set pixel.
     * @param {TileEditorPixelCallback} callback - Callback function.
     */
    addHandlerPixelMouseOver(callback) {
        this.#dispatcher.on(EVENT_PixelMouseOver, callback);
    }

    /**
     * Mouse clicks on a tile set pixel.
     * @param {TileEditorPixelCallback} callback - Callback function.
     */
    addHandlerPixelMouseDown(callback) {
        this.#dispatcher.on(EVENT_PixelMouseDown, callback);
    }

    /**
     * Mouse clicks on a tile set pixel.
     * @param {TileEditorPixelCallback} callback - Callback function.
     */
    addHandlerPixelMouseUp(callback) {
        this.#dispatcher.on(EVENT_PixelMouseUp, callback);
    }

    /**
     * Request to remove a tile from a tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestRemoveTile(callback) {
        this.#dispatcher.on(EVENT_RequestRemoveTile, callback);
    }

    /**
     * Request to insert a tile before another in a tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestInsertTileBefore(callback) {
        this.#dispatcher.on(EVENT_RequestInsertTileBefore, callback);
    }

    /**
     * Request to insert a tile before another in a tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestInsertTileAfter(callback) {
        this.#dispatcher.on(EVENT_RequestInsertTileAfter, callback);
    }

    /**
     * Request to clone a tile in a tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestCloneTile(callback) {
        this.#dispatcher.on(EVENT_RequestCloneTile, callback);
    }

    /**
     * Request to swap the position with the tile to the right in the tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestMoveTileLeft(callback) {
        this.#dispatcher.on(EVENT_RequestMoveTileLeft, callback);
    }

    /**
     * Request to swap the position with the tile to the left in the tile set.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestMoveTileRight(callback) {
        this.#dispatcher.on(EVENT_RequestMoveTileRight, callback);
    }

    /**
     * Request to horizontally mirror the tile.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestMirrorTileHorizontal(callback) {
        this.#dispatcher.on(EVENT_RequestMirrorHorizontal, callback);
    }

    /**
     * Request to vertically mirror the tile.
     * @param {TileEditorTileCallback} callback - Callback function.
     */
    addHandlerRequestMirrorTileVertical(callback) {
        this.#dispatcher.on(EVENT_RequestMirrorVertical, callback);
    }


    /** @param {MouseEvent} event */
    #handleCanvasMouseMove(event) {
        if (this.#tileSet) {
            const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(event.clientX, event.clientY);
            const lastCoords = this.#lastCoords;
            if (!lastCoords || lastCoords.x !== coords.x || lastCoords.y !== coords.y) {
                /** @type {TileEditorPixelEventArgs} */
                const args = { x: coords.x, y: coords.y, mouseIsDown: this.#canvasMouseIsDown };
                this.#dispatcher.dispatch(EVENT_PixelMouseOver, args);
                this.#lastCoords = coords;
                if (this.#canvasManager.canDraw) {
                    this.#canvasManager.drawUI(this.#tbCanvas, coords.x, coords.y);
                }
            }
        }
    }

    /** @param {MouseEvent} event */
    #handleCanvasMouseDown(event) {
        if (event.button === 0) {
            this.#canvasMouseIsDown = true;
            const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(event.clientX, event.clientY);
            /** @type {TileEditorPixelEventArgs} */
            const args = { x: coords.x, y: coords.y, mouseIsDown: this.#canvasMouseIsDown };
            this.#dispatcher.dispatch(EVENT_PixelMouseDown, args);
        }
    }

    /** @param {MouseEvent} event */
    #handleCanvasMouseUp(event) {
        this.#canvasMouseIsDown = false;
        const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(event.clientX, event.clientY);
        /** @type {TileEditorPixelEventArgs} */
        const args = { x: coords.x, y: coords.y, mouseIsDown: this.#canvasMouseIsDown };
        this.#dispatcher.dispatch(EVENT_PixelMouseUp, args);
    }

    /** @param {MouseEvent} event */
    #handleCanvasMouseLeave(event) {
        this.#canvasMouseIsDown = false;
        /** @type {TileEditorPixelEventArgs} */
        const args = { x: 0, y: 0, mouseIsDown: this.#canvasMouseIsDown };
        if (this.#lastCoords) {
            args.x = this.#lastCoords.x;
            args.y = this.#lastCoords.y;
        }
        this.#dispatcher.dispatch(EVENT_PixelMouseUp, args);
        this.#lastCoords = null;
    }

    /** @param {MouseEvent} event */
    #handleCanvasContextMenu(event) {
        const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(event.clientX, event.clientY);
        this.#tileEditorContextMenu.show(event.clientX, event.clientY, coords.x, coords.y);
        return false;
    }

    /** 
     * @param {string} string 
     * @param {import('./tileEditorContextMenu').TileEditorContextMenuPixelEventArgs} args 
     * */
    #bubbleContextEvent(eventName, args) {
        // Get the tile index
        const tile = this.#tileSet.getTileByCoordinate(args.x, args.y);
        const tileIndex = this.#tileSet.getTileIndex(tile);

        /** @type {TileEditorTileEventArgs} */
        const tileArgs = { tileIndex: tileIndex };

        this.#dispatcher.dispatch(eventName, tileArgs);
    }


    /**
     * Converts a mouse position within the application viewport to the corresponding tile set x/y.
     * @param {number} mouseClientX - Mouse horizontal coordinate within the application's viewport.
     * @param {number} mouseClientY - Mouse vertical coordinate within the application's viewport.
     * @returns {Coordinates}
     */
    #convertMouseClientCoordsToTileSetPixelCoords(mouseClientX, mouseClientY) {
        const rect = this.#tbCanvas.getBoundingClientRect();
        const canvasX = mouseClientX - rect.left;
        const canvasY = mouseClientY - rect.top;
        const scale = this.#canvasManager.scale;
        const imageX = Math.floor(canvasX / scale);
        const imageY = Math.floor(canvasY / scale);
        return { x: imageX, y: imageY };
    }


}


/**
 * @typedef {object} TileEditorState
 * @property {TileSet?} tileSet - Tile set that will be drawn, passing this will trigger a redraw.
 * @property {Palette?} palette - Palette to use for drawing, passing this will trigger a redraw.
 * @property {number?} scale - Current scale level.
 * @property {boolean?} displayNative - Should the tile editor display native colours?
 * @property {number?} selectedTileIndex - Currently selected tile index.
 * @exports 
 */

/**
 * @typedef {object} Coordinates
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @exports
 */

/**
 * Tile editor pixel callback.
 * @callback TileEditorPixelCallback
 * @param {TileEditorPixelEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorPixelEventArgs
 * @property {number} x - X tile map pixel thats selected.
 * @property {number} y - Y tile map pixel thats selected.
 * @property {boolean} mouseIsDown - True when the mouse is down, otherwise false.
 * @exports
 */

/**
 * Tile editor tile callback.
 * @callback TileEditorTileCallback
 * @param {TileEditorTileEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorTileEventArgs
 * @property {number} tileIndex - Index of the tile witin the tile map.
 * @exports 
 */
