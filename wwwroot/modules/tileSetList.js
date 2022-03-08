import TileSet from "./tileSet.js";
import Tile from "./tile.js";

export default class TileSetList {


    /**
     * Gets the amount of stored palettes. 
     */
     get length() {
        return this.#tileSets.length;
    }


    /** @type {TileSet[]} */
    #tileSets = [];


    constructor() {
    }


    /**
     * Returns all tile sets.
     * @returns {TileSet[]}
     */
    getTileSets() {
        return this.#tileSets.slice();
    }

    /**
     * Gets a tile set.
     * @param {number} index Index of the tile set to get.
     * @returns {TileSet}
     */
    getTileSet(index) {
        if (index >= 0 && index < this.#tileSets.length) {
            return this.#tileSets[index];
        } else throw new Error('Index out of range.');
    }

    /**
     * Adds a tile set to the collection.
     * @param {TileSet} value Tile set value to insert.
     */
    addTileSet(value) {
        this.#tileSets.push(value);
    }

    /**
     * Inserts a tile set.
     * @param {number} index Index of where to insert the tile set.
     * @param {TileSet} value Tile set value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#tileSets.length);
        if (index === 0) this.#tileSets.unshift(value);
        else if (index === this.#tileSets.length) this.#tileSets.push(value);
        else this.#tileSets = this.#tileSets.splice(index, 0, value);
    }

    /**
     * Sets a tile set.
     * @param {number} index Index of the tile set to set.
     * @param {TileSet} value Tile set value to set.
     */
    setTileSet(index, value) {
        if (index >= 0 && index < this.#tileSets.length) {
            this.#tileSets[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a pelette at a given index.
     * @param {number} index Index of the tile set to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#tileSets.length) {
            this.#tileSets.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the tile set list.
     */
    clear() {
        this.#tileSets.splice(0, this.#tileSets.length);
    }

    /**
     * Serialises the list of tile sets.
     * @returns {string} 
     */
    serialise() {
        const jsonTileSets = this.#tileSets.map(tileSet => {
            /** @type {JsonTileSet} */
            const result = {
                tileWidth: tileSet.tileWidth,
                tilesAsHex: tileSet.getTiles().map(t => t.toHexString())
            };
            return JSON.stringify(result);
        });
        return JSON.stringify(jsonTileSets);
    }

    /**
     * Returns a deserialised list of tile sets.
     * @param {string} value Serialised list of tile sets.
     * @returns {TileSetList}
     */
    static deserialise(value) {
        if (value) {
            const tileSetList = new TileSetList();
            /** @type {string[]} */
            const jsonStringTileSets = JSON.parse(value);
            jsonStringTileSets.forEach(jsonStringTileSet => {
                /** @type {JsonTileSet} */
                const jsonTileSet = JSON.parse(jsonStringTileSet);
                const tileSet = new TileSet();
                tileSet.tileWidth = jsonTileSet.tileWidth;
                jsonTileSet.tilesAsHex.forEach(tileAsHex => {
                    tileSet.addTile(Tile.fromHex(tileAsHex));
                });
                tileSetList.addTileSet(tileSet);
            });
            return tileSetList;
        } else throw new Error('Invalid tile set data supplied.');
    }

    
}

/**
 * @typedef JsonTileSet
 * @type {object}
 * @property {number} tileWidth - The width of the tile map (in 8x8 pixel tiles).
 * @property {string[]} tilesAsHex - Array of tiles encoded as hexadecimal.
 */

