import TileGridProvider from "../models/tileGridProvider.js";
import TileMap from "../models/tileMap.js";
import TileSet from "../models/tileSet.js";
import TileMapTileJsonSerialiser from "./tileMapTileJsonSerialiser.js";
import TileSetJsonSerialiser from "./tileSetJsonSerialiser.js";


/**
 * Provides tile grid provider serialisation functions.
 */
export default class TileGridProviderJsonSerialiser {


    /**
     * Serialises a tile grid provider to a JSON string.
     * @param {TileGridProvider} value - Tile grid object to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        const result = TileGridProviderJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile grid provider object.
     * @param {string} jsonString - JSON serialised tile map.
     * @throws When the JSON string is null or empty.
     * @returns {TileGridProviderSerialisable}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {TileGridProviderSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return TileGridProviderJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile grid provider object to a serialisable one.
     * @param {TileGridProvider} value - Tile grid object to serialise.
     * @throws When a valid tile grid provider was not passed.
     * @returns {TileGridProviderSerialisable} 
     */
    static toSerialisable(value) {
        if (value instanceof TileMap) {
            return {
                type: 'TileMap',
                value: TileMapJsonSerialiser.toSerialisable(value)
            };
        } else if (value instanceof TileSet) {
            return {
                type: 'TileSet',
                value: TileSetJsonSerialiser.toSerialisable(value)
            };
        } else {
            throw new Error('An unknown tile grid provider object was passed.');
        }
    }

    /**
     * Converts a serialisable tile grid provider back to a tile grid provider.
     * @param {TileGridProviderSerialisable} serialisable - Serialisable tile grid provider to convert.
     * @returns {TileGridProvider}
     */
    static fromSerialisable(serialisable) {
        if (serialisable.type === 'TileMap') {
            return TileMapTileJsonSerialiser.fromSerialisable(serialisable.serialised);
        } else if (serialisable.type === 'TileSet') {
            return TileSetJsonSerialiser.fromSerialisable(serialisable.serialised);
        } else {
            throw new Error('Didn\'t know how to convert the serialised tile grid provider object.');
        }
    }


}

/**
 * @typedef {Object} TileGridProviderSerialisable
 * @property {string} type - Type of tile grid provider.
 * @property {string} serialised - Serialised object.
 * @exports
 */
