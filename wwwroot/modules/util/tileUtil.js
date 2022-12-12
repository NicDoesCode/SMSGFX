import TileFactory from "../factory/tileFactory.js";
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

    /**
     * Mirrors a tile horizontally.
     * @param {Tile} originalTile - The tile that we are encoding.
     * @returns {Tile}
     */
    static mirrorHorizontal(originalTile) {
        const mirroredTile = TileFactory.create();
        for (let col = 0; col < 8; col++) {
            const mCol = 7 - col;
            for (let row = 0; row < 8; row++) {
                const originalPx = originalTile.readAtCoord(col, row);
                mirroredTile.setValueAtCoord(mCol, row, originalPx);
            }
        }
        return mirroredTile;
    }

    /**
     * Mirrors a tile vertically.
     * @param {Tile} originalTile - The tile that we are encoding.
     * @returns {Tile}
     */
    static mirrorVertical(originalTile) {
        const mirroredTile = TileFactory.create();
        for (let row = 0; row < 8; row++) {
            const mRow = 7 - row;
            for (let col = 0; col < 8; col++) {
                const originalPx = originalTile.readAtCoord(col, row);
                mirroredTile.setValueAtCoord(col, mRow, originalPx);
            }
        }
        return mirroredTile;
    }


}