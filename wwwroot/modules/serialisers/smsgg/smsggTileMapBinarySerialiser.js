import TileMap from '../../models/tileMap.js';
import TileMapBinarySerialiser from '../tileMapBinarySerialiser.js';
import SmsggTileMapTileBinarySerialiser from './smsggTileMapTileBinarySerialiser.js';

export default class SmsggTileMapBinarySerialiser extends TileMapBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileMap} tileMap - Tile set to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        return tileMap.getTileMapTiles().map((tileMapTile) => {
            return SmsggTileMapTileBinarySerialiser.serialise(tileMapTile);
        });
    }


}