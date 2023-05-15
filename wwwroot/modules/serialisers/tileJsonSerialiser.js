import Tile from "../models/tile.js";
import TileFactory from "../factory/tileFactory.js";
import TileUtil from "../util/tileUtil.js";

export default class TileJsonSerialiser {


    /**
     * Serialises the list of tile.
     * @param {Tile} tile - Tile to serialise.
     * @returns {string} 
     */
    static serialise(tile) {
        const result = TileJsonSerialiser.toSerialisable(tile);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile.
     * @param {string} jsonTile - JSON serialised tile.
     * @returns {Tile}
     */
    static deserialise(jsonTile) {
        if (jsonTile) {
            /** @type {TileSerialisable} */
            const deserialised = JSON.parse(jsonTile);
            return TileJsonSerialiser.fromSerialisable(deserialised);
        } else throw new Error('Invalid tile data supplied.');
    }

    /**
     * Converts a tile object to a serialisable one.
     * @param {Tile} tile - Tile to serialise.
     * @returns {TileSerialisable} 
     */
     static toSerialisable(tile) {
        if (!tile || typeof tile.readAll !== 'function') throw new Error('Please pass a tile.');
        return {
            tileId: tile.tileId,
            tileData: TileUtil.toHex(tile)
        };
    }

    /**
     * Converts a serialisable tile back to a tile.
     * @param {TileSerialisable} tileSerialisable - Serialisable tile to convert.
     * @returns {TileSet}
     */
    static fromSerialisable(tileSerialisable) {
        if (!tileSerialisable) throw new Error('Please pass a serialisable tile.');

        const result = TileFactory.fromHex(tileAsHex);
        result.tileId = tileSerialisable.tileId;
        return result;
    }


}

/**
 * @typedef TileSerialisable
 * @type {object}
 * @property {string} tileId
 * @property {string} tileData
 */