export default class TileMapTile {


    get palette() {
        return this.#palette;
    }
    set palette(value) {
        if (value !== 0 && value !== 1) throw new Error('Value for "palette" must be 0 or 1.');
        this.#palette = value;
    }

    get tileIndex() {
        return this.#tileIndex;
    }
    set tileIndex(value) {
        if (value < 0) throw new Error('Value for "tileIndex" must be 0 or greater.');
        this.#tileIndex = value;
    }


    #palette = 0;
    #tileIndex = 0;


    /**
     * Creates a new instance of a tile map tile.
     * @param {number} palette The palette index to use, 0 or 1.
     * @param {number} tileIndex Index of the tile to use witin the tile library.
     */
    constructor(palette, tileIndex) {
        this.palette = palette;
        this.tileIndex = tileIndex;
    }


    toJSON() {
        return {
            palette: this.palette,
            tileIndex: this.tileIndex
        }
    }

    static fromJSON(jsonString) {
        if (!jsonString || jsonString !== 'string') throw new Error('Please pass a JSON string.');
        const parsed = JSON.parse(jsonString);
        return new TileMapTile(parsed.palette, parsed.tileIndex);
    }


}