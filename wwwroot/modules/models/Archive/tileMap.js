import TileMapTile from "./tileMapTile.js";

export default class TileMap {


    /** Gets or sets the width of the tile map (in 8x8 tiles). */
    get tileWidth() {
        return this.#tileWidth;
    }
    set tileWidth(value) {
        if (value < 1) throw new Error('Value for "tileWidth" must be greater than 0.');
        this.#tileWidth = value;
    }

    /** Gets or sets the memory offset of the tile map. */
    get memoryAddress() {
        return this.#memoryAddress;
    }
    set memoryAddress(value) {
        if (value < 1) throw new Error('Value for "tileWidth" must be greater than 0.');
        this.#memoryAddress = value;
    }

    /** Gets the tiles within the tile map. */
    get tiles() {
        return this.#tiles;
    }


    #tileWidth = 1;
    #memoryAddress = 0;
    /** @type {TileMapTile[]} */
    #tiles = [];


    /**
     * Initialise a new instance of a tile map.
     * @param {number} [tileWidth] How wide is the tile map?
     * @package {number} [memoryAddress] The memory offset for this tile map.
     */
    constructor(tileWidth, memoryAddress) {
        if (typeof tileWidth === 'number') this.#tileWidth = tileWidth;
        if (typeof memoryAddress === 'number') this.#memoryAddress = memoryAddress;
    }


    /**
     * Serialises the palette object to a string.
     * @returns {string}
     */
     toJSON() {
        return {
            tileWidth: this.tileWidth,
            memoryAddress: this.memoryAddress,
            tiles: this.tiles.map(t => t.toJSON())
        };
    }

    static fromJSON(jsonString) {
        if (!jsonString || jsonString !== 'string') throw new Error('Please pass a JSON string.');
        const parsed = JSON.parse(jsonString);
        const result = new TileMap(parsed.tileWidth, parsed.memoryAddress);
        result.tiles.push();
    }

    
}