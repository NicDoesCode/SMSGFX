import TileMapTile from "./tileMapTile.js";

/**
 * Tile map.
 */
export default class TileMap {


    get vramOffset() {
        return this.#vramOffset;
    }
    set vramOffset(value) {
        this.#vramOffset = value;
    }

    get tiles() {
        return this.#tiles;
    }
    set tiles(value) {
        this.#tiles = value;
    }

    get tileWidth() {
        return this.#tileWidth;
    }
    set tileWidth(value) {
        if (value < 1 || value > 100) throw new Error('Tile width must be greater than 1 and less than 100.');
        this.#tileWidth = value;
    }


    #vramOffset = 0;
    #tileWidth = 0;
    /** @type {TileMapTile[]} */
    #tiles = [];


    constructor() {
    }


}