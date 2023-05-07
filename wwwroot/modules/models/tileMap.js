import TileMapTile from "./tileMapTile.js";
import Tile from "./../models/tile.js";
import TileSet from "./../models/tileSet.js";
import TileUtil from "../util/tileUtil.js";

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

    get tileWidth() {
        return this.#tileWidth;
    }
    set tileWidth(value) {
        if (value < 1 || value > 100) throw new Error('Tile width must be greater than 1 and less than 100.');
        this.#tileWidth = value;
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


    #vramOffset = 0;
    #tileWidth = 1;
    /** @type {TileMapTile[]} */
    #tiles = [];
    /** @type {Object.<string, { tile: Tile, index: number }} */
    #uniqueTiles = {};
    #uniqueTileCount = 0;
    #optimise = false;


    constructor() {
    }


    /**
     * Adds a tile to the tile set.
     * @param {Tile} tile - Tile reference to add.
     * @param {TileMapTileParams} params - Parameters.
     */
    addTile(tile, params) {
        if (!this.optimise) {
            // Just add all tiles
            this.#tiles.push({
                tileNumber: this.#tiles.length,
                sourceTile: tile,
                horizontalFlip: params.horizontalFlip,
                verticalFlip: params.verticalFlip,
                palette: params.palette,
                priority: params.priority
            });
        } else {
            // Optimise by eliminating duplicate tiles
            const tileHex = TileUtil.toHex(tile);
            if (!this.#uniqueTiles[tileHex]) {
                this.#uniqueTiles[tileHex] = { tile: tile, index: this.#uniqueTileCount };
                this.#uniqueTileCount++;
            }
            const uniqueTile = this.#uniqueTiles[tileHex];
            this.#tiles.push({
                tileNumber: uniqueTile.index,
                sourceTile: uniqueTile.tile,
                horizontalFlip: params.horizontalFlip,
                verticalFlip: params.verticalFlip,
                palette: params.palette,
                priority: params.priority
            });
        }
    }

    getTileMapTiles() {
        return this.#tiles.map((tileMapTile) => {
            /** @type {TileMapTile} */
            const result = {
                tileNumber: tileMapTile.tileNumber + this.vramOffset,
                sourceTile: tileMapTile.sourceTile,
                horizontalFlip: tileMapTile.horizontalFlip,
                verticalFlip: tileMapTile.verticalFlip,
                palette: tileMapTile.palette,
                priority: tileMapTile.priority
            };
            return result;
        });
    }


    toTileSet() {
        const result = new TileSet();
        result.tileWidth = this.tileWidth;
        if (!this.optimise) {
            this.#tiles.forEach((tile) => {
                result.addTile(tile.sourceTile);
            });
        } else {
            Object.keys(this.#uniqueTiles).forEach(key => {
                result.addTile(this.#uniqueTiles[key].tile);
            });
        }
        return result;
    }


}

/**
 * Parameters for tile map tiles.
 * @typedef {object} TileMapTileParams
 * @property {boolean} horizontalFlip - Mirror tile horizontally?
 * @property {boolean} verticalFlip - Mirror tile vertically?
 * @property {number} palette - Palette index to use for the tile.
 * @property {boolean} priority - Does this tile have a higher priority? (in SMS+GG means it draws on-top of sprites).
 * @exports
 */
