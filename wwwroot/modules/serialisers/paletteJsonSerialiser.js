import Palette from "../models/palette.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteFactory from "../factory/paletteFactory.js";

export default class PaletteJsonSerialiser {


    /**
     * Serialises an array of palettes.
     * @param {Palette[]} paletteArray - Array of palettes to serialise.
     * @returns {string} 
     */
    static serialise(paletteArray) {
        if (!paletteArray || !Array.isArray(paletteArray)) throw new Error('Please pass an array of palettes.');

        const result = paletteArray.map(palette => {
            /** @type {PaletteSerialisable} */
            return {
                title: palette.title,
                system: palette.system,
                colours: palette.getColours().map(c => { return { r: c.r, g: c.g, b: c.b } })
            };
        });
        return JSON.stringify(result);
    }


    /**
     * Returns a deserialised list of palettes.
     * @param {string} jsonPaletteArray - JSON serialised palettes.
     * @returns {Palette[]}
     */
    static deserialise(jsonPaletteArray) {
        if (!jsonPaletteArray || typeof jsonPaletteArray !== 'string') throw new Error('Palettes to deserialise must be passed as a JSON string.');

        /** @type {PaletteSerialisable[]} */
        const jsonPalettes = JSON.parse(jsonPaletteArray);
        if (Array.isArray(jsonPalettes)) {

            const result = jsonPalettes.map(jsonPalette => {
                const palette =PaletteFactory.create(jsonPalette.title, jsonPalette.system);
                jsonPalette.colours.forEach((jsonColour, index) => {
                    palette.setColour(index, PaletteColourFactory.create(jsonColour.r, jsonColour.g, jsonColour.b));
                });
                return palette;
            });
            return result;

        } else throw new Error('Palettes must be passed as an array.');
    }


}

/**
 * @typedef PaletteSerialisable
 * @type {object}
 * @property {string} title
 * @property {string} system
 * @property {PaletteColourSerialisable[]} colours
 */
/**
 * @typedef PaletteColourSerialisable
 * @type {object}
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */