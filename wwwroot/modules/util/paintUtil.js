import ColourUtil from './colourUtil.js';
import Palette from '../models/palette.js';
import Tile from '../models/tile.js';
import TileSet from '../models/tileSet.js'
import TileGridProvider from '../models/tileGridProvider.js';
import TileSetFactory from '../factory/tileSetFactory.js';
import TileMap from '../models/tileMap.js';
import PaletteList from '../models/paletteList.js';

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
        if (tileInfo === null || tileInfo < 0) return { affectedTileIds: [], affectedTileIndexes: [] };

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
        if (tileInfo === null || tileInfo < 0) return { affectedTileIds: [], affectedTileIndexes: [] };

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
                    const thisTileInfo = tileGrid.getTileInfoByPixel(xPx, yPx);
                    if (thisTileInfo !== null) {
                        const differentTile = thisTileInfo.tileIndex !== tileInfo.tileIndex;
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
     * Fills a contiguious area on a tile grid of one colour with another colour.
     * @param {TileGridProvider} tileGrid - Tile grid that contains information about the tile layout.
     * @param {TileSet} tileSet - Tile set that countains the tiles.
     * @param {number} x - Origin X coordinate.
     * @param {number} y - Origin Y coordinate.
     * @param {number} fillColour - Palette index to fill with.
     * @param {FillOptions} options - Options for bucked tool.
     * @returns {DrawResult}
     */
    static fillOnTileGrid(tileGrid, tileSet, x, y, fillColour, options) {
        const w = tileGrid.columnCount * 8;
        const h = tileGrid.rowCount * 8;
        if (x < 0 || x >= w || y < 0 || y >= h) throw 'Invalid origin coordinates.';

        const tileInfo = tileGrid.getTileInfoByPixel(x, y);
        const tile = tileSet.getTileById(tileInfo?.tileId ?? null);
        if (!tile) return { affectedTileIds: [], affectedTileIndexes: [] };

        // Constrain? Create a virtual tile set and operate on that
        if (!options.affectAdjacentTiles) {
            const newTileSet = TileSetFactory.create();
            newTileSet.addTile(tile);
            tileGrid = newTileSet;
            x = x % 8;
            y = y % 8;
        }

        const coord = translateCoordinate(tileInfo, x % 8, y % 8);
        const originColour = tile.readAtCoord(coord.x, coord.y);
        if (originColour === null || originColour === fillColour) return { affectedTileIds: [], affectedTileIndexes: [] };

        const updatedTileIds = {};
        const updatedTileIndexes = {};

        /** @type {FillProps} */
        const props = { tileGrid, tileSet, w, h, originColour };

        if (pxIsInsideImageAndMatchesOriginColour(coord.x, coord.y, props)) {

            /** @type {Coordinate[]} */
            let scanCoords = [{ x: coord.x, y: coord.y }];
            while (scanCoords.length > 0) {

                const scanCoord = scanCoords.pop();
                const scanY = scanCoord.y;

                // Fill left of the origin
                let leftX = scanCoord.x;
                while (pxIsInsideImageAndMatchesOriginColour(pxToLeftOf(leftX), scanY, props)) {
                    const result = setColourOnPixel(tileGrid, tileSet, pxToLeftOf(leftX), scanY, fillColour);
                    if (result.wasUpdated) {
                        updatedTileIds[result.tileId] = result.tileId;
                        updatedTileIndexes[result.tileIndex] = result.tileIndex;
                    }
                    leftX = pxToLeftOf(leftX);
                }

                // Fill right of the origin
                let rightX = scanCoord.x - 1;
                while (pxIsInsideImageAndMatchesOriginColour(pxToRightOf(rightX), scanY, props)) {
                    const result = setColourOnPixel(tileGrid, tileSet, pxToRightOf(rightX), scanY, fillColour);
                    if (result.wasUpdated) {
                        updatedTileIds[result.tileId] = result.tileId;
                        updatedTileIndexes[result.tileIndex] = result.tileIndex;
                    }
                    rightX = pxToRightOf(rightX);
                }

                // Now scan the line above and below this one, if any matching pixels 
                // found then add them to the coords list
                scanCoords = scanCoords
                    .concat(scanLineForBlocksOfPixelsWithSameOriginColour(leftX, rightX, oneBelow(scanY), props))
                    .concat(scanLineForBlocksOfPixelsWithSameOriginColour(leftX, rightX, oneAbove(scanY), props));
            }

        }

        return {
            affectedTileIndexes: Object.keys(updatedTileIndexes),
            affectedTileIds: Object.keys(updatedTileIds)
        }

    }

    /**
     * Draws a tile map onto a canvas object.
     * @param {TileGridProvider} tileGrid - Tile grid to draw.
     * @param {TileSet} tileSet - Tile set that contains the tiles used by the tile grid.
     * @param {PaletteList} paletteList - Palettes to use when drawing.
     * @param {number[]?} [paletteIndiciesToRenderTransparent] - Palette indicies to render as transparent.
     * @returns {ImageBitmap}
     */
    static createTileGridImage(tileGrid, tileSet, paletteList, paletteIndiciesToRenderTransparent) {
        const widthPx = tileGrid.columnCount * 8;
        const heightPx = tileGrid.rowCount * 8;
        const canvas = new OffscreenCanvas(widthPx, heightPx);
        drawTileGridOntoCanvas(canvas, tileGrid, tileSet, paletteList, paletteIndiciesToRenderTransparent);
        return canvas.transferToImageBitmap();
    }

    /**
     * Renders an image of the tile onto a canvas object, at the size of the canvas object.
     * @param {Tile} tile - Tile to draw to the canvas.
     * @param {Palette} palette - Colour palette to use.
     * @param {OffscreenCanvas|HTMLCanvasElement} canvas - Canvas to contain the tile image.
     * @param {CanvasRenderingContext2D?} context - Canvas 2D rendering context.
     * @param {number[]?} [paletteIndiciesToRenderTransparent] - Palette indicies to render as transparent.
     * @returns {ImageBitmap}
     */
    static drawTileImageOntoCanvas(tile, palette, canvas, context, paletteIndiciesToRenderTransparent) {
        if (!tile instanceof Tile) throw new Error('Please supply a valid tile to draw.');
        if (!palette instanceof Palette) throw new Error('Please supply a valid tile to draw.');
        if (!canvas instanceof OffscreenCanvas && !canvas instanceof HTMLCanvasElement) throw new Error('Please supply a valid canvas.');

        if (!context) {
            context = canvas.getContext('2d');
        }

        if (!paletteIndiciesToRenderTransparent) {
            paletteIndiciesToRenderTransparent = [];
        }

        let pixelIndex = 0;
        let scaleX = canvas.width / 8;
        let scaleY = canvas.height / 8;
        let pixelX = 0;
        let pixelY = 0;

        for (let y = 0; y < 8; y++) {
            pixelY = y * scaleY;
            for (let x = 0; x < 8; x++) {
                pixelX = x * scaleX;

                const pixelPaletteIndex = tile.readAt(pixelIndex);

                // Set colour of the pixel
                if (pixelPaletteIndex >= 0 && pixelPaletteIndex < palette.getColours().length) {
                    const colour = palette.getColour(pixelPaletteIndex);
                    context.fillStyle = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
                }

                if (paletteIndiciesToRenderTransparent.includes(pixelPaletteIndex)) {
                    // This palette index is within the transparency indexes, so it shouldn't be
                    // drawn, so clear it instead of drawing it.
                    context.clearRect(pixelX, pixelY, scaleX, scaleY);
                } else {
                    // Pixel colour is not in transparency indicies, so draw it.
                    context.fillRect(pixelX, pixelY, scaleX, scaleY);
                }

                pixelIndex++;
            }
        }
    }

    static drawTileImage = drawTileImage;

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
    if (x >= 0 && x < props.w && y >= 0 && y < props.h) {
        const tileInfo = props.tileGrid.getTileInfoByPixel(x, y);
        if (tileInfo) {
            const tile = props.tileSet.getTileById(tileInfo.tileId);
            const coords = translateCoordinate(tileInfo, x % 8, y % 8);
            if (tile.readAtCoord(coords.x, coords.y) === props.originColour) {
                return true;
            }
        }
    }
    return false;
}

