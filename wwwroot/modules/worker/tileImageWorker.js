import CanvasManager from "../components/canvasManager.js";
import PaletteList from "../models/paletteList.js";
import Tile from "../models/tile.js";
import TileGridProvider from "../models/tileGridProvider.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";
import PaletteListJsonSerialiser from "../serialisers/paletteListJsonSerialiser.js";
import TileGridProviderJsonSerialiser from "../serialisers/tileGridProviderJsonSerialiser.js";
import TileJsonSerialiser from "../serialisers/tileJsonSerialiser.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";


const canvasManager = new CanvasManager();
// let canvas = new OffscreenCanvas(500, 500);
/** @type {OffscreenCanvas} */
let canvas;
/** @type {CanvasRenderingContext2D} */
let canvasContext;
let imageUpdateQueued = false;
let isBusy = false;
/** @type {TileImageWorkerMessage[]} */
let canvasManagerUpdateQueue = [];


addEventListener('message', (/** @type {MessageEvent<{ canvas: OffscreenCanvas?, message: TileImageWorkerMessage?>} */ e) => {
    // console.log('worker: message', e.data); // TMP 
    if (e.data.canvas) {
        // console.log('workder: got canvas'); // TMP 
        canvas = e.data.canvas;
        canvasContext = canvas.getContext('2d');
    }
    if (e.data.message) {
        // console.log('workder: got message'); // TMP 
        canvasManagerUpdateQueue.push(e.data.message);

        // if (e.data.message.updateImage === true || e.data.message.updateUI === true) {
        //     // process();
        // }
    }
});


function process() {
    // console.log('process'); // TMP 
    // if (isBusy) {
    //     console.log('process, queue update'); // TMP 
    //     imageUpdateQueued = true;
    // } else {
    // console.log('process, make image'); // TMP 
    // isBusy = true;
    // imageUpdateQueued = false;

    if (canvasManagerUpdateQueue.length > 0) {
        const message = applyQueuedUpdatesToCanvasManager();
        if (message) {
            const response = generateTheImageResponse(message);
            postMessage(response);
        }
    }

    // isBusy = false;
    // if (imageUpdateQueued) setTimeout(() => {
    // setTimeout(() => {
    //     console.log('Wait and process'); // TMP 
    //     process();
    // }, 500);
    // // }
    requestAnimationFrame(process);
}
requestAnimationFrame(process);
// setTimeout(() => process(), 500);


function applyQueuedUpdatesToCanvasManager() {
    /** @type {TileImageWorkerMessage} */
    let lastMessage = null;
    while (canvasManagerUpdateQueue.length > 0) {
        lastMessage = canvasManagerUpdateQueue.pop();
        applyUpdateToCanvasManager(lastMessage);
    }
    return lastMessage;
}


/**
 * Updates the canvas manager with values from the arguments.
 * @param {TileImageWorkerMessage} message - Message with arguments.
 */
