import Palette from "../models/palette.js";


export default class PaletteUtil {


    /**
     * Creates a clone of a palette with native colour values.
     * @param {Palette} palette - Palette to clone.
     * @returns {Palette}
     */
    static clonePaletteWithNativeColours(palette) {
        const result = PaletteFactory.clone(palette);
        result.getColours().forEach((colour) => {
            const nativeColour = ColourUtil.getClosestNativeColour(palette.system, colour.r, colour.g, colour.b);
            colour.r = nativeColour.r;
            colour.g = nativeColour.g;
            colour.b = nativeColour.b;
        });
        return result;
    }


}