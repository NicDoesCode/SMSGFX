import Palette from "./palette.js";

export default class PaletteList {


    /**
     * Gets the amount of stored palettes. 
     */
    get length() {
        return this.#palettes.length;
    }


    /** @type {Palette[]} */
    #palettes = [];


    /**
     * Creates a new instance of a palette list.
     * @param {Palette[]?} palettes - Initial array of palettes to populate.
     */
    constructor(palettes) {
        if (palettes && !Array.isArray(palettes)) throw new Error('Array of palettes must be passed.');
        if (palettes && Array.isArray(palettes)) {
            palettes.forEach(p => this.addPalette(p));
        }
    }


    /**
     * Returns all palettes.
     * @returns {Palette[]}
     */
    getPalettes() {
        return this.#palettes.slice();
    }

    /**
     * Gets a palette.
     * @param {number} index Index of the palette to get.
     * @returns {Palette}
     */
    getPalette(index) {
        if (index >= 0 && index < this.#palettes.length) {
            return this.#palettes[index];
        } else throw new Error('Index out of range.');
    }

    /**
     * Adds a palette to the list.
     * @param {Palette|Palette[]} value Palette object to add.
     */
    addPalette(value) {
        this.#palettes.push(value);
    }

    /**
     * Inserts a palette.
     * @param {number} index Index of where to insert the palette.
     * @param {Palette} value Palette value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#palettes.length);
        if (index === 0) this.#palettes.unshift(value);
        else if (index === this.#palettes.length) this.#palettes.push(value);
        else this.#palettes = this.#palettes.splice(index, 0, value);
    }

    /**
     * Sets a palette.
     * @param {number} index Index of the palette to set.
     * @param {Palette} value Palette value to set.
     */
    setPalette(index, value) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a pelette at a given index.
     * @param {number} index Index of the palette to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the palette list.
     */
    clear() {
        this.#palettes.splice(0, this.#palettes.length);
    }

    
}