function applyUpdateToCanvasManager(message) {
    if (typeof message.tileGrid === 'object') {
        canvasManager.tileGrid = TileGridProviderJsonSerialiser.fromSerialisable(message.tileGrid);
    } else if (message.tileGrid === null) {
        canvasManager.tileGrid = null;
    }
    if (typeof message.tileSet === 'object') {
        canvasManager.tileSet = TileSetJsonSerialiser.fromSerialisable(message.tileSet);
    } else if (message.tileSet === null) {
        canvasManager.tileSet = null;
    }
    if (typeof message.paletteList === 'object') {
        canvasManager.paletteList = PaletteListJsonSerialiser.fromSerialisable(message.paletteList);
    } else if (message.paletteList === null) {
        canvasManager.paletteList = null;
    }
    if (Array.isArray(message.updatedTiles)) {
        message.updatedTiles
            .forEach((tileSerialisable) => {
                const tile = TileJsonSerialiser.fromSerialisable(tileSerialisable);
                canvasManager.tileSet.getTileById(tile.tileId).setData(tile.readAll());
                canvasManager.invalidateTileId(tile.tileId);
            });
    }
    if (Array.isArray(message.updatedTileIndexes)) {
        message.updatedTileIndexes
            .filter((tileIndex) => typeof tileIndex === 'number' && tileIndex >= 0)
            .forEach((tileIndex) => canvasManager.invalidateTile(tileIndex));
    }
    if (Array.isArray(message.updatedTileIds)) {
        message.updatedTileIds
            .filter((tileId) => typeof tileId === 'string')
            .forEach((tileId) => canvasManager.invalidateTileId(tileId));
    }
    if (typeof message.scale === 'number') {
        if (canvasManager.scale !== message?.scale) {
            canvasManager.scale = message.scale;
        }
    }
    if (typeof message.canvasHighlightMode === 'string' || message.canvasHighlightMode === null) {
        canvasManager.highlightMode = message.canvasHighlightMode ?? CanvasManager.HighlightModes.pixel;
    }
    if (typeof message.tilesPerBlock === 'number') {
        canvasManager.tilesPerBlock = message.tilesPerBlock;
    }
    if (typeof message.selectedTileIndex === 'number') {
        if (canvasManager.selectedTileIndex !== message.selectedTileIndex) {
            canvasManager.selectedTileIndex = message.selectedTileIndex;
        }
    }
    if (typeof message.cursorSize === 'number') {
        if (message.cursorSize > 0 && message.cursorSize <= 50) {
            canvasManager.cursorSize = message.cursorSize;
        }
    }
    if (typeof message.showTileGrid === 'boolean') {
        canvasManager.showTileGrid = message.showTileGrid;
    }
    if (typeof message.showPixelGrid === 'boolean') {
        canvasManager.showTileGrid = message.showTileGrid;
    }
    if (Array.isArray(message.transparencyIndicies)) {
        canvasManager.transparencyIndicies = message.transparencyIndicies.filter((i) => typeof i === 'number');
    } else if (message.transparencyIndicies === null) {
        canvasManager.transparencyIndicies = [];
    }
    if (typeof message.lockedPaletteSlotIndex === 'number' || message.lockedPaletteSlotIndex === null) {
        canvasManager.lockedPaletteSlotIndex = message.lockedPaletteSlotIndex ?? -1;
    }
    if (typeof message.offsetX === 'number') {
        canvasManager.offsetX = message.offsetX;
    }
    if (typeof message.offsetY === 'number') {
        canvasManager.offsetY = message.offsetY;
    }
    if (typeof message.panViewportX === 'number') {
        canvasManager.offsetX += message.panViewportX;
    }
    if (typeof message.panViewportY === 'number') {
        canvasManager.offsetY += message.panViewportY;
    }
    if (typeof message.backgroundColour === 'string' || message.backgroundColour === null) {
        canvasManager.backgroundColour = message.backgroundColour;
    }
    if (typeof message.pixelGridColour === 'string') {
        canvasManager.pixelGridColour = message.pixelGridColour;
    }
    if (typeof message.pixelGridOpacity === 'number') {
        canvasManager.pixelGridOpacity = message.pixelGridOpacity;
    }
    if (typeof message.tileGridColour === 'string') {
        canvasManager.tileGridColour = message.tileGridColour;
    }
    if (typeof message.tileGridOpacity === 'number') {
        canvasManager.tileGridOpacity = message.tileGridOpacity;
    }
    if (typeof message.transparencyGridOpacity === 'number') {
        canvasManager.transparencyGridOpacity = message.transparencyGridOpacity;
    }
    if (typeof message.referenceImageDrawMode === 'string') {
        canvasManager.referenceImageDrawMode = message.referenceImageDrawMode;
    } else if (message.referenceImageDrawMode === null) {
        canvasManager.referenceImageDrawMode = 'overIndex';
    }
    if (typeof message.tileStampPreview === 'string' || message.tileStampPreview instanceof TileMap || message.tileStampPreview instanceof Tile || message.tileStampPreview === null) {
        canvasManager.setTilePreview(message.tileStampPreview);
    }
    if (typeof message.selectedRegion !== 'undefined') {
        if (message.selectedRegion !== null) {
            const r = message.selectedRegion;
            canvasManager.setSelectedTileRegion(r.rowIndex, r.columnIndex, r.width, r.height);
        } else {
            canvasManager.clearSelectedTileRegion();
        }
    }
    if (message.imageSize && message.imageSize.width && message.imageSize.height) {
        // console.log('worker: resize', message.imageSize); // TMP
        // console.log('worker: width', message.imageSize?.width ?? 500); // TMP
        // console.log('worker: height', message.imageSize?.height ?? 500); // TMP
        // canvas = new OffscreenCanvas(message.imageSize?.width ?? 500, message.imageSize?.height ?? 500);
        canvas.width = message.imageSize?.width ?? 500;
        canvas.height = message.imageSize?.height ?? 500;
    }
}

/**
 * @param {TileImageWorkerMessage} message
 * @returns {{ response: TileImageWorkerResponse, canvas: OffscreenCanvas }}
 */
function generateTheImageResponse(message) {
    // console.log('generateTheImageResponse message.imageSize'); // TMP
    // /** @type {OffscreenCanvas} */
    // let drawCanvas = null;
    const response = makeImageResponse();
    if (canvasManager.canDraw) {
        // drawCanvas = new OffscreenCanvas(canvas.width, canvas.height);
        // console.log('draw'); // TMP
        if (message.mousePosition) {
            const pos = message.mousePosition;
            canvasManager.drawUI(canvasContext, { width: canvas.width, height: canvas.height }, pos.x, pos.y);
        } else {
            canvasManager.drawUI(canvasContext, { width: canvas.width, height: canvas.height });
        }
        // try {
        //     response.hasImage = true;
        //     // response.tileGridBitmap = drawCanvas;
        //     // response.tileGridBitmap = canvas.transferToImageBitmap();
        // } catch (e) {
        //     console.error('generateTheImageResponse error', e); // TMP
        // }
    }
    return response;
}

/**
 * @returns {TileImageWorkerResponse}
 */
