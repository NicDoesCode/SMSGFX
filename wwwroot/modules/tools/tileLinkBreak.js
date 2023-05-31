import TileFactory from "../factory/tileFactory.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileLinkBreak {

    /**
     * Breaks a link from a tile index and promotes it to a new tile.
     * @param {number} tileIndex - Index of the tile witin the tile map.
     * @param {TileMap} tileMap - Tile map that contains the tile.
     * @param {TileSet} tileSet - Tile set that containes the tiles for the tile map.
     */
    static run(tileIndex, tileMap, tileSet) {
        if (tileIndex < 0 || tileIndex >= tileMap.tileCount) throw new Error('Invalid tile index.')
        if (!tileMap instanceof TileMap) throw new Error('Invalid tile map.');
        if (!tileSet instanceof TileSet) throw new Error('Invalid tile set.');

        const tileMapTile = tileMap.getTileByIndex(tileIndex);
        const otherTiles = tileMap.getTiles().filter((t, index) => t.tileId === tileMapTile.tileId && tileIndex !== index);

        if (otherTiles.length > 0) {
            const tile = tileSet.getTileById(tileMapTile.tileId);
            if (tile) {
                const newTile = TileFactory.create({ data: tile.readAll() });
                tileSet.addTile(newTile);
                
                tileMapTile.tileId = newTile.tileId;

                return true;
            }
        }

        return false;
    }

}