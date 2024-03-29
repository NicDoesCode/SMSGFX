import TileMap from '../../models/tileMap.js';
import TileMapBinarySerialiser from '../tileMapBinarySerialiser.js';
import GameBoyTileMapTileBinarySerialiser from './gameBoyTileMapTileBinarySerialiser.js';

export default class GameBoyTileMapBinarySerialiser extends TileMapBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileMap} tileMap - Tile set to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        return tileMap.getTileMapTiles().map((tileMapTile) => {
            return GameBoyTileMapTileBinarySerialiser.serialise(tileMapTile);
        });
    }


}