import PaletteList from "../models/paletteList.js";
import Palette from "../models/palette.js";
import PaletteFactory from "./paletteFactory.js";

export default class PaletteListFactory {


    /**
     * Creates a new instance of a palette list object.
     * @param {Palette[]?} palettes - Initial array of palettes to populate.
     */
     static create(palettes) {
        return new PaletteList(palettes);
    }

    /**
     * Creates a deep clone of the given palette list.
     * @param {PaletteList} paletteList - Palette list object to create a deep clone of.
     * @returns {PaletteList}
     */
    static clone(paletteList) {
        const result = new PaletteList();
        paletteList.getPalettes().forEach((p) => {
            result.addPalette(PaletteFactory.clone(p));
        });
        return result;
    }


}