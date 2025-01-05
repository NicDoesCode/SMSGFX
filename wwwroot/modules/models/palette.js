import PaletteColour from './paletteColour.js';
import GeneralUtil from './../util/generalUtil.js';

/**
 * Represents a colour palette.
 */
export default class Palette {


    /**
     * Unique ID of the palette.
     */
    get paletteId() {
        return this.#paletteId;
    }
    set paletteId(value) {
        if (!value || value.length === '') throw new Error('Please supply a valid ID value.');
        this.#paletteId = value;
    }

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
    #paletteId;
    /** @type {string} */
    #system;
    /** @type {number} */
    #title;
    /** @type {PaletteColour[]} */
    #colours;


    /**
     * Creates a new instance of a palette object.
     * @param {string?} [paletteId] - Unique ID of the palette.
     * @param {string?} [title] - Title of the palette.
     * @param {string} system - Intended system, either 'ms' (Sega Master System), 'gg' (Sega Game Gear), 'gb (Nintendo Game Boy) or 'nes' (Nintendo Entertainment System).
     */
    constructor(paletteId, title, system) {
        if (typeof paletteId !== 'undefined' && paletteId !== null) {
            this.paletteId = paletteId;
        } else {
            this.paletteId = GeneralUtil.generateRandomString(12);
        }
        if (typeof title !== 'undefined' && title !== null) {
            this.title = title;
        } else {
            this.title = 'Palette';
        }
        this.system = system;
        this.#colours = new Array(getSystemColourCount(system));
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
     * @throws Index is out of range.
     * @returns {PaletteColour}
     */
    getColour(index) {
        if (index >= 0 && index < this.#colours.length) {
            return this.#colours[index];
        } else throw new Error('Colour index was out of range.');
    }

    /**
     * Gets the colour at a given index, or null if out of range.
     * @param {number} index - Index of the colour to get.
     * @returns {PaletteColour?}
     */
    getColourByIndex(index) {
        if (index >= 0 && index < this.#colours.length) {
            return this.#colours[index];
        } else return null;
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