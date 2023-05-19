import ColourUtil from './colourUtil.js';
import Palette from '../models/palette.js';
import Tile from '../models/tile.js';
import TileSet from '../models/tileSet.js'

export default class PaintUtil {


    /**
     * Draws onto a tile set, returns any updated tiles.
     * @param {TileSet} tileSet - Tile set to draw onto.
     * @param {number} x - X coordinate in the tile set.
     * @param {number} y - Y coordinate in the tile set.
     * @param {number} colourIndex - Colour palette index, 0 to 15.
     * @param {DrawOptions} options - Options for drawing onto the tile set.
     * @returns {DrawResult}
     */
    static drawOnTileSet(tileSet, x, y, colourIndex, options) {
        const updatedTiles = [];

        const tileIndex = tileSet.getTileIndexByCoordinate(x, y);
        if (tileIndex === null || tileIndex < 0) return;

        const brushSize = options.brushSize ?? 1;
        if (brushSize < 1 || brushSize > 100) throw new Error('Brush size must be between 1 and 100 px.');

        if (brushSize === 1) {
            if (tileSet.setPixelAt(x, y, colourIndex)) {
                updatedTiles.push(tileIndex);
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
                            if (tileSet.setPixelAt(xPx, yPx, colourIndex)) {
                                if (!updatedTiles.includes(thisTileIndex)) updatedTiles.push(thisTileIndex);
                            }
                        }
                    }
                }
            }
        }

        return { affectedTileIndexes: updatedTiles };
    }


    /**
     * Replaces a colour on the tile set with another colour, returns any updated tiles.
     * @param {TileSet} tileSet - Tile set to draw onto.
     * @param {number} x - X coordinate in the tile set.
     * @param {number} y - Y coordinate in the tile set.
     * @param {number} sourceColourIndex - Colour index that will be replaced, 0 to 15.
     * @param {number} replacementColourIndex - Colour index to replace any instance of the source colour with, 0 to 15.
     * @param {DrawOptions} options - Options for drawing onto the tile set.
     * @returns {DrawResult}
     */
    static replaceColourOnTileSet(tileSet, x, y, sourceColourIndex, replacementColourIndex, options) {
        const updatedTiles = [];

        const tileIndex = tileSet.getTileIndexByCoordinate(x, y);
        if (tileIndex === null || tileIndex < 0) return;

        const brushSize = options.brushSize ?? 1;
        if (brushSize < 1 || brushSize > 100) throw new Error('Brush size must be between 1 and 100 px.');

        if (brushSize === 1) {
            const currentColourIndex = tileSet.getPixelAt(x, y);
            if (currentColourIndex === sourceColourIndex) {
                if (tileSet.setPixelAt(x, y, replacementColourIndex)) {
                    updatedTiles.push(tileIndex);
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
                            const currentColourIndex = tileSet.getPixelAt(xPx, yPx);
                            if (currentColourIndex === sourceColourIndex) {
                                if (tileSet.setPixelAt(xPx, yPx, replacementColourIndex)) {
                                    if (!updatedTiles.includes(thisTileIndex)) updatedTiles.push(thisTileIndex);
                                }
                            }
                        }
                    }
                }
            }
        }

        return { affectedTileIndexes: updatedTiles };
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
 */