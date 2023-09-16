import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileStampTool {

    /**
     * Sets the tile ID on a tile within a tile map.
     * @param {TileStampByBlockArgs} args - Arguments for the function.
     * @returns {TileStampResult}
     */
    static stampTile(args) {
        const updatedTileIds = [];
        const tileInfo = args.tileMap.getTileByCoordinate(args.tileRow, args.tileCol);
        if (tileInfo && tileInfo.tileId !== args.tileId) {
            tileInfo.tileId = args.tileId;
            updatedTileIds.push(tileInfo.tileId);
        }
        return { updatedTileIds: updatedTileIds };
    }

    /**
     * Sets the tile ID on a tile within a tile map.
     * @param {TileStampByBlockArgs} args - Arguments for the function.
     * @returns {TileStampResult}
     */
    static stampTileMap(args) {
        const updatedTileIds = [];

        for (let r = 0; r < args.stampTileMap.rowCount; r++) {
            const row = args.tileRow + r;
            for (let c = 0; c < args.stampTileMap.columnCount; c++) {
                const col = args.tileCol + c;
                const tileInfo = args.tileMap.getTileByCoordinate(row, col);
                const stampTileInfo = args.stampTileMap.getTileByCoordinate(r, c);
                if (tileInfo && stampTileInfo) {
                    tileInfo.tileId = stampTileInfo.tileId;
                    tileInfo.horizontalFlip = stampTileInfo.horizontalFlip;
                    tileInfo.verticalFlip = stampTileInfo.verticalFlip;
                    tileInfo.palette = stampTileInfo.palette;
                    tileInfo.priority = stampTileInfo.priority;
                    updatedTileIds.push(tileInfo.tileId);
                }
            }
        }
        return { updatedTileIds: updatedTileIds };
    }

}
/** 
 * Arguments for the tile stamp tool.
 * @typedef {Object} TileStampByBlockArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {TileSet} tileSet - Tile set that contains the tiles for the project.
 * @property {number} tileRow - Row in tile block grid.
 * @property {number} tileCol - Column in the tile block grid.
 * @property {TileMap} stampTileMap - The tile map to be stamped.
 * @exports
 */
/** 
 * Arguments for the tile stamp tool.
 * @typedef {Object} TileStampByBlockArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {TileSet} tileSet - Tile set that contains the tiles for the project.
 * @property {number} tileRow - Row in tile block grid.
 * @property {number} tileCol - Column in the tile block grid.
 * @property {string} tileId - Unique ID of the tile to be set.
 * @exports
 */
/** 
 * Result for the tile stamp tool.
 * @typedef {Object} TileStampResult
 * @property {string[]} updatedTileIds - Unique IDs of tiles affected by the operation.
 * @exports
 */