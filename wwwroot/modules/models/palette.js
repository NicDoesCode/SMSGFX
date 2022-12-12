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
     * System this palette is for, either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
     */
    get system() {
        return this.#system;
    }
    set system(value) {
        if (!value || !/^ms|gg$/i.test(value)) throw new Error('System must be non null and either "ms" or "gg".');
        this.#system = value.toLowerCase();
    }


    /** @type {string} */
    #system;
    /** @type {number} */
    #title;
    /** @type {PaletteColour[]} */
    #colours = new Array(16);


    /**
     * Creates a new instance of a palette object.
     * @param {string} index - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
     */
    constructor(title, system) {
        this.title = title ? title : 'Palette';
        this.system = system;
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
        if (index >= 0 && index < 16) {
            return this.#colours[index];
        } else throw new Error('Colour index was out of range.');
    }

    /**
     * Sets the colour at a given index.
     * @param {number} index Index of the colour to set.
     * @param {PaletteColour} value Colour data to set.
     */
    setColour(index, value) {
        if (index >= 0 && index < 16) {
            this.#colours[index] = value;
        } else throw new Error('Colour index was out of range.');
    }

    
}
