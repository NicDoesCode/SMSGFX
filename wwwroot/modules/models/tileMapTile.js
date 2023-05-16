/**
 * Tile map entry.
 */
export default class TileMapTile {


    /**
     * Gets or sets the unique ID of the tile associated with this item.
     */
    get tileId() {
        return this.#tileId;
    }
    set tileId(value) {
        this.#tileId = value;
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
     * Gets or sets the palette index to use for the tile.
     */
    get palette() {
        return this.#palette;
    }
    set palette(value) {
        if (value !== null && typeof value === 'number' && value >= 0 && value <= 100) {
            this.#palette = value;
        } else throw new Error('Invalid palette index.');
    }

    /**
     * Gets or sets whether to flip the tile horizontally?
     */
    get verticalFlip() {
        return this.#verticalFlip;
    }
    set verticalFlip(value) {
        this.#verticalFlip = value;
    }

    /**
     * Gets or sets whether to flip the tile vertically?
     */
    get horizontalFlip() {
        return this.#horizontalFlip;
    }
    set horizontalFlip(value) {
        this.#horizontalFlip = value;
    }


    /** @type {string} */
    #tileId = null;
    #priority = false;
    #palette = 0;
    #verticalFlip = false;
    #horizontalFlip = false;


    constructor() {
    }


}