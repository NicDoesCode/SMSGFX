import ComponentBase from "./componentBase.js";
import CanvasManager from "../components/canvasManager.js";
import EventDispatcher from "../components/eventDispatcher.js";
import PaletteFactory from "../factory/paletteFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import ReferenceImage from "../models/referenceImage.js";
import TileSet from "../models/tileSet.js";
import TileEditorContextMenu from "./tileEditorContextMenu.js";
import TemplateUtil from "../util/templateUtil.js";
import PaletteList from "../models/paletteList.js";
import TileGridProvider from "../models/tileGridProvider.js";

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

export default class TileEditor extends ComponentBase {


    static get Commands() {
        return commands;
    }

    static get Events() {
        return events;
    }

    static get CanvasHighlightModes() {
        return CanvasManager.HighlightModes;
    }


    /** @type {HTMLElement} */
    #element;
    /** @type {HTMLCanvasElement} */
    #tbCanvas;
    /** @type {TileEditorContextMenu} */
    #tileEditorContextMenu;
    /** @type {PaletteList} */
    #paletteList = null;
    /** @type {PaletteList} */
    #nativePaletteList = null;
    /** @type {TileGridProvider} */
    #tileGrid = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {Coordinates} */
    #lastCoords;
    #scale = 1;
    #tilesPerBlock = 1;
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
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbCanvas = this.#element.querySelector('[data-sms-id=tile-editor-canvas]');
        this.#canvasManager = new CanvasManager();
        // this.#canvasManager.backgroundColour = window.getComputedStyle(this.#element).backgroundColor;
        this.#canvasManager.backgroundColour = null;

