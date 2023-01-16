import CanvasManager from "../components/canvasManager.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteFactory from "../factory/paletteFactory.js";
import Palette from "../models/palette.js";
import ReferenceImage from "../models/referenceImage.js";
import TileSet from "../models/tileSet.js";
import TileEditorContextMenu from "./tileEditorContextMenu.js";
import TemplateUtil from "../util/templateUtil.js";

const EVENT_OnCommand = 'EVENT_OnCommand';
const EVENT_OnEvent = 'EVENT_OnEvent';

const commands = {
    clone: 'clone', remove: 'remove',
    moveLeft: 'moveLeft', moveRight: 'moveRight',
    mirrorHorizontal: 'mirrorHorizontal', mirrorVertical: 'mirrorVertical',
    insertBefore: 'insertBefore', insertAfter: 'insertAfter',
    selectTile: 'selectTile',
    zoomIn: 'zoomIn', zoomOut: 'zoomOut'
}

const events = {
    pixelMouseOver: 'pixelMouseOver',
    pixelMouseDown: 'pixelMouseDown',
    pixelMouseUp: 'pixelMouseUp'
}

export default class TileEditor {


    static get Commands() {
        return commands;
    }

    static get Events() {
        return events;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {HTMLCanvasElement} */
    #tbCanvas;
    /** @type {TileEditorContextMenu} */
    #tileEditorContextMenu;
    /** @type {Palette} */
    #palette = null;
    /** @type {Palette} */
    #nativePalette = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {Coordinates} */
    #lastCoords;
    #scale = 1;
    #canvasManager;
    #panCanvasOnMouseMove = false;
    #canvasMouseLeftDown = false;
    #canvasMouseMiddleDown = false;
    #canvasMouseRightDown = false;
    #displayNative = true;
    #dispatcher;
    #enabled = true;


    /**
     * Initialises a new instance of this class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbCanvas = this.#element.querySelector('[data-sms-id=tile-editor-canvas]');
        this.#canvasManager = new CanvasManager();
        this.#canvasManager.backgroundColour = window.getComputedStyle(this.#element).backgroundColor;

        document.addEventListener('mousedown', (ev) => this.#handleCanvasMouseDown(ev));
        document.addEventListener('mouseup', (ev) => this.#handleCanvasMouseUp(ev));
        document.addEventListener('mousemove', (ev) => this.#handleCanvasMouseMove(ev));
        this.#tbCanvas.addEventListener('mouseleave', (ev) => this.#handleCanvasMouseLeave(ev));
        this.#tbCanvas.addEventListener('contextmenu', (ev) => this.#handleCanvasContextMenu(ev));
        this.#tbCanvas.addEventListener('wheel', (ev) => this.#handleCanvasMouseWheel(ev));

        const canvasObserver = new ResizeObserver((entries) => {
            if (this.#enabled && this.#canvasManager.canDraw) {
                this.#canvasManager.drawUI(this.#tbCanvas);
            }
        });
        canvasObserver.observe(this.#tbCanvas);

        TileEditorContextMenu.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-editor-context-menu]'))
            .then((obj) => {
                this.#tileEditorContextMenu = obj
                this.#tileEditorContextMenu.addHandlerOnCommand((args) => this.#bubbleCommand(args));
            });
    }


    /**
     * Creates an instance of the object inside a container element.
     * @param {HTMLElement} element - Container element.
     * @returns {Promise<TileEditor>}
     */
    static async loadIntoAsync(element) {
        const componentElement = await TemplateUtil.replaceElementWithComponentAsync('tileEditor', element);
        return new TileEditor(componentElement);
    }


    /**
     * Sets the state of the tile editor.
     * @param {TileEditorState} state - State object.
     */
    setState(state) {
        let dirty = false;
        // Change palette?
        const palette = state?.palette;
        if (palette && typeof palette.getColour === 'function') {
            this.#canvasManager.invalidateImage();
            this.#palette = palette;
            this.#nativePalette = PaletteFactory.convertToNative(this.#palette);
            dirty = true;
        }
        // Changing tile set
        const tileSet = state?.tileSet;
        if (tileSet && typeof tileSet.getPixelAt === 'function') {
            this.#canvasManager.invalidateImage();
            this.#tileSet = tileSet;
            dirty = true;
        }
        // Updated tiles
        if (state?.updatedTiles && Array.isArray(state?.updatedTiles)) {
            const updatedTiles = state.updatedTiles;
            updatedTiles.forEach((tileIndex) => {
                this.#canvasManager.invalidateTile(tileIndex);
            });
            dirty = true;
        }
        // Changing scale?
        if (typeof state?.scale === 'number') {
            const scale = state.scale;
            if (scale > 0 && scale <= 50) {
                this.#scale = state.scale;
                this.#canvasManager.invalidateImage();
                dirty = true;
            } else {
                throw new Error('Scale must be between 1 and 50.');
            }
        }
        // Display native?
        if (typeof state?.displayNative === 'boolean') {
            this.#displayNative = state.displayNative;
            dirty = true;
        }
        // Draw tile grid
        if (['boolean', 'number'].includes(typeof state?.showTileGrid)) {
            this.#canvasManager.showTileGrid = state?.showTileGrid;
            dirty = true;
        }
        // Draw pixel grid
        if (['boolean', 'number'].includes(typeof state?.showPixelGrid)) {
            this.#canvasManager.showPixelGrid = state?.showPixelGrid;
            dirty = true;
        }
        // Selected tile index?
        if (typeof state?.selectedTileIndex === 'number') {
            this.#canvasManager.selectedTileIndex = state.selectedTileIndex;
            dirty = true;
        }
        // Cursor size
        if (typeof state?.cursorSize === 'number') {
            if (state.cursorSize > 0 && state.cursorSize <= 50) {
                this.#canvasManager.cursorSize = state.cursorSize;
            }
        }
        // Cursor type
        if (typeof state?.cursor === 'string') {
            this.#tbCanvas.style.cursor = state.cursor;
        }
        // Reference image
        if (state.referenceImage) {
            this.#canvasManager.clearReferenceImages();
            this.#canvasManager.addReferenceImage(state.referenceImage);
            this.#canvasManager.invalidateImage();
            dirty = true;
        }
        // Transparency index
        if (typeof state?.transparencyIndex === 'number') {
            this.#canvasManager.transparencyIndex = state.transparencyIndex;
            this.#canvasManager.invalidateImage();
            dirty = true;
        }
        // Refresh image?
        if (dirty && this.#palette && this.#tileSet) {
            let palette = !this.#displayNative ? this.#palette : this.#nativePalette;
            if (this.#canvasManager.palette !== palette) {
                this.#canvasManager.palette = palette;
            }
            if (this.#canvasManager.tileSet !== this.#tileSet) {
                this.#canvasManager.tileSet = this.#tileSet;
            }
            if (this.#canvasManager.scale !== this.#scale) {
                this.#canvasManager.scale = this.#scale;
            }
            if (this.#lastCoords) {
                this.#canvasManager.drawUI(this.#tbCanvas, this.#lastCoords.x, this.#lastCoords.y);
            } else {
                this.#canvasManager.drawUI(this.#tbCanvas, 0, 0);
            }
        }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
        }

        if (typeof state?.focusedTile === 'number') {
            this.#focusTile(state?.focusedTile);
        }
    }

    /**
     * Returns a bitmap that represents the tile set as a PNG data URL.
     */
    toDataUrl() {
        return this.#canvasManager.toDataURL();
    }


    /**
     * Register a callback function for when a command is invoked.
     * @param {TileEditorEventCallback} callback - Callback that will receive the command.
     */
    addHandlerOnCommand(callback) {
        this.#dispatcher.on(EVENT_OnCommand, callback);
    }

    /**
     * Register a callback function for when an event occurs.
     * @param {TileEditorEventCallback} callback - Callback for when the event occurs.
     */
    addHandlerOnEvent(callback) {
        this.#dispatcher.on(EVENT_OnEvent, callback);
    }


    /** @param {MouseEvent} ev */
    #handleCanvasMouseMove(ev) {

        console.log('mouse move', ev.buttons);

        if (this.#enabled && this.#tileSet) {
            if (ev.target === this.#tbCanvas) {
                const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(ev.clientX, ev.clientY);
                if (coords) {
                    const lastCoords = this.#lastCoords;
                    if (!lastCoords || lastCoords.x !== coords.x || lastCoords.y !== coords.y) {
                        /** @type {TileEditorEventArgs} */
                        const args = {
                            event: events.pixelMouseOver,
                            x: coords.x, y: coords.y,
                            mousePrimaryIsDown: this.#canvasMouseLeftDown,
                            isPrimaryButton: ev.button === 0,
                            isSecondaryButton: ev.button === 2,
                            isAuxButton: ev.button === 1,
                            ctrlKeyPressed: ev.ctrlKey
                        };
                        this.#dispatcher.dispatch(EVENT_OnEvent, args);
                        this.#lastCoords = coords;
                        if (this.#canvasManager.canDraw) {
                            this.#canvasManager.drawUI(this.#tbCanvas, coords.x, coords.y);
                        }
                    }
                }
            }
            if (this.#panCanvasOnMouseMove)
                this.panCanvas(ev.movementX, ev.movementY);
        }
    }

