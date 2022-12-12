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
     * @param {Palette[]?} items - Initial array of items to populate.
     */
    constructor(items) {
        if (items && !Array.isArray(items)) throw new Error('Array of palettes must be passed.');
        if (items && Array.isArray(items)) {
            items.forEach(p => this.addPalette(p));
        }
    }


    /**
     * Returns all items.
     * @returns {Palette[]}
     */
    getPalettes() {
        return this.#palettes.slice();
    }

    /**
     * Gets an item by index.
     * @param {number} index - Index of the item to get.
     * @returns {Palette}
     */
    getPalette(index) {
        if (index >= 0 && index < this.#palettes.length) {
            return this.#palettes[index];
        } else {
            throw new Error('Index out of range.');
        }
    }

    /**
     * Adds an item to the list.
     * @param {Palette|Palette[]} value - Item or array of items to add.
     */
    addPalette(value) {
        if (Array.isArray(value)) {
            value.forEach(item => this.#palettes.push(item));
        } else {
            this.#palettes.push(value);
        }
    }

    /**
     * Inserts an item by index.
     * @param {number} index - Index of where to insert the item.
     * @param {Palette} value - Value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#palettes.length);
        if (index === 0) this.#palettes.unshift(value);
        else if (index === this.#palettes.length) this.#palettes.push(value);
        else this.#palettes = this.#palettes.splice(index, 0, value);
    }

    /**
     * Sets an item by index.
     * @param {number} index - Index of the palette to set.
     * @param {Palette} value - Palette value to set.
     */
    setPalette(index, value) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes an item at a given index.
     * @param {number} index - Index of the palette to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the list.
     */
    clear() {
        this.#palettes.splice(0, this.#palettes.length);
    }

    
}