/**
 * If the pixel falls within the constraints of the image and
 * is the same colour as the origin colour then returns true.
 * @param {TileGridProvider} tileGrid - Tile grid that contains information about the tile layout.
 * @param {TileSet} tileSet - Tile set to fill.
 * @param {number} x - Image X coordinate.
 * @param {number} y - Image Y coordinate.
 * @param {number} colour - Palette index to set.
 * @returns {{wasUpdated: boolean, tileId: string, tileIndex: number}}
 */
function setColourOnPixel(tileGrid, tileSet, x, y, colour) {
    const tileInfo = tileGrid.getTileInfoByPixel(x, y);
    const tile = tileSet.getTileById(tileInfo.tileId);
    const coords = translateCoordinate(tileInfo, x % 8, y % 8);
    return {
        wasUpdated: tile.setValueAtCoord(coords.x, coords.y, colour),
        tileId: tileInfo.tileId,
        tileIndex: tileInfo.tileIndex
    };
}

/**
 * Translates a coordinate based on the orientation of a given tile.
 * @param {import('../models/tileGridProvider.js').TileProviderTileInfo} tileInfo 
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {{x: number, y: number}}
 */
function translateCoordinate(tileInfo, x, y) {
    return {
        x: tileInfo.horizontalFlip ? 7 - x : x,
        y: tileInfo.verticalFlip ? 7 - y : y
    };
}


/**
 * Draws a tile map onto a canvas object.
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas - Canvas to draw onto.
 * @param {TileGridProvider} tileGrid - Tile grid to draw.
 * @param {TileSet} tileSet - Tile set that contains the tiles used by the tile grid.
 * @param {PaletteList} paletteList - Palettes to use when drawing.
 */
