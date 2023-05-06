import TileSetFactory from '../factory/tileSetFactory.js';
import TileSet from '../models/tileSet.js';
import TileMap from '../models/tileMap.js';
import TileMapTile from '../models/tileMapTile.js';
import TileBinarySerialiser from './tileBinarySerialiser.js';
import TileMapTileBinarySerialiser from './tileMapTileBinarySerialiser.js';

export default class TileMapBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileMap} tileMap - Tile set to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        return tileMap.getTileMapTiles().map((tileMapTile) => {
            return TileMapTileBinarySerialiser.serialise(tileMapTile);
        });
    }


}