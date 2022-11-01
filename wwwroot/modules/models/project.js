import PaletteList from "./paletteList.js";
import TileSet from "./tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import GeneralUtil from "../util/generalUtil.js";

export default class Project {


    /** Gets or sets the project id. */
    get id() {
        return this.#id;
    }
    set id(value) {
        this.#id = value;
    }

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
    #id = null;
    /** @type {string} */
    #title;
    /** @type {TileSet} */
    #tileSet;
    /** @type {PaletteList} */
    #paletteList;


    /**
     * Creates a new instance of the project class.
     * @param {string?} id - ID of the project.
     * @param {string?} title - Title, if not supplied one will be created.
     * @param {TileSet?} tileSet - Tile set, if not supplied one will be created.
     * @param {PaletteList?} paletteList - Colour palettes, if not supplied one will be created.
     */
    constructor(id, title, tileSet, paletteList) {

        if (typeof id !== 'undefined' && title !== null) {
            this.#id = id;
        } else {
            this.id = GeneralUtil.generateRandomString(16);
        }

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