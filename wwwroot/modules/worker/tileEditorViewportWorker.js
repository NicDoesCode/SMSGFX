import CanvasManager from "../components/canvasManager.js";
import Tile from "../models/tile.js";
import TileGridProvider from "../models/tileGridProvider.js";
import TileMap from "../models/tileMap.js";
import PaletteListJsonSerialiser from "../serialisers/paletteListJsonSerialiser.js";
import TileGridProviderJsonSerialiser from "../serialisers/tileGridProviderJsonSerialiser.js";
import TileJsonSerialiser from "../serialisers/tileJsonSerialiser.js";
import TileMapJsonSerialiser from "../serialisers/tileMapJsonSerialiser.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";
import ReferenceImage from "./../models/referenceImage.js";


/** @type {OffscreenCanvas} */
let canvas;
/** @type {CanvasRenderingContext2D} */
let canvasContext;
/** @type {TileEditorViewportWorkerMessage[]} */
let canvasManagerUpdateQueue = [];


const canvasManager = new CanvasManager();
canvasManager.backgroundColour = null;
canvasManager.transparencyGridOpacity = 0.15;


addEventListener('message', (/** @type {MessageEvent<{ canvas: OffscreenCanvas?, message: TileEditorViewportWorkerMessage?>} */ e) => {
    if (e.data.canvas) {
        canvas = e.data.canvas;
        canvasContext = canvas.getContext('2d');
    }
    if (e.data.message) {
        canvasManagerUpdateQueue.push(e.data.message);
    }
    if (e.data?.message?.requestBitmapImage === true) {
        getBitmapImage();
    }
});


function refreshCanvasIfRequested() {
    if (canvasManagerUpdateQueue.length > 0) {
        const message = applyQueuedUpdatesToCanvasManager();
        if (message) {
            updateCanvas(message);
            postMessage(makeImageResponse());
        }
    }
    requestAnimationFrame(refreshCanvasIfRequested);
}
requestAnimationFrame(refreshCanvasIfRequested);


function applyQueuedUpdatesToCanvasManager() {
    /** @type {TileEditorViewportWorkerMessage} */
    let lastMessage = null;
    while (canvasManagerUpdateQueue.length > 0) {
        lastMessage = canvasManagerUpdateQueue.shift();
        applyUpdateToCanvasManager(lastMessage);
    }
    return lastMessage;
}


/**
 * Updates the canvas manager with values from the arguments.
 * @param {TileEditorViewportWorkerMessage} message - Message with arguments.
 */
