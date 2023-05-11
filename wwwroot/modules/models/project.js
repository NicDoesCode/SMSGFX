import PaletteList from "./paletteList.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import TileSet from "./tileSet.js";
import TileSetFactory from "../factory/tileSetFactory.js";
import TileMapList from './tileMapList.js';
import TileMapListFactory from "../factory/tileMapListFactory.js";
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

    /** Gets or sets the system type (either 'smsgg' or 'gb'). */
    get systemType() {
        return this.#systemType;
    }
    set systemType(value) {
        this.#systemType = value;
    }

    /** Gets or sets the tile set for this project. */
    get tileSet() {
        return this.#tileSet;
    }
    set tileSet(value) {
        if (value === null || typeof value.getPixelAt !== 'function') throw new Error('Invalid tile set.');
        this.#tileSet = value;
    }

    /** Gets or sets the tile map list for this project. */
    get tileMapList() {
        return this.#tileMapList;
    }
    set tileMapList(value) {
        if (value === null || typeof value.getTileMaps !== 'function') throw new Error('Invalid tile map list.');
        this.#tileMapList = value;
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
    /** @type {string} */
    #systemType;
    /** @type {TileSet} */
    #tileSet;
    /** @type {TileMapList} */
    #tileMapList;
    /** @type {PaletteList} */
    #paletteList;


    /**
     * Creates a new instance of the project class.
     * @param {string?} id - ID of the project.
     * @param {string?} title - Title, if not supplied one will be created.
     * @param {string?} systemType - Type of system targetted, either 'smsgg', 'gb' or 'nes', default is 'smsgg'.
     * @param {TileSet?} tileSet - Tile set, if not supplied one will be created.
     * @param {TileMapList?} tileMapList - Tile map list, if not supplied one will be created.
     * @param {PaletteList?} paletteList - Colour palettes, if not supplied one will be created.
     */
    constructor(id, title, systemType, tileSet, tileMapList, paletteList) {

        if (typeof id !== 'undefined' && id !== null && id.length > 0) {
            this.#id = id;
        } else {
            this.id = GeneralUtil.generateRandomString(16);
        }

        if (typeof title !== 'undefined' && title !== null) {
            this.title = title;
        } else {
            this.title = 'New project';
        }
        
        if (typeof systemType !== 'undefined' && systemType !== null) {
            switch (systemType) {
                case 'gb': this.systemType = 'gb'; break;
                case 'nes': this.systemType = 'nes'; break;
                case 'smsgg': default: this.systemType = 'smsgg'; break;
            }
        } else {
            this.systemType = 'smsgg';
        }

        if (tileSet) {
            this.#tileSet = tileSet;
        } else {
            this.#tileSet = TileSetFactory.create();
        }
        
        if (tileMapList) {
            this.#tileMapList = tileMapList;
        } else {
            this.#tileMapList = TileMapListFactory.create();
        }

        if (paletteList) {
            this.#paletteList = paletteList;
        } else {
            this.#paletteList = PaletteListFactory.create();
        }
    }


}