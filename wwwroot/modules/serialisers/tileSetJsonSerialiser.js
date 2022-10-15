import TileSet from "../models/tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import TileFactory from "../factory/tileFactory.js";

export default class TileSetJsonSerialiser {


    /**
     * Serialises the list of tile sets.
     * @param {TileSet} tileSet - Tile set to serialise.
     * @returns {string} 
     */
    static serialise(tileSet) {
        const result = TileSetJsonSerialiser.toSerialisable(tileSet);
        return JSON.stringify(result);
    }

    /**
     * Converts the tile to a hex encoded string.
     * @param {Tile} tile - The tile that we are encoding.
     * @returns {string}
     */
     static #toHex(tile) {
        let result = '';
        const tileData = tile.readAll();
        for (let i = 0; i < tileData.length; i++) {
            let byteAsString = tileData[i].toString(16);
            if (byteAsString.length % 2 !== 0) result += '0';
            result += byteAsString;
        }
        return result;
    }

    /**
     * Returns a deserialised tile set.
     * @param {string} jsonTileSet - JSON serialised tile set.
     * @returns {TileSet}
     */
    static deserialise(jsonTileSet) {
        if (jsonTileSet) {
            /** @type {TileSetSerialisable} */
            const deserialised = JSON.parse(jsonTileSet);
            return TileSetJsonSerialiser.fromSerialisable(deserialised);
        } else throw new Error('Invalid tile set data supplied.');
    }

    /**
     * Converts a tile set object to a serialisable one.
     * @param {TileSet} tileSet - Tile set to serialise.
     * @returns {TileSetSerialisable} 
     */
     static toSerialisable(tileSet) {
        if (!tileSet || typeof tileSet.getPixelAt !== 'function') throw new Error('Please pass a tile set.');
        return {
            tileWidth: tileSet.tileWidth,
            tilesAsHex: tileSet.getTiles().map(t => TileSetJsonSerialiser.#toHex(t))
        };
    }

    /**
     * Converts a serialisable tiles set back to a tile set.
     * @param {TileSetSerialisable} tileSetSerialisable - Serialisable tile set to convert.
     * @returns {TileSet}
     */
    static fromSerialisable(tileSetSerialisable) {
        if (!tileSetSerialisable) throw new Error('Please pass a serialisable tile set.');

        const result = TileSetFactory.create();
        result.tileWidth = tileSetSerialisable.tileWidth;
        tileSetSerialisable.tilesAsHex.forEach(tileAsHex => {
            const newTile = TileFactory.fromHex(tileAsHex);
            result.addTile(newTile);
        });
        return result;
    }


}

/**
 * @typedef TileSetSerialisable
 * @type {object}
 * @property {number} tileWidth - The width of the tile map (in 8x8 pixel tiles).
 * @property {string[]} tilesAsHex - Array of tiles encoded as hexadecimal.
 */