import ColourUtil from './colourUtil.js';
import Palette from '../models/palette.js';
import Tile from '../models/tile.js';
import TileSet from '../models/tileSet.js'
import TileGridProvider from '../models/tileGridProvider.js';

export default class PaintUtil {


    /**
     * Draws onto a tile grid, returns the ID and indexes of any updated tiles.
     * @param {TileGridProvider} tileGrid - Tile grid that contains information about the tile layout.
     * @param {TileSet} tileSet - Tile set with the tiles to draw onto.
     * @param {number} x - X coordinate in the tile grid.
     * @param {number} y - Y coordinate in the tile grid.
     * @param {number} colourIndex - Colour palette index, 0 to 15.
     * @param {DrawOptions} options - Options for drawing onto the tile grid.
     * @returns {DrawResult}
     */
    static drawOnTileGrid(tileGrid, tileSet, x, y, colourIndex, options) {
        const updatedTileIndexes = [];
        /** @type {Object.<string, number>} */
        const updatedTileIds = {};

        const tileInfo = tileGrid.getTileInfoByPixel(x, y);
        if (tileInfo === null || tileInfo < 0) return;

        const brushSize = options.brushSize ?? 1;
        if (brushSize < 1 || brushSize > 100) throw new Error('Brush size must be between 1 and 100 px.');

        if (brushSize === 1) {
            const coord = translateCoordinate(tileInfo, x % 8, y % 8);
            const tile = tileSet.getTileById(tileInfo.tileId);
            const drawSuccess = tile.setValueAtCoord(coord.x, coord.y, colourIndex);
            if (drawSuccess) {
                updatedTileIndexes.push(tileInfo.tileIndex);
                updatedTileIds[tileInfo.tileId] = tileInfo;
            }
        } else {
            const affect = options?.affectAdjacentTiles ?? true;
            const startX = x - Math.floor(brushSize / 2);
            const startY = y - Math.floor(brushSize / 2);
            const endX = x + Math.ceil(brushSize / 2);
            const endY = y + Math.ceil(brushSize / 2);
            for (let yPx = startY; yPx < endY; yPx++) {
                const xLeft = (brushSize > 3 && (yPx === startY || yPx === endY - 1)) ? startX + 1 : startX;
                const xRight = (brushSize > 3 && (yPx === startY || yPx === endY - 1)) ? endX - 1 : endX;
                for (let xPx = xLeft; xPx < xRight; xPx++) {
                    const thisTileInfo = tileGrid.getTileInfoByPixel(xPx, yPx);
                    if (thisTileInfo !== null && thisTileInfo.tileIndex >= 0) {
                        const differentTile = thisTileInfo.tileIndex !== tileInfo.tileIndex;
                        if (!differentTile || affect) {
                            const coord = translateCoordinate(thisTileInfo, xPx % 8, yPx % 8);
                            const tile = tileSet.getTileById(thisTileInfo.tileId);
                            const drawSuccess = tile.setValueAtCoord(coord.x, coord.y, colourIndex);
                            if (drawSuccess) {
                                if (!updatedTileIndexes.includes(thisTileInfo.tileIndex)) updatedTileIndexes.push(thisTileInfo.tileIndex);
                                updatedTileIds[thisTileInfo.tileId] = tileInfo;
                            }
                        }
                    }
                }
            }
        }

        return {
            affectedTileIndexes: updatedTileIndexes,
            affectedTileIds: Object.keys(updatedTileIds)
        };
    }


