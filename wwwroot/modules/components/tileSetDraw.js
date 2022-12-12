import Tile from "../models/tile.js";
import TileSet from "./../models/tileSet.js";

export default class TileSetDraw {


    /**
     * Draws onto a tile set, returns any updated tiles.
     * @param {TileSet} tileSet - Tile set to draw onto.
     * @param {number} x - X coordinate in the tile set.
     * @param {number} y - Y coordinate in the tile set.
     * @param {number} colourIndex - Colour palette index, 0 to 15.
     * @param {number} brushSize - Size of the brush.
     * @param {DrawOptions} options - Options for drawing onto the tile set.
     * @returns {DrawResult}
     */
    static drawOntoTileSet(tileSet, x, y, colourIndex, brushSize, options) {
        const updatedTiles = [];
        let tileIndex = tileSet.getTileIndexByCoordinate(x, y);
        if (tileIndex === null || tileIndex < 0) return;

        if (brushSize === 1) {
            tileSet.setPixelAt(x, y, colourIndex);
            updatedTiles.push(tileIndex);
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
                            tileSet.setPixelAt(xPx, yPx, colourIndex);
                            if (!updatedTiles.includes(thisTileIndex)) updatedTiles.push(thisTileIndex);
                        }
                    }
                }
            }
        }

        return { affectedTileIndexes: updatedTiles };
    }

}

/**
 * @typedef DrawOptions
 * @type {object}
 * @property {boolean} affectAdjacentTiles - Default: true. Will neigbouring tiles also be drawn onto?
 * @exports
 */

/**
 * @typedef DrawResult
 * @type {object}
 * @property {number[]} affectedTileIndexes - The tiles that were affected by the draw operation.
 */