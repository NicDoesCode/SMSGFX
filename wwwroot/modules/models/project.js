import PaletteList from "./paletteList.js";
import TileSet from "./tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";

export default class Project {


    /** Gets or sets the project title. */
    get title() {
        return this.#title;
    }
    set title(value) {
        this.#title = value;
    }

    /** Gets or sets the tile set for this project. */
    get tileSet() {
        return this.#tileSet;
    }
    set tileSet(value) {
        if (value === null || typeof value.getPixelAt !== 'function') throw new Error('Invalid tile set.');
        this.#tileSet = value;
    }

    /** Gets or sets the palette list for this project. */
    get paletteList() {
        return this.#paletteList;
    }
    set paletteList(value) {
        if (value === null || typeof value.getPalettes !== 'function') throw new Error('Invalid palette list.');
        this.#paletteList = value;
    }


    /** @type {string} */
    #title;
    /** @type {TileSet} */
    #tileSet;
    /** @type {PaletteList} */
    #paletteList;


    /**
     * Creates a new instance of the project class.
     * @param {string?} title - Title, if not supplied one will be created.
     * @param {TileSet?} tileSet - Tile set, if not supplied one will be created.
     * @param {PaletteList?} paletteList - Colour palettes, if not supplied one will be created.
     */
    constructor(title, tileSet, paletteList) {

        if (typeof title !== 'undefined' && title !== null) {
            this.title = title;
        } else {
            this.title = 'New project';
        }
        
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