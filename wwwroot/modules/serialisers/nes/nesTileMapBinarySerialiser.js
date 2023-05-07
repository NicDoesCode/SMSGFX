import TileMap from '../../models/tileMap.js';
import TileMapBinarySerialiser from '../tileMapBinarySerialiser.js';
import NesTileMapTileBinarySerialiser from './nesTileMapTileBinarySerialiser.js';

export default class NesMapBinarySerialiser extends TileMapBinarySerialiser {


    /**
     * Serialises an NES tile map (Name table) to a planar byte array.
     * @param {TileMap} tileMap - Tile map to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        return tileMap.getTileMapTiles().map((tileMapTile) => {
            return NesTileMapTileBinarySerialiser.serialise(tileMapTile);
        });
    }


}