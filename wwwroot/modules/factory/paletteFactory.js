import Palette from "../models/palette.js";

const defaultColours = ['#000000', '#000000', '#00AA00', '#00FF00', '#000055', '#0000FF', '#550000', '#00FFFF', '#AA0000', '#FF0000', '#555500', '#FFFF00', '#005500', '#FF00FF', '#555555', '#FFFFFF'];

export default class PaletteFactory {


    /**
     * Creates a new instance of a palette object.
     * @param {string} index - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
     */
     static create(title, system) {
        return new Palette(title, system);
    }

    /**
     * Creates a new palette object with the default colours.
     * @param {string} title - Title for the new palette.
     * @param {string} system - System the palette is for, either 'ms' or 'gg'. When invalid input 'ms' is assumed.
     */
    static createNewStandardColourPalette(title, system) {
        if (!title || title.trim() === '') title = 'New palette';
        if (!system || system !== 'gg') system = 'ms';

        /** @type {NewPalette} */

        for (let i = 0; i < 2; i++) {
            const system = i % 2 === 0 ? 'ms' : 'gg';
            const palette = PaletteFactory.create(system, 0);
            for (let c = 0; c < 16; c++) {
                palette.setColour(c, ColourUtil.paletteColourFromHex(c, system, defaultColours[c]));
            }
            dataStore.paletteList.addPalette(palette);
        }
    }

    /**
     * Creates a new palette from an array of Master System colours.
     * @param {Uint8ClampedArray} array 
     * @returns {Palette}
     */
    static createFromMasterSystemPalette(array) {
        /** @type {Palette} */
        const result = PaletteFactory.create('Master System Palette', 'ms');
        array.forEach((colour, index) => {
            var r = Math.round(255 / 3 * (parseInt('00000011', 2) & colour));
            var g = Math.round(255 / 3 * (parseInt('00001100', 2) & colour) >> 2);
            var b = Math.round(255 / 3 * (parseInt('00110000', 2) & colour) >> 4);
            result.setColour(index, { r, g, b })
        });
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
        array.forEach(colour => {
            var r = Math.round(255 / 15 * (parseInt('0000000000001111', 2) & colour));
            var g = Math.round(255 / 15 * (parseInt('0000000011110000', 2) & colour) >> 4);
            var b = Math.round(255 / 15 * (parseInt('0000111100000000', 2) & colour) >> 8);
            result.setColour(index, { r, g, b })
        });
        return result;
    }

    
}