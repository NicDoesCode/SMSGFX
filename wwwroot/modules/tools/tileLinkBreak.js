import TileFactory from "../factory/tileFactory.js";
import Project from "../models/project.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";

export default class TileLinkBreak {

    /**
     * Breaks a link from a tile index and promotes it to a new tile.
     * @param {number} tileIndex - Index of the tile witin the tile map.
     * @param {TileMap} tileMap - Tile map that contains the tile.
     * @param {TileSet} tileSet - Tile set that containes the tiles for the tile map.
     * @param {Project?} [project] - Project object, used to search tile maps for references to the tile.
     * @returns {boolean}
     */
    static run(tileIndex, tileMap, tileSet, project) {
        if (tileIndex < 0 || tileIndex >= tileMap.tileCount) throw new Error('Invalid tile index.')
        if (!tileMap instanceof TileMap) throw new Error('Invalid tile map.');
        if (!tileSet instanceof TileSet) throw new Error('Invalid tile set.');

        const tileMapTile = tileMap.getTileByIndex(tileIndex);
        
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

                return true;
            }
        }

        return false;
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
