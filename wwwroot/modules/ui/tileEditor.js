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
import TileImageManager from "../components/tileImageManager.js";
import PaletteUtil from "../util/paletteUtil.js";
import Tile from "../models/tile.js";
import TileMap from "../models/tileMap.js";
import PaletteListJsonSerialiser from "../serialisers/paletteListJsonSerialiser.js";


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
    /** @type {CanvasRenderingContext2D} */
    #tbCanvasContext;
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
    #canvasManager;
    #panCanvasOnMouseMove = false;
    #canvasMouseLeftDown = false;
    #canvasMouseMiddleDown = false;
    #canvasMouseRightDown = false;
    #displayNative = true;
    #dispatcher;
    #enabled = true;

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

        this.#tbCanvas = this.#element.querySelector('[data-sms-id=tile-editor-canvas]');
        this.#canvasManager = new CanvasManager();
        // this.#canvasManager.backgroundColour = window.getComputedStyle(this.#element).backgroundColor;
        this.#canvasManager.backgroundColour = null;
        this.#canvasManager.transparencyGridOpacity = 0.15;

        document.addEventListener('mousedown', (ev) => this.#handleCanvasMouseDown(ev));
        document.addEventListener('mouseup', (ev) => this.#handleCanvasMouseUp(ev));
        document.addEventListener('mousemove', (ev) => this.#handleCanvasMouseMove(ev));
        this.#tbCanvas.addEventListener('mouseleave', (ev) => this.#handleCanvasMouseLeave(ev));
        this.#tbCanvas.addEventListener('contextmenu', (ev) => this.#handleCanvasContextMenu(ev));
        this.#tbCanvas.addEventListener('wheel', (ev) => this.#handleCanvasMouseWheel(ev));

        // Observe size changes and redraw where needed
        const canvasResizeObserver = new ResizeObserver(() => {
            this.#sendUpdatedCanvasSizeToImageWorker();
            // if (this.#enabled) {
            //     this.#postImageWorkerMessage({
            //         imageSize: {
            //             width: this.#tbCanvas.width,
            //             height: this.#tbCanvas.height
            //         },
            //         updateImage: true
            //     });
            // }
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

        this.#imageWorker = new Worker('./modules/worker/tileImageWorker.js', { type: 'module' });
        this.#imageWorker.addEventListener('message', (/** @type {MessageEvent<import('./../worker/tileImageWorker.js').TileImageWorkerResponse>} */ e) => {
            this.#receiveImageWorkerMessage(e.data);
        });

        this.#sendUpdatedCanvasSizeToImageWorker();
    }


    #sendUpdatedCanvasSizeToImageWorker() {
        this.#postImageWorkerMessage({
            imageSize: {
                width: this.#tbCanvas.width,
                height: this.#tbCanvas.height
            },
            updateImage: true
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
        let refreshTiles = false;
        let redrawUI = false;
        let updateRenderPaletteList = false;
        let updateScale = false;


        /** @type {import('./../worker/tileImageWorker.js').TileImageWorkerMessage} */
        const message = {};

        // Tile image manager
        if (state?.tileImageManager === null || state.tileImageManager instanceof TileImageManager) {
            this.#canvasManager.setTileImageManager(state.tileImageManager);
        }
        // Change palette list?
        const paletteList = state?.paletteList;
        if (paletteList instanceof PaletteList) {
            // this.#canvasManager.invalidateImage();
            this.#paletteList = paletteList;
            updateRenderPaletteList = true;
            // refreshTiles = true;
        }
        // Changing tile grid
        const tileGrid = state?.tileGrid;
        if (paletteList instanceof TileGridProvider || tileGrid === null) {
            resizeCanvas(this.#tbCanvas);
            message.tileGrid = state.tileGrid;
            // this.#canvasManager.invalidateImage();
            // this.#tileGrid = tileGrid;
            // refreshTiles = true;
        }
        // Changing tile set
        const tileSet = state?.tileSet;
        if (tileSet instanceof TileSet || tileSet === null) {
            message.tileSet = state.tileSet;
            // this.#canvasManager.invalidateImage();
            // this.#tileSet = tileSet;
            // refreshTiles = true;
        }
        // Updated tiles
        if (state?.updatedTiles && Array.isArray(state?.updatedTiles)) {
            message.updatedTileIndexes = state.updatedTileIndexes;
            // const updatedTiles = state.updatedTiles;
            // updatedTiles.forEach((tileIndex) => {
            //     this.#canvasManager.invalidateTile(tileIndex);
            // });
            // refreshTiles = true;
        }
        // Updated tile IDs
        if (state?.updatedTileIds && Array.isArray(state?.updatedTileIds)) {
            message.updatedTileIds = state.updatedTiles;
            // const updatedTileIds = state.updatedTileIds;
            // updatedTileIds.forEach((tileId) => {
            //     this.#canvasManager.invalidateTileId(tileId);
            // });
            // refreshTiles = true;
        }
        // Changing scale?
        if (typeof state?.scale === 'number') {
            message.scale = state.scale;
            // if (this.#scale !== state?.scale) {
            //     const scale = state.scale;
            //     if (scale > 0 && scale <= 100) {
            //         this.#scale = state.scale;
            //         this.#canvasManager.invalidateImage();
            //         refreshTiles = true;
            //         updateScale = true;
            //     } else {
            //         throw new Error('Scale must be between 1 and 100.');
            //     }
            // }
        }
        // Changing amount of tiles per block?
        if (typeof state.tilesPerBlock === 'number') {
            message.tilesPerBlock = state.tilesPerBlock;
            // this.#canvasManager.tilesPerBlock = state.tilesPerBlock;
        } else if (state.tilesPerBlock === null) {
            message.tilesPerBlock = 1;
            // this.#canvasManager.tilesPerBlock = 1;
        }
        // Display native?
        if (typeof state?.displayNative === 'boolean') {
            this.#displayNative = state.displayNative;
            if (state.displayNative && this.#paletteList?.getPalettes().filter((p) => p.system === 'gb').length > 0) {
                message.pixelGridColour = '#98a200';
                message.pixelGridOpacity = 0.5;
                message.tileGridColour = '#98a200';
                message.tileGridOpacity = 1;
                // this.#canvasManager.pixelGridColour = '#98a200';
                // this.#canvasManager.pixelGridOpacity = 0.5;
                // this.#canvasManager.tileGridColour = '#98a200';
                // this.#canvasManager.tileGridOpacity = 1;
            } else {
                message.pixelGridColour = '#000000';
                message.pixelGridOpacity = 0.2;
                message.tileGridColour = '#000000';
                message.tileGridOpacity = 0.4;
                // this.#canvasManager.pixelGridColour = '#000000';
                // this.#canvasManager.pixelGridOpacity = 0.2;
                // this.#canvasManager.tileGridColour = '#000000';
                // this.#canvasManager.tileGridOpacity = 0.4;
            }
            updateRenderPaletteList = true;
            // refreshTiles = true;
        }
        // Draw tile grid
        if (typeof state?.showTileGrid === 'boolean') {
            message.showTileGrid = state?.showTileGrid;
            // this.#canvasManager.showTileGrid = state?.showTileGrid;
            // refreshTiles = true;
        }
        // Draw pixel grid
        if (typeof state?.showPixelGrid === 'boolean') {
            message.showPixelGrid = state?.showPixelGrid;
            // this.#canvasManager.showPixelGrid = state?.showPixelGrid;
            // refreshTiles = true;
        }
        // Selected tile index?
        if (typeof state?.selectedTileIndex === 'number') {
            message.selectedTileIndex = state.selectedTileIndex;
            // if (this.#canvasManager.selectedTileIndex !== state.selectedTileIndex) {
            //     this.#canvasManager.selectedTileIndex = state.selectedTileIndex;
            //     redrawUI = true;
            // }
        }
        // Cursor size
        if (typeof state?.cursorSize === 'number') {
            if (state.cursorSize > 0 && state.cursorSize <= 50) {
                message.cursorSize = state.cursorSize;
                // this.#canvasManager.cursorSize = state.cursorSize;
            }
            // redrawUI = true;
        }
        // Cursor type
        if (typeof state?.cursor === 'string') {
            this.#tbCanvas.style.cursor = state.cursor;
        }
        // Reference image
        if (state?.referenceImage instanceof ReferenceImage || state?.referenceImage === null) {
            // this.#canvasManager.clearReferenceImages();
            // if (state?.referenceImage && state.referenceImage.hasImage()) {
            //     this.#canvasManager.addReferenceImage(state.referenceImage);
            //     this.#canvasManager.transparencyGridOpacity = 0;
            // } else {
            //     this.#canvasManager.transparencyGridOpacity = 0.15;
            // }
            // this.#canvasManager.invalidateImage();
            // refreshTiles = true;
        }
        // Transparency indicies index
        if (Array.isArray(state?.transparencyIndicies) || state.transparencyIndicies === null) {
            message.transparencyIndicies = state.transparencyIndicies;
        }
        //     if (Array.isArray(state?.transparencyIndicies)) {
        //     this.#canvasManager.transparencyIndicies = state.transparencyIndicies.filter((i) => typeof i === 'number');
        //     this.#canvasManager.invalidateImage();
        //     refreshTiles = true;
        // } else if (state.transparencyIndicies === null) {
        //     this.#canvasManager.transparencyIndicies = [];
        //     this.#canvasManager.invalidateImage();
        //     refreshTiles = true;
        // }
        // Reference image draw mode
        if (Array.isArray(state?.referenceImageDrawMode) || state.referenceImageDrawMode === null) {
            message.referenceImageDrawMode = state.referenceImageDrawMode;
        }
        // if (typeof state?.referenceImageDrawMode === 'string') {
        //     this.#canvasManager.referenceImageDrawMode = state?.referenceImageDrawMode;
        // } else if (state.referenceImageDrawMode === null) {
        //     this.#canvasManager.referenceImageDrawMode = 'overIndex';
        // }
        // Locked palette slot index
        if (typeof state.lockedPaletteSlotIndex === 'number' || state.lockedPaletteSlotIndex === null) {
            message.lockedPaletteSlotIndex = state.lockedPaletteSlotIndex;
            // this.#canvasManager.lockedPaletteSlotIndex = state.lockedPaletteSlotIndex ?? -1;
            // this.#canvasManager.invalidateImage();
            // refreshTiles = true;
        }
        // Canvas highlight mode
        if (typeof state.canvasHighlightMode === 'number' || state.canvasHighlightMode === null) {
            message.canvasHighlightMode = state.canvasHighlightMode;
        }
        // if (typeof state?.canvasHighlightMode === 'string') {
        //     this.#canvasManager.highlightMode = state.canvasHighlightMode;
        // } else if (typeof state?.canvasHighlightMode === 'object' && state.canvasHighlightMode === null) {
        //     this.#canvasManager.highlightMode = CanvasManager.HighlightModes.pixel;
        // }
        // Tile stamp preview
        if (typeof state.tileStampPreview === 'string' || state.tileStampPreview instanceof TileMap || state.tileStampPreview instanceof Tile || state.tileStampPreview === null) {
            message.tileStampPreview = state.tileStampPreview;
            // this.#canvasManager.setTilePreview(state.tileStampPreview);
        }
        // Selected region 
        if (typeof state?.selectedRegion !== 'undefined') {
            message.selectedRegion = state.selectedRegion;
            // if (state.selectedRegion !== null) {
            //     const r = state.selectedRegion;
            //     this.#canvasManager.setSelectedTileRegion(r.rowIndex, r.columnIndex, r.width, r.height);
            // } else {
            //     this.#canvasManager.clearSelectedTileRegion();
            // }
            // redrawUI = true;
        }
        // Pan horizontal
        if (typeof state?.viewportPanHorizontal === 'number') {
            message.panViewportX = state.viewportPanHorizontal;
            // this.#canvasManager.offsetX += state?.viewportPanHorizontal;
            // redrawUI = true;
        }
        // Pan vertical
        if (typeof state?.viewportPanVertical === 'number') {
            message.panViewportY = state.viewportPanVertical;
            // this.#canvasManager.offsetY += state?.viewportPanVertical;
            // redrawUI = true;
        }
        // Refresh native palette?
        if (updateRenderPaletteList && this.#paletteList) {
            if (this.#displayNative) {
                message.paletteList = PaletteUtil.clonePaletteListWithNativeColours(this.#paletteList, { preserveIds: true });
            } else {
                message.paletteList = this.#paletteList;
            }
            message.paletteListSerialised = PaletteListJsonSerialiser.serialise(this.#paletteList);
            // if (this.#paletteList && this.#displayNative) {
            //     this.#renderPaletteList = PaletteUtil.clonePaletteListWithNativeColours(this.#paletteList, { preserveIds: true });
            // } else if (this.#paletteList && !this.#displayNative) {
            //     this.#renderPaletteList = this.#paletteList;
            // } else {
            //     this.#renderPaletteList = null;
            // }
            // refreshTiles = true;
            // this.#canvasManager.invalidateImage();
        }
        if (this.#lastCoords) {
            message.mousePosition = { x: this.#lastCoords.x, y: this.#lastCoords.y };
        }
        if (typeof state?.focusedTile === 'number' && this.#tileGrid) {
            this.#focusTileOnMessage(state?.focusedTile, message);
        }
        // Force refresh?
        if (typeof state.forceRefresh === 'boolean' && state.forceRefresh === true) {
            message.updateImage = true;
            // refreshTiles = true;
            // this.#canvasManager.invalidateImage();
        }

        message.imageSize = {
            width: this.#tbCanvas.width,
            height: this.#tbCanvas.height
        };

        // Refresh image?
        // TODO figure out how to update scale
        // if ((refreshTiles || redrawUI) && this.#tileGrid && this.#tileSet && this.#paletteList && this.#paletteList.length > 0) {
        //     if (refreshTiles) {
        //         this.#canvasManager.paletteList = this.#renderPaletteList;
        //         this.#canvasManager.tileSet = this.#tileSet;
        //         this.#canvasManager.tileGrid = this.#tileGrid;
        //         if (updateScale) {
        //             // TODO figure out how to update scale
        //             this.#updateCanvasManagerScale(state?.scaleRelativeToMouse ?? false);
        //         }
        //     }
        //     // console.time('Draw UI.'); // TMP 
        //     // if (this.#lastCoords) {
        //     //     this.#canvasManager.drawUI(this.#tbCanvas, this.#lastCoords.x, this.#lastCoords.y);
        //     // } else {
        //     //     this.#canvasManager.drawUI(this.#tbCanvas);
        //     // }
        //     // console.timeEnd('Draw UI.'); // TMP 
        // }

        if (typeof state?.enabled === 'boolean') {
            this.#enabled = state?.enabled;
        }

        // if (this.#tileGrid && typeof state?.focusedTile === 'number') {
        //     this.#focusTile(state?.focusedTile);
        // }

        this.#postImageWorkerMessage(message);
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
        if (!this.#tileGrid) return;

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
                        this.#lastMouseCoords = this.#canvasManager.convertViewportCoordsToCanvasCoords(this.#tbCanvas, ev.clientX, ev.clientY);
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
        if (!this.#tileGrid) return;

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
        if (!this.#tileGrid) return;

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
                    args.command = commands.zoomOut;
                } else {
                    args.command = commands.zoomIn;
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

    // TODO - Delete this when worker canvas manager is happy
    #focusTile(index) {
        const col = index % this.#tileSet.tileWidth;
        const row = Math.floor(index / this.#tileSet.tileWidth);
        const pxPerTile = this.#canvasManager.scale * 8;
        this.#canvasManager.offsetX = col / pxPerTile;
        this.#canvasManager.offsetY = row / pxPerTile;
    }

    /**
     * 
     * @param {number} index 
     * @param {import('./../worker/tileImageWorker.js').TileImageWorkerMessage} message 
     */
    #focusTileOnMessage(index, message) {
        const col = index % this.#tileGrid.columnCount;
        const row = Math.floor(index / this.#tileGrid.rowCount);
        const pxPerTile = this.#scale * 8;
        message.offsetX = col / pxPerTile;
        message.offsetY = row / pxPerTile;
    }


    /**
     * @param {number} scale 
     * @param {boolean} relativeToMouse 
     */
    #updateCanvasManagerScale(scale, relativeToMouse) {
        this.#prevScale = this.#scale;
        this.#scale = scale;
        if (relativeToMouse === true && this.#lastCoords && this.#lastMouseCoords) {
            // Scale / zoom based on mouse coord
            const mouseXRelativeToCentre = -((this.#tbCanvas.clientWidth / 2) - this.#lastMouseCoords.x);
            const zeroOffsetX = (((this.#tileGrid.columnCount * 8) / 2) * this.#scale);
            const hoverPixelNewXOffset = this.#lastCoords.x * this.#scale;
            this.#offsetX = Math.round(zeroOffsetX + mouseXRelativeToCentre - hoverPixelNewXOffset);

            const mouseYRelativeToCentre = -((this.#tbCanvas.clientHeight / 2) - this.#lastMouseCoords.y);
            const zeroOffsetY = (((this.#tileGrid.rowCount * 8) / 2) * this.#scale);
            const hoverPixelNewYOffset = this.#lastCoords.y * this.#scale;
            this.#offsetY = Math.round(zeroOffsetY + mouseYRelativeToCentre - hoverPixelNewYOffset);
        } else {
            // Scale / zoom based on viewport centre
            this.#offsetX = Math.round((this.#offsetX / this.#prevScale) * this.#scale);
            this.#offsetY = Math.round((this.#offsetY / this.#prevScale) * this.#scale);
        }

        this.#postImageWorkerMessage({
            scale: this.#scale,
            offsetX: this.#offsetX,
            offsetY: this.#offsetY
        });
    }


    /**
     * Posts a message to the tile image worker.
     * @param {import('./../worker/tileImageWorker.js').TileImageWorkerMessage} message 
     */
    #postImageWorkerMessage(message) {
        this.#imageWorker.postMessage(message);
    }

    /**
     * Posts a message to the tile image worker.
     * @param {import('./../worker/tileImageWorker.js').TileImageWorkerResponse} response 
     */
    #receiveImageWorkerMessage(response) {
        console.log('receiveImageWorkerMessage', response); // TMP 
        if (!this.#tbCanvasContext) {
            this.#tbCanvasContext = this.#tbCanvas.getContext('2d');
        }
        this.#tbCanvasContext.drawImage(response.tileGridBitmap, 0, 0);
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
 * @property {string?} [referenceImageDrawMode] - Draw mode for the reference image.
 * @property {number[]?} [transparencyIndicies] - Palette indicies that should be rendered as transparent.
 * @property {number?} [lockedPaletteSlotIndex] - When not null, the palette slot index specified here will be repeated from palette 0 across all palettes.
 * @property {boolean?} showTileGrid - Should the tile grid be drawn?
 * @property {boolean?} showPixelGrid - Should the pixel grid be drawn?
 * @property {boolean?} enabled - Is the control enabled or disabled?
 * @property {number?} focusedTile - Will ensure that this tile is shown on the screen.
 * @property {number[]?} updatedTiles - When passing updated tiles, the entire image will not be updated and instead only these tiles will be updated.
 * @property {string[]?} [updatedTileIds] - Array of unique tile IDs that were updated.
 * @property {string?} [canvasHighlightMode] - The highlight mode that the canvas should use.
 * @property {string|Tile|TileMap|null} [tileStampPreview] - Either a tile ID, individual tile object or tile grid object with the tile stamp preview.
 * @property {import("../models/tileGridProvider.js").TileGridRegion} [selectedRegion] - Selected region to highlight.
 * @property {boolean?} [forceRefresh] - When true the tile grid image will be refreshed.
 * @property {TileImageManager?} [tileImageManager] - Tile image manager to use for rendering tiles.
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