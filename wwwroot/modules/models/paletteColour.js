/**
 * Colour entry for a palette.
 */
export default class PaletteColour {


    /** Red component. */
    get r() { return this.#r; }
    set r(value) {
        if (value < 0 || value > 255) throw 'Red colour value must be between 0 and 255';
        this.#r = value;
    }

    /** Green component. */
    get g() { return this.#g; }
    set g(value) {
        if (value < 0 || value > 255) throw 'Green colour value must be between 0 and 255';
        this.#g = value;
    }

    /** Blue component. */
    get b() { return this.#b; }
    set b(value) {
        if (value < 0 || value > 255) throw 'Blue colour value must be between 0 and 255';
        this.#b = value;
    }


    /** @type {number} */ #r = 0;
    /** @type {number} */ #g = 0;
    /** @type {number} */ #b = 0;


    /**
     * Creates a new palette colour instance.
     * @param {number} r - Red component.
     * @param {number} g - Green component.
     * @param {number} b - Blue component.
     */
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    
}