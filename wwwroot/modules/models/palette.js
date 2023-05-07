import PaletteColour from './paletteColour.js';

/**
 * Represents a colour palette.
 */
export default class Palette {


    /**
     * Title of the palette.
     */
    get title() {
        return this.#title;
    }
    set title(value) {
        if (!value) throw new Error('Please supply a valid title for this palette.');
        this.#title = value;
    }

    /**
     * System this palette is for, either 'ms' (Sega Master), 'gg' (Sega Game Gear), 'nes' (Nintendo Entertainment System), 'gb' (Nintendo Game Boy).
     */
    get system() {
        return this.#system;
    }
    set system(value) {
        if (!value || !/^ms|gg|nes|gb$/i.test(value)) throw new Error('System must be non null and either "ms", "gg", "nes" or "gb".');
        this.#system = value.toLowerCase();
    }


    /** @type {string} */
    #system;
    /** @type {number} */
    #title;
    /** @type {PaletteColour[]} */
    #colours;


    /**
     * Creates a new instance of a palette object.
     * @param {string} index - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master), 'gg' (Sega Game Gear) or 'gb (Nintendo Game Boy).
     */
    constructor(title, system) {
        this.title = title ? title : 'Palette';
        this.system = system;
        this.#colours = getSystemColourCount(system);
    }


    /**
     * Gets all stored colours.
     * @returns {PaletteColour[]}
     */
    getColours() {
        return this.#colours.slice(0);
    }

    /**
     * Gets the colour at a given index.
     * @param {number} index - Index of the colour to get.
     * @returns {PaletteColour}
     */
    getColour(index) {
        if (index >= 0 && index < this.#colours.length) {
            return this.#colours[index];
        } else throw new Error('Colour index was out of range.');
    }

    /**
     * Sets the colour at a given index.
     * @param {number} index - Index of the colour to set.
     * @param {PaletteColour} value - Colour data to set.
     */
    setColour(index, value) {
        if (index >= 0 && index < this.#colours.length) {
            this.#colours[index] = value;
        } else throw new Error('Colour index was out of range.');
    }


}


/**
 * Sets the colour at a given index.
 * @param {string} system - Intended system.
 * @returns {4 | 16}
 */
function getSystemColourCount(system) {
    switch (system) {
        case 'ms': return 16;
        case 'gg': return 16;
        case 'nes': return 4;
        case 'gb': return 4;
        default: throw new Error('Unknown system.');
    }
}