import TileMap from "./tileMap.js";

export default class TileMapList {


    /**
     * Gets the count of items. 
     */
    get length() {
        return this.#tileMaps.length;
    }


    /** @type {TileMap[]} */
    #tileMaps = [];


    /**
     * Creates a new instance of a tile map list.
     * @param {TileMap[]?} [items] - Initial array of items to populate.
     */
    constructor(items) {
        if (items && !Array.isArray(items)) throw new Error('Array of tile maps must be passed.');
        if (items && Array.isArray(items)) {
            items.forEach(p => this.addTileMap(p));
        }
    }


    /**
     * Returns all items.
     * @returns {TileMap[]}
     */
    getTileMaps() {
        return this.#tileMaps.slice();
    }

    /**
     * Sets the items in the list.
     * @param {TileMap[]} values - Array of values.
     */
    setTileMaps(values) {
        if (Array.isArray(values)) {
            const filtered = values.filter((tileMap) => tileMap !== null && tileMap instanceof TileMap);
            this.#tileMaps = filtered;
        }
    }


    /**
     * Gets whether the project contains a tile map by ID.
     * @param {string} tileMapId - ID of the item to check.
     * @returns {boolean}
     */
    containsTileMapById(tileMapId) {
        if (tileMapId) {
            return this.#tileMaps.filter((tm) => tm.tileMapId === tileMapId).length > 0;
        }
        return false;
    }

    /**
     * Gets an item by ID.
     * @param {string} tileMapId - ID of the item to get.
     * @returns {TileMap?}
     */
    getTileMapById(tileMapId) {
        if (tileMapId) {
            const found = this.#tileMaps.filter((tm) => tm.tileMapId === tileMapId);
            if (found.length > 0) {
                return found[0];
            }
        }
        return null;
    }

    /**
     * Gets an item by index.
     * @param {number} index - Index of the item to get.
     * @throws Index is out of range.
     * @returns {TileMap}
     */
    getTileMap(index) {
        if (index >= 0 && index < this.#tileMaps.length) {
            return this.#tileMaps[index];
        } else {
            throw new Error('Index out of range.');
        }
    }

    /**
     * Gets an item by index, or null if out of range.
     * @param {number} index - Index of the item to get.
     * @returns {TileMap}
     */
    getTileMapByIndex(index) {
        if (index >= 0 && index < this.#tileMaps.length) {
            return this.#tileMaps[index];
        } else {
            return null;
        }
    }

    /**
     * Gets the index of an item in the list by ID.
     * @param {string} tileMapId - Unique tile map ID to get the index of.
     * @returns {number}
     */
    indexOf(tileMapId) {
        if (typeof tileMapId !== 'string') return -1;
        for (let i = 0; i < this.#tileMaps.length; i++) {
            if (this.#tileMaps[i].tileMapId === tileMapId) {
                return i;
            }
        }
        return -1;
    }


    /**
     * Adds an item to the list.
     * @param {TileMap|TileMap[]} value - Item or array of items to add.
     */
    addTileMap(value) {
        if (Array.isArray(value)) {
            value.forEach(item => this.#tileMaps.push(item));
        } else {
            this.#tileMaps.push(value);
        }
    }

    /**
     * Inserts an item by index.
     * @param {number} index - Index of where to insert the item.
     * @param {TileMap} value - Value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#tileMaps.length);
        if (index === 0) this.#tileMaps.unshift(value);
        else if (index === this.#tileMaps.length) this.#tileMaps.push(value);
        else this.#tileMaps = this.#tileMaps.splice(index, 0, value);
    }

    /**
     * Sets an item by index.
     * @param {number} index - Index of the item to set.
     * @param {TileMap} value - Value to set.
     */
    setTileMap(index, value) {
        if (index >= 0 && index < this.#tileMaps.length) {
            this.#tileMaps[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes an item at a given index.
     * @param {number} index - Index of the item to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#tileMaps.length) {
            this.#tileMaps.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the list.
     */
    clear() {
        this.#tileMaps.splice(0, this.#tileMaps.length);
    }


}
