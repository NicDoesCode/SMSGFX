import Palette from "../models/palette.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteFactory from "../factory/paletteFactory.js";


/**
 * Provides palette serialisation functions.
 */
export default class PaletteJsonSerialiser {


    /**
     * Serialises a palette to a JSON string.
     * @param {Palette} value - Palette to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        if (!value) throw new Error('Please pass a palette.');

        const result = PaletteJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised palette.
     * @param {string} jsonString - JSON serialised palette.
     * @returns {Palette}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Palette to deserialise must be passed as a JSON string.');

        /** @type {PaletteSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return PaletteJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a palette object to a serialisable one.
     * @param {Palette} value - Palette to create serialisable from.
     * @throws When a valid palette was not passed.
     * @returns {PaletteSerialisable} 
     */
     static toSerialisable(value) {
        if (!value instanceof Palette) throw new Error('Please pass a palette.');
      
        return {
            paletteId: value.paletteId,
            title: value.title,
            system: value.system,
            colours: value.getColours().map(c => { return { r: c.r, g: c.g, b: c.b } })
        };
    }

    /**
     * Converts a serialisable palette back to a palette.
     * @param {PaletteSerialisable} serialisable - Serialisable palette to convert.
     * @returns {Palette}
     */
    static fromSerialisable(serialisable) {
        const palette = PaletteFactory.create(serialisable.paletteId, serialisable.title, serialisable.system);
        serialisable.colours.forEach((colour, index) => {
            palette.setColour(index, PaletteColourFactory.create(colour.r, colour.g, colour.b));
        });
        return palette;
    }


}

/**
 * @typedef {Object} PaletteSerialisable
 * @property {string} paletteId
 * @property {string} title
 * @property {string} system
 * @property {import('./../types.js').ColourInformation[]} colours
 * @exports
 */