    /** @param {MouseEvent} ev */
    #handleCanvasMouseDown(ev) {
        if (!this.#enabled) return;

        if (ev.target === this.#tbCanvas) {
            if (ev.button === 0) {
                this.#canvasMouseLeftDown = true;
            } else if (ev.button === 1) {
                this.#canvasMouseMiddleDown = true;
                this.#panCanvasOnMouseMove = true;
            } else if (ev.button === 2) {
                this.#canvasMouseRightDown = true;
            }
        }

        const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(ev.clientX, ev.clientY);
        if (coords) {
            /** @type {TileEditorEventArgs} */
            const args = {
                event: events.pixelMouseDown,
                x: coords.x, y: coords.y,
                mousePrimaryIsDown: this.#canvasMouseLeftDown,
                mouseSecondaryIsDown: this.#canvasMouseRightDown,
                mouseAuxIsDown: this.#canvasMouseMiddleDown,
                isPrimaryButton: ev.button === 0,
                isSecondaryButton: ev.button === 2,
                isAuxButton: ev.button === 1,
                ctrlKeyPressed: ev.ctrlKey
            };
            this.#dispatcher.dispatch(EVENT_OnEvent, args);
        }
    }

    /** @param {MouseEvent} ev */
    #handleCanvasMouseUp(ev) {
        this.#panCanvasOnMouseMove = false;

        if (!this.#enabled) return;

        if (ev.button === 0) {
            this.#canvasMouseLeftDown = false;
        } else if (ev.button === 1) {
            this.#canvasMouseMiddleDown = false;
        } else if (ev.button === 2) {
            this.#canvasMouseRightDown = false;
        }

        const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(ev.clientX, ev.clientY);
        if (coords) {
            /** @type {TileEditorEventArgs} */
            const args = {
                event: events.pixelMouseUp,
                x: coords.x, y: coords.y,
                mousePrimaryIsDown: this.#canvasMouseLeftDown,
                mouseSecondaryIsDown: this.#canvasMouseRightDown,
                mouseAuxIsDown: this.#canvasMouseMiddleDown,
                isPrimaryButton: ev.button === 0,
                isSecondaryButton: ev.button === 2,
                isAuxButton: ev.button === 1,
                ctrlKeyPressed: ev.ctrlKey
            };
            this.#dispatcher.dispatch(EVENT_OnEvent, args);
        }
    }

