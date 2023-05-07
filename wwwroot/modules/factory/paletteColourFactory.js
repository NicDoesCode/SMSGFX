import PaletteColour from "../models/paletteColour.js";
import ColourUtil from "../util/colourUtil.js";

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
        if (!g) g = 0;
        if (!b) b = 0;
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
        const rgb = ColourUtil.rgbFromHex(hex);
        return PaletteColourFactory.create(rgb.r, rgb.g, rgb.b);
    }

    /**
     * Returns a palette with native colours for the system.
     * @param {string} system - System to make native colour for, either 'ms' or 'gg'.
     * @param {PaletteColour} paletteColour - Palette colour to convert.
     * @returns {PaletteColour}
     */
    static convertToNative(system, paletteColour) {
        const originalHex = ColourUtil.toHex(paletteColour.r, paletteColour.g, paletteColour.b);
        const nativeHex = ColourUtil.getClosestNativeColourFromHex(system, originalHex);
        return PaletteColourFactory.fromHex(nativeHex);
    }


}