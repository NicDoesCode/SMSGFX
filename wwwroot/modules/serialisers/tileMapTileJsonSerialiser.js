import TileMapTile from "../models/tileMapTile.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";


/**
 * Provides tile map tile serialisation functions.
 */
export default class TileMapTileJsonSerialiser {


    /**
     * Serialises a tile map tile to a JSON string.
     * @param {TileMapTile} value - Tile map tile to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        const result = TileMapTileFactory.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map tile.
     * @param {string} jsonString - JSON serialised tile map tile.
     * @throws When the JSON string is null or empty.
     * @returns {TileMapTile}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {TileMapTileSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return TileMapTileSerialisable.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map tile object to a serialisable one.
     * @param {TileMapTile} value - Tile map tile to create serialisable from.
     * @throws When a valid tile map tile was not passed.
     * @returns {TileMapTileSerialisable} 
     */
     static toSerialisable(value) {
        if (!value instanceof TileMapTile) throw new Error('Please pass a tile map tile.');
       
        return {
            tileId: value.tileId,
            priority: value.priority,
            paletteId: value.palette,
            verticalFlip: value.verticalFlip,
            horizontalFlip: value.horizontalFlip
        };
    }

    /**
     * Converts a serialisable tile map tile back to a tile map tile.
     * @param {TileMapTileSerialisable} serialisable - Serialisable tile map tile to convert.
     * @returns {TileMapTile}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable) throw new Error('Please pass a serialisable tile map tile.');
      
        return TileMapTileFactory.create({
            tileId: serialisable.tileId,
            priority: serialisable.priority,
            palette: serialisable.paletteId,
            verticalFlip: serialisable.verticalFlip,
            horizontalFlip: serialisable.horizontalFlip
        });
    }


}

/**
 * @typedef {Object} TileMapTileSerialisable
 * @property {string} tileId
 * @property {boolean} priority
 * @property {string} paletteId
 * @property {number} verticalFlip
 * @property {number} horizontalFlip
 * @exports
 */
