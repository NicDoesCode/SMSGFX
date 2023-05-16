import TileMapTile from "../models/tileMapTile.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";

export default class TileMapTileJsonSerialiser {


    /**
     * Serialises a tile map tile to a JSON string.
     * @param {TileMapTile} tileMapTile - Tile map tile to serialise.
     * @returns {string} 
     */
    static serialise(tileMapTile) {
        if (!tileMapTile) throw new Error('Please pass a tile map tile.');

        const result = TileMapTileFactory.toSerialisable(tileMapTile);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised tile map tile.
     * @param {string} jsonTileMapTile - JSON serialised tile map tile.
     * @returns {TileMapTile}
     */
    static deserialise(jsonTileMapTile) {
        if (!jsonTileMapTile || typeof jsonTileMapTile !== 'string') throw new Error('Tile map tile to deserialise must be passed as a JSON string.');

        /** @type {TileMapTileSerialisable} */
        const deserialised = JSON.parse(jsonTileMapTile);
        return TileMapTileSerialisable.fromSerialisable(deserialised);
    }

    /**
     * Converts a tile map tile object to a serialisable one.
     * @param {TileMapTile} tileMapTile - Tile map tile to create serialisable from.
     * @returns {TileMapTileSerialisable} 
     */
     static toSerialisable(tileMapTile) {
        return {
            tileId: tileMapTile.tileId,
            priority: tileMapTile.priority,
            paletteId: tileMapTile.palette,
            verticalFlip: tileMapTile.verticalFlip,
            horizontalFlip: tileMapTile.horizontalFlip
        };
    }

    /**
     * Converts a serialisable tile map tile back to a tile map tile.
     * @param {TileMapTileSerialisable} tileMapTileSerialisable - Serialisable tile map tile to convert.
     * @returns {TileMapTile}
     */
    static fromSerialisable(tileMapTileSerialisable) {
        return TileMapTileFactory.create({
            tileId: tileMapTileSerialisable.tileId,
            priority: tileMapTileSerialisable.priority,
            palette: tileMapTileSerialisable.paletteId,
            verticalFlip: tileMapTileSerialisable.verticalFlip,
            horizontalFlip: tileMapTileSerialisable.horizontalFlip
        });
    }


}

/**
 * @typedef TileMapTileSerialisable
 * @type {object}
 * @property {string} tileId
 * @property {boolean} priority
 * @property {string} paletteId
 * @property {number} verticalFlip
 * @property {number} horizontalFlip
 * @exports
 */
