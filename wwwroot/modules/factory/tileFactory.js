import Tile from "../models/tile.js";

export default class TileFactory {


    /**
     * Creates a new instance of a tile object.
     * @returns {Tile}
     */
     static create() {
        return new Tile();
    }

    /**
     * Converts a hexadecimal string to a tile object.
     * @param {string} hexString String of hexadecimal data.
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


}