function makeImageResponse() {
    return {
        hasTileGrid: canvasManager.tileGrid !== null,
        hasTileSet: canvasManager.tileSet !== null,
        hasPalettes: canvasManager.paletteList !== null,
        isTileMap: canvasManager.tileGrid !== null && canvasManager.tileGrid instanceof TileMap,
        hasImage: false,
        tileGridBitmap: null,
        canvasSize: {
            width: canvas.width,
            height: canvas.height
        },
        tileGridRows: canvasManager.tileGrid?.rowCount ?? 1,
        tileGridColumns: canvasManager.tileGrid?.columnCount ?? 1,
        offsetX: canvasManager.offsetX,
        offsetY: canvasManager.offsetY,
        scale: canvasManager.scale,
        tilesPerBlock: canvasManager.tilesPerBlock
    }
}


/**
 * @typedef {Object} TileImageWorkerMessage 
 * @property {boolean} [updateImage] - When true, the image will be updated and posted back, when set, it also implies update UI.
 * @property {boolean} [updateUI] - When true, the UI component of the image will be updated and posted back.
 * @property {import('./../types.js').Coordinate} [mousePosition] - Mouse X and Y position.
 * @property {import('./../serialisers/tileGridProviderJsonSerialiser.js').TileGridProviderSerialisable?} [tileGrid] - Tile grid to draw.
 * @property {import('./../serialisers/tileSetJsonSerialiser.js').TileSetSerialisable?} [tileSet] - Tile set that contains the tiles used by the tile grid.
 * @property {import('./../serialisers/paletteJsonSerialiser.js').PaletteSerialisable[]?} [paletteList] - Pallette list used by the tile grid.
 * @property {import('../serialisers/tileJsonSerialiser.js').TileSerialisable[]} [updatedTiles] - Triggers a redraw of only the given tile IDs in this array.
 * @property {string[]} [updatedTileIndexes] - Triggers a redraw of only the tiles at the given index in the tile set.
 * @property {string[]} [updatedTileIds] - Triggers a redraw of only the given tile IDs in this array.
 * @property {string} [canvasHighlightMode] - How the canvas highlights what is under the mouse cursor (pixel, row, column, etc).
 * @property {number} [scale] - Image drawing scale, 1 = 1:1, 2 = 2:1, 15 = 15:1.
 * @property {number} [tilesPerBlock] - Size of each block of tiles.
 * @property {number} [selectedTileIndex] - Selected index of a tile, -1 means no selection.
 * @property {number} [cursorSize] - Cursor size.
 * @property {boolean} [showTileGrid] - Draw grid lines for the tiles?
 * @property {boolean} [showPixelGrid] - Draw grid lines for the pixels?
 * @property {number[]?} [transparencyIndicies] - Palette indicies for transparency.
 * @property {number?} [lockedPaletteSlotIndex] - Locked palette slot index from 0 to 15, null for none.
 * @property {number} [offsetX] - X offset of the tile grid image.
 * @property {number} [offsetY] - Y offset of the tile grid image.
 * @property {number} [panViewportX] - When set, the viewport will be panned on the X axis by this amount of pixels.
 * @property {number} [panViewportY] - When set, the viewport will be panned on the Y axis by this amount of pixels.
 * @property {string?} [backgroundColour] - Background colour of the viewport, set to null for transparency.
 * @property {string} [pixelGridColour] - Colour of the pixel grid.
 * @property {number} [pixelGridOpacity] - Opacity of the pixel grid.
 * @property {string} [tileGridColour] - Colour of the tile grid.
 * @property {number} [tileGridOpacity] - Opacity of the tile grid.
 * @property {number} [transparencyGridOpacity] - Opacity of the transparency grid.
 * @property {string} [referenceImageDrawMode] - Draw mode for the reference image.
 * @property {string|Tile|TileGridProvider|null} [tileStampPreview] - Either a tile ID, individual tile object or tile grid object with the tile stamp preview.
 * @property {import("../models/tileGridProvider.js").TileGridRegion} [selectedRegion] - Selected region to highlight.
 * @property {import('./../types.js').Dimension} [imageSize] - Size of the output image.
 * @exports
 */
/**
 * @typedef {Object} TileImageWorkerResponse
 * @property {boolean} hasImage 
 * @property {ImageBitmap?} tileGridBitmap 
 * @property {boolean} hasTileGrid 
 * @property {boolean} hasTileSet 
 * @property {boolean} hasPalettes 
 * @property {boolean} isTileMap 
 * @property {import('./../types.js').Dimension} [canvasSize] - Size of the canvas object.
 * @property {number} [tileGridRows]
 * @property {number} [tileGridColumns]
 * @property {number} [offsetX] - X offset of the tile grid image.
 * @property {number} [offsetY] - Y offset of the tile grid image.
 * @property {number} [scale] - Image drawing scale, 1 = 1:1, 2 = 2:1, 15 = 15:1.
 * @property {number} [tilesPerBlock] - Size of each block of tiles.
 * @exports
 */
