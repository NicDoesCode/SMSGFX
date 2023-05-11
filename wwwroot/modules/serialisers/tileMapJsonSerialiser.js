import TileMap from "../models/tileMap.js";
import TileMapFactory from "../factory/tileMapListFactory.js";

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
            title: tileMap.title,
            system: tileMap.system,
            colours: tileMap.getColours().map(c => { return { r: c.r, g: c.g, b: c.b } })
        };
    }

    /**
     * Converts a serialisable tile map back to a tile map.
     * @param {TileMapSerialisable} tileMapSerialisable - Serialisable tile map to convert.
     * @returns {TileMap}
     */
    static fromSerialisable(tileMapSerialisable) {
        const palette = PaletteFactory.create(tileMapSerialisable.title, tileMapSerialisable.system);
        tileMapSerialisable.colours.forEach((jsonColour, index) => {
            palette.setColour(index, PaletteColourFactory.create(jsonColour.r, jsonColour.g, jsonColour.b));
        });
        return palette;
    }


}

/**
 * @typedef TileMapSerialisable
 * @type {object}
 * @property {string} title
 * @property {string} system
 * @property {PaletteColourSerialisable[]} colours
 * @exports
 */
