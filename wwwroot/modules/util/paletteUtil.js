import ColourUtil from "./colourUtil.js";
import PaletteFactory from "../factory/paletteFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import Palette from "../models/palette.js";
import PaletteList from "../models/paletteList.js";


/**
 * Provides palette related utility functions.
 */
export default class PaletteUtil {


    /**
     * Creates a clone of a palette list with native colour values.
     * @param {PaletteList} paletteList - Palette list to clone.
     * @param {ClonePaletteListOptions?} [options] - Clone options.
     * @returns {Palette}
     */
    static clonePaletteListWithNativeColours(paletteList, options) {
        const preserveId = options?.preserveIds ?? false;
        return PaletteListFactory.create(
            paletteList.getPalettes().map((p) => PaletteUtil.clonePaletteWithNativeColours(p, { preserveId: preserveId }))
        );
    }

    /**
     * Creates a clone of a palette with native colour values.
     * @param {Palette} palette - Palette to clone.
     * @param {ClonePaletteOptions?} [options] - Clone options.
     * @returns {Palette}
     */
    static clonePaletteWithNativeColours(palette, options) {
        const result = PaletteFactory.clone(palette);
        result.getColours().forEach((colour) => {
            const nativeColour = ColourUtil.getClosestNativeColour(palette.system, colour.r, colour.g, colour.b);
            colour.r = nativeColour.r;
            colour.g = nativeColour.g;
            colour.b = nativeColour.b;
        });
        if (options?.preserveId === true) {
            result.paletteId = palette.paletteId;
        }
        return result;
    }


}

/**
 * @typedef {Object} ClonePaletteListOptions
 * @property {boolean?} [preserveIds] - Will the output contain the same IDs as the original?
 * @exports
 */
/**
 * @typedef {Object} ClonePaletteOptions
 * @property {boolean?} [preserveId] - Will the output contain the same ID as the original?
 * @exports
 */