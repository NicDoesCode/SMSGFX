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
        const updatedTileMapTileIndexes = [];

        const tileInfo = args.tileMap.getTileInfoByRowAndColumn(args.tileRow, args.tileCol);
        if (tileInfo && tileInfo.tileId !== args.tileId) {
            const tileMapTile = args.tileMap.getTileByIndex(tileInfo.tileIndex);
            tileMapTile.tileId = args.tileId;
            updatedTileIds.push(tileMapTile.tileId);
            updatedTileMapTileIndexes.push(tileInfo.tileIndex);
        }

        return {
            updatedTileIds: updatedTileIds,
            updatedTileMapTileIndexes: updatedTileMapTileIndexes
        };
    }

    /**
     * Sets the tile ID on a tile within a tile map.
     * @param {TileStampByBlockArgs} args - Arguments for the function.
     * @returns {TileStampResult}
     */
    static stampTileMap(args) {
        const updatedTileIds = [];
        const updatedTileMapTileIndexes = [];

        for (let stampRow = 0; stampRow < args.stampTileMap.rowCount; stampRow++) {
            const row = args.tileRow + stampRow;
            for (let stampCol = 0; stampCol < args.stampTileMap.columnCount; stampCol++) {
                const col = args.tileCol + stampCol;
                const tileInfo = args.tileMap.getTileInfoByRowAndColumn(row, col);
                const stampTile = args.stampTileMap.getTileByRowAndColumn(stampRow, stampCol);
                if (tileInfo && stampTile) {
                    const tileMapTile = args.tileMap.getTileByIndex(tileInfo.tileIndex);
                    tileMapTile.tileId = stampTile.tileId;
                    tileMapTile.horizontalFlip = stampTile.horizontalFlip;
                    tileMapTile.verticalFlip = stampTile.verticalFlip;
                    tileMapTile.palette = stampTile.palette;
                    tileMapTile.priority = stampTile.priority;
                    updatedTileIds.push(tileMapTile.tileId);
                    updatedTileMapTileIndexes.push(tileInfo.tileIndex);
                }
            }
        }

        return { 
            updatedTileIds: updatedTileIds, 
            updatedTileMapTileIndexes: updatedTileMapTileIndexes
        };
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
 * @property {string[]} updatedTileMapTileIndexes - Indexes of the tile map tiles that were affected.
 * @exports
 */