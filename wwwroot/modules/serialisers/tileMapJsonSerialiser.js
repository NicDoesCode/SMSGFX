import TileMapFactory from "../factory/tileMapFactory.js";
import TileMap from "../models/tileMap.js";
import TileMapTileJsonSerialiser from "./tileMapTileJsonSerialiser.js";

export default class TileMapJsonSerialiser {


    /**
     * Serialises a palette to a JSON string.
     * @param {TileMap} tileMap - Tile map to serialise.
     * @returns {string} 
     */
    static serialise(tileMap) {
        if (!tileMap) throw new Error('Please pass a tile map.');

        const result = TileMapJsonSerialiser.toSerialisable(tileMap);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map.
     * @param {string} jsonPalette - JSON serialised tile map.
     * @returns {Palette}
     */
    static deserialise(jsonPalette) {
        if (!jsonPalette || typeof jsonPalette !== 'string') throw new Error('Tile map to deserialise must be passed as a JSON string.');

        /** @type {TileMapSerialisable} */
        const deserialised = JSON.parse(jsonPalette);
        return TileMapJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map object to a serialisable one.
     * @param {TileMap} tileMap - Tile map to create serialisable from.
     * @returns {TileMapSerialisable} 
     */
     static toSerialisable(tileMap) {
        return {
            id: tileMap.id,
            title: tileMap.title,
            vramOffset: tileMap.vramOffset,
            rows: tileMap.rows,
            columns: tileMap.columns,
            optimise: tileMap.optimise,
            tiles: TileMapTileJsonSerialiser.toSerialisable(tileMap.tiles)
        };
    }

    /**
     * Converts a serialisable tile map back to a tile map.
     * @param {TileMapSerialisable} tileMapSerialisable - Serialisable tile map to convert.
     * @returns {TileMap}
     */
    static fromSerialisable(tileMapSerialisable) {
        const result = TileMapFactory.create({
            id: tileMapSerialisable.id,
            title: tileMapSerialisable.title,
            vramOffset: tileMapSerialisable.vramOffset,
            rows: tileMapSerialisable.rows,
            columns: tileMapSerialisable.columns,
            optimise: tileMapSerialisable.optimise
        });
        if (Array.isArray(tileMapSerialisable.tiles)) {
            tileMapSerialisable.tiles.forEach((t) => result.addTile(TileMapTileJsonSerialiser.fromSerialisable(t)));
        }
        return result;
    }


}

/**
 * @typedef TileMapSerialisable
 * @type {object}
 * @property {string} id
 * @property {string} title
 * @property {number} vramOffset
 * @property {number} rows
 * @property {number} columns
 * @property {boolean} optimise
 * @property {import('./tileMapTileJsonSerialiser.js').TileMapTileSerialisable[]} tiles
 * @exports
 */
