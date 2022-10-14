import PaletteList from "./paletteList.js";
import TileSet from "./tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";

export default class Project {


    /** Gets the tile set for this project. */
    get tileSet() {
        return this.#tileSet;
    }

    /** Gets the palette list for this project. */
    get paletteList() {
        return this.#paletteList;
    }


    /** @type {TileSet} */
    #tileSet;
    /** @type {PaletteList} */
    #paletteList;


    /**
     * Creates a new instance of the project class.
     * @param {TileSet} tileSet - Tile set.
     * @param {PaletteList} paletteList - Colour palettes.
     */
    constructor(tileSet, paletteList) {
        if (tileSet) {
            this.#tileSet = tileSet;
        } else {
            this.#tileSet = TileSetFactory.create();
        }
        if (paletteList) {
            this.#paletteList = paletteList;
        } else {
            this.#paletteList = PaletteListFactory.create();
        }
    }


}