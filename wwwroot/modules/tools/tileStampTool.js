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

}

/** 
 * Arguments for the tile stamp tool.
 * @typedef {object} TileStampByBlockArgs
 * @property {TileMap} tileMap - Tile map that contains the tiles to set.
 * @property {TileSet} tileSet - Tile set that contains the tiles for the project.
 * @property {number} tileRow - Row in tile block grid.
 * @property {number} tileCol - Column in the tile block grid.
 * @property {string} tileId - Unique ID of the tile to be set.
 * @exports
 */
/** 
 * Result for the tile stamp tool.
 * @typedef {object} TileStampResult
 * @property {string[]} updatedTileIds - Unique IDs of tiles affected by the operation.
 * @exports
 */