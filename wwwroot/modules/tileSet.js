import Tile from './tile.js';

/**
 * Set of tiles.
 */
export default class TileSet {

    /** @type {Tile[]} */
    #tiles = [];
    #tileWidth = 1;

    /**
     * Creates a new instace of TileSet and fills the tiles from an array.
     * 
     * @constructor
     * @param {Uint8ClampedArray} [sourceArray=null] Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=64] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
    constructor(sourceArray, sourceIndex, sourceLength) {
        if (sourceArray) {
            this.fillFromArray(sourceArray, sourceIndex, sourceLength);
        }
    }

    /**
     * The amount of tiles in this tile set.
     */
    get tileCount() {
        return this.#tiles.length;
    }

    /**
     * The width of the tile map (in 8x8 pixel tiles).
     */
    get tileWidth() {
        return this.#tileWidth;
    }
    set tileWidth(value) {
        if (value < 0) throw new Error('Tile width must be greater than 0.');
        this.#tileWidth = value;
    }

    /**
     * Adds a tile to the tile map.
     * @param {Tile} tile The tile to add.
     */
    addTile(tile) {
        if (!tile) throw new Error('Tile can not be null.');
        this.#tiles.push(tile);
    }

    /**
     * Inserts a tile at the given index.
     * @param {Tile} tile The tile to insert.
     * @param {number} index Index in the tile map where the tile should reside.
     */
    insertTileAt(tile, index) {
        if (!tile) throw new Error('Tile can not be null.');
        if (index < 0 || index > this.#tiles.length) throw new Error('Index must be between 0 and tile map count.');
        this.#tiles.splice(index, 0, tile);
    }

    /**
     * Removes a tile from the tile map.
     * @param {number} index Index in the tile map where the tile should be removed.
     */
    removeTile(index) {
        if (index < 0 || index > this.#tiles.length) throw new Error('Index must be between 0 and tile map count.');
        this.#tiles.splice(index, 1);
    }

    /**
     * Gets a tile from the tile map.
     * @param {number} index Index in the tile map of the tile to get.
     * @returns {Tile} Tile found at the given index.
     */
    getTile(index) {
        if (index < 0 || index > this.#tiles.length) throw new Error('Index must be between 0 and tile map count.');
        return this.#tiles[index];
    }

    /**
     * Gets all tiles.
     * @returns {Array<Tile>}
     */
    getTiles() {
        return this.#tiles;
    }

    /** Clears the tile set. */
    clear() {
        this.#tiles = [];
    }

    /**
     * Creates a tile set from a given array.
     * @param {Uint8ClampedArray} sourceArray Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=null] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
    fillFromArray(sourceArray, sourceIndex, sourceLength) {
        if (!sourceArray) throw new Error('Source array was not valid.');
        if (!sourceIndex) sourceIndex = 0;

        if (sourceIndex >= sourceArray.length) throw new Error('The source index exceeds the bounds of the source array.');
        if (sourceIndex < 0) throw new Error('Source index must be 0 or greater.');

        if (sourceLength === null) sourceLength = sourceIndex - sourceArray.length;
        else if (sourceLength < 0) throw new Error('Source length must be greater than 0.');

        let leftToRead = sourceLength;
        while (sourceIndex < sourceArray.length) {
            let amtToRead = Math.min(leftToRead, 64);
            const sourceReadEnd = sourceIndex + amtToRead;
            if (sourceReadEnd > sourceArray.length) amtToRead = sourceIndex - sourceArray.length;

            const tile = new Tile(sourceArray, sourceIndex, amtToRead);
            this.#tiles.push(tile);

            sourceIndex += 64;
        }
    }

    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} array Array or tile data in planar format.
     * @returns {TileSet}
     */
    static parsePlanarFormat(array) {
        const tileSet = new TileSet();
        for (let i = 0; i < array.length; i += 32) {
            const arraySlice = array.slice(i, i + 32);
            const tile = Tile.parsePlanarFormat(arraySlice);
            tileSet.addTile(tile);
        }
        return tileSet;
    }

}