    /**
     * Replaces a colour on the tile grid with another colour, returns IDs and indexes of any updated tiles.
     * @param {TileGridProvider} tileGrid - Tile grid that contains information about the tile layout.
     * @param {TileSet} tileSet - Tile set with the tiles to draw onto.
     * @param {number} x - X coordinate in the tile set.
     * @param {number} y - Y coordinate in the tile set.
     * @param {number} sourceColourIndex - Colour index that will be replaced, 0 to 15.
     * @param {number} replacementColourIndex - Colour index to replace any instance of the source colour with, 0 to 15.
     * @param {DrawOptions} options - Options for drawing onto the tile set.
     * @returns {DrawResult}
     */
    static replaceColourOnTileGrid(tileGrid, tileSet, x, y, sourceColourIndex, replacementColourIndex, options) {
        const updatedTileIndexes = [];
        /** @type {Object.<string, number>} */
        const updatedTileIds = {};

        const tileInfo = tileGrid.getTileInfoByPixel(x, y);
        if (tileInfo === null || tileInfo < 0) return;

        const brushSize = options.brushSize ?? 1;
        if (brushSize < 1 || brushSize > 100) throw new Error('Brush size must be between 1 and 100 px.');

        if (brushSize === 1) {
            const coord = translateCoordinate(tileInfo, x % 8, y % 8);
            const tile = tileSet.getTileById(tileInfo.tileId);
            const currentColourIndex = tile.readAtCoord(coord.x, coord.y);
            if (currentColourIndex === sourceColourIndex) {
                const drawSuccess = tile.setValueAtCoord(coord.x, coord.y, replacementColourIndex);
                if (drawSuccess) {
                    updatedTileIndexes.push(tileInfo.tileIndex);
                    updatedTileIds[tileInfo.tileId] = tileInfo;
                }
            }
        } else {
            const affect = options?.affectAdjacentTiles ?? true;
            const startX = x - Math.floor(brushSize / 2);
            const startY = y - Math.floor(brushSize / 2);
            const endX = x + Math.ceil(brushSize / 2);
            const endY = y + Math.ceil(brushSize / 2);
            for (let yPx = startY; yPx < endY; yPx++) {
                const xLeft = (brushSize > 3 && (yPx === startY || yPx === endY - 1)) ? startX + 1 : startX;
                const xRight = (brushSize > 3 && (yPx === startY || yPx === endY - 1)) ? endX - 1 : endX;
                for (let xPx = xLeft; xPx < xRight; xPx++) {
                    const thisTileIndex = tileSet.getTileIndexByCoordinate(xPx, yPx);
                    if (thisTileIndex !== null && thisTileIndex >= 0) {
                        const differentTile = thisTileIndex !== tileIndex;
                        if (!differentTile || affect) {
                            const coord = translateCoordinate(thisTileInfo, xPx % 8, yPx % 8);
                            const tile = tileSet.getTileById(thisTileInfo.tileId);
                            const currentColourIndex = tile.readAtCoord(coord.x, coord.y);
                            if (currentColourIndex === sourceColourIndex) {
                                const drawSuccess = tile.setValueAtCoord(coord.x, coord.y, replacementColourIndex);
                                if (drawSuccess) {
                                    if (!updatedTileIndexes.includes(thisTileInfo.tileIndex)) updatedTileIndexes.push(thisTileInfo.tileIndex);
                                    updatedTileIds[thisTileInfo.tileId] = tileInfo;
                                }
                            }
                        }
                    }
                }
            }
        }

        return {
            affectedTileIndexes: updatedTileIndexes,
            affectedTileIds: Object.keys(updatedTileIds)
        };
    }


    /**
     * Fills a contiguious area on a tile set of one colour with another colour.
     * @param {TileSet} tileSet - Tile set to fill.
     * @param {number} x - Origin X coordinate.
     * @param {number} y - Origin Y coordinate.
     * @param {number} fillColour - Palette index to fill with.
     */
    static fillOnTileSet(tileSet, x, y, fillColour) {
        const w = tileSet.tileWidth * 8;
        const h = tileSet.tileHeight * 8;
        if (x < 0 || x >= w || y < 0 || y >= h) throw 'Invalid origin coordinates.';

        const originColour = tileSet.getPixelAt(x, y);
        if (originColour === null || originColour === fillColour) return;

        const props = { tileSet, w, h, originColour };

        if (pxIsInsideImageAndMatchesOriginColour(x, y, props)) {

            /** @type {Coordinate[]} */
            let scanCoords = [{ x, y }];
            while (scanCoords.length > 0) {

                const scanCoord = scanCoords.pop();
                const y = scanCoord.y;

                // Fill left of the origin
                let leftX = scanCoord.x;
                while (pxIsInsideImageAndMatchesOriginColour(pxToLeftOf(leftX), y, props)) {
                    setColourOnPixel(tileSet, pxToLeftOf(leftX), y, fillColour);
                    leftX = pxToLeftOf(leftX);
                }

                // Fill right of the origin
                let rightX = scanCoord.x - 1;
                while (pxIsInsideImageAndMatchesOriginColour(pxToRightOf(rightX), y, props)) {
                    setColourOnPixel(tileSet, pxToRightOf(rightX), y, fillColour);
                    rightX = pxToRightOf(rightX);
                }

                // Now scan the line above and below this one, if any matching pixels 
                // found then add them to the coords list
                scanCoords = scanCoords
                    .concat(scanLineForBlocksOfPixelsWithSameOriginColour(leftX, rightX, oneBelow(y), props))
                    .concat(scanLineForBlocksOfPixelsWithSameOriginColour(leftX, rightX, oneAbove(y), props));
            }

        }

    }

