import TileGridProvider from "../models/tileGridProvider.js";
import PaintUtil from "../util/paintUtil.js";

export default class PaintTool {

    /**
     * Replaces one colour on a tile with another.
     * @param {TileGridProvider} tileGrid - Tile grid with the tiles that comprise the image.
     * @param {TileSet} tileSet - Tile set that contains the tiles to modify.
     * @param {Object} config
     * @param {Object} config.coordinate - Coordinates that are the centre of the brush.
     * @param {number} config.coordinate.x - X coordinate, relative to the left of the image.
     * @param {number} config.coordinate.y - Y coordinate, relative to the top of the image.
     * @param {Object} config.brush - Details about the paint brush.
     * @param {number} config.brush.size - Size of the brush.
     * @param {number} config.brush.primaryColourIndex - Primary colour to use, for solid brush, or primary pattern colour.
     * @param {number} config.brush.secondaryColourIndex - Secondary colour to use, for secondary pattern colour.
     * @param {Object} config.pattern - Optional, details of the pattern to use.
     * @param {import("../types.js").Pattern} config.pattern.pattern - Object that contains the pattern data.
     * @param {number} config.pattern.originX - X origin of the pattern, relative to the left of the image.
     * @param {number} config.pattern.originY - Y origin of the pattern, relative to the top of the image.
     * @param {Object} config.options - Optional, additional painting options.
     * @param {boolean} config.options.clampToTile - Will neigbouring tiles be affected?
     * @param {number?} config.options.constrainToColourIndex - Only modify pixels with this colour index value.
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static paintOntoTileGrid(tileGrid, tileSet, { coordinate, brush, pattern, options }) {
        return PaintUtil.paintOntoTileGrid(tileGrid, tileSet, { coordinate, brush, pattern, options });
    }

    /**
     * Fills pixels on a tile grid.
     * @param {TileGridProvider} tileGrid - Tile grid with the tiles that comprise the image.
     * @param {TileSet} tileSet - Tile set that contains the tiles to modify.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} colourIndex - Colour index to be filled.
     * @param {boolean} clampToTile - Will neigbouring tiles be affected?
     * @param {boolean} breakTileLinks - Break links on affected tiles?
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static fillColourOnTileGrid(tileGrid, tileSet, x, y, colourIndex, clampToTile, breakTileLinks) {
        return PaintUtil.fillOnTileGrid(tileGrid, tileSet, x, y, colourIndex, { affectAdjacentTiles: !clampToTile });
    }

}