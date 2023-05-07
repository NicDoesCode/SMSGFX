import TileMap from '../../models/tileMap.js';
import TileMapBinarySerialiser from '../TileMapBinarySerialiser.js';
import MasterSystemGameGearTileMapTileBinarySerialiser from './masterSystemGameGearTileMapTileBinarySerialiser.js';

export default class MasterSystemGameGearTileMapBinarySerialiser extends TileMapBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileMap} tileMap - Tile set to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        return tileMap.getTileMapTiles().map((tileMapTile) => {
            return MasterSystemGameGearTileMapTileBinarySerialiser.serialise(tileMapTile);
        });
    }


}