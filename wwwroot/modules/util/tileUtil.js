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
        const tileData = tile?.readAll() ?? TileFactory.create().readAll();
        for (let i = 0; i < tileData.length; i++) {
            let byteAsString = tileData[i].toString(16);
            if (byteAsString.length % 2 !== 0) result += '0';
            result += byteAsString;
        }
        return result;
    }

    /**
     * Creates a clone of a tile that is horizontally mirrored.
     * @param {Tile} originalTile - The tile that we are cloning and mirroring.
     * @returns {Tile}
     */
    static createHorizontallyMirroredClone(originalTile) {
        const mirroredTile = TileFactory.create({ tileId: originalTile.tileId });
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
     * Creates a clone of a tile that is vertically mirrored.
     * @param {Tile} originalTile - The tile that we are cloning and mirroring.
     * @returns {Tile}
     */
    static createVerticallyMirroredClone(originalTile) {
        const mirroredTile = TileFactory.create({ tileId: originalTile.tileId });
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