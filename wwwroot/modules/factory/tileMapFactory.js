import TileMap from "../models/tileMap.js";
import TileMapTile from "../models/tileMapTile.js";
import GeneralUtil from "../util/generalUtil.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";
import TileMapJsonSerialiser from "../serialisers/tileMapJsonSerialiser.js";


/**
 * Provides factory methods for constructing tile map objects.
 */
export default class TileMapFactory {


    /**
     * Creates a new instance of a tile map object.
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
        result.isSprite = (typeof args.isSprite === 'boolean') ? args.isSprite : false;

        if (Array.isArray(args.paletteSlots)) {
            args.paletteSlots.forEach((paletteId, index) => {
                if (paletteId) {
                    result.setPalette(index, paletteId);
                }
            });
        }

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

    /**
     * Creates a deep copy of a tile map object, the new tile map will be the same but have a different ID.
     * @param {TileMap} sourceTileMap - Source tile map.
     * @returns {TileMap}
     */
    static clone(sourceTileMap) {
        const sourceJSON = TileMapJsonSerialiser.serialise(sourceTileMap);
        const cloneTileMap = TileMapJsonSerialiser.deserialise(sourceJSON);
        cloneTileMap.tileMapId = GeneralUtil.generateRandomString(16);
        return cloneTileMap;
    }


}
/**
 * Arguments for creating a tile map.
 * @typedef {Object} TileMapFactoryCreateArgs
 * @property {string?} tileMapId - Unique ID of the tile map object.
 * @property {string?} title - Title of the tile map object.
 * @property {number?} vramOffset - Offset in VRAM for where the tiles for the tile map begin.
 * @property {number?} rows - Number of rows in the tile map.
 * @property {number?} columns - Number of columns in the tile map.
 * @property {boolean?} optimise - When exporting to code, will the tile map be optimised?
 * @property {boolean?} isSprite - This tile map is a sprite, which will affect the result of export to code operations.
 * @property {string[]?} paletteSlots - Array of palette IDs for each palette slot.
 * @property {TileMapTile[]} tiles - Tile map tiles that comprise the tile map.
 * @property {string?} [defaultTileId] - Tile ID to use when initially populating the tile map tile list.
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