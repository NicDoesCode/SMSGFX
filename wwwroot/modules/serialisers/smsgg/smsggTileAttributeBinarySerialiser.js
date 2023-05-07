import TileMap from '../../models/tileMap.js';
import TileAttributeBinarySerialiser from '../tileAttributeBinarySerialiser.js';

export default class SmsggTileAttributeBinarySerialiser extends TileAttributeBinarySerialiser {


    /**
     * Serialises an NES tile attribute table to a byte array.
     * @param {TileMap} tileMap - Tile map to serialise.
     * @returns {Uint8ClampedArray}
     */
    static serialise(tileMap) {
        return new Uint8ClampedArray();
    }


}