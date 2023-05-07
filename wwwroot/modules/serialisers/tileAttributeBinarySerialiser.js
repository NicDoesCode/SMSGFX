import Tile from '../models/tile.js';


export default class TileAttributeBinarySerialiser {


    /**
     * Serialises a tile to a planar byte array.
     * @param {Tile} tile - Tile to serialise.
     * @returns {Uint8ClampedArray}
     */
    static serialise(tile) {
        throw new Error('This method is not implemented.');
    }


    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} planarByteArray - Array or tile data in planar format.
     * @returns {Tile}
     */
    static deserialise(planarByteArray) {
        throw new Error('This method is not implemented.');
    }


}
