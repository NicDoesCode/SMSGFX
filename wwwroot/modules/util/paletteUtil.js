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
     * @returns {Palette}
     */
    static clonePaletteListWithNativeColours(paletteList) {
        return PaletteListFactory.create(
            paletteList.getPalettes().map((p) => PaletteUtil.clonePaletteWithNativeColours(p))
        );
    }

    /**
     * Creates a clone of a palette with native colour values.
     * @param {Palette} palette - Palette to clone.
     * @returns {Palette}
     */
    static clonePaletteWithNativeColours(palette) {
        const result = PaletteFactory.clone(palette);
        result.paletteId = palette.paletteId;
        result.getColours().forEach((colour) => {
            const nativeColour = ColourUtil.getClosestNativeColour(palette.system, colour.r, colour.g, colour.b);
            colour.r = nativeColour.r;
            colour.g = nativeColour.g;
            colour.b = nativeColour.b;
        });
        return result;
    }


}