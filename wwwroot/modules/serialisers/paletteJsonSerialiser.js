import Palette from "../models/palette.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteFactory from "../factory/paletteFactory.js";

export default class PaletteJsonSerialiser {


    /**
     * Serialises a palette to a JSON string.
     * @param {Palette} palette - Palette to serialise.
     * @returns {string} 
     */
    static serialise(palette) {
        if (!palette) throw new Error('Please pass a palette.');

        const result = PaletteJsonSerialiser.toSerialisable(palette);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised palette.
     * @param {string} jsonPalette - JSON serialised palette.
     * @returns {Palette}
     */
    static deserialise(jsonPalette) {
        if (!jsonPalette || typeof jsonPalette !== 'string') throw new Error('Palette to deserialise must be passed as a JSON string.');

        /** @type {PaletteSerialisable} */
        const deserialised = JSON.parse(jsonPalette);
        return PaletteJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a palette object to a serialisable one.
     * @param {Palette} palette - Palette to create serialisable from.
     * @returns {PaletteSerialisable} 
     */
     static toSerialisable(palette) {
        return {
            paletteId: palette.paletteId,
            title: palette.title,
            system: palette.system,
            colours: palette.getColours().map(c => { return { r: c.r, g: c.g, b: c.b } })
        };
    }

    /**
     * Converts a serialisable palette back to a palette.
     * @param {PaletteSerialisable} paletteSerialisable - Serialisable palette to convert.
     * @returns {Palette}
     */
    static fromSerialisable(paletteSerialisable) {
        const palette = PaletteFactory.create(paletteSerialisable.paletteId, paletteSerialisable.title, paletteSerialisable.system);
        paletteSerialisable.colours.forEach((jsonColour, index) => {
            palette.setColour(index, PaletteColourFactory.create(jsonColour.r, jsonColour.g, jsonColour.b));
        });
        return palette;
    }


}

/**
 * @typedef PaletteSerialisable
 * @type {object}
 * @property {string} paletteId
 * @property {string} title
 * @property {string} system
 * @property {PaletteColourSerialisable[]} colours
 * @exports
 */
/**
 * @typedef PaletteColourSerialisable
 * @type {object}
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @exports
 */