    /**
     * Draw a single tile to a canvas.
     * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
     * @param {Tile} tile - Tile to draw.
     * @param {Palette} palette - Palette to use to render the pixel.
     */
    static drawTile(canvas, tile, palette) {
        const context = canvas.getContext('2d');
        const numColours = palette.getColours().length;

        const w = canvas.width / 8;
        const h = canvas.height / 8;

        for (let tilePx = 0; tilePx < 64; tilePx++) {

            const tileCol = tilePx % 8;
            const tileRow = (tilePx - tileCol) / 8;

            const x = tileCol * w;
            const y = tileRow * h;

            let pixelPaletteIndex = tile.readAt(tilePx);

            // Set colour
            if (pixelPaletteIndex >= 0 && pixelPaletteIndex < numColours) {
                const colour = palette.getColour(pixelPaletteIndex);
                const hex = ColourUtil.toHex(colour.r, colour.g, colour.b);
                context.fillStyle = hex;
            }

            context.moveTo(0, 0);
            context.fillRect(x, y, w, h);
        }
    }


}

const pxToLeftOf = px => px - 1;
const pxToRightOf = px => px + 1;
const oneAbove = line => line - 1;
const oneBelow = line => line + 1;

/**
 * Performs a scan on a given horizontal line and adds one
 * entry to the coordinate array per uninterrupted line of
 * origin colour. 
 * @param {number} leftX - Left X coordinate to start scan from.
 * @param {number} rightX - Right X coordinate to end scan at.
 * @param {number} y - Vertical line number to perform the scan on.
 * @param {FillProps} props - Object containing fill properties.
 * @returns {Coordinate[]}
 */
function scanLineForBlocksOfPixelsWithSameOriginColour(leftX, rightX, y, props) {
    /** @type {Coordinate[]} */
    const singlePixelFromEachFoundBlockOfSameColourPixels = [];
    let isNewLineOfSameColourPixels = false;
    for (let x = leftX; x <= rightX; x++) {
        const thisPxMatchesOriginColour = pxIsInsideImageAndMatchesOriginColour(x, y, props);
        if (thisPxMatchesOriginColour && !isNewLineOfSameColourPixels) {
            isNewLineOfSameColourPixels = true;
            singlePixelFromEachFoundBlockOfSameColourPixels.push({ x, y });
        }
        if (!thisPxMatchesOriginColour) {
            isNewLineOfSameColourPixels = false;
        }
    }
    return singlePixelFromEachFoundBlockOfSameColourPixels;
}

/**
 * If the pixel falls within the constraints of the image and
 * is the same colour as the origin colour then returns true.
 * @param {number} x - Image X coordinate.
 * @param {number} y - Image Y coordinate.
 * @param {FillProps} props - Object containing fill properties.
 * @returns {boolean}
 */
function pxIsInsideImageAndMatchesOriginColour(x, y, props) {
    if (x < 0 || x >= props.w) {
        return false;
    } else if (y < 0 || y >= props.h) {
        return false;
    } else if (props.tileSet.getPixelAt(x, y) === null) {
        return false;
    } else if (props.tileSet.getPixelAt(x, y) !== props.originColour) {
        return false;
    }
    return true;
}

/**
 * If the pixel falls within the constraints of the image and
 * is the same colour as the origin colour then returns true.
 * @param {TileSet} tileSet - Tile set to fill.
 * @param {number} x - Image X coordinate.
 * @param {number} y - Image Y coordinate.
 * @param {number} colour - Palette index to set.
 * @returns {boolean}
 */
function setColourOnPixel(tileSet, x, y, colour) {
    tileSet.setPixelAt(x, y, colour);
}

