import PaletteList from "../models/paletteList.js";
import PaletteJsonSerialiser from "./paletteJsonSerialiser.js";


/**
 * Provides palette list serialisation functions.
 */
export default class PaletteListJsonSerialiser {


    /**
     * Serialises a palette list to JSON.
     * @param {PaletteList} value - Palette list to serialise.
     * @returns {string} 
     */
    static serialise(value) {
        if (!value || typeof value.getPalettes !== 'function') throw new Error('Please pass a palette list.');

        const result = PaletteListJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised palette list.
     * @param {string} jsonString - JSON serialised palette list.
     * @returns {PaletteList}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Palette list to deserialise must be passed as a JSON string.');

        /** @type {import('./paletteJsonSerialiser').PaletteSerialisable[]} */
        const deserialised = JSON.parse(jsonString);
        return PaletteListJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a palette list object to a serialisable one.
     * @param {PaletteList} value - Palette list to convert.
     * @throws When a valid palette list was not passed.
     * @returns {import('./paletteJsonSerialiser').PaletteSerialisable[]} 
     */
    static toSerialisable(value) {
        if (!value instanceof PaletteList) throw new Error('Please pass a palette list.');

        return value.getPalettes().map(palette => PaletteJsonSerialiser.toSerialisable(palette));
    }

    /**
     * Converts a serialisable palette array array back to a palette list.
     * @param {import('./paletteJsonSerialiser').PaletteSerialisable[]} serialisable - Serialisable palette to convert.
     * @returns {PaletteList}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable || !Array.isArray(serialisable)) throw new Error('Please pass an array of serialisable palettes.');

        const result = new PaletteList();
        serialisable.forEach((palletteSerialisable) => {
            result.addPalette(PaletteJsonSerialiser.fromSerialisable(palletteSerialisable));
        });
        return result;
    }


}
