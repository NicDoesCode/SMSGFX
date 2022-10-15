import PaletteList from "../models/paletteList.js";
import PaletteJsonSerialiser from "./paletteJsonSerialiser.js";

export default class PaletteListJsonSerialiser {


    /**
     * Serialises a palette list to JSON.
     * @param {PaletteList} paletteList - Palette list to serialise.
     * @returns {string} 
     */
    static serialise(paletteList) {
        if (!paletteList || typeof paletteList.getPalettes !== 'function') throw new Error('Please pass a palette list.');

        const result = PaletteListJsonSerialiser.toSerialisable(paletteList);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised palette list.
     * @param {string} jsonPaletteList - JSON serialised palette list.
     * @returns {PaletteList}
     */
    static deserialise(jsonPaletteList) {
        if (!jsonPaletteList || typeof jsonPaletteList !== 'string') throw new Error('Palette list to deserialise must be passed as a JSON string.');

        /** @type {import('./paletteJsonSerialiser').PaletteSerialisable[]} */
        const deserialised = JSON.parse(jsonPaletteList);
        return PaletteListJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a palette object to a serialisable one.
     * @param {PaletteList} paletteList - Palette list to convert.
     * @returns {paletteList} 
     */
    static toSerialisable(paletteList) {
        if (!paletteList || typeof paletteList.getPalettes !== 'function') throw new Error('Please pass a palette list.');

        return paletteList.getPalettes().map(palette => PaletteJsonSerialiser.toSerialisable(palette));
    }

    /**
     * Converts a serialisable palette array array back to a palette list.
     * @param {import('./paletteJsonSerialiser').PaletteSerialisable[]} paletteSerialisableArray - Serialisable palette to convert.
     * @returns {PaletteList}
     */
    static fromSerialisable(paletteSerialisableArray) {
        if (!paletteSerialisableArray || !Array.isArray(paletteSerialisableArray)) throw new Error('Please pass an array of serialisable palettes.');

        const result = new PaletteList();
        paletteSerialisableArray.forEach(p => {
            try {
                result.addPalette(PaletteJsonSerialiser.fromSerialisable(p));
            } catch (e) {
                console.error('Unable to restore palette.', p);
                console.error(e);
            }
        });
        return result;
    }


}
