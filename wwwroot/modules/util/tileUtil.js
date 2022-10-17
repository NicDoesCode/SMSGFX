import Tile from "./../models/tile.js";

export default class TileUtil {


    /**
     * Converts the tile to a hex encoded string.
     * @param {Tile} tile - The tile that we are encoding.
     * @returns {string}
     */
     static toHex(tile) {
        let result = '';
        const tileData = tile.readAll();
        for (let i = 0; i < tileData.length; i++) {
            let byteAsString = tileData[i].toString(16);
            if (byteAsString.length % 2 !== 0) result += '0';
            result += byteAsString;
        }
        return result;
    }


}