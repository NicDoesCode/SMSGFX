import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileMapUtil {


    /**
     * Turns a tile set into a tile map.
     * @param {TileSet} tileSet - Input tile set to convert to a tile map.
     * @param {number} [paletteIndex] - Palette index to use for the tiles.
     * @param {number} [memoryOffset] - VRAM memory offset for the tile addresses in the tile map.
     * @returns {TileMap}
     */
    static tileSetToTileMap(tileSet, paletteIndex, memoryOffset) {
        if (!paletteIndex || ![0, 1].includes(paletteIndex)) paletteIndex = 0;
        if (!memoryOffset || memoryOffset < 0 || memoryOffset >= 255) memoryOffset = 0;
        const result = new TileMap();
        result.tileWidth = tileSet.tileWidth;
        tileSet.getTiles().forEach((tile, index, array) => {
            result.tiles.push({
                priority: false,
                palette: paletteIndex,
                verticalFlip: false,
                horizontalFlip: false,
                tileNumber: index + memoryOffset
            });
        });
        return result;
    }


}