import Palette from "../models/palette.js";
import PaletteList from "../models/paletteList.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteFactory from "../factory/paletteFactory.js";
import PaletteJsonSerialiser from "./paletteJsonSerialiser.js";

export default class PaletteListJsonSerialiser {


    /**
     * Serialises a palette list to JSON.
     * @param {PaletteList} paletteList - Palette list to serialise.
     * @returns {string} 
     */
    static serialise(paletteList) {
        if (!paletteList || typeof paletteList.getPalettes !== 'function') throw new Error('Please pass a palette list.');

        const result = paletteList.getPalettes().map(palette => PaletteJsonSerialiser.toSerialisable(palette));
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
        if (Array.isArray(deserialised)) {

            const result = new PaletteList();
            deserialised.forEach(p => result.addPalette(PaletteJsonSerialiser.fromSerialisable(p)));
            return result;

        } else throw new Error('Palette list to deserialise was not valid.');
    }


}
