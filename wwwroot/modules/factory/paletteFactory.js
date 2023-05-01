import Palette from "../models/palette.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteJsonSerialiser from "../serialisers/paletteJsonSerialiser.js";
import ColourUtil from "../util/colourUtil.js";

const defaultColours = ['#000000', '#000000', '#00AA00', '#00FF00', '#000055', '#0000FF', '#550000', '#00FFFF', '#AA0000', '#FF0000', '#555500', '#FFFF00', '#005500', '#FF00FF', '#555555', '#FFFFFF'];

export default class PaletteFactory {


    /**
     * Creates a new instance of a palette object.
     * @param {string} title - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master), 'gg' (Sega Game Gear) or 'gb' (Nintendo Game Boy).
     * @returns {Palette}
     */
    static create(title, system) {
        return new Palette(title, system);
    }

    /**
     * Creates a new palette object with the default colours.
     * @param {string} title - Title for the new palette.
     * @param {string} system - System the palette is for, either 'ms', 'gg' or 'gb'. When invalid input 'ms' is assumed.
     * @returns {Palette}
     */
    static createNewStandardColourPalette(title, system) {
        if (!title || title.trim() === '') title = `${system.toUpperCase()} palette`;
        if (!system || system !== 'gg' || system !== 'gb') system = 'ms';

        const palette = PaletteFactory.create(title, system);
        for (let c = 0; c < 16; c++) {
            const colour = PaletteColourFactory.fromHex(defaultColours[c]);
            palette.setColour(c, colour);
        }
        return palette;
    }

    /**
     * Creates a new palette from an array of Master System colours.
     * @param {Uint8ClampedArray} array 
     * @returns {Palette}
     */
    static createFromMasterSystemPalette(array) {
        /** @type {Palette} */
        const result = PaletteFactory.create('Master System Palette', 'ms');
        for (let idx = 0; idx < 16 || idx < array.length; idx++) {
            const colour = array[idx];
            var r = Math.round(255 / 3 * (parseInt('00000011', 2) & colour));
            var g = Math.round(255 / 3 * (parseInt('00001100', 2) & colour) >> 2);
            var b = Math.round(255 / 3 * (parseInt('00110000', 2) & colour) >> 4);
            result.setColour(idx, { r, g, b })
        }
        return result;
    }

    /**
     * Creates a new palette from an array of Game Gear colours.
     * @param {Uint16Array} array 
     * @returns {Palette}
     */
    static createFromGameGearPalette(array) {
        /** @type {Palette} */
        const result = PaletteFactory.create('Game Gear Palette', 'gg');
        for (let idx = 0; idx < 16 || idx < array.length; idx++) {
            const colour = array[idx];
            var r = Math.round(255 / 15 * (parseInt('0000000000001111', 2) & colour));
            var g = Math.round(255 / 15 * (parseInt('0000000011110000', 2) & colour) >> 4);
            var b = Math.round(255 / 15 * (parseInt('0000111100000000', 2) & colour) >> 8);
            result.setColour(idx, { r, g, b })
        }
        return result;
    }

    /**
     * Creates a new instance of a palette object from an existing.
     * @param {Palette} palette - Palette to clone.
     * @returns {Palette}
     */
    static clone(palette) {
        const serialiseable = PaletteJsonSerialiser.toSerialisable(palette);
        return PaletteJsonSerialiser.fromSerialisable(serialiseable);
    }

    /**
     * Returns a palette with native colours for the system.
     * @param {Palette} palette - Palette to convert.
     * @returns {Palette}
     */
    static convertToNative(palette) {
        const result = new Palette(palette.title, palette.system);
        palette.getColours().forEach((colour, index) => {
            const nativeColour = PaletteColourFactory.convertToNative(palette.system, colour);
            result.setColour(index, nativeColour);
        });
        return result;
    }


}