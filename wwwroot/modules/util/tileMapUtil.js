import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileMapUtil {


    /**
     * Turns a tile set into a tile map.
     * @param {TileSet} tileSet - Input tile set to convert to a tile map.
     * @param {number} [paletteIndex] - Palette index to use for the tiles.
     * @param {number} [vramOffset] - VRAM memory offset for the tile addresses in the tile map.
     * @returns {TileMap}
     */
    static tileSetToTileMap(tileSet, paletteIndex, vramOffset) {
        if (!paletteIndex || ![0, 1].includes(paletteIndex)) paletteIndex = 0;
        if (!vramOffset || vramOffset < 0 || vramOffset >= 255) vramOffset = 0;

        const result = new TileMap();
        result.vramOffset = vramOffset;
        result.tileWidth = tileSet.tileWidth;
        tileSet.getTiles().forEach((tile, index, array) => {
            result.addTile(tile, {
                priority: false,
                palette: paletteIndex,
                verticalFlip: false,
                horizontalFlip: false 
            });
        });

        return result;
    }


}

