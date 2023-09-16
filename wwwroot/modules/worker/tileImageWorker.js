import CanvasManager from "../components/canvasManager.js";
import PaletteList from "../models/paletteList.js";
import Tile from "../models/tile.js";
import TileGridProvider from "../models/tileGridProvider.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";
import PaletteListJsonSerialiser from "../serialisers/paletteListJsonSerialiser.js";


const canvasManager = new CanvasManager();
const canvas = new OffscreenCanvas(8, 8);
let imageUpdateQueued = false;
let isBusy = false;
/** @type {TileImageWorkerMessage[]} */
let canvasManagerUpdateQueue = [];


addEventListener('message', (/** @type {MessageEvent<TileImageWorkerMessage>} */ e) => {
    console.log('worker: message', e.data); // TMP 
    if (e.data) {
        canvasManagerUpdateQueue.push(e.data);

        if (e.data.updateImage === true) {
            process();
        }
    }
});


function process() {
    console.log('process'); // TMP 
    if (isBusy) {
        console.log('process, queue update'); // TMP 
        imageUpdateQueued = true;
    } else {
        console.log('process, make image'); // TMP 
        isBusy = true;
        imageUpdateQueued = false;

        const message = applyQueuedUpdatesToCanvasManager();
        const result = generateTheImageResponse(message);
        postMessage(result);

        isBusy = false;
        if (imageUpdateQueued) process();
    }
}


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
    if (message.tileGrid instanceof TileGridProvider) {
        canvasManager.tileGrid = message.tileGrid;
    }
    if (message.tileSet instanceof TileSet) {
        canvasManager.tileSet = message.tileSet;
    }
    if (message.paletteList instanceof PaletteList) {
        canvasManager.paletteList = message.paletteList;
    }
    if (message.tileGrid) {
        canvasManager.tileGrid = message.tileGrid;
    }
    if (message.tileSet) {
        canvasManager.tileSet = message.tileSet;
    }
    if (message.paletteList) {
        canvasManager.paletteList = PaletteListJsonSerialiser.deserialise(message.paletteList);
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
    if (message.imageSize) {
        console.log('worker: resize', message.imageSize); // TMP
        canvas.width = message.imageSize?.width ?? canvas.width;
        canvas.height = message.imageSize?.width ?? canvas.height;
    }
}

/**
 * @param {TileImageWorkerMessage} message
 * @returns {TileImageWorkerResponse}
 */
function generateTheImageResponse(message) {
    console.log('generateTheImageResponse message.imageSize'); // TMP
    if (message.mousePosition) {
        const pos = message.mousePosition;
        canvasManager.drawUI(canvas, pos.x, pos.y);
    } else {
        canvasManager.drawUI(canvas);
    }
    return {
        tileGridBitmap: canvas.transferToImageBitmap()
    };
}


/**
 * @typedef {Object} TileImageWorkerMessage 
 * @property {boolean} [updateImage] - When true, the image will be updated and posted back, when set, it also implies update UI.
 * @property {boolean} [updateUI] - When true, the UI component of the image will be updated and posted back.
 * @property {import('./../types.js').Coordinate} [mousePosition] - Mouse X and Y position.
 * @property {TileGridProvider?} [tileGrid] - Tile grid to draw.
 * @property {TileSet} [tileSet] - Tile set that contains the tiles used by the tile grid.
 * @property {PaletteList} [paletteList] - Pallette list used by the tile grid.
 * @property {string[]} [updatedTileIndexes] - Triggers a redraw of only the tiles at the given index in the tile set.
 * @property {string[]} [updatedTileIds] - Triggers a redraw of only the given tile IDs in this array.
 * @property {string} [canvasHighlightMode] - Highlighting mode for the canvas manager.
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
 * @property {ImageBitmap} tileGridBitmap 
 * @exports
 */

