import PaletteList from "../models/paletteList.js";
import Palette from "../models/palette.js";

export default class PaletteListFactory {


    /**
     * Creates a new instance of a palette list object.
     * @param {Palette[]?} palettes - Initial array of palettes to populate.
     */
     static create(palettes) {
        return new PaletteList(palettes);
    }


}