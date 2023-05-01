import TileMapTile from '../models/tileMapTile.js';

export default class GameBoyTileMapTileBinarySerialiser {


    /**
     * Serialises the tile map tile to a planar byte array.
     * @param {TileMapTile} tileMapTile - Tile map tile to serialise.
     * @returns {number}
     */
     static serialise(tileMapTile) {
        let result = tileMapTile.tileNumber;
        return result;
    }


}