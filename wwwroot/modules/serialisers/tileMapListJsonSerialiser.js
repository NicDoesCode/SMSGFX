import TileMapListFactory from "../factory/tileMapListFactory.js";
import TileMapList from "../models/tileMapList.js";
import TileMapJsonSerialiser from "./tileMapJsonSerialiser.js";


/**
 * Provides tile map list serialisation functions.
 */
export default class TileMapListJsonSerialiser {


    /**
     * Serialises a tile map list to JSON.
     * @param {TileMapList} value - tile map list to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        const result = TileMapListJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map list.
     * @param {string} jsonString - JSON serialised tile map list.
     * @throws When the JSON string is null or empty.
     * @returns {TileMapList}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Tile map list to deserialise must be passed as a JSON string.');

        /** @type {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} */
        const deserialised = JSON.parse(jsonString);
        return TileMapListJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map list object to a serialisable one.
     * @param {TileMapList} value - Tile map list to convert.
     * @throws When a valid tile map list was not passed.
     * @returns {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} 
     */
    static toSerialisable(value) {
        if (!value instanceof TileMapList) throw new Error('Please pass a tile map list.');

        return value.getTileMaps().map((tm) => TileMapJsonSerialiser.toSerialisable(tm));
    }

    /**
     * Converts a serialisable tile map array array back to a tile map list.
     * @param {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} serialisable - Serialisable tile maps to convert.
     * @throws When the passed serialisable list of projects was not valid.
     * @returns {TileMapList}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable || !Array.isArray(serialisable)) throw new Error('Please pass an array of serialisable tile maps.');

        const result = TileMapListFactory.create();
        serialisable.forEach((tm) => {
            try {
                result.addTileMap(TileMapJsonSerialiser.fromSerialisable(tm));
            } catch (e) {
                console.error('Unable to restore tile map.', tm);
                console.error(e);
            }
        });
        return result;
    }


}
