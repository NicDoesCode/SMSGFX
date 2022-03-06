import TileSet from "./tileSet.js";
import Tile from "./tile.js";

export default class TileSetList {

    /** @type {TileSet[]} */
    #tileSets = [];
    /** @type {function[]} */
    #callbacks = [];

    constructor() {
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
     * Sets a tile set.
     * @param {number} index Index of the tile set to set.
     * @param {TileSet} value Tile set value to set.
     */
    setTileSet(index, value) {
        if (index >= 0 && index < this.#tileSets.length) {
            this.#tileSets[index] = value;
            this.#triggerOnChanged();
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a pelette at a given index.
     * @param {number} index Index of the tile set to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#tileSets.length) {
            this.#tileSets.splice(index, 1);
            this.#triggerOnChanged();
        } else throw new Error('Index out of range.');
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
        this.#triggerOnChanged();
    }

    /**
     * Clears the tile set list.
     */
    clear() {
        this.#tileSets.splice(0, this.#tileSets.length);
        this.#triggerOnChanged();
    }

    /**
     * Triggered when the list is changed.
     * @param {function} [callback=null] The callback to be triggered.
     */
    onchanged(callback) {
        if (callback) {
            if (typeof callback === 'function') {
                this.#callbacks.push(callback);
            } else throw new Error('Callback must be a function.');
        } else this.#triggerOnChanged();
    }
    #triggerOnChanged() {
        this.#callbacks.forEach(cb => {
            if (typeof cb === 'function') {
                cb(this);
            }
        });
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
            const result = new TileSetList();
            /** @type {string[]} */
            const jsonTileSets = JSON.parse(localData);
            jsonTileSets.forEach(jsonTileSet => {
                /** @type {JsonTileSet} */
                const jsonTileSet = JSON.parse(jsonString);
                const result = new TileSet();
                result.tileWidth = jsonTileSet.tileWidth;
                jsonTileSet.tilesAsHex.forEach(tileAsHex => {
                    result.addTile(Tile.fromHex(tileAsHex));
                });
                this.#tileSets.push(TileSet.fromJSON(jsonTileSet));
            });
            return result;
        } else throw new Error('Invalid tile set data supplied.');
    }

}

/**
 * @typedef JsonTileSet
 * @type {object}
 * @property {number} tileWidth - The width of the tile map (in 8x8 pixel tiles).
 * @property {string[]} tilesAsHex - Array of tiles encoded as hexadecimal.
 */

