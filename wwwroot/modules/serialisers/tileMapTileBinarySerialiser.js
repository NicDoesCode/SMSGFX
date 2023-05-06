import TileMapTile from '../models/tileMapTile.js';

export default class TileMapTileBinarySerialiser {


    /**
     * Serialises the tile map tile to a planar byte array.
     * @param {TileMapTile} tileMapTile - Tile map tile to serialise.
     * @returns {number}
     */
     static serialise(tileMapTile) {
        let result = tileMapTile.tileNumber;
        result &= 511;
        if (tileMapTile.horizontalFlip) result |= 512;
        if (tileMapTile.verticalFlip) result |= 1024;
        if (tileMapTile.palette === 1) result |= 2048;
        if (tileMapTile.priority) result |= 4096;
        return result;
    }


}