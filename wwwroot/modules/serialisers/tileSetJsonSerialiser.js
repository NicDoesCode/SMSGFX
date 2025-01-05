import TileSet from "../models/tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import TileFactory from "../factory/tileFactory.js";
import TileJsonSerialiser from "./tileJsonSerialiser.js";


/**
 * Provides tile set serialisation functions.
 */
export default class TileSetJsonSerialiser {


    /**
     * Serialises a tile set to a JSON string.
     * @param {TileSet} value - Tile set to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        const result = TileSetJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile set.
     * @param {string} jsonString - JSON serialised tile set.
     * @throws When the JSON string is null or empty.
     * @returns {TileSet}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {TileSetSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return TileSetJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile set object to a serialisable one.
     * @param {TileSet} value - Tile set to serialise.
     * @throws When a valid tile set was not passed.
     * @returns {TileSetSerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof TileSet) throw new Error('Please pass a tile set.');

        return {
            tileWidth: value.tileWidth,
            tiles: value.getTiles().map(t => TileJsonSerialiser.toSerialisable(t))
        };
    }

    /**
     * Converts a serialisable tiles set back to a tile set.
     * @param {TileSetSerialisable} serialisable - Serialisable tile set to convert.
     * @throws When a valid serialisable tile set was not passed.
     * @returns {TileSet}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable) throw new Error('Please pass a serialisable tile set.');

        const result = TileSetFactory.create();
        result.tileWidth = serialisable.tileWidth;

        if (serialisable.tiles && Array.isArray(serialisable.tiles)) {
            serialisable.tiles.forEach((t) => {
                const newTile = TileJsonSerialiser.fromSerialisable(t);
                result.addTile(newTile);
            });
        }

        // TODO - remove this in the future 
        if (serialisable.tilesAsHex && Array.isArray(serialisable.tilesAsHex)) {
            serialisable.tilesAsHex.forEach((tileAsHex) => {
                const newTile = TileFactory.fromHex(tileAsHex);
                result.addTile(newTile);
            });
        }

        return result;
    }


}

/**
 * @typedef {Object} TileSetSerialisable
 * @property {number} tileWidth - The width of the tile map (in 8x8 pixel tiles).
 * @property {string[]} tilesAsHex - Array of tiles encoded as hexadecimal.
 * @property {import("./tileJsonSerialiser.js").TileSerialisable[]} tiles - Array of tiles.
 */