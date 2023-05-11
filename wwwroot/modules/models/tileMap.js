import TileMapTile from "./tileMapTile.js";
import Tile from "./../models/tile.js";
import TileSet from "./../models/tileSet.js";
import TileUtil from "../util/tileUtil.js";

/**
 * Tile map.
 */
export default class TileMap {


    get id() {
        return this.id;
    }
    set id(value) {
        this.id = value;
    }

    get title() {
        return this.#title;
    }
    set id(value) {
        this.#title = value;
    }

    get vramOffset() {
        return this.#vramOffset;
    }
    set vramOffset(value) {
        this.#vramOffset = value;
    }

    get columns() {
        return this.columns;
    }
    set columns(value) {
        if (value < 1 || value > 1000) throw new Error('Columns must be between 1 and 1000.');
        this.columns = value;
    }

    get rows() {
        return this.rows;
    }
    set rows(value) {
        if (value < 1 || value > 1000) throw new Error('Rows must be between 1 and 1000.');
        this.rows = value;
    }

    get tileCount() {
        return this.#tiles.length; 
    }

    get optimise() {
        return this.#optimise;
    }
    set optimise(value) {
        this.#optimise = value;
    }


    /** @type {string} */
    id = null;
    #title = null;
    #vramOffset = 0;
    columns = 1;
    rows = 1;
    #optimise = false;
    /** @type {TileMapTile[]} */
    #tiles = [];


    constructor() {
    }


    /**
     * Adds a tile to the tile set.
     * @param {Tile} tile - Tile reference to add.
     * @param {TileMapTileParams} params - Parameters.
     */
    addTile(tile, params) {
        this.#tiles.push({
            tileIndex: this.#tiles.length,
            sourceTile: tile,
            horizontalFlip: params.horizontalFlip,
            verticalFlip: params.verticalFlip,
            palette: params.palette,
            priority: params.priority
        });
    }

    getTileMapTiles() {
        return this.#tiles.map((tileMapTile) => {
            /** @type {TileMapTile} */
            const result = {
                tileIndex: tileMapTile.tileIndex + this.vramOffset,
                horizontalFlip: tileMapTile.horizontalFlip,
                verticalFlip: tileMapTile.verticalFlip,
                palette: tileMapTile.palette,
                priority: tileMapTile.priority
            };
            return result;
        });
    }


    // toTileSet() {
    //     const result = new TileSet();
    //     result.tileWidth = this.columns;
    //     if (!this.optimise) {
    //         this.#tiles.forEach((tile) => {
    //             result.addTile(tile.sourceTile);
    //         });
    //     } else {
    //         Object.keys(this.#uniqueTiles).forEach(key => {
    //             result.addTile(this.#uniqueTiles[key].tile);
    //         });
    //     }
    //     return result;
    // }


}

/**
 * Parameters for tile map tiles.
 * @typedef {object} TileMapTileParams
 * @property {number} tileIndex - Index of the tile within the tile map.
 * @property {boolean} horizontalFlip - Mirror tile horizontally?
 * @property {boolean} verticalFlip - Mirror tile vertically?
 * @property {number} palette - Palette index to use for the tile.
 * @property {boolean} priority - Does this tile have a higher priority? (in SMS+GG means it draws on-top of sprites).
 * @exports
 */
