import TileGridProvider from "../models/tileGridProvider.js";
import PaintUtil from "../util/paintUtil.js";

export default class PaintTool {

    /**
     * Replaces one colour on a tile with another.
     * @param {TileGridProvider} tileGrid - Tile grid with the tiles that comprise the image.
     * @param {TileSet} tileSet - Tile set that contains the tiles to modify.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} colourIndex - Colour index to be replaced.
     * @param {number} pencilSize - Size of the brush.
     * @param {boolean} clampToTile - Will neigbouring tiles be affected?
     * @param {boolean} breakTileLinks - Break links on affected tiles?
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static paintColourOnTileGrid(tileGrid, tileSet, x, y, colourIndex, pencilSize, clampToTile, breakTileLinks) {
        return PaintUtil.drawOnTileGrid(tileGrid, tileSet, x, y, colourIndex, { brushSize: pencilSize, affectAdjacentTiles: !clampToTile });
    }

    /**
     * Replaces one colour on a tile with another.
     * @param {TileGridProvider} tileGrid - Tile grid with the tiles that comprise the image.
     * @param {TileSet} tileSet - Tile set that contains the tiles to modify.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} sourceColourIndex - Colour index to be replaced.
     * @param {number} replacementColourIndex - Colour index to replace with.
     * @param {number} pencilSize - Size of the brush.
     * @param {boolean} clampToTile - Will neigbouring tiles be affected?
     * @param {boolean} breakTileLinks - Break links on affected tiles?
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static replaceColourOnTileGrid(tileGrid, tileSet, x, y, sourceColourIndex, replacementColourIndex, pencilSize, clampToTile, breakTileLinks) {
        return PaintUtil.replaceColourOnTileGrid(tileGrid, tileSet, x, y, sourceColourIndex, replacementColourIndex, { brushSize: pencilSize, affectAdjacentTiles: !clampToTile });
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
     * @returns {boolean}
     */
    static fillColourOnTileGrid(tileGrid, tileSet, x, y, colourIndex, clampToTile, breakTileLinks) {
        PaintUtil.fillOnTileGrid(tileGrid, tileSet, x, y, colourIndex, { affectAdjacentTiles: !clampToTile });
    }

}