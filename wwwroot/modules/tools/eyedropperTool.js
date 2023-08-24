import TileGridProvider from "../models/tileGridProvider.js";
import TileSet from "../models/tileSet.js";

export default class EyedropperTool {

    /**
     * Gets the colour of a pixel on a tile grid provider.
     * @param {TileGridProvider} tileGrid - Tile grid to query.
     * @param {TileSet} tileSet - Tile set that contains the tiles for the project.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {number|null}
     */
    static getPixelColour(tileGrid, tileSet, x, y) {
        const tileInfo = tileGrid.getTileInfoByPixel(x, y);
        if (tileInfo) {
            const tile = tileSet.getTileById(tileInfo.tileId);
            if (tile) {
                x = tileInfo.horizontalFlip ? 7 - (x % 8) : (x % 8);
                y = tileInfo.verticalFlip ? 7 - (y % 8) : (y % 8);
                return tile.readAtCoord(x, y);
            }
        }
        return null;
    }

}