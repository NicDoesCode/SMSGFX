import TileMapListFactory from "../factory/tileMapListFactory.js";
import TileMapList from "../models/tileMapList.js";
import TileMapJsonSerialiser from "./tileMapJsonSerialiser.js";

export default class TileMapListJsonSerialiser {


    /**
     * Serialises a tile map list to JSON.
     * @param {TileMapList} tileMapList - tile map list to serialise.
     * @returns {string} 
     */
    static serialise(tileMapList) {
        if (!tileMapList || typeof tileMapList.getTileMaps !== 'function') throw new Error('Please pass a tile map list.');

        const result = TileMapListJsonSerialiser.toSerialisable(tileMapList);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map list.
     * @param {string} jsonTileMapList - JSON serialised tile map list.
     * @returns {TileMapList}
     */
    static deserialise(jsonTileMapList) {
        if (!jsonTileMapList || typeof jsonTileMapList !== 'string') throw new Error('Tile map list to deserialise must be passed as a JSON string.');

        /** @type {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} */
        const deserialised = JSON.parse(jsonTileMapList);
        return TileMapListJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map list object to a serialisable one.
     * @param {TileMapList} tileMapList - Tile map list to convert.
     * @returns {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} 
     */
    static toSerialisable(tileMapList) {
        if (!tileMapList || !tileMapList instanceof TileMapList) throw new Error('Please pass a tile map list.');

        return tileMapList.getTileMaps().map((tm) => TileMapJsonSerialiser.toSerialisable(tm));
    }

    /**
     * Converts a serialisable tile map array array back to a tile map list.
     * @param {import('./tileMapJsonSerialiser.js').TileMapSerialisable[]} tileMapSerialisableArray - Serialisable tile maps to convert.
     * @returns {TileMapList}
     */
    static fromSerialisable(tileMapSerialisableArray) {
        if (!tileMapSerialisableArray || !Array.isArray(tileMapSerialisableArray)) throw new Error('Please pass an array of serialisable tile maps.');

        const result = TileMapListFactory.create();
        tileMapSerialisableArray.forEach((tm) => {
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
