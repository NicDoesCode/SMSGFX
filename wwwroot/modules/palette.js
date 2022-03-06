/**
 * Represents a colour palette.
 */
export default class Palette {
    /** @type {string} */
    #system;
    /** @type {number} */
    #index;
    /** @type {Array<PaletteColour>} */
    #colours = new Array(16);

    /**
     * System this palette is for, either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
     */
    get system() {
        return this.#system;
    }
    set system(value) {
        if (!value || !/^ms|gg$/i.test(value)) throw new Error('System must be non null and either "ms" or "gg".');
        this.#system = value.toLowerCase();
    }

    /**
     * Palette index, either 0 or 1.
     */
    get index() {
        return this.#index;
    }
    set index(value) {
        if (index === null || (index !== 0 && index !== 1)) throw new Error('Palette index must be "0" or "1".');
        this.#index = value;
    }

    /**
     * Palette colours.
     */
    get colours() {
        return this.#colours;
    }

    /**
     * Sets the colour at a given index.
     * @param {number} index Index of the colour to set.
     * @param {PaletteColour} value Colour data to set.
     */
    setColour(index, value) {
        if (index >= 0 && index < 16) {
            this.#colours[index] = value;
        } else throw new Error('Index was out of range.');
    }

    /**
     * Creates a new instance of a palette object.
     * @param {string} system Either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
     * @param {number} index Palette index, either 0 or 1.
     */
    constructor(system, index) {
        if (!system || !/^ms|gg$/i.test(system)) throw new Error('System must be non null and either "ms" or "gg".');
        if (index === null || (index !== 0 && index !== 1)) throw new Error('Palette index must be "0" or "1".');

        this.#system = system.toLowerCase();
        this.#index = index;
    }

    /**
     * Loads Sega Master System palette colours.
     * @param {Uint8ClampedArray} array 
     */
    loadMasterSystemPalette(array) {
        this.#colours = loadMasterSystemPalette(array);
    }

    /**
     * Loads Sega Game Gear palette colours.
     * @param {Uint16Array} array 
     */
    loadGameGearPalette(array) {
        this.#colours = loadGameGearPalette(array);
    }
}

/**
 * @typedef PaletteColour
 * @type {object}
 * @property {number} index - Colour slot (0 to 15).
 * @property {string} nativeColour - The HEX encoded native colour.
 * @property {string} hex - Colour encoded in HEX format.
 * @property {number} r - Red value.
 * @property {number} g - Green value.
 * @property {number} b - Blue value.
 */

/**
 * Reads Master System colour palette.
 * @param {Uint8ClampedArray} array 
 * @returns {PaletteColour[]}
 */
function loadMasterSystemPalette(array) {
    /** @type {PaletteColour[]} */
    const result = [];

    array.forEach((colour, index) => {
        var r = Math.round(255 / 3 * (parseInt('00000011', 2) & colour));
        var g = Math.round(255 / 3 * (parseInt('00001100', 2) & colour) >> 2);
        var b = Math.round(255 / 3 * (parseInt('00110000', 2) & colour) >> 4);
        result.push({
            index: index,
            nativeColour: colour.toString(16),
            r, g, b,
            hex: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
        });
    });

    return result;
}

/**
 * Reads Master System colour palette.
 * @param {Uint16Array} array 
 * @returns {PaletteColour[]}
 */
function loadGameGearPalette(array) {
    /** @type {PaletteColour[]} */
    const result = [];

    array.forEach((colour, index) => {
        var r = Math.round(255 / 15 * (parseInt('0000000000001111', 2) & colour));
        var g = Math.round(255 / 15 * (parseInt('0000000011110000', 2) & colour) >> 4);
        var b = Math.round(255 / 15 * (parseInt('0000111100000000', 2) & colour) >> 8);
        result.push({
            index: index,
            nativeColour: colour.toString(16),
            r, g, b,
            hex: `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
        });
    });

    return result;
}