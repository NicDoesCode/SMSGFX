import ComponentBase from "./componentBase.js";
import CanvasManager from "../components/canvasManager.js";
import EventDispatcher from "../components/eventDispatcher.js";
import ReferenceImage from "../models/referenceImage.js";
import TileSet from "../models/tileSet.js";
import TileEditorContextMenu from "./tileEditorContextMenu.js";
import TemplateUtil from "../util/templateUtil.js";
import PaletteList from "../models/paletteList.js";
import TileGridProvider from "../models/tileGridProvider.js";
import PaletteUtil from "../util/paletteUtil.js";
import Tile from "../models/tile.js";
import TileMap from "../models/tileMap.js";
import PaletteListJsonSerialiser from "../serialisers/paletteListJsonSerialiser.js";
import TileGridProviderJsonSerialiser from "../serialisers/tileGridProviderJsonSerialiser.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";


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
    pixelMouseUp: 'pixelMouseUp',
    tileGridImage: 'tileGridImage'
}


/**
 * Manages and renders the tile editor including rendered tile image and toolbars.
 */
export default class TileEditor extends ComponentBase {


    /**
     * Gets a list of commands this component can invoke.
     */
    static get Commands() {
        return commands;
    }

    /**
     * Gets a list of events this component can raise.
     */
    static get Events() {
        return events;
    }

    /**
     * Gets a list of canvas highlight modes that this object can accept.
     */
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
    #renderPaletteList = null;
    /** @type {TileGridProvider} */
    #tileGrid = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {import("../types.js").Coordinate?} */
    #lastCoords = null;
    /** @type {import("../types.js").Coordinate?} */
    #lastMouseCoords = null;
    #scale = 1;
    #prevScale = 1;
    #offsetX = 0;
    #offsetY = 0;
    #tilesPerBlock = 1;
    #panCanvasOnMouseMove = false;
    #canvasMouseLeftDown = false;
    #canvasMouseMiddleDown = false;
    #canvasMouseRightDown = false;
    #displayNative = true;
    #dispatcher;
    #enabled = true;

    /** @type {Worker?} */
    #viewportWorker = null;


