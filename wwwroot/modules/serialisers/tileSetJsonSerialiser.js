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
        /** @type {TileSetSerialisable} */
        const result = {
            tileWidth: tileSet.tileWidth,
            tilesAsHex: tileSet.getTiles().map(t => TileSetJsonSerialiser.#toHex(t))
        };
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
     * @param {string} tileSetJsonString - JSON serialised tile set.
     * @returns {TileSet}
     */
    static deserialise(tileSetJsonString) {
        if (tileSetJsonString) {
            /** @type {TileSetSerialisable} */
            const jsonTileSet = JSON.parse(tileSetJsonString);
            const result = TileSetFactory.create();
            result.tileWidth = jsonTileSet.tileWidth;
            jsonTileSet.tilesAsHex.forEach(tileAsHex => {
                const newTile = TileFactory.fromHex(tileAsHex);
                result.addTile(newTile);
            });
            return result;
        } else throw new Error('Invalid tile set data supplied.');
    }


}

/**
 * @typedef TileSetSerialisable
 * @type {object}
 * @property {number} tileWidth - The width of the tile map (in 8x8 pixel tiles).
 * @property {string[]} tilesAsHex - Array of tiles encoded as hexadecimal.
 */