function applyUpdateToCanvasManager(message) {
    if (typeof message.tileGrid === 'object' && message.tileGrid !== null) {
        canvasManager.tileGrid = TileGridProviderJsonSerialiser.fromSerialisable(message.tileGrid);
    } else if (message.tileGrid === null) {
        canvasManager.tileGrid = null;
    }
    if (typeof message.tileSet === 'object' && message.tileSet !== null) {
        canvasManager.tileSet = TileSetJsonSerialiser.fromSerialisable(message.tileSet);
    } else if (message.tileSet === null) {
        canvasManager.tileSet = null;
    }
    if (typeof message.paletteList === 'object' && message.paletteList !== null) {
        canvasManager.paletteList = PaletteListJsonSerialiser.fromSerialisable(message.paletteList);
    } else if (message.paletteList === null) {
        canvasManager.paletteList = null;
    }
    if (Array.isArray(message.updatedTileGridTiles)) {
        message.updatedTileGridTiles.forEach((tileInfo) => {
            if (canvasManager.tileGrid instanceof TileMap) {
                /** @type {TileMap} */ const tileMap = canvasManager.tileGrid;
                const tileMapTile = tileMap.getTileByIndex(tileInfo.tileIndex);
                if (tileMapTile) {
                    tileMapTile.tileId = tileInfo.tileId;
                    tileMapTile.horizontalFlip = tileInfo.horizontalFlip;
                    tileMapTile.verticalFlip = tileInfo.verticalFlip;
                    tileMapTile.palette = tileInfo.paletteIndex;
                }
                canvasManager.invalidateTile(tileInfo.tileIndex);
            }
        });
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
        canvasManager.showPixelGrid = message.showPixelGrid;
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

    // Reference image

    if (typeof message.referenceImage === 'object' && message.referenceImage !== null) {
        canvasManager.clearReferenceImages();
        const referenceImage = ReferenceImage.fromObject(message.referenceImage);
        if (referenceImage && referenceImage.hasImage()) {
            canvasManager.addReferenceImage(referenceImage);
            canvasManager.transparencyGridOpacity = 0;
        } else {
            canvasManager.transparencyGridOpacity = 0.15;
        }
        canvasManager.invalidateImage();
    } else if (message.referenceImage === null) {
        canvasManager.clearReferenceImages();
        canvasManager.transparencyGridOpacity = 0.15;
        canvasManager.invalidateImage();
    }
    if (message.referenceImageBounds && message.referenceImageBounds !== null) {
        if (canvasManager.getReferenceImageCount() > 0) {
            const ref = canvasManager.getReferenceImageByIndex(0);
            const b = message.referenceImageBounds;
            ref.setBounds(b.x, b.y, b.width, b.height);
        }
    }
    if (typeof message.referenceImageDrawMode === 'string') {
        canvasManager.referenceImageDrawMode = message.referenceImageDrawMode;
    } else if (message.referenceImageDrawMode === null) {
        canvasManager.referenceImageDrawMode = 'overIndex';
    }
    if (message.tileStampPattern) {
        const pattern = TileMapJsonSerialiser.fromSerialisable(message.tileStampPattern);
        canvasManager.setTilePreview(pattern);
    } else if (message.tileStampPattern === null) {
        canvasManager.setTilePreview(null);
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
        canvas.width = message.imageSize?.width ?? 500;
        canvas.height = message.imageSize?.height ?? 500;
    }
}

/**
 * @param {TileEditorViewportWorkerMessage} message
 * @returns {{ response: TileEditorViewportWorkerResponse, canvas: OffscreenCanvas }}
 */
function updateCanvas(message) {
    if (canvasManager.canDraw) {
        if (message.mousePosition) {
            const pos = message.mousePosition;
            canvasManager.drawUI(canvasContext, { width: canvas.width, height: canvas.height }, pos.x, pos.y);
        } else {
            canvasManager.drawUI(canvasContext, { width: canvas.width, height: canvas.height });
        }
    }
}


function getBitmapImage() {
    if (canvasManager.canDraw) {
        const result = canvasManager.toImageBitmap();
        /** @type {TileEditorViewportWorkerResponse} */
        const message = makeImageResponse();
        message.tileGridImage = result;
        postMessage(message);
    }
}


/**
 * @returns {TileEditorViewportWorkerResponse}
 */
function makeImageResponse() {
    return {
        hasTileGrid: canvasManager.tileGrid !== null,
        hasTileSet: canvasManager.tileSet !== null,
        hasPalettes: canvasManager.paletteList !== null,
        isTileMap: canvasManager.tileGrid !== null && canvasManager.tileGrid instanceof TileMap,
        tileGridBitmap: null,
        canvasSize: {
            width: canvas.width,
            height: canvas.height
        },
        tileGridImage: {
            width: canvasManager.tileGrid ? (canvasManager.tileGrid.columnCount * 8 * canvasManager.scale) : 1,
            height: canvasManager.tileGrid ? (canvasManager.tileGrid.rowCount * 8 * canvasManager.scale) : 1
        },
        tileGridDimension: {
            rows: canvasManager.tileGrid?.rowCount ?? 1,
            columns: canvasManager.tileGrid?.columnCount ?? 1
        },
        tileGridOffset: {
            x: canvasManager.offsetX,
            y: canvasManager.offsetY,
        },
        scale: canvasManager.scale,
        tilesPerBlock: canvasManager.tilesPerBlock
    }
}


/**
 * @typedef {Object} TileEditorViewportWorkerMessage 
 * @property {boolean} [requestBitmapImage] - When true, a bitmap image will be returned.
 * @property {boolean} [redrawFull] - When true, the image will be updated and posted back, when set, it also implies update UI.
 * @property {boolean} [redrawPartial] - When true, the UI component of the image will be updated and posted back.
 * @property {import('../types.js').Coordinate} [mousePosition] - Mouse X and Y position.
 * @property {import('../serialisers/tileGridProviderJsonSerialiser.js').TileGridProviderSerialisable?} [tileGrid] - Tile grid to draw.
 * @property {import('../serialisers/tileSetJsonSerialiser.js').TileSetSerialisable?} [tileSet] - Tile set that contains the tiles used by the tile grid.
 * @property {import('../serialisers/paletteJsonSerialiser.js').PaletteSerialisable[]?} [paletteList] - Pallette list used by the tile grid.
 * @property {import("./../models/tileGridProvider.js").TileProviderTileInfo[]?} [updatedTileGridTiles] - Triggers a redraw of only the given tile IDs in this array.
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
 * @property {import('./../models/referenceImage.js').ReferenceImageObject} [referenceImage] - Reference image to display.
 * @property {import('../types.js').Bounds} [referenceImageBounds] - Bounds for the reference image.
 * @property {string} [referenceImageDrawMode] - Draw mode for the reference image.
 * @property {import('../serialisers/tileMapJsonSerialiser.js').TileMapSerialisable|null} [tileStampPattern] - Serialisable tile map object that contains the tile stamp pattern.
 * @property {import("../models/tileGridProvider.js").TileGridRegion} [selectedRegion] - Selected region to highlight.
 * @property {import('../types.js').Dimension} [imageSize] - Size of the output image.
 * @exports
 */

/**
 * @typedef {Object} TileEditorViewportWorkerResponse
 * @property {boolean} hasTileGrid 
 * @property {boolean} hasTileSet 
 * @property {boolean} hasPalettes 
 * @property {boolean} isTileMap 
 * @property {ImageBitmap?} [tileGridImage] - An image of the tile grid.
 * @property {import('../types.js').Dimension} [canvasSize] - Pixel dimensions of the viewport.
 * @property {import('../types.js').Dimension} [tileGridImage] - Pixel dimensions of the tile grid image.
 * @property {import('../types.js').GridDimension} [tileGridDimension] - Dimension of the tile grid in rows and columns.
 * @property {import('../types.js').Coordinate} [tileGridOffset] - Offset of the tile grid image relative to the centre of the viewport.
 * @property {number} [scale] - Image drawing scale, 1 = 1:1, 2 = 2:1, 15 = 15:1.
 * @property {number} [tilesPerBlock] - Size of each block of tiles.
 * @exports
 */
