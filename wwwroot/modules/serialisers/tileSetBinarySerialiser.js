import TileSet from '../models/tileSet.js';

export default class TileSetBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileSet} tileSet - Tile set to serialise.
     * @returns {Uint8ClampedArray}
     * @static
     */
    static serialise(tileSet) {
        throw new Error('This method is not implemented.');
    }


    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} array - Array or tile data in planar format.
     * @returns {TileSet}
     * @static
     */
    static deserialise(array) {
        throw new Error('This method is not implemented.');
    }


}