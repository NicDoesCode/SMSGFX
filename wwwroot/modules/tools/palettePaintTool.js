import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class PalettePaintTool {

    /**
     * Sets the palette index on a tile by tile index.
     * @param {PalettePaintByIndexArgs} args - Arguments for the function.
     * @returns {PalettePaintResult}
     */
    static setPaletteIndexByTileIndex(args) {
        const col = Math.floor((args.tileIndex % args.tileMap.columnCount) / args.tilesPerBlock);
        const row = Math.floor(Math.floor(args.tileIndex / args.tileMap.columnCount) / args.tilesPerBlock);
        return this.setTileBlockPaletteIndex({
            paletteIndex: args.paletteIndex,
            row: row,
            column: col,
            tileMap: args.tileMap,
            tilesPerBlock: args.tilesPerBlock
        });
    }

    /**
     * Sets the palette index on tiles witin a given tile block.
     * @param {PalettePaintByBlockArgs} args - Arguments for the function.
     * @returns {PalettePaintResult}
     */
    static setTileBlockPaletteIndex(args) {
        const updatedTileIds = [];
        const mapRow = args.row * args.tilesPerBlock;
        const mapCol = args.column * args.tilesPerBlock;
        for (let r = 0; r < args.tilesPerBlock; r++) {
            const row = mapRow + r;
            for (let c = 0; c < args.tilesPerBlock; c++) {
                const col = mapCol + c;
                const tileInfo = args.tileMap.getTileByRowAndColumn(row, col);
                if (tileInfo && tileInfo.palette !== args.paletteIndex) {
                    tileInfo.palette = args.paletteIndex;
                    updatedTileIds.push(tileInfo.tileId);
                }
            }
        }
        return { updatedTileIds: updatedTileIds };
    }

}
/** 
 * Arguments for the palette paint by block tool.
 * @typedef {Object} PalettePaintByIndexArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {number} tilesPerBlock - Amount of tiles that comprise each tile block.
 * @property {number} paletteIndex - Index of the palette slot to set.
 * @property {number} tileIndex - Tile or tile block row.
 * @exports
 */
/** 
 * Arguments for the palette paint by block tool.
 * @typedef {Object} PalettePaintByBlockArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {number} row - Tile or tile block row.
 * @property {number} column - Tile or tile block column.
 * @property {number} tilesPerBlock - Amount of tiles that comprise each tile block.
 * @property {number} paletteIndex - Index of the palette slot to set.
 * @exports
 */
/** 
 * Result for the palette paint tool.
 * @typedef {Object} PalettePaintResult
 * @property {string[]} updatedTileIds - Unique IDs of tiles affected by the operation.
 * @exports
 */