function drawTileGridOntoCanvas(canvas, tileGrid, tileSet, paletteList) {
    if (!canvas instanceof HTMLCanvasElement && !canvas instanceof OffscreenCanvas) throw new Error('Non valid canvas object was passed.');
    if (!tileGrid instanceof TileGridProvider) throw new Error('Tile grid was not valid.');
    if (!tileSet instanceof TileSet) throw new Error('Tile set was not valid.');
    if (!paletteList instanceof PaletteList) throw new Error('Palette list was not valid.');

    const context = canvas.getContext('2d');
    const dimensions = { w: 8, h: 8 };

    for (let col = 0; col < tileGrid.columnCount; col++) {
        for (let row = 0; row < tileGrid.rowCount; row++) {
            const tileInfo = tileGrid.getTileInfoByRowAndColumn(row, col);
            const tile = tileSet?.getTile(tileInfo.tileId) ?? null;
            const palette = paletteList?.getPaletteByIndex(tileInfo.paletteIndex) ?? null;
            const coords = { x: col * 8, y: row * 8 };
            if (tile && palette) {
                drawTileImage(context,
                    coords.x, coords.y,
                    dimensions.w, dimensions.h,
                    tile, palette,
                    { horizontalFlip: tileInfo.horizontalFlip, verticalFlip: tileInfo.verticalFlip }
                );
            }
        }
    }
}

/**
 * Renders an image of the tile onto a canvas object, at the size of the canvas object.
 * @param {CanvasRenderingContext2D} context - Context object to do the drawing.
 * @param {number} x - X position to draw the tile image.
 * @param {number} y - Y position to draw the tile image.
 * @param {number} width - Width to draw the tile image.
 * @param {number} height - Height to draw the tile image.
 * @param {Tile} tile - Tile to draw to the canvas.
 * @param {Palette} palette - Colour palette to use.
 * @param {DrawTileImageOptions?} [options] - Optional. Additional options for painting the tile.
 * @returns {ImageBitmap}
 */
function drawTileImage(context, x, y, width, height, tile, palette, options) {
    let transIndexes = Array.isArray(options?.transparencyIndexes) ? options.transparencyIndexes : null;
    let hFlip = options?.horizontalFlip === true;
    let vflip = options?.verticalFlip === true;

    let tilePixelIndex = 0;
    let scaleX = width / 8;
    let scaleY = height / 8;
    let canvasX = hFlip ? x + (scaleX * 7) : x;
    let canvasY = vflip ? y + (scaleY * 7) : y;

    for (let tileY = 0; tileY < 8; tileY++) {
        for (let tileX = 0; tileX < 8; tileX++) {

            const pixelPaletteIndex = tile.readAt(tilePixelIndex);

            // Set colour of the pixel
            if (pixelPaletteIndex >= 0 && pixelPaletteIndex < palette.getColours().length) {
                const colour = palette.getColour(pixelPaletteIndex);
                context.fillStyle = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
            }

            if (transIndexes && transIndexes.includes(pixelPaletteIndex)) {
                // This palette index is within the transparency indexes, so it shouldn't be
                // drawn, so clear it instead of drawing it.
                context.clearRect(canvasX, canvasY, scaleX, scaleY);
            } else {
                // Pixel colour is not in transparency indicies, so draw it.
                context.fillRect(canvasX, canvasY, scaleX, scaleY);
            }

            tilePixelIndex++;

            canvasX += hFlip ? -scaleX : scaleX;
        }
        canvasY += vflip ? -scaleY : scaleY;
        canvasX = hFlip ? x + (scaleX * 7) : x;
    }
}


/** 
 * @typedef {Object} FillProps
 * @property {TileGridProvider} tileGrid - Tile grid provider with tile layout.
 * @property {TileSet} tileSet - Tile set to fill.
 * @property {number} w - Tile set image width.
 * @property {number} h - Tile set image height.
 * @property {number} x - Image X coordinate.
 * @property {number} y - Image Y coordinate.
 * @property {number} originColour - Original colour of the pixel that the fill operation started from.
 */

/**
 * @typedef {Object} Coordinate
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 */

/**
 * @typedef {Object} DrawOptions
 * @property {number} brushSize - Size of the brush in pixels, between 1 and 100.
 * @property {boolean} affectAdjacentTiles - Default: true. Will neigbouring tiles also be drawn onto?
 * @property {boolean} breakTileLinks - Break links on affected tiles?
 * @exports
 */

/**
 * @typedef {Object} FillOptions
 * @property {boolean} affectAdjacentTiles - Default: true. Will neigbouring tiles also be affected?
 * @property {boolean} breakTileLinks - Break links on affected tiles?
 * @exports
 */

/**
 * @typedef {Object} DrawResult
 * @property {number[]} affectedTileIndexes - The tiles that were affected by the draw operation.
 * @property {string[]} affectedTileIds - The unique tile IDs that were affected by the draw operation.
 * @exports
*/

/**
 * @typedef {Object} DrawTileImageOptions
 * @property {number[]} transparencyIndexes - Palette colour indexes that will be rendered as transparent.
 * @property {boolean} horizontalFlip - Draw the tile horizontally reversed?
 * @property {boolean} verticalFlip - Draw the tile vertically reversed?
 * @exports
 */
