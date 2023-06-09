import TileFactory from "../factory/tileFactory.js";
import Project from "../models/project.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileLinkBreakTool {

    /**
     * Breaks a link from a tile index and promotes it to a new tile.
     * @param {number} tileIndex - Index of the tile witin the tile map.
     * @param {TileMap} tileMap - Tile map that contains the tile.
     * @param {TileSet} tileSet - Tile set that containes the tiles for the tile map.
     * @param {Project?} [project] - Project object, used to search tile maps for references to the tile.
     * @returns {TileBreakLinkResult}
     */
    static createAndLinkNewTileIfUsedElsewhere(tileIndex, tileMap, tileSet, project) {
        if (tileIndex < 0 || tileIndex >= tileMap.tileCount) throw new Error('Invalid tile index.')
        if (!tileMap instanceof TileMap) throw new Error('Invalid tile map.');
        if (!tileSet instanceof TileSet) throw new Error('Invalid tile set.');

        const tileMapTile = tileMap.getTileByIndex(tileIndex);
        /** @type {TileBreakLinkResult} */
        const result = { changesMade: false, updatedTileIds: [] };

        let instanceCount = countOfTileIdInTileMap(tileMapTile.tileId, tileMap);
        if (instanceCount === 1) {
            instanceCount = totalCountOfTileIdInProjectTileMaps(tileMapTile.tileId, project);
        }

        const isRepeated = instanceCount > 1;
        if (isRepeated) {
            const associatedTile = tileSet.getTileById(tileMapTile.tileId);
            if (associatedTile) {
                const duplicateTile = TileFactory.create({ data: associatedTile.readAll() });
                tileSet.addTile(duplicateTile);

                tileMapTile.tileId = duplicateTile.tileId;

                result.updatedTileIds.push(duplicateTile.tileId);
                result.changesMade = true;
            }
        }

        return result;
    }

}

/**
 * @param {string} tileId 
 * @param {Project?} [project]
 * @returns {number}
 */
function totalCountOfTileIdInProjectTileMaps(tileId, project) {
    let result = 0;
    if (project && project instanceof Project) {
        const tileMaps = project.tileMapList.getTileMaps();
        tileMaps.forEach((tileMap) => {
            result += countOfTileIdInTileMap(tileId, tileMap);
        });
    }
    return result;
}

/**
 * @param {string} tileId 
 * @param {TileMap} tileMap
 * @returns {number}
 */
function countOfTileIdInTileMap(tileId, tileMap) {
    const instancesInTileMap = tileMap.getTiles().filter((tile) => tile.tileId === tileId);
    return instancesInTileMap.length;
}

/** 
 * Result for the tile break link tool.
 * @typedef {object} TileBreakLinkResult
 * @property {boolean} changesMade - True if changes were made, otherwise false.
 * @property {string[]} updatedTileIds - Unique IDs of tiles affected by the operation.
 * @exports
 */