    /**
     * Constructor for the class.
     * @param {HTMLElement} element - Element that contains the DOM.
     */
    constructor(element) {
        super(element);
        this.#element = element;
        this.#dispatcher = new EventDispatcher();

        this.#tbCanvas = this.#element.querySelector('[data-sms-id=tile-editor-canvas]');

        document.addEventListener('mousedown', (ev) => this.#handleCanvasMouseDown(ev));
        document.addEventListener('mouseup', (ev) => this.#handleCanvasMouseUp(ev));
        document.addEventListener('mousemove', (ev) => this.#handleCanvasMouseMove(ev));
        this.#tbCanvas.addEventListener('mouseleave', (ev) => this.#handleCanvasMouseLeave(ev));
        this.#tbCanvas.addEventListener('contextmenu', (ev) => this.#handleCanvasContextMenu(ev));
        this.#tbCanvas.addEventListener('wheel', (ev) => this.#handleCanvasMouseWheel(ev));

        const containerResizeObserver = new ResizeObserver(() => {
            const parent = this.#tbCanvas.parentElement;
            const parentRect = parent.getBoundingClientRect();
            this.#postImageWorkerMessage({ imageSize: { width: parentRect.width, height: parentRect.height }, updateUI: true });
        });
        containerResizeObserver.observe(this.#tbCanvas.parentElement);

        // Load up the tile set context menu
        TileEditorContextMenu.loadIntoAsync(this.#element.querySelector('[data-smsgfx-component-id=tile-editor-context-menu]'))
            .then((obj) => {
                this.#tileEditorContextMenu = obj
                this.#tileEditorContextMenu.addHandlerOnCommand((args) => this.#bubbleCommand(args));
            });

        this.#viewportWorker = new Worker('./modules/worker/tileEditorViewportWorker.js', { type: 'module' });
        this.#viewportWorker.addEventListener('message', (/** @type {MessageEvent<import('./../worker/tileEditorViewportWorker.js').TileEditorViewportWorkerResponse>} */ e) => {
            this.#receiveImageWorkerMessage(e.data);
        });
        this.#tbCanvas.style.position = 'absolute';

        const viewportCanvas = this.#tbCanvas.transferControlToOffscreen();
        this.#viewportWorker.postMessage({ canvas: viewportCanvas }, [viewportCanvas]);

        setTimeout(() => {
            const parent = this.#tbCanvas.parentElement;
            const parentRect = parent.getBoundingClientRect();
            this.#postImageWorkerMessage({ imageSize: { width: parentRect.width, height: parentRect.height }, updateUI: true });
        }, 250);
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

        /** @type {import('./../worker/tileEditorViewportWorker.js').TileEditorViewportWorkerMessage} */
        const message = {};

        // Palette list
        let paletteUpdated = false;
        if (state?.paletteList instanceof PaletteList) {
            this.#paletteList = state?.paletteList;
            paletteUpdated = true;
        }

        // Native display
        if (typeof state?.displayNative === 'boolean') {
            this.#displayNative = state.displayNative;
            if (state.displayNative && this.#paletteList?.getPalettes().filter((p) => p.system === 'gb').length > 0) {
                message.pixelGridColour = '#98a200';
                message.pixelGridOpacity = 0.5;
                message.tileGridColour = '#98a200';
                message.tileGridOpacity = 1;
            } else {
                message.pixelGridColour = '#000000';
                message.pixelGridOpacity = 0.2;
                message.tileGridColour = '#000000';
                message.tileGridOpacity = 0.4;
            }
            paletteUpdated = true;
        }

        // Update native palette if either palette or native option was updated
        if (paletteUpdated && this.#paletteList) {
            if (this.#displayNative) {
                this.#renderPaletteList = PaletteUtil.clonePaletteListWithNativeColours(this.#paletteList, { preserveIds: true });
            } else {
                this.#renderPaletteList = this.#paletteList;
            }
            message.paletteList = PaletteListJsonSerialiser.toSerialisable(this.#renderPaletteList);
            message.updateImage = true;
        }

        // Tile grid
        if (state?.tileGrid instanceof TileGridProvider) {
            this.#tileGrid = state.tileGrid;
            message.tileGrid = TileGridProviderJsonSerialiser.toSerialisable(state.tileGrid);
            message.updateImage = true;
        } else if (state?.tileGrid === null) {
            this.#tileGrid = null;
            message.tileGrid = null;
            message.updateImage = true;
        }

        // Tile set
        if (state?.tileSet instanceof TileSet) {
            this.#tileSet = state.tileSet;
            message.tileSet = TileSetJsonSerialiser.toSerialisable(state.tileSet);
            message.updateImage = true;
        } else if (state?.tileGrid === null) {
            this.#tileSet = null;
            message.tileSet = null;
            message.updateImage = true;
        }

        // Updated tiles
        if (state?.updatedTiles && Array.isArray(state?.updatedTiles)) {
            message.updatedTiles = state.updatedTiles;
            message.updateImage = true;
        }

        // Updated tile indexes
        if (state?.updatedTileIndexes && Array.isArray(state?.updatedTileIndexes)) {
            message.updatedTileIndexes = state.updatedTileIndexes;
            message.updateImage = true;
        }

        // Updated tile IDs
        if (state?.updatedTileIds && Array.isArray(state?.updatedTileIds)) {
            message.updatedTileIds = state.updatedTiles;
            message.updateImage = true;
        }

        // Scale
        if (typeof state?.scale === 'number') {
            const scaleSettings = this.#getScalingValues(state.scale, state.scaleRelativeToMouse);
            message.scale = scaleSettings.scale;
            message.offsetX = scaleSettings.offsetX;
            message.offsetY = scaleSettings.offsetY;
            message.updateImage = true;
        }

        // Tiles per block
        if (typeof state.tilesPerBlock === 'number') {
            message.tilesPerBlock = state.tilesPerBlock;
        } else if (state.tilesPerBlock === null) {
            message.tilesPerBlock = 1;
        }

        // View option: show tile grid
        if (typeof state?.showTileGrid === 'boolean') {
            message.showTileGrid = state?.showTileGrid;
            message.updateUI = true;
        }
        // View option: show pixel grid
        if (typeof state?.showPixelGrid === 'boolean') {
            message.showPixelGrid = state?.showPixelGrid;
            message.updateUI = true;
        }

        // Selected tile index?
        if (typeof state?.selectedTileIndex === 'number') {
            message.selectedTileIndex = state.selectedTileIndex;
            message.updateUI = true;
        }

        // Cursor size
        if (typeof state?.cursorSize === 'number') {
            if (state.cursorSize > 0 && state.cursorSize <= 50) {
                message.cursorSize = state.cursorSize;
            }
        }

        // Cursor type
        if (typeof state?.cursor === 'string') {
            this.#tbCanvas.style.cursor = state.cursor;
        }

        // Reference image
        if (state?.referenceImage instanceof ReferenceImage) {
            message.referenceImage = state.referenceImage.toObject();
            message.updateImage = true;
        } else if (state?.referenceImage === null) {
            message.referenceImage = null;
            message.updateImage = true;
        }

        // Reference image draw mode
        if (state.referenceImageBounds && state.referenceImageBounds !== null) {
            message.referenceImageBounds = state.referenceImageBounds;
            message.updateImage = true;
        }

        // Transparency indicies 
        if (Array.isArray(state?.transparencyIndicies) || state.transparencyIndicies === null) {
            message.transparencyIndicies = state.transparencyIndicies;
            message.updateImage = true;
        }

        // Reference image draw mode
        if (Array.isArray(state?.referenceImageDrawMode) || state.referenceImageDrawMode === null) {
            message.referenceImageDrawMode = state.referenceImageDrawMode ?? CanvasManager.ReferenceImageDrawMode.overIndex;
            message.updateImage = true;
        }

        // Locked palette slot index
        if (typeof state.lockedPaletteSlotIndex === 'number' || state.lockedPaletteSlotIndex === null) {
            message.lockedPaletteSlotIndex = state.lockedPaletteSlotIndex;
            message.updateImage = true;
        }

        // Canvas highlight mode
        if (typeof state.canvasHighlightMode === 'number' || state.canvasHighlightMode === null) {
            message.canvasHighlightMode = state.canvasHighlightMode;
        }

        // Tile stamp preview
        if (typeof state.tileStampPreview === 'string' || state.tileStampPreview instanceof TileMap || state.tileStampPreview instanceof Tile || state.tileStampPreview === null) {
            message.tileStampPreview = state.tileStampPreview;
        }

        // Selected region 
        if (typeof state?.selectedRegion !== 'undefined') {
            message.selectedRegion = state.selectedRegion;
            message.updateUI = true;
        }

        // Pan the viewport horizontally
        if (typeof state?.viewportPanHorizontal === 'number') {
            message.panViewportX = state.viewportPanHorizontal;
            message.updateUI = true;
        }

        // Pan the viewport vertically
        if (typeof state?.viewportPanVertical === 'number') {
            message.panViewportY = state.viewportPanVertical;
            message.updateUI = true;
        }

        if (this.#lastCoords) {
            message.mousePosition = { x: this.#lastCoords.x, y: this.#lastCoords.y };
            message.updateUI = true;
        }

        if (typeof state?.focusedTile === 'number' && canvasState.hasTileGrid) {
            this.#focusTileOnMessage(state?.focusedTile, message);
            message.updateUI = true;
        }

        // Force refresh?
        if (typeof state.forceRefresh === 'boolean' && state.forceRefresh === true) {
            message.updateImage = true;
        }

        message.imageSize = {
            width: this.#tbCanvas.width,
            height: this.#tbCanvas.height
        };

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
        }

        if (typeof state.requestExportImage === 'boolean' && state.requestExportImage === true) {
            message.requestBitmapImage = true;
        }

        this.#postImageWorkerMessage(message);
    }


    /**
     * Returns a bitmap that represents the tile set as a PNG data URL.
     */
    toDataUrl() {
        throw new Error('Not implemented.');
        // return this.#canvasManager.toDataURL();
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
        if (!canvasState.hasTileGrid) return;

        if (this.#enabled && canvasState.hasTileSet) {
            if (ev.target === this.#tbCanvas) {
                const coords = convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
                if (coords) {
                    const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < canvasState.tileGridColumns * 8 && coords.y < canvasState.tileGridRows * 8;
                    const rowColInfo = getRowAndColumnInfo(coords.x, coords.y);
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
                            tilesPerBlock: canvasState.tilesPerBlock,
                            isInBounds: pxInBounds && rowColInfo.isInBounds
                        };
                        this.#dispatcher.dispatch(EVENT_OnEvent, args);
                        this.#lastCoords = coords;
                        this.#lastMouseCoords = convertViewportCoordsToCanvasCoords(this.#tbCanvas, ev.clientX, ev.clientY);
                        this.#postImageWorkerMessage({ mousePosition: { x: coords.x, y: coords.y }, updateUI: true });
                    }
                }
            }
            if (this.#panCanvasOnMouseMove)
                this.panCanvas(ev.movementX, ev.movementY);
        }
    }

    /** @param {MouseEvent} ev */
    #handleCanvasMouseDown(ev) {
        if (!canvasState.hasTileGrid) return;

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

        const coords = convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
        if (coords) {
            const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < canvasState.tileGridColumns * 8 && coords.y < canvasState.tileGridRows * 8;
            const rowColInfo = getRowAndColumnInfo(coords.x, coords.y);
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
                tilesPerBlock: canvasState.tilesPerBlock,
                isInBounds: pxInBounds && rowColInfo.isInBounds
            };
            this.#dispatcher.dispatch(EVENT_OnEvent, args);
        }
    }

    /** @param {MouseEvent} ev */
    #handleCanvasMouseUp(ev) {
        if (!canvasState.hasTileGrid) return;

        this.#panCanvasOnMouseMove = false;

        if (!this.#enabled) return;

        if (ev.button === 0) {
            this.#canvasMouseLeftDown = false;
        } else if (ev.button === 1) {
            this.#canvasMouseMiddleDown = false;
        } else if (ev.button === 2) {
            this.#canvasMouseRightDown = false;
        }

        const coords = convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
        if (coords) {
            const pxInBounds = coords.x >= 0 && coords.y >= 0 && coords.x < canvasState.tileGridColumns * 8 && coords.y < canvasState.tileGridRows * 8;
            const rowColInfo = getRowAndColumnInfo(coords.x, coords.y);
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
                tilesPerBlock: canvasState.tilesPerBlock,
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
        if (!this.#enabled || canvasState.isTileMap) return;

        const coords = convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
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
            const coords = convertViewportCoordsToTileGridCoords(this.#tbCanvas, ev.clientX, ev.clientY);
            if (coords) {
                const tile = this.#tileSet.getTileByCoordinate(coords.x, coords.y);
                args.tileIndex = this.#tileSet.getTileIndex(tile);

                if (ev.deltaY > 0) {
                    args.command = commands.zoomOut;
                } else {
                    args.command = commands.zoomIn;
                }

                this.#dispatcher.dispatch(EVENT_OnCommand, args);
            }
            return false;
        } else {
            const message = {};
            if (ev.deltaX !== 0) {
                message.panViewportX = -(ev.deltaX * 3);
            }
            if (ev.deltaY !== 0) {
                message.panViewportY = -(ev.deltaY * 3);
            }
            this.#postImageWorkerMessage({
                updateUI: true,
                ...message
            });
            ev.preventDefault();
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
        this.#postImageWorkerMessage({
            updateUI: true,
            panViewportX: amountX,
            panViewportY: amountY
        });
    }


