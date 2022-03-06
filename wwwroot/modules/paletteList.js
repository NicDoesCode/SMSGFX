import Palette from "./palette.js";

export default class PaletteList {

    /** @type {Palette[]} */
    #palettes = [];
    /** @type {function[]} */
    #callbacks = [];

    constructor() {
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
     * Sets a palette.
     * @param {number} index Index of the palette to set.
     * @param {Palette} value Palette value to set.
     */
    setPalette(index, value) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes[index] = value;
            this.#triggerOnChanged();
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a pelette at a given index.
     * @param {number} index Index of the palette to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#palettes.length) {
            this.#palettes.splice(index, 1);
            this.#triggerOnChanged();
        } else throw new Error('Index out of range.');
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
        this.#triggerOnChanged();
    }

    /**
     * Clears the palette list.
     */
    clear() {
        this.#palettes.splice(0, this.#palettes.length);
        this.#triggerOnChanged();
    }

    /**
     * Triggered when the list is changed.
     * @param {function} [callback=null] The callback to be triggered.
     */
    onchanged(callback) {
        if (callback) {
            if (typeof callback === 'function') {
                this.#callbacks.push(callback);
            } else throw new Error('Callback must be a function.');
        } else this.#triggerOnChanged();
    }
    #triggerOnChanged() {
        this.#callbacks.forEach(cb => {
            if (typeof cb === 'function') {
                cb(this);
            }
        });
    }

    /**
     * Serialises the list of palettes.
     * @returns {string} 
     */
    serialise() {
        const jsonPalettes = this.#palettes.map(palette => {
            return JSON.stringify({
                system: palette.system,
                index: palette.index,
                colours: palette.colours
            });
        });
        return JSON.stringify(jsonPalettes);
    }

    /**
     * Returns a deserialised list of palettes.
     * @param {string} value Serialised list of palettes.
     * @returns {PaletteList}
     */
    static deserialise(value) {
        if (value) {
            /** @type {string[]} */
            const jsonPalettes = JSON.parse(value);
            const result = new PaletteList();
            jsonPalettes.forEach(jsonPalette => {
                /** @type {JSONPalette} */
                const deserialsedPalette = JSON.parse(content);
                const result = new Palette(deserialsedPalette.system, deserialsedPalette.index);
                deserialsedPalette.colours.forEach((colour, index) => {
                    result.setColour(index, colour);
                });
                return result;
            });
            return result;
        } else throw new Error('Invalid palette data supplied.');
    }

}

/**
 * @typedef JSONPalette
 * @type {object}
 * @property {string} system - Either 'ms' (Sega Master) or 'gg' (Sega Game Gear).
 * @property {number} index - Palette index, either 0 or 1.
 * @property {Array<PaletteColour>} colours - Colours in the palette.
 */
