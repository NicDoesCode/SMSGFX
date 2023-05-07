import TileSetFactory from '../../factory/tileSetFactory.js';
import TileSet from '../../models/tileSet.js';
import TileSetBinarySerialiser from '../tileSetBinarySerialiser.js';
import NesTileBinarySerialiser from './nesTileBinarySerialiser.js';

export default class NesTileSetBinarySerialiser extends TileSetBinarySerialiser {


    /**
     * Serialises the tile set to a planar byte array.
     * @param {TileSet} tileSet - Tile set to serialise.
     * @returns {Uint8ClampedArray}
     */
     static serialise(tileSet) {
        const byteLength = tileSet.length * 16;
        const result = new Uint8ClampedArray(byteLength);
        tileSet.getTiles().forEach((tile, index) => {
            const resultArrayOffset = index * 16;
            const tileAsBinary = NesTileBinarySerialiser.serialise(tile);
            result.set(tileAsBinary, resultArrayOffset);
        });
        return result;
    }


    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} array - Array or tile data in planar format.
     * @returns {TileSet}
     */
     static deserialise(array) {
        const tileSet = TileSetFactory.create();
        for (let i = 0; i < array.length; i += 16) {
            const arraySlice = array.slice(i, i + 16);
            const tile = NesTileBinarySerialiser.deserialise(arraySlice);
            tileSet.addTile(tile);
        }
        return tileSet;
    }


}