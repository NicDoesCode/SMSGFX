import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class PalettePaintTool {

    /**
     * Sets the palette index on tiles witin a given tile block.
     * @param {PalettePaintByBlockArgs} args - Arguments for the function.
     * @returns {PalettePaintResult}
     */
    static setTileBlockPaletteIndex(args) {
        const updatedTileIds = [];
        const mapRow = args.tileBlockRow * args.tilesPerBlock;
        const mapCol = args.tileBlockCol * args.tilesPerBlock;
        for (let r = 0; r < args.tilesPerBlock; r++) {
            const row = mapRow + r;
            for (let c = 0; c < args.tilesPerBlock; c++) {
                const col = mapCol + c;
                const tileInfo = args.tileMap.getTileByCoordinate(row, col);
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
 * @typedef {object} PalettePaintByBlockArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {TileSet} tileSet - Tile set that contains the tiles for the project.
 * @property {number} tileBlockRow - Row in tile block grid.
 * @property {number} tileBlockCol - Column in the tile block grid.
 * @property {number} tilesPerBlock - Amount of tiles that comprise each tile block.
 * @property {number} paletteIndex - Index of the palette slot to set.
 * @exports
 */
/** 
 * Result for the palette paint tool.
 * @typedef {object} PalettePaintResult
 * @property {string[]} updatedTileIds - Unique IDs of tiles affected by the operation.
 * @exports
 */