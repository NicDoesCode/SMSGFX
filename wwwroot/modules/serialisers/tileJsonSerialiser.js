import Tile from "../models/tile.js";
import TileFactory from "../factory/tileFactory.js";
import TileUtil from "../util/tileUtil.js";


/**
 * Provides tile serialisation functions.
 */
export default class TileJsonSerialiser {


    /**
     * Serialises a tile.
     * @param {Tile} value - Tile to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        const result = TileJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile.
     * @param {string} jsonString - JSON serialised tile.
     * @throws When the JSON string is null or empty.
     * @returns {Tile}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {TileSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return TileJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile object to a serialisable one.
     * @param {Tile} value - Tile to serialise.
     * @throws When a valid tile was not passed.
     * @returns {TileSerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof Tile) throw new Error('Please pass a tile.');

        return {
            tileId: value.tileId,
            alwaysKeep: value.alwaysKeep,
            tileData: TileUtil.toHex(value)
        };
    }

    /**
     * Converts a serialisable tile back to a tile.
     * @param {TileSerialisable} serialisable - Serialisable tile to convert.
     * @returns {TileSet}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable) throw new Error('Please pass a serialisable tile.');

        const result = TileFactory.fromHex(serialisable.tileData);
        result.tileId = serialisable.tileId;
        result.alwaysKeep = serialisable.alwaysKeep ?? false;
        return result;
    }


}

/**
 * @typedef {Object} TileSerialisable
 * @property {string} tileId
 * @property {boolean?} [alwaysKeep]
 * @property {string} tileData
 */