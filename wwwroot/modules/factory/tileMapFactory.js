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
        if (typeof args === 'undefined' || args === null) args = {};

        const result = new TileMap();
        result.id = (typeof args.id === 'string' && args.id.length > 0) ? args.id : GeneralUtil.generateRandomString(16);
        result.title = (typeof args.title === 'string' && args.title.length > 0) ? args.title : 'Tile map';
        result.vramOffset = (typeof args.vramOffset === 'number') ? result.vramOffset : 0;
        result.columns = (typeof args.columns === 'number') ? result.columns : 0;
        result.rows = (typeof args.rows === 'number') ? result.rows : 0;
        result.optimise = (typeof args.optimise === 'boolean') ? result.optimise : true;
        if (Array.isArray(args.tiles)) args.tiles.forEach((t) => result.addTile(t));
        return result;
    }


}
/**
 * @typedef TileMapFactoryCreateArgs
 * @type {object}
 * @property {string?} id
 * @property {string?} title
 * @property {number?} vramOffset
 * @property {number?} rows
 * @property {number?} columns
 * @property {boolean?} optimise
 * @property {TileMapTile[]} tiles
 * @exports
 */
