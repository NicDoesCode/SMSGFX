import TileMap from "../models/tileMap.js";
import TileMapList from "../models/tileMapList.js";
import TileMapTile from "../models/tileMapTile.js";
import TileSet from "../models/tileSet.js";
import GeneralUtil from "../util/generalUtil.js";
import TileUtil from "../util/tileUtil.js";
import TileMapListFactory from "../factory/tileMapListFactory.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";

export default class TileMapFactory {


    /**
     * Creates a new instance of a tile map list object.
     * @param {TileMapFactoryCreateArgs} [args] - Arguments for tile map creation.
     * @returns {TileMap}
     */
    static create(args) {
        if (typeof args === 'undefined' || args === null) args = {
            rows: 1, columns: 1
        };

        if (!typeof args.rows === 'number' || args.rows <= 0) throw new Error('Invalid value given for "rows" parameter.');
        if (!typeof args.columns === 'number' || args.columns <= 0) throw new Error('Invalid value given for "columns" parameter.');

        const result = new TileMap(args.rows, args.columns);
        result.tileMapId = (typeof args.tileMapId === 'string' && args.tileMapId.length > 0) ? args.tileMapId : GeneralUtil.generateRandomString(16);
        result.title = (typeof args.title === 'string' && args.title.length > 0) ? args.title : 'Tile map';
        result.vramOffset = (typeof args.vramOffset === 'number') ? args.vramOffset : 0;
        result.optimise = (typeof args.optimise === 'boolean') ? args.optimise : true;

        /** @type {TileMapTile[]} */
        const tileArray = (Array.isArray(args.tiles)) ? args.tiles : new Array();
        if (tileArray.length > result.tileCount) throw new Error('Number of tiles passed in tile array exceeds capacity of the tile map.');

        // Fill tiles
        const tileId = args?.defaultTileId ?? null;
        for (let idx = 0; idx < result.tileCount; idx++) {
            const tile = (idx < tileArray.length) ? tileArray[idx] : createNewTile(tileId);
            result.setTileByIndex(idx, tile);
        }

        return result;
    }


}
/**
 * @typedef TileMapFactoryCreateArgs
 * @type {object}
 * @property {string?} tileMapId
 * @property {string?} title
 * @property {number?} vramOffset
 * @property {number?} rows
 * @property {number?} columns
 * @property {boolean?} optimise
 * @property {TileMapTile[]} tiles
 * @property {string?} defaultTileId
 * @exports
 */

function createNewTile(tileId) {
    return TileMapTileFactory.create({
        horizontalFlip: false,
        verticalFlip: false,
        palette: 0,
        priority: false,
        tileId: tileId
    });
}