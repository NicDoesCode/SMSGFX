import TileSetFactory from '../factory/tileSetFactory.js';
import TileSet from '../models/tileSet.js';
import TileBinarySerialiser from './tileBinarySerialiser.js';

export default class TileSetBinarySerialiser {


    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} array - Array or tile data in planar format.
     * @returns {TileSet}
     */
     static deserialise(array) {
        const tileSet = TileSetFactory.create();
        for (let i = 0; i < array.length; i += 32) {
            const arraySlice = array.slice(i, i + 32);
            const tile = TileBinarySerialiser.deserialise(arraySlice);
            tileSet.addTile(tile);
        }
        return tileSet;
    }


}