    /** @param {MouseEvent} ev */
    #handleCanvasMouseLeave(ev) {
        if (!this.#enabled) return;

        /** @type {TileEditorEventArgs} */
        const args = {
            event: events.pixelMouseUp,
            x: 0, y: 0,
            mousePrimaryIsDown: this.#canvasMouseLeftDown,
            mouseSecondaryIsDown: this.#canvasMouseRightDown,
            mouseAuxIsDown: this.#canvasMouseMiddleDown,
            isPrimaryButton: this.#canvasMouseLeftDown,
            isSecondaryButton: this.#canvasMouseRightDown,
            isAuxButton: this.#canvasMouseMiddleDown,
            ctrlKeyPressed: ev.ctrlKey
        };
        if (this.#lastCoords) {
            args.x = this.#lastCoords.x;
            args.y = this.#lastCoords.y;
        }
        this.#dispatcher.dispatch(EVENT_OnEvent, args);

        this.#canvasMouseLeftDown = false;
        this.#canvasMouseMiddleDown = false;
        this.#canvasMouseRightDown = false;
        this.#lastCoords = null;
    }

    /** @param {MouseEvent} ev */
    #handleCanvasContextMenu(ev) {
        if (!this.#enabled) return;

        const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(ev.clientX, ev.clientY);
        if (coords) {
            // Get the tile index
            const tile = this.#tileSet.getTileByCoordinate(coords.x, coords.y);
            const tileIndex = this.#tileSet.getTileIndex(tile);

            /** @type {TileEditorCommandEventArgs} */
            const tileArgs = {
                command: commands.selectTile,
                tileIndex: tileIndex
            };
            this.#dispatcher.dispatch(EVENT_OnCommand, tileArgs);

            this.#tileEditorContextMenu.show(ev.clientX, ev.clientY, coords.x, coords.y);

            ev.preventDefault();
        }
        return false;
    }

