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
    /** @type {Object.<string, Palette>} */
    #palettesByIdCache = null;


    /**
     * Creates a new instance of a palette list.
     * @param {Palette[]?} items - Initial array of items to populate.
     */
    constructor(items) {
        if (items && !Array.isArray(items)) throw new Error('Array of palettes must be passed.');
        if (items && Array.isArray(items)) {
            items.forEach((p) => this.addPalette(p));
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
     * Sets the items in the list.
     * @param {Palette[]} values - Array of values.
     */
    setPalettes(values) {
        if (Array.isArray(values)) {
            const filtered = values.filter((palette) => palette !== null && palette instanceof Palette);
            this.#palettes = filtered;
        }
    }


    /**
     * Gets an item by index.
     * @param {number} index - Index of the item to get.
     * @throws Index is out of range.
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
     * Gets an item by index, or null if out of range.
     * @param {number} index - Index of the item to get.
     * @returns {Palette?}
     */
    getPaletteByIndex(index) {
        if (index >= 0 && index < this.#palettes.length) {
            return this.#palettes[index];
        } else {
            return null;
        }
    }

    /**
     * Gets the index of an item in the list by ID.
     * @param {string} paletteId - Unique Palette ID to get the index of.
     * @returns {number}
     */
    indexOf(paletteId) {
        if (typeof paletteId !== 'string') return -1;
        for (let i = 0; i < this.#palettes.length; i++) {
            if (this.#palettes[i].paletteId === paletteId) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Gets an item by ID.
     * @param {string} paletteId - Unique Palette ID to fetch.
     * @returns {Palette|null}
     */
    getPaletteById(paletteId) {
        if (this.containsPaletteById(paletteId)) {
            return this.#getPalettesByIdCache()[paletteId];
        } else {
            return null;
        }
    }


    /**
     * Gets whether this list has a palette by a given ID.
     * @param {string} paletteId - Unique Palette ID to query.
     * @returns {boolean}
     */
    containsPaletteById(paletteId) {
        return (paletteId && this.#getPalettesByIdCache()[paletteId]);
    }


    /**
     * Adds an item to the list.
     * @param {Palette|Palette[]} value - Item or array of items to add.
     */
    addPalette(value) {
        if (Array.isArray(value)) {
            value.forEach((p) => this.#palettes.push(p));
        } else {
            this.#palettes.push(value);
        }
        this.#resetPalettesByIdCache();
    }


    /**
     * Inserts an item by index.
     * @param {number} index - Index of where to insert the item.
     * @param {Palette} value - Value to insert.
     */
    insertAt(index, value) {
        if (this.containsPaletteById(value.paletteId)) {
            throw new Error('Palette list already contains a palette with the given ID.');
        }
        index = Math.max(index, 0);
        index = Math.min(index, this.#palettes.length);
        if (index === 0) this.#palettes.unshift(value);
        else if (index === this.#palettes.length) this.#palettes.push(value);
        else {
            const start = this.#palettes.slice(0, index + 1);
            const end = this.#palettes.slice(index + 1);
            this.#palettes = start.concat([value]).concat(end);
        }
        this.#resetPalettesByIdCache();
    }

    /**
     * Sets an item by index.
     * @param {number} index - Index of the palette to set.
     * @param {Palette} value - Palette value to set.
     */
    setPalette(index, value) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes[index] = value;
            this.#resetPalettesByIdCache();
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes an item at a given index.
     * @param {number} index - Index of the palette to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes.splice(index, 1);
            this.#resetPalettesByIdCache();
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a palette by ID.
     * @param {string} paletteId - Unique Palette ID.
     */
    removeById(paletteId) {
        if (paletteId) {
            this.#palettes = this.#palettes.filter((p) => p.paletteId !== paletteId);
            this.#resetPalettesByIdCache();
        } else throw new Error('Please supply a palette ID.');
    }

    /**
     * Clears the list.
     */
    clear() {
        this.#palettes.splice(0, this.#palettes.length);
        this.#resetPalettesByIdCache();
    }


    #getPalettesByIdCache() {
        if (!this.#palettesByIdCache) {
            this.#palettesByIdCache = {};
            this.#palettes.forEach((p) => this.#palettesByIdCache[p.paletteId] = p);
        }
        return this.#palettesByIdCache;
    }

    #resetPalettesByIdCache() {
        this.#palettesByIdCache = null;
    }


}
