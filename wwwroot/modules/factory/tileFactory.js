import Tile from "../models/tile.js";
import TileUtil from "../util/tileUtil.js";

export default class TileFactory {


    /**
     * Creates a new instance of a tile object.
     * @argument {string?} [tileId] - Unique ID for the tile.
     * @argument {number?} [defaultColourIndex] - Colour index to set as the initial colour of the tile, default is 15.
     * @returns {Tile}
     */
    static create(tileId, defaultColourIndex) {
        if (typeof defaultColourIndex !== 'number') defaultColourIndex = 15;
        const tileDataArray = new Uint8ClampedArray(64);
        tileDataArray.fill(defaultColourIndex, 0, tileDataArray.length);
        return new Tile(tileId, tileDataArray);
    }

    /**
     * Converts a hexadecimal string to a tile object.
     * @param {string} hexString - String of hexadecimal data.
     * @returns {Tile}
     */
    static fromHex(hexString) {
        if (!hexString || hexString.length % 2 !== 0) throw new Error('Hex string length must align to 2.');

        const result = new Uint8ClampedArray(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            let byte = parseInt(hexString.substring(i, i + 2), 16);
            result[i / 2] = byte;
        }

        return TileFactory.fromArray(result);
    }

    /**
     * Creates a tile set from a given array.
     * @param {Uint8ClampedArray} sourceArray Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=null] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     * @returns {Tile}
     */
    static fromArray(sourceArray, sourceIndex, sourceLength) {
        if (!sourceArray) throw new Error('Source array was not valid.');
        if (!sourceIndex) sourceIndex = 0;
        if (sourceIndex >= sourceArray.length) throw new Error('The index exceeds the bounds of the source array.');
        if (sourceIndex < 0) throw new Error('Index must be 0 or greater.');
        if (!sourceLength) sourceLength = 64;
        if (sourceLength < 0 || sourceLength > 64) throw new Error('Length must be between 0 and 64.');

        const tile = TileFactory.create(null, null);
        const sourceStopIndex = sourceIndex + sourceLength;
        let dataIndex = 0;
        for (let i = sourceIndex; i < sourceArray.length && i < sourceStopIndex; i++) {
            tile.setValueAt(dataIndex, sourceArray[i]);
            dataIndex++;
        }
        return tile;
    }

    /**
     * Creates a deep clone of the given tile.
     * @param {Tile} tile - Tile object to create a deep clone of.
     * @returns {Tile}
     */
    static clone(tile) {
        const hex = TileUtil.toHex(tile);
        return TileFactory.fromHex(hex);
    }


}