    /** @param {WheelEvent} ev */
    #handleCanvasMouseWheel(ev) {
        if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey) {
            ev.stopImmediatePropagation();
            ev.preventDefault();

            /** @type {TileEditorCommandEventArgs} */
            const args = {};

            // Get the tile index
            const coords = this.#convertMouseClientCoordsToTileSetPixelCoords(ev.clientX, ev.clientY);
            if (coords) {
                const tile = this.#tileSet.getTileByCoordinate(coords.x, coords.y);
                args.tileIndex = this.#tileSet.getTileIndex(tile);

                if (ev.deltaY > 0) {
                    args.command = commands.zoomIn;
                } else {
                    args.command = commands.zoomOut;
                }

                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
            return false;
        } else {
            console.log(`Scroll, ctrl:${ev.ctrlKey}, x:${ev.deltaX}, y:${ev.deltaY}, z:${ev.deltaZ}`); // TMP 
            const speeds = [0, 5, 10, 15, 20, 25];
            if (ev.deltaX !== 0) {
                // this.#canvasManager.offsetX += ev.deltaX > 0 ? -25 : 25;
                this.#canvasManager.offsetX -= ev.deltaX * 5;
            }
            if (ev.deltaY !== 0) {
                // this.#canvasManager.offsetY += ev.deltaY > 0 ? -25 : 25;
                this.#canvasManager.offsetY -= ev.deltaY * 5;
            }
            ev.preventDefault();
            this.#canvasManager.drawUI(this.#tbCanvas);
            return false;
        }
    }

    /** 
     * @param {string} string 
     * @param {import('./tileEditorContextMenu').TileEditorContextMenuCommandEventArgs} args 
     * */
    #bubbleCommand(args) {
        // Get the tile index
        const tile = this.#tileSet.getTileByCoordinate(args.x, args.y);
        const tileIndex = this.#tileSet.getTileIndex(tile);

        /** @type {TileEditorCommandEventArgs} */
        const tileArgs = {
            command: args.command,
            tileIndex: tileIndex
        };
        this.#dispatcher.dispatch(EVENT_OnCommand, tileArgs);
    }


    /**
     * Pans the canvas.
     * @param {number} amountX - Movement of the mouse on the X axis.
     * @param {number} amountY - Movement of the mouse on the Y axis.
     */
    panCanvas(amountX, amountY) {
        this.#canvasManager.offsetX += amountX;
        this.#canvasManager.offsetY += amountY;
        if (this.#canvasManager.canDraw) {
            this.#canvasManager.drawUI(this.#tbCanvas);
        }
    }


    /**
     * Converts a mouse position within the application viewport to the corresponding tile set x/y.
     * @param {number} mouseClientX - Mouse horizontal coordinate within the application's viewport.
     * @param {number} mouseClientY - Mouse vertical coordinate within the application's viewport.
     * @returns {Coordinates|null}
     */
    #convertMouseClientCoordsToTileSetPixelCoords(mouseClientX, mouseClientY) {
        const rect = this.#tbCanvas.getBoundingClientRect();
        const canvMgr = this.#canvasManager;
        const canvasX = canvMgr.resolveMouseX(this.#tbCanvas, mouseClientX - rect.left);
        const canvasY = canvMgr.resolveMouseY(this.#tbCanvas, mouseClientY - rect.top);
        if (canvasX !== null && canvasY !== null) {
            const scale = this.#canvasManager.scale;
            const imageX = Math.floor(canvasX / scale);
            const imageY = Math.floor(canvasY / scale);
            return { x: imageX, y: imageY };
        } else {
            return null;
        }
    }

    #focusTile(index) {
        const col = index % this.#tileSet.tileWidth;
        const row = Math.floor(index / this.#tileSet.tileWidth);
        const pxPerTile = this.#canvasManager.scale * 8;
        const tileX = (col * pxPerTile) + (this.#canvasManager.scale / 2);
        const tileY = (row * pxPerTile) + (this.#canvasManager.scale / 2);
        // const rect = this.#canvasContainer.getBoundingClientRect();
        // this.#canvasContainer.scrollLeft = Math.max(tileX - (rect.width / 2), 0);
        // this.#canvasContainer.scrollTop = Math.max(tileY - (rect.height / 2), 0);
    }


}


/**
 * @typedef {object} TileEditorState
 * @property {TileSet?} tileSet - Tile set that will be drawn, passing this will trigger a redraw.
 * @property {Palette?} palette - Palette to use for drawing, passing this will trigger a redraw.
 * @property {number?} scale - Current scale level.
 * @property {boolean?} displayNative - Should the tile editor display native colours?
 * @property {number?} selectedTileIndex - Currently selected tile index.
 * @property {number?} cursorSize - Size of the cursor in px.
 * @property {string?} cursor - Cursor to use when the mouse hovers over the image editor.
 * @property {ReferenceImage?} referenceImage - Reference image to draw.
 * @property {number?} transparencyIndex - 0 to 15 of which colour index to make transparent.
 * @property {boolean?} showTileGrid - Should the tile grid be drawn?
 * @property {boolean?} showPixelGrid - Should the pixel grid be drawn?
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {number?} focusedTile - Will ensure that this tile is shown on the screen.
 * @property {number[]?} updatedTiles - When passing updated tiles, the entire image will not be updated and instead only these tiles will be updated.
 * @exports 
 */

/**
 * @typedef {object} Coordinates
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @exports
 */

/**
 * Callback for when a command is invoked.
 * @callback TileEditorCommandCallback
 * @param {TileEditorCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorCommandEventArgs
 * @property {string} command - Command being invoked.
 * @property {number} tileIndex - Index of the tile witin the tile map.
 * @exports
 */

/**
 * Callback for when an event occurs.
 * @callback TileEditorEventCallback
 * @param {TileEditorEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {object} TileEditorEventArgs
 * @property {string} event - Event that occurred.
 * @property {number} x - X tile map pixel thats selected.
 * @property {number} y - Y tile map pixel thats selected.
 * @property {boolean} mousePrimaryIsDown - True when the primary mouse button is down, otherwise false.
 * @property {boolean} mouseSecondaryIsDown - True when the secondary mouse button is down, otherwise false.
 * @property {boolean} mouseAuxIsDown - True when the auxiliary mouse button is down, otherwise false.
 * @property {boolean} isPrimaryButton - True when the mouse button is the primary one, otherwise false.
 * @property {boolean} isSecondaryButton - True when the mouse button is the secondary one, otherwise false.
 * @property {boolean} isAuxButton - True when the mouse button is the auxiliary one (mouse wheel), otherwise false.
 * @property {boolean} ctrlKeyPressed - True when the control key is pressed, otherwise false, otherwise false.
 * @exports
 */
