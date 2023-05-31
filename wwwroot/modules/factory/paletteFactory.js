import Palette from "../models/palette.js";
import PaletteColourFactory from "../factory/paletteColourFactory.js";
import PaletteJsonSerialiser from "../serialisers/paletteJsonSerialiser.js";
import ColourUtil from "../util/colourUtil.js";
import PaletteColour from "../models/paletteColour.js";

export default class PaletteFactory {


    /**
     * Creates a new instance of a palette object.
     * @param {number?} [paletteId] - Unique ID of the palette.
     * @param {string?} [title] - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master System), 'gg' (Sega Game Gear), 'gb (Nintendo Game Boy) or 'nes' (Nintendo Entertainment System).
     * @returns {Palette}
     */
    static create(paletteId, title, system) {
        return new Palette(paletteId, title, system);
    }

    /**
     * Creates a new palette object with the default colours based on system type (rather than individual system).
     * @param {string} systemType - System the palette is for, either 'smsgg', 'nes' or 'gb'.
     * @returns {Palette}
     */
    static createNewStandardColourPaletteBySystemType(systemType) {
        switch (systemType) {
            case 'smsgg':
                return PaletteFactory.createNewStandardColourPalette(`SMS palette`, 'ms');
            case 'nes':
                return PaletteFactory.createNewStandardColourPalette(`NES palette`, 'nes');
            case 'gb':
                return PaletteFactory.createNewStandardColourPalette(`GB palette`, 'gb');
            default:
                throw new Error('The system type was not valid.');
        }
    }

    /**
     * Creates a new palette object with the default colours based on system.
     * @param {string} title - Title for the new palette.
     * @param {string} system - System the palette is for, either 'ms', 'gg', 'nes' or 'gb'. When invalid input 'ms' is assumed.
     * @returns {Palette}
     */
    static createNewStandardColourPalette(title, system) {
        if (!title || title === '' || title.length < 1) throw new Error('No value given for "title".');
        if (!system || typeof system !== 'string') throw new Error('No value given for "system".');

        const palette = PaletteFactory.create(null, title, system);
        switch (system) {
            case 'ms':
            case 'gg':
                for (let c = 0; c < palette.getColours().length; c++) {
                    const colour = PaletteColourFactory.fromHex(defaultColoursMS[c]);
                    palette.setColour(c, colour);
                }
                break;
            case 'nes':
                for (let c = 0; c < palette.getColours().length; c++) {
                    const colour = PaletteColourFactory.fromHex(defaultColourNES[c]);
                    palette.setColour(c, colour);
                }
                break;
            case 'gb':
                for (let c = 0; c < palette.getColours().length; c++) {
                    const colour = PaletteColourFactory.fromHex(defaultColoursGB[c]);
                    palette.setColour(c, colour);
                }
                break;
            default:
                throw new Error('The system was not valid.');
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
        const result = PaletteFactory.create(null, 'Master System palette', 'ms');
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
        const result = PaletteFactory.create(null, 'Game Gear palette', 'gg');
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
     * Creates a new palette from an array of Game Boy colours.
     * @param {Uint16Array} array 
     * @returns {Palette}
     */
    static createFromGameBoyPalette(array) {
        if (array.length >= 1) {

            /** @type {Palette} */
            const result = PaletteFactory.create(null, 'Game Boy palette', 'gb');

            const colour0 = ((array[0] & parseInt('11000000', 2)) >> 6) * 85;
            const colour1 = ((array[0] & parseInt('00110000', 2)) >> 4) * 85;
            const colour2 = ((array[0] & parseInt('00001100', 2)) >> 2) * 85;
            const colour3 = ((array[0] & parseInt('00000011', 2)) >> 0) * 85;

            result.setColour(0, { r: colour0, g: colour0, b: colour0 });
            result.setColour(1, { r: colour1, g: colour1, b: colour1 });
            result.setColour(2, { r: colour2, g: colour2, b: colour2 });
            result.setColour(3, { r: colour3, g: colour3, b: colour3 });

            return result;

        } else {
            throw new Error('No palette data to read.');
        }
    }

    /**
     * Creates a new palette from an array of NES colour indexes.
     * @param {Uint16Array} array 
     * @returns {Palette}
     */
    static createFromNesPalette(array) {
        if (array.length >= 4) {

            /** @type {Palette} */
            const result = PaletteFactory.create(null, 'NES palette', 'nes');

            const colour0 = getColourFromNesIndex(array[0]);
            const colour1 = getColourFromNesIndex(array[1]);
            const colour2 = getColourFromNesIndex(array[2]);
            const colour3 = getColourFromNesIndex(array[3]);

            result.setColour(0, { r: colour0.r, g: colour0.g, b: colour0.b });
            result.setColour(1, { r: colour1.r, g: colour1.g, b: colour1.b });
            result.setColour(2, { r: colour2.r, g: colour2.g, b: colour2.b });
            result.setColour(3, { r: colour3.r, g: colour3.g, b: colour3.b });

            return result;

        } else {
            throw new Error('No palette data to read.');
        }
    }

    /**
     * Creates a new instance of a palette object from an existing.
     * @param {Palette} palette - Palette to clone.
     * @returns {Palette}
     */
    static clone(palette) {
        const newPalette = PaletteFactory.create(null, palette.title, palette.system);
        palette.getColours().forEach((colour, index) => {
            newPalette.setColour(index, PaletteColourFactory.create(colour.r, colour.g, colour.b));
        });
        return newPalette;
    }

    /**
     * Returns a palette with native colours for the system.
     * @param {Palette} palette - Palette to convert.
     * @returns {Palette}
     */
    static convertToNative(palette) {
        const result = PaletteFactory.create(palette.paletteId, palette.title, palette.system);
        if (palette.system !== 'gb') {
            palette.getColours().forEach((colour, index) => {
                const nativeColour = PaletteColourFactory.convertToNative(palette.system, colour);
                result.setColour(index, nativeColour);
            });
        } else {
            const nativeColours = [
                PaletteColourFactory.create(22, 72, 2),
                PaletteColourFactory.create(44, 84, 2),
                PaletteColourFactory.create(88, 115, 3),
                PaletteColourFactory.create(140, 153, 2)
            ];
            palette.getColours().forEach((colour, index) => {
                const averageColour = Math.min(255, Math.max(0, (colour.r + colour.g + colour.b) / 3));
                const nearest = averageColour - (averageColour % 85);
                const nativeIndex = nearest / 85;
                result.setColour(index, nativeColours[nativeIndex]);
            });
        }
        return result;
    }


}


const defaultColoursMS = ['#000000', '#000000', '#00AA00', '#00FF00', '#000055', '#0000FF', '#550000', '#00FFFF', '#AA0000', '#FF0000', '#555500', '#FFFF00', '#005500', '#FF00FF', '#555555', '#FFFFFF'];
const defaultColoursGB = ['#000000', '#555555', '#AAAAAA', '#FFFFFF'];
const defaultColourNES = ['#38b4cc', '#000000', '#3032ec', '#FFFFFF'];

/**
 * Gets the colour that corresponds with the NES colour code.
 * @param {number} value - NES colour code.
 * @returns {import("../util/colourUtil.js").ColourInformation}
 */
function getColourFromNesIndex(value) {
    const palette = ColourUtil.getFullNESPalette();
    const row = (value & parseInt('11110000', 2)) >> 4;
    const col = value & parseInt('00001111', 2);
    const index = (14 * row) + col;
    return palette[index];
}