    /**
     * 
     * @param {number} index 
     * @param {import('./../worker/tileEditorViewportWorker.js').TileEditorViewportWorkerMessage} message 
     */
    #focusTileOnMessage(index, message) {
        const col = index % canvasState.tileGridColumns;
        const row = Math.floor(index / canvasState.tileGridRows);
        const pxPerTile = this.#scale * 8;
        message.offsetX = col / pxPerTile;
        message.offsetY = row / pxPerTile;
    }


    /**
     * @param {number} scale 
     * @param {boolean} relativeToMouse 
     */
    #getScalingValues(scale, relativeToMouse) {
        this.#prevScale = this.#scale;
        this.#scale = scale;
        let offsetX = 0;
        let offsetY = 0;
        if (relativeToMouse === true && this.#lastCoords && this.#lastMouseCoords) {
            // Scale / zoom based on mouse coord
            const mouseXRelativeToCentre = -((this.#tbCanvas.clientWidth / 2) - this.#lastMouseCoords.x);
            const zeroOffsetX = (((canvasState.tileGridColumns * 8) / 2) * this.#scale);
            const hoverPixelNewXOffset = this.#lastCoords.x * this.#scale;
            offsetX = Math.round(zeroOffsetX + mouseXRelativeToCentre - hoverPixelNewXOffset);

            const mouseYRelativeToCentre = -((this.#tbCanvas.clientHeight / 2) - this.#lastMouseCoords.y);
            const zeroOffsetY = (((canvasState.tileGridRows * 8) / 2) * this.#scale);
            const hoverPixelNewYOffset = this.#lastCoords.y * this.#scale;
            offsetY = Math.round(zeroOffsetY + mouseYRelativeToCentre - hoverPixelNewYOffset);
        } else {
            // Scale / zoom based on viewport centre
            offsetX = Math.round((this.#offsetX / this.#prevScale) * this.#scale);
            offsetY = Math.round((this.#offsetY / this.#prevScale) * this.#scale);
        }

        return {
            scale: this.#scale,
            offsetX: offsetX,
            offsetY: offsetY
        };
    }


    /**
     * Posts a message to the tile image worker.
     * @param {import('./../worker/tileEditorViewportWorker.js').TileEditorViewportWorkerMessage} message 
     */
    #postImageWorkerMessage(message) {
        this.#viewportWorker.postMessage({ message: message });
    }

    /**
     * Posts a message to the tile image worker.
     * @param {import('./../worker/tileEditorViewportWorker.js').TileEditorViewportWorkerResponse} response 
     */
    #receiveImageWorkerMessage(response) {
        canvasState.hasTileGrid = response.hasTileGrid;
        canvasState.hasTileSet = response.hasTileSet;
        canvasState.hasPalettes = response.hasPalettes;
        canvasState.isTileMap = response.isTileMap;
        canvasState.canvasWidth = response.canvasSize.width;
        canvasState.canvasHeight = response.canvasSize.height;
        canvasState.tileGridRows = response.tileGridDimension.rows;
        canvasState.tileGridColumns = response.tileGridDimension.columns;
        canvasState.tileGridWidthPixels = response.tileGridImage.width;
        canvasState.tileGridHeightPixels = response.tileGridImage.height;
        canvasState.offsetX = response.tileGridOffset.x;
        canvasState.offsetY = response.tileGridOffset.y;
        canvasState.scale = response.scale;
        canvasState.tilesPerBlock = response.tilesPerBlock;

        if (response.tileGridImage instanceof ImageBitmap) {
            /** @type {TileEditorEventArgs} */
            const args = {
                event: events.tileGridImage,
                tileGridImage: response.tileGridImage,
            };
            this.#dispatcher.dispatch(EVENT_OnEvent, args);
        }
    }

}


/**
 * @typedef {Object} TileEditorState
 * @property {TileGridProvider?} tileGrid - Tile grid that will be drawn, passing this will trigger a redraw.
 * @property {TileSet?} tileSet - Tile set that will be drawn, passing this will trigger a redraw.
 * @property {PaletteList?} paletteList - Palette list to use for drawing, passing this will trigger a redraw.
 * @property {number?} scale - Current scale level.
 * @property {boolean?} [scaleRelativeToMouse] - Scale based on the mouse cursor position?.
 * @property {number?} [tilesPerBlock] - The amount of tiles per tile block.
 * @property {boolean?} displayNative - Should the tile editor display native colours?
 * @property {number?} selectedTileIndex - Currently selected tile index.
 * @property {number?} cursorSize - Size of the cursor in px.
 * @property {string?} cursor - Cursor to use when the mouse hovers over the image editor.
 * @property {number?} [viewportPanHorizontal] - Pan the viewport horizontally.
 * @property {number?} [viewportPanVertical] - Pan the viewport vertically.
 * @property {ReferenceImage?} [referenceImage] - Reference image to draw.
 * @property {import('../types.js').Bounds} [referenceImageBounds] - Bounds for the reference image.
 * @property {string?} [referenceImageDrawMode] - Draw mode for the reference image.
 * @property {number[]?} [transparencyIndicies] - Palette indicies that should be rendered as transparent.
 * @property {number?} [lockedPaletteSlotIndex] - When not null, the palette slot index specified here will be repeated from palette 0 across all palettes.
 * @property {boolean?} showTileGrid - Should the tile grid be drawn?
 * @property {boolean?} showPixelGrid - Should the pixel grid be drawn?
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {number?} focusedTile - Will ensure that this tile is shown on the screen.
 * @property {import("../serialisers/tileJsonSerialiser.js").TileSerialisable[]?} updatedTiles - Tiles that have been updated.
 * @property {number[]?} updatedTileIndexes - When passing updated tiles, the entire image will not be updated and instead only these tiles will be updated.
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 * @property {string?} [canvasHighlightMode] - How the canvas highlights what is under the mouse cursor (pixel, row, column, etc).
 * @property {string|Tile|TileMap|null} [tileStampPreview] - Either a tile ID, individual tile object or tile grid object with the tile stamp preview.
 * @property {import("../models/tileGridProvider.js").TileGridRegion} [selectedRegion] - Selected region to highlight.
 * @property {boolean?} [forceRefresh] - When true the tile grid image will be refreshed.
 * @property {boolean?} [requestExportImage] - Request that the displayed image be exported.
 * @exports 
 */

/**
 * Callback for when a command is invoked.
 * @callback TileEditorCommandCallback
 * @param {TileEditorCommandEventArgs} args - Arguments.
 * @exports
 */
/**
 * @typedef {Object} TileEditorCommandEventArgs
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
 * @typedef {Object} TileEditorEventArgs
 * @property {string} event - Event that occurred.
 * @property {number} tileGridImage - Image of the tile grid.
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


const canvasState = {
    hasTileGrid: false,
    hasTileSet: false,
    hasPalettes: false,
    isTileMap: false,
    tileGridRows: 0,
    tileGridColumns: 0,
    tileGridWidthPixels: 0,
    tileGridHeightPixels: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    tilesPerBlock: 0

};

/**
 * Converts mouse X and Y coordinates from the viewport to the corresponding tile grid coordinate.
 * @param {HTMLCanvasElement} viewportCanvas - Canvas element to use for the conversion.
 * @param {number} viewportX - Y pixel coordinate within the viewport.
 * @param {number} viewportY - Y pixel coordinate within the viewport.
 * @returns {import("../types.js").Coordinate}
 */
function convertViewportCoordsToTileGridCoords(viewportCanvas, viewportX, viewportY) {
    const canvasRect = viewportCanvas.getBoundingClientRect();
    const canvasX = viewportX - canvasRect.left - (canvasState.scale / 2);
    const canvasY = viewportY - canvasRect.top - (canvasState.scale / 2);
    return convertCanvasCoordsToTileGridCoords(viewportCanvas, canvasX, canvasY);
}

/**
 * Converts mouse X and Y coordinates from the tile editor canvas to the corresponding tile grid coordinate.
 * @param {HTMLCanvasElement} canvas - Canvas element to use for the conversion.
 * @param {number} canvasX - Y pixel coordinate within the canvas.
 * @param {number} canvasY - Y pixel coordinate within the canvas.
 * @returns {import("../types.js").Coordinate}
 */
function convertCanvasCoordsToTileGridCoords(canvas, canvasX, canvasY) {
    const drawCoords = getDrawCoords(canvas);
    canvasX -= drawCoords.x;
    canvasY -= drawCoords.y;
    return {
        x: Math.round(canvasX / canvasState.scale),
        y: Math.round(canvasY / canvasState.scale)
    };
}

/**
 * Gets the top left coordinate of where the tile image is to be drawn.
 * @param {HTMLCanvasElement} canvas - Canvas where the image is to be drawn.
 * @returns {import("../types.js").Coordinate}
 */
function getDrawCoords(canvas) {
    return {
        x: Math.floor((canvas.width - canvasState.tileGridWidthPixels) / 2) + canvasState.offsetX,
        y: Math.floor((canvas.height - canvasState.tileGridHeightPixels) / 2) + canvasState.offsetY
    }
}


/**
 * Gets the top left coordinate of where the tile image is to be drawn.
 * @param {HTMLCanvasElement} canvas - Canvas where the image is to be drawn.
 * @param {number} tileGridX - X coordinate within the tile grid.
 * @param {number} tileGridY - Y coordinate within the tile grid.
 * @returns {RowAndColumnInfo}
 */
function getRowAndColumnInfo(tileGridX, tileGridY) {
    const row = Math.floor(tileGridY / 8);
    const col = Math.floor(tileGridX / 8);
    const clampedRow = Math.min(Math.max(row, 0), canvasState.tileGridRows);
    const clampedCol = Math.min(Math.max(col, 0), canvasState.tileGridColumns);
    const blockRow = Math.floor(clampedRow / canvasState.tilesPerBlock);
    const blockCol = Math.floor(clampedCol / canvasState.tilesPerBlock);
    const nearNextRowAdditionalOffset = tileGridY % 8 >= 4 ? 1 : 0;
    const nearNextColAdditionalOffset = tileGridX % 8 >= 4 ? 1 : 0;
    const nearestBlockRow = Math.min(Math.round(clampedRow / canvasState.tilesPerBlock) + nearNextRowAdditionalOffset, canvasState.tileGridRows);
    const nearestBlockCol = Math.min(Math.round(clampedCol / canvasState.tilesPerBlock) + nearNextColAdditionalOffset, canvasState.tileGridColumns);
    return {
        rowIndex: row,
        columnIndex: col,
        clampedRowIndex: clampedRow,
        clampedColumnIndex: clampedCol,
        nearestRowIndex: (tileGridY % 4 > 4) ? clampedRow + 1 : clampedRow,
        nearestColumnIndex: (tileGridX % 4 > 4) ? clampedCol + 1 : clampedCol,
        rowBlockIndex: blockRow,
        columnBlockIndex: blockCol,
        nearestRowBlockIndex: nearestBlockRow,
        nearestColumnBlockIndex: nearestBlockCol,
        rowIsInBounds: row === clampedRow,
        columnIsInBounds: col === clampedCol,
        isInBounds: row === clampedRow && col === clampedCol
    };
}

/**
 * Converts mouse X and Y coordinates from the viewport to X and Y coordinates relative to a given canvas object.
 * @param {HTMLCanvasElement} canvas - Canvas element to use for the conversion.
 * @param {number} viewportX - Y pixel coordinate within the viewport.
 * @param {number} viewportY - Y pixel coordinate within the viewport.
 * @returns {import("../types.js").Coordinate}
 */
function convertViewportCoordsToCanvasCoords(canvas, viewportX, viewportY) {
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: viewportX - canvasRect.left - (canvasState.scale / 2),
        y: viewportY - canvasRect.top - (canvasState.scale / 2)
    };
}