/** 
 * @typedef FillProps
 * @type {object}
 * @property {TileSet} tileSet - Tile set to fill.
 * @property {number} w - Tile set image width.
 * @property {number} h - Tile set image height.
 * @property {number} x - Image X coordinate.
 * @property {number} y - Image Y coordinate.
 * @property {number} originColour - Original colour of the pixel that the fill operation started from.
 */

/**
 * @typedef Coordinate
 * @type {object}
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 */

/**
 * @typedef DrawOptions
 * @type {object}
 * @property {number} brushSize - Size of the brush in pixels, between 1 and 100.
 * @property {boolean} affectAdjacentTiles - Default: true. Will neigbouring tiles also be drawn onto?
 * @exports
 */

/**
 * @typedef DrawResult
 * @type {object}
 * @property {number[]} affectedTileIndexes - The tiles that were affected by the draw operation.
 * @property {string[]} affectedTileIds - The unique tile IDs that were affected by the draw operation.
 */


/**
 * Sets the palette slot of a pixel at a given coordinate on the tile grid.
 * @param {TileGridProvider} tileGrid - Tile grid provider to set the pixel on.
 * @param {TileSet} tileSet - Tile set that contains the tiles.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} paletteIndex Palette index of the colour, 0 to 15.
 * @returns {boolean} true if the value was updated, otherwise false.
 */
function setTileGridPixelAt(tileGrid, tileSet, x, y, paletteIndex) {
    if (paletteIndex < 0 || paletteIndex > 15) throw new Error('setTileGridPixelAt: Palette index must be between 0 and 15.');

    if (x < 0 || x > tileGrid.columnCount * 8 - 1) return;
    if (y < 0 || y > tileGrid.rowCount * 8 - 1) return;

    // Get the tile number
    const tileX = (x - (x % 8)) / 8;
    const tileY = (y - (y % 8)) / 8;
    const tileNum = (tileY * tileGrid.columnCount) + tileX;

    if (tileNum >= tileGrid.tileCount.length) return;

    // Work out the coordinates and byte number within the tile itself
    x = x % 8;
    y = y % 8;
    const byteNum = (y * 8) + x;

    const tileId = tileGrid.getTileInfoByIndex(tileNum)?.tileId ?? null;
    if (tileId) {
        const tile = tileSet.getTileById(tileId);
        if (tile) {
            return tile.setValueAt(byteNum, paletteIndex);
        }
    }
    return false;
}

// /**
//  * Sets the palette slot of a pixel at a given coordinate on the tile grid.
//  * @param {import('../models/tileGridProvider.js').TileProviderTileInfo} tileInfo - Details on the tile to set.
//  * @param {TileSet} tileSet - Tile set that contains the tiles.
//  * @param {number} x - X coordinate.
//  * @param {number} y - Y coordinate.
//  * @param {number} paletteIndex Palette index of the colour, 0 to 15.
//  * @returns {boolean} true if the value was updated, otherwise false.
//  */
// function setTilePixel(tileInfo, tileSet, x, y, paletteIndex) {
//     if (paletteIndex < 0 || paletteIndex > 15) throw new Error('setTileGridPixelAt: Palette index must be between 0 and 15.');

//     if (x < 0 || x > tileGrid.columnCount * 8 - 1) return;
//     if (y < 0 || y > tileGrid.rowCount * 8 - 1) return;

//     // Get the tile number
//     const tileX = (x - (x % 8)) / 8;
//     const tileY = (y - (y % 8)) / 8;
//     const tileNum = (tileY * tileGrid.columnCount) + tileX;

//     if (tileNum >= tileGrid.tileCount.length) return;

//     // Work out the coordinates and byte number within the tile itself
//     x = x % 8;
//     y = y % 8;
//     const byteNum = (y * 8) + x;

//     const tileId = tileGrid.getTileInfoByIndex(tileNum)?.tileId ?? null;
//     if (tileId) {
//         const tile = tileSet.getTileById(tileId);
//         if (tile) {
//             return tile.setValueAt(byteNum, paletteIndex);
//         }
//     }
//     return false;
// }

/**
 * Translates a coordinate based on the orientation of a given tile.
 * @param {import('../models/tileGridProvider.js').TileProviderTileInfo} tileInfo 
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {{x: number, y: number}}
 */
function translateCoordinate(tileInfo, x, y) {
    return {
        x: tileInfo.horizontalFlip ? 8 - x : x,
        y: tileInfo.verticalFlip ? 8 - y : y
    };
}