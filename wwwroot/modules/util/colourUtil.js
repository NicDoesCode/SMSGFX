import PaletteColour from './../models/paletteColour.js';

const hexRegex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export default class ColourUtil {


    /**
     * Converts an RGB value to a hexadecimal colour code.
     * @param {number} r - Red value.
     * @param {number} g - Green value.
     * @param {number} b - Blue value.
     * @returns {string}
     */
    static toHex(r, g, b) {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        return `#${hexR}${hexG}${hexB}`;
    }

    /**
     * Extracts RGB colour values from a hexadecimal colour code.
     * @param {string} hex - Hexadecimal colour code.
     * @returns {ColourInformation}
     */
    static rgbFromHex(hex) {
        if (hex && hexRegex.test(hex)) {
            const match = hexRegex.exec(hex);
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        } else throw new Error(`Invalid hex value "${hex}".`);
    }

    /**
     * Converts a hexadecimal colour string to the native binary format for the given system.
     * @param {string} system - System to get the native colour for, either 'ms' or 'gg'.
     * @param {string} hex - Hexadecimal colour code.
     * @returns {string}
     */
    static getNativeHexFromHex(system, hex) {
        const rgb = this.rgbFromHex(hex);
        return this.toNativeHex(system, rgb.r, rgb.g, rgb.b);
    }

    /**
     * Converts a RGB value to a native colour value as a byte.
     * @param {string} system - System to get the native colour for, either 'ms', 'gg' or 'gb'.
     * @param {number} r - Red value.
     * @param {number} g - Green value.
     * @param {number} b - Blue value.
     * @param {string?} format - Either 'hex' or 'binary', default is 'hex'.
     * @returns {string}
     */
    static encodeToNativeString(system, r, g, b, format) {
        if (r < 0 || r > 255) throw new Error('Invalid value for red.');
        if (g < 0 || g > 255) throw new Error('Invalid value for green.');
        if (b < 0 || b > 255) throw new Error('Invalid value for blue.');
        if (!format) format = 'hex';
        if (format !== 'hex' && format !== 'binary') throw new Error('Format must be null, "hex" or "binary".');
        if (system === 'ms') {
            r = Math.round(3 / 255 * r);
            g = Math.round(3 / 255 * g) << 2;
            b = Math.round(3 / 255 * b) << 4;
            if (format === 'binary') return (r | g | b).toString(2).padStart(6, 0);
            else return (r | g | b).toString(16).padStart(2, '0');
        } else if (system === 'gg') {
            r = Math.round(15 / 255 * r);
            g = Math.round(15 / 255 * g) << 4;
            b = Math.round(15 / 255 * b) << 8;
            if (format === 'binary') return (r | g | b).toString(2).padStart(12, 0);
            else return (r | g | b).toString(16).padStart(3, '0');
        } else if (system === 'gb') {
            const colour = Math.round(getNearestGBColour((r + g + b) / 3) / 85);
            if (format === 'binary') return colour.toString(2).padStart(2, 0);
            else return (colour).toString(16);
        } else throw new Error('System was not valid.');
    }

    /**
     * Converts a given RGB value to a web safe hexadecimal approximation to the closest native system colour.
     * @param {string} system - System to get the native colour for, either 'ms' or 'gg'.
     * @param {PaletteColour} colour - Palette colour to convert.
     * @returns {string}
     */
    static toNativeHex(system, r, g, b) {
        if (r < 0 || r > 255) throw new Error('Invalid value for red.');
        if (g < 0 || g > 255) throw new Error('Invalid value for green.');
        if (b < 0 || b > 255) throw new Error('Invalid value for blue.');
        if (system === 'ms') {
            r = Math.round(3 / 255 * r) * 85;
            g = Math.round(3 / 255 * g) * 85;
            b = Math.round(3 / 255 * b) * 85;
            return this.toHex(r, g, b);
        } else if (system === 'gg') {
            r = Math.round(15 / 255 * r) * 17;
            g = Math.round(15 / 255 * g) * 17;
            b = Math.round(15 / 255 * b) * 17;
            return this.toHex(r, g, b);
        } else if (system === 'gb') {
            const colour = Math.round(getNearestGBColour((r + g + b) / 3) / 85);
            return this.toHex(colour, colour, colour);
        } else throw new Error('System was not valid.');

    }

    /**
     * Gets a Master System colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullMasterSystemPalette() {
        if (!masterSystemPalette) {
            masterSystemPalette = [];
            const colourShades = [0, 85, 170, 255];
            colourShades.forEach(b => {
                colourShades.forEach(g => {
                    colourShades.forEach(r => {
                        masterSystemPalette.push({ r, g, b });
                    });
                });
            });
        }
        return masterSystemPalette;
    }

    /**
     * Gets a Game Gear colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullGameGearPalette() {
        if (!gameGearPalette) {
            gameGearPalette = [];
            const colourShades = [0, 15, 31, 47, 63, 79, 95, 111, 127, 143, 159, 175, 191, 207, 223, 239, 255];
            colourShades.forEach(b => {
                colourShades.forEach(g => {
                    colourShades.forEach(r => {
                        gameGearPalette.push({ r, g, b });
                    });
                });
            });
        }
        return gameGearPalette;
    }

    /**
     * Gets a Game Boy colour palette.
     * @returns {ColourInformation[]}
     */
    static getFullGameBoyPalette() {
        if (!gameBoyPalette) {
            gameBoyPalette = [];
            const colourShades = [0, 85, 170, 255];
            colourShades.forEach(c => {
                gameBoyPalette.push({ c, c, c });
            });
        }
        return gameBoyPalette;
    }

    // /**
    //  * 
    //  * @param {import("./palette.js").PaletteColour} value 
    //  * @returns 
    //  */
    //  #ggColour(value) {
    //     const r = Math.floor(value.r / 16).toString(16);
    //     const g = Math.floor(value.g / 16).toString(16);
    //     const b = Math.floor(value.b / 16).toString(16);
    //     return `$${b}${g}${r}`.toUpperCase();
    // }

    // /**
    //  * 
    //  * @param {import("./palette.js").PaletteColour} value 
    //  * @returns 
    //  */
    // #msColour(value) {
    //     const r = Math.floor(value.r / 64);
    //     const g = Math.floor(value.g / 64);
    //     const b = Math.floor(value.b / 64);
    //     const result = (b << 4 | g << 2 | r).toString(16).padStart(4, '0').substring(2);
    //     return '$' + result.toUpperCase();
    // }


}

/** @type {ColourInformation[]} */
let masterSystemPalette = null;

/** @type {ColourInformation[]} */
let gameGearPalette = null;

/** @type {ColourInformation[]} */
let gameBoyPalette = null;

let gbColours = [0, 85, 170, 255];
let gbColourValues = [0, 1, 2, 3];

/**
 * Gets the nearest GB colour.
 * @param {number} colour - Colour to check.
 * @returns {number}
 */
function getNearestGBColour(colour) {
    return gbColours.reduce((prev, curr) => {
        return (Math.abs(curr - colour) < Math.abs(prev - colour) ? curr : prev);
    });
}

/**
 * @typedef ColourInformation
 * @type {object}
 * @property {number} r - Red component.
 * @property {number} g - Green component.
 * @property {number} b - Blue component.
 * @export
 */