        document.addEventListener('mousedown', (ev) => this.#handleCanvasMouseDown(ev));
        document.addEventListener('mouseup', (ev) => this.#handleCanvasMouseUp(ev));
        document.addEventListener('mousemove', (ev) => this.#handleCanvasMouseMove(ev));
        this.#tbCanvas.addEventListener('mouseleave', (ev) => this.#handleCanvasMouseLeave(ev));
        this.#tbCanvas.addEventListener('contextmenu', (ev) => this.#handleCanvasContextMenu(ev));
        this.#tbCanvas.addEventListener('wheel', (ev) => this.#handleCanvasMouseWheel(ev));

        // Observe size changes and redraw where needed
        const canvasResizeObserver = new ResizeObserver(() => {
            if (this.#enabled && this.#canvasManager.canDraw) {
                this.#canvasManager.drawUI(this.#tbCanvas);
            }
        });
        canvasResizeObserver.observe(this.#tbCanvas);

        const containerResizeObserver = new ResizeObserver(() => {
            if (this.#enabled && this.#canvasManager.canDraw) {
                resizeCanvas(this.#tbCanvas);
            }
        });
        containerResizeObserver.observe(this.#tbCanvas.parentElement);

        // Load up the tile set context menu
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
        // Change palette list?
        const paletteList = state?.paletteList;
        if (paletteList && typeof paletteList.getPaletteById === 'function') {
            this.#canvasManager.invalidateImage();
            this.#paletteList = paletteList;
            this.#nativePaletteList = PaletteListFactory.create(paletteList.getPalettes().map((p) => PaletteFactory.convertToNative(p)));
            dirty = true;
        }
        // Changing tile grid
        const tileGrid = state?.tileGrid;
        if (tileGrid instanceof TileGridProvider || tileGrid === null) {
            this.#canvasManager.invalidateImage();
            this.#tileGrid = tileGrid;
            dirty = true;
        }
        // Changing tile set
        const tileSet = state?.tileSet;
        if (tileSet instanceof TileSet || tileSet === null) {
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
        // Updated tile IDs
        if (state?.updatedTileIds && Array.isArray(state?.updatedTileIds)) {
            const updatedTileIds = state.updatedTileIds;
            updatedTileIds.forEach((tileId) => {
                this.#canvasManager.invalidateTileId(tileId);
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
        // Changing amount of tiles per block?
        if (typeof state.tilesPerBlock === 'number') {
            this.#canvasManager.tilesPerBlock = state.tilesPerBlock;
        } else if (state.tilesPerBlock === null) {
            this.#canvasManager.tilesPerBlock = 1;
        }
        // Display native?
        if (typeof state?.displayNative === 'boolean') {
            this.#displayNative = state.displayNative;
            if (state.displayNative && this.#paletteList?.getPalettes().filter((p) => p.system === 'gb') > 0) {
                this.#canvasManager.pixelGridColour = '#98a200';
                this.#canvasManager.pixelGridOpacity = 0.5;
                this.#canvasManager.tileGridColour = '#98a200';
                this.#canvasManager.tileGridOpacity = 1;
            } else {
                this.#canvasManager.pixelGridColour = '#000000';
                this.#canvasManager.pixelGridOpacity = 0.2;
                this.#canvasManager.tileGridColour = '#000000';
                this.#canvasManager.tileGridOpacity = 0.4;
            }
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
        // Theme
        if (typeof state?.theme === 'string') {
            if (state.theme === 'light') {
                // this.#canvasManager.backgroundColour = '#e9ecef';
                // dirty = true;
            }
            if (state.theme === 'dark') {
                // this.#canvasManager.backgroundColour = '#151719';
                // dirty = true;
            }
        }
        // Canvas highlight mode
        if (typeof state?.canvasHighlightMode === 'string') {
            this.#canvasManager.highlightMode = state.canvasHighlightMode;
        } else if (typeof state?.canvasHighlightMode === 'object' && state.canvasHighlightMode === null) {
            this.#canvasManager.highlightMode = CanvasManager.HighlightModes.pixel;
        }
        // Force refresh?
        if (typeof state.forceRefresh === 'boolean' && state.forceRefresh === true) {
            dirty = true;
        }
        // Refresh image?
        if (dirty && this.#tileGrid && this.#tileSet && this.#paletteList && this.#paletteList.length > 0) {
            let paletteList = !this.#displayNative ? this.#paletteList : this.#nativePaletteList;
            if (this.#canvasManager.paletteList !== paletteList) {
                this.#canvasManager.paletteList = paletteList;
            }
            this.#canvasManager.tileSet = this.#tileSet;
            this.#canvasManager.tileGrid = this.#tileGrid;
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
        if (this.#enabled && this.#tileSet) {
            if (ev.target === this.#tbCanvas) {
                const coords = this.#canvasManager.convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
                if (coords) {
                    const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < this.#tileGrid.columnCount * 8 && coords.y < this.#tileGrid.rowCount * 8;
                    const rowColInfo = this.#canvasManager.getRowAndColumnInfo(coords.x, coords.y);
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
                            ctrlKeyPressed: ev.ctrlKey,
                            tileGridRowIndex: rowColInfo.rowIndex,
                            tileGridColumnIndex: rowColInfo.columnIndex,
                            tileGridInsertRowIndex: rowColInfo.nearestRowIndex,
                            tileGridInsertColumnIndex: rowColInfo.nearestColumnIndex,
                            tileBlockGridRowIndex: rowColInfo.rowBlockIndex,
                            tileBlockGridColumnIndex: rowColInfo.columnBlockIndex,
                            tileBlockGridInsertRowIndex: rowColInfo.nearestRowBlockIndex,
                            tileBlockGridInsertColumnIndex: rowColInfo.nearestColumnBlockIndex,
                            tilesPerBlock: this.#canvasManager.tilesPerBlock,
                            isInBounds: pxInBounds && rowColInfo.isInBounds
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
        if (!this.#enabled || ev.target !== this.#tbCanvas) return;

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

        const coords = this.#canvasManager.convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
        if (coords) {
            const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < this.#tileGrid.columnCount * 8 && coords.y < this.#tileGrid.rowCount * 8;
            const rowColInfo = this.#canvasManager.getRowAndColumnInfo(coords.x, coords.y);
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
                ctrlKeyPressed: ev.ctrlKey,
                tileGridRowIndex: rowColInfo.rowIndex,
                tileGridColumnIndex: rowColInfo.columnIndex,
                tileGridInsertRowIndex: rowColInfo.nearestRowIndex,
                tileGridInsertColumnIndex: rowColInfo.nearestColumnIndex,
                tileBlockGridRowIndex: rowColInfo.rowBlockIndex,
                tileBlockGridColumnIndex: rowColInfo.columnBlockIndex,
                tileBlockGridInsertRowIndex: rowColInfo.nearestRowBlockIndex,
                tileBlockGridInsertColumnIndex: rowColInfo.nearestColumnBlockIndex,
                tilesPerBlock: this.#canvasManager.tilesPerBlock,
                isInBounds: pxInBounds && rowColInfo.isInBounds
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

        const coords = this.#canvasManager.convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
        if (coords) {
            const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < this.#tileGrid.columnCount * 8 && coords.y < this.#tileGrid.rowCount * 8;
            const rowColInfo = this.#canvasManager.getRowAndColumnInfo(coords.x, coords.y);
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
                ctrlKeyPressed: ev.ctrlKey,
                tileGridRowIndex: rowColInfo.rowIndex,
                tileGridColumnIndex: rowColInfo.columnIndex,
                tileGridInsertRowIndex: rowColInfo.nearestRowIndex,
                tileGridInsertColumnIndex: rowColInfo.nearestColumnIndex,
                tileBlockGridRowIndex: rowColInfo.rowBlockIndex,
                tileBlockGridColumnIndex: rowColInfo.columnBlockIndex,
                tileBlockGridInsertRowIndex: rowColInfo.nearestRowBlockIndex,
                tileBlockGridInsertColumnIndex: rowColInfo.nearestColumnBlockIndex,
                tilesPerBlock: this.#canvasManager.tilesPerBlock,
                isInBounds: pxInBounds && rowColInfo.isInBounds
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
            ctrlKeyPressed: ev.ctrlKey,
            isInBounds: false
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
        if (!this.#enabled || this.#tileGrid.isTileMap) return;

        const coords = this.#canvasManager.convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
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
            const coords = this.#canvasManager.convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
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
            if (ev.deltaX !== 0) {
                this.#canvasManager.offsetX -= ev.deltaX * 3;
            }
            if (ev.deltaY !== 0) {
                this.#canvasManager.offsetY -= ev.deltaY * 3;
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

    #focusTile(index) {
        const col = index % this.#tileSet.tileWidth;
        const row = Math.floor(index / this.#tileSet.tileWidth);
        const pxPerTile = this.#canvasManager.scale * 8;
        const tileY = (row * pxPerTile) + (this.#canvasManager.scale / 2);
        // const rect = this.#canvasContainer.getBoundingClientRect();
        // this.#canvasContainer.scrollLeft = Math.max(tileX - (rect.width / 2), 0);
        // this.#canvasContainer.scrollTop = Math.max(tileY - (rect.height / 2), 0);
    }


}


/**
 * @typedef {object} TileEditorState
 * @property {TileGridProvider?} tileGrid - Tile grid that will be drawn, passing this will trigger a redraw.
 * @property {TileSet?} tileSet - Tile set that will be drawn, passing this will trigger a redraw.
 * @property {PaletteList?} paletteList - Palette list to use for drawing, passing this will trigger a redraw.
 * @property {number?} scale - Current scale level.
 * @property {number?} [tilesPerBlock] - The amount of tiles per tile block.
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
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 * @property {string?} theme - Name of the theme being used.
 * @property {string?} [canvasHighlightMode] - The highlight mode that the canvas should use.
 * @property {boolean?} [forceRefresh] - When true the tile grid image will be refreshed.
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
 * @property {number} tileIndex - Index of the tile witin the tile grid.
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
 * @property {number} x - X tile grid pixel thats selected.
 * @property {number} y - Y tile grid pixel thats selected.
 * @property {number?} [tileGridRowIndex] - Index of the tile grid row that corresponds with the Y mouse coordinate.
 * @property {number?} [tileGridColumnIndex] - Index of the tile grid column that corresponds with the X mouse coordinate.
 * @property {number?} [tileGridInsertRowIndex] - Index in the tile grid row for inserting a new row.
 * @property {number?} [tileGridInsertColumnIndex] - Index in the tile grid column for inserting a new column.
 * @property {number?} [tileBlockGridRowIndex] - Index of the tile block grid row that corresponds with the Y mouse coordinate.
 * @property {number?} [tileBlockGridColumnIndex] - Index of the tile block grid column that corresponds with the X mouse coordinate.
 * @property {number?} [tileBlockGridInsertRowIndex] - Index in the tile block grid row for inserting a new row.
 * @property {number?} [tileBlockGridInsertColumnIndex] - Index in the tile block grid column for inserting a new column.
 * @property {number?} [tilesPerBlock] - The amount of tiles per tile block.
 * @property {boolean} isInBounds - True when the given coordinate was out of bounds of the tile grid.
 * @property {boolean} mousePrimaryIsDown - True when the primary mouse button is down, otherwise false.
 * @property {boolean} mouseSecondaryIsDown - True when the secondary mouse button is down, otherwise false.
 * @property {boolean} mouseAuxIsDown - True when the auxiliary mouse button is down, otherwise false.
 * @property {boolean} isPrimaryButton - True when the mouse button is the primary one, otherwise false.
 * @property {boolean} isSecondaryButton - True when the mouse button is the secondary one, otherwise false.
 * @property {boolean} isAuxButton - True when the mouse button is the auxiliary one (mouse wheel), otherwise false.
 * @property {boolean} ctrlKeyPressed - True when the control key is pressed, otherwise false, otherwise false.
 * @exports
 */

/**
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvas(canvas) {
    const parent = canvas.parentElement;
    const parentRect = parent.getBoundingClientRect();
    canvas.style.position = 'absolute';
    canvas.width = parentRect.width;
    canvas.height = parentRect.height;
}