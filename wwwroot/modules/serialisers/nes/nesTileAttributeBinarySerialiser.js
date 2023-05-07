import TileMap from '../../models/tileMap.js';
import TileAttributeBinarySerialiser from '../tileAttributeBinarySerialiser.js';

export default class NesTileAttributeBinarySerialiser extends TileAttributeBinarySerialiser {


    /**
     * Serialises an NES tile attribute table to a byte array.
     * @param {TileMap} tileMap - Tile map to serialise.
     * @returns {number[]}
     */
    static serialise(tileMap) {
        throw new Error('Not implemented!');
    }


}