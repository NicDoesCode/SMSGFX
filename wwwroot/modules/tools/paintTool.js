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
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static fillColourOnTileGrid(tileGrid, tileSet, x, y, colourIndex, clampToTile, breakTileLinks) {
        return PaintUtil.fillOnTileGrid(tileGrid, tileSet, x, y, colourIndex, { affectAdjacentTiles: !clampToTile });
    }
    
    /**
     * Replaces one colour on a tile with another.
     * @param {TileGridProvider} tileGrid - Tile grid with the tiles that comprise the image.
     * @param {TileSet} tileSet - Tile set that contains the tiles to modify.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} primaryColourIndex - Colour for #1 on the pattern.
     * @param {number} secondaryColourIndex - Colour for #2 on the pattern.
     * @param {number} pencilSize - Size of the brush.
     * @param {import("../types.js").Pattern} pattern - Size of the brush.
     * @param {number} patternOriginX - Size of the brush.
     * @param {number} patternOriginY - Size of the brush.
     * @param {boolean} clampToTile - Will neigbouring tiles be affected?
     * @returns {import("../util/paintUtil").DrawResult}
     */
    static patternPaintOnTileGrid(tileGrid, tileSet, x, y, primaryColourIndex, secondaryColourIndex, pencilSize, pattern, patternOriginX, patternOriginY, clampToTile) {
        return PaintUtil.paintPatternOntoTileGrid(tileGrid, tileSet, { 
            x, y, primaryColourIndex, secondaryColourIndex, 
            brushSize: pencilSize, 
            pattern, patternOriginX, patternOriginY, 
            affectAdjacentTiles: !clampToTile 
        });
    }

}