import TileMapTile from '../../models/tileMapTile.js';
import TileMapTileBinarySerialiser from '../tileMapTileBinarySerialiser.js';

export default class GameBoyTileMapTileBinarySerialiser extends TileMapTileBinarySerialiser {


    /**
     * Serialises the tile map tile to a planar byte array.
     * @param {TileMapTile} tileMapTile - Tile map tile to serialise.
     * @returns {number}
     */
    static serialise(tileMapTile) {
        let result = tileMapTile.tileNumber;
        if (result < 0) result = 0;
        if (result > 255) result = 255;
        return result;
    }


}