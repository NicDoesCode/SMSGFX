import TileMapFactory from "../factory/tileMapFactory.js";
import TileMap from "../models/tileMap.js";
import TileMapTileJsonSerialiser from "./tileMapTileJsonSerialiser.js";


/**
 * Provides tile map serialisation functions.
 */
export default class TileMapJsonSerialiser {


    /**
     * Serialises a tile map to a JSON string.
     * @param {TileMap} value - Tile map to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        if (!value) throw new Error('Please pass a tile map.');

        const result = TileMapJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map.
     * @param {string} jsonString - JSON serialised tile map.
     * @throws When the JSON string is null or empty.
     * @returns {TileMap}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {TileMapSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return TileMapJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map object to a serialisable one.
     * @param {TileMap} value - Tile map to create serialisable from.
     * @throws When a valid tile map was not passed.
     * @returns {TileMapSerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof TileMap) throw new Error('Please pass a tile set.');
    
        return {
            tileMapId: value.tileMapId,
            title: value.title,
            vramOffset: value.vramOffset,
            rows: value.rowCount,
            columns: value.columnCount,
            optimise: value.optimise,
            isSprite: value.isSprite,
            paletteSlots: value.getPalettes(),
            tiles: value.getTiles().map((tile) => TileMapTileJsonSerialiser.toSerialisable(tile))
        };
    }

    /**
     * Converts a serialisable tile map back to a tile map.
     * @param {TileMapSerialisable} serialisable - Serialisable tile map to convert.
     * @throws When a valid serialisable tile map was not passed.
     * @returns {TileMap}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable) throw new Error('Please pass a serialisable tile map.');

        const result = TileMapFactory.create({
            tileMapId: serialisable.tileMapId,
            title: serialisable.title,
            vramOffset: serialisable.vramOffset,
            rows: serialisable.rows,
            columns: serialisable.columns,
            optimise: serialisable.optimise,
            isSprite: serialisable.isSprite ?? false,
            paletteSlots: serialisable.paletteSlots
        });
        if (Array.isArray(serialisable.tiles)) {
            serialisable.tiles.forEach((tileMapTileSerialisable, index) => {
                const tileMapTile = TileMapTileJsonSerialiser.fromSerialisable(tileMapTileSerialisable);
                result.setTileByIndex(index, tileMapTile);
            });
        }
        return result;
    }


}

/**
 * @typedef {Object} TileMapSerialisable
 * @property {string} tileMapId
 * @property {string} title
 * @property {number} vramOffset
 * @property {number} rows
 * @property {number} columns
 * @property {boolean} optimise
 * @property {boolean} isSprite
 * @property {string[]} paletteSlots
 * @property {import('./tileMapTileJsonSerialiser.js').TileMapTileSerialisable[]} tiles
 * @exports
 */
