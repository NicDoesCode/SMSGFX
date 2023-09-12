import Tile from "../models/tile.js";
import TileUtil from "../util/tileUtil.js";

export default class TileFactory {


    /**
     * Creates a new instance of a tile object.
     * @argument {TileCreateArgs} [args] - Colour index to set as the initial colour of the tile, default is 15.
     * @returns {Tile}
     */
    static create(args) {
        const tileId = args?.tileId ?? null;
        const alwaysKeep = args?.alwaysKeep ?? false;

        const defaultColourIndex = (args && typeof args.defaultColourIndex === 'number') ? args.defaultColourIndex : 15;
        if (defaultColourIndex < 0 || defaultColourIndex > 15) throw new Error('Default colour index out of range.');

        const tileDataArray = new Uint8ClampedArray(64);
        if (args && args.data instanceof Uint8ClampedArray) {
            for (let i = 0; i < tileDataArray.length && i < args.data.length; i++) {
                tileDataArray[i] = args.data[i];
            }
        } else if (args && typeof args.data === 'string') {
            const data = TileUtil.fromHex(args.data);
            for (let i = 0; i < tileDataArray.length && i < data.length; i++) {
                tileDataArray[i] = data[i];
            }
        } else {
            tileDataArray.fill(defaultColourIndex, 0, tileDataArray.length);
        }

        return new Tile(tileId, alwaysKeep, tileDataArray);
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

        const tile = TileFactory.create();
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
        const cloned = TileFactory.fromHex(hex);
        cloned.tileId = tile.tileId;
        cloned.alwaysKeep = tile.alwaysKeep;
        return cloned;
    }


}

/**
 * @typedef {object} TileCreateArgs
 * @property {string?} [tileId] - Unique ID for the tile.
 * @property {boolean?} [alwaysKeep] - Should the tile be kept during the export optimisation phase?
 * @property {number?} [defaultColourIndex] - Colour index to set as the initial colour of the tile, defaults to 15 when not supplied.
 * @property {Uint8ClampedArray|string} [data] - Data for the new tile as either an array or encoded string.
 * @exports
 */