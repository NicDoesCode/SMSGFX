/**
 * Tile map entry.
 */
export default class TileMapTile {


    /**
     * Gets or sets the index of the tile within the tile set.
     */
    get tileIndex() {
        return this.#tileIndex;
    }
    set tileIndex(value) {
        this.#tileIndex = value;
    }

    /**
     * Gets or sets the priority of the tile, the effect of this will vary on the system and the usage context.
     */
    get priority() {
        return this.#priority;
    }
    set priority(value) {
        this.#priority = value;
    }

    /**
     * Sets the palette index to use for the tile.
     */
    get palette() {
        return this.#palette;
    }
    set palette(value) {
        if (value < 0 || value > 100) throw new Error('Invalid palette index.');
        this.#palette = value;
    }

    /**
     * Flip the tile horizontally?
     */
    get verticalFlip() {
        return this.#verticalFlip;
    }
    set verticalFlip(value) {
        this.#verticalFlip = value;
    }

    /**
     * Flip the tile vertically?
     */
    get horizontalFlip() {
        return this.#horizontalFlip;
    }
    set horizontalFlip(value) {
        this.#horizontalFlip = value;
    }


    #tileIndex = 0;
    #priority = false;
    #palette = 0;
    #verticalFlip = false;
    #horizontalFlip = false;


    constructor() {
    }


}