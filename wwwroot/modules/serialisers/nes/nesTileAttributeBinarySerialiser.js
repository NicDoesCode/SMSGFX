import TileMap from '../../models/tileMap.js';
import TileAttributeBinarySerialiser from '../tileAttributeBinarySerialiser.js';

export default class NesTileAttributeBinarySerialiser extends TileAttributeBinarySerialiser {


    /**
     * Serialises an NES tile attribute table to a byte array.
     * @param {TileMap} tileMap - Tile map to serialise.
     * @returns {Uint8ClampedArray}
     */
    static serialise(tileMap) {

        /*
         * The NES attribute table is a table of bytes that stores the palette index of each of the background tiles.
         * 
         * The attribute table breaks the name table (tile map) into a 4 x 4 tile grid, and each byte represents the 
         * 2-bit palette index of the tile.
         * 
         * So the following  Tile 1 | Tile 2  is encoded in the byte as  1122  or  11223344.
         *                   ---------------                             3344
         *                   Tile 3 | Tile 4
         * 
         * Because of this encoding, the row count and column count need to be even, so the following values are used:
         * - tileWidth, tileRows = tile map colums and rows, may be an odd number.
         * - attrWidth, attrRows = tile width and rows, but always ensure that it's an even number. 
         * - byteWidth, byteRows = encoded byte array width and height, as per above, the width and rows will be half the original tile map.
         * - paletteIdx = palette index (0, 1, 2, 3) of the tile, if we overflow because the tileWidth or tileRows was odd, we assume 0.
         * 
         */

        const tileWidth = tileMap.columnsPerRow;
        const attrWidth = tileMap.columnsPerRow + (tileMap.columnsPerRow % 2);
        const byteWidth = attrWidth / 2;

        const tileRows = Math.ceil(tileMap.tileCount / tileWidth);
        const attrRows = tileRows + (tileRows % 2);
        const byteRows = attrRows / 2;

        const tiles = tileMap.getTiles();

        const attrTable = new Uint8ClampedArray(byteRows * byteWidth);
        // For each row in our virtual attribute table
        for (let r = 0; r < attrRows; r++) {
            // For each column in our virtual attribute table
            for (let c = 0; c < attrWidth; c++) {
                // Index of the tile in the tile map array, or -1 if overflow
                const idx = (r < tileRows && c < tileWidth) ? ((r * tileWidth) + c) : -1;
                // Palette index of the given tile, or assume 0 if it was overflow (-1)
                let paletteValue = (idx !== -1) ? tiles[idx].palette : 0;
                // We only want the first 2 bits of the palette index
                paletteValue = paletteValue & parseInt('00000011', 2);
                // Depending on the row and column, work out where the tile's palette sits within the byte
                if (r % 2 === 0 && c % 2 === 0) paletteValue = paletteValue << 6;
                else if (r % 2 === 0 && c % 2 === 1) paletteValue = paletteValue << 4;
                else if (r % 2 === 1 && c % 2 === 0) paletteValue = paletteValue << 2;
                else if (r % 2 === 1 && c % 2 === 1) paletteValue = paletteValue << 0;
                // Work out the index in the result attribute table and flip the bits on that index for this tile
                const attrIdx = (byteWidth * Math.floor(r / 2)) + Math.floor(c / 2);
                attrTable[attrIdx] = attrTable[attrIdx] | paletteValue;
            }
        }
        return attrTable;
    }


}