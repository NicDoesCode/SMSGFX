import PaletteColour from "../models/paletteColour.js";

export default class PaletteColourFactory {


    /**
     * Creates a new instance of a palette colour object.
     * @param {number?} r - Red component.
     * @param {number?} g - Green component.
     * @param {number?} b - Blue component.
     * @returns {PaletteColour}
     */
    static create(r, g, b) {
        if (!r) r = 0;
        if (!g) r = 0;
        if (!b) r = 0;
        if (r < 0 || r > 255) throw 'Red colour value must be between 0 and 255';
        if (g < 0 || g > 255) throw 'Green colour value must be between 0 and 255';
        if (b < 0 || b > 255) throw 'Blue colour value must be between 0 and 255';
        return new PaletteColour(r, g, b);
    }

    /**
     * Creates a new instance of a palette colour from a hexadecimal colour code.
     * @param {string} hex - Hexadecimal colour code.
     * @returns {PaletteColour}
     */
    static fromHex(hex) {
        const rgb = this.rgbFromHex(hex);
        rgb.index = index;
        return PaletteColourFactory.create(rgb.r, rgb.g, rgb.b);
    }


}