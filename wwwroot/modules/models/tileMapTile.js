/**
 * Tile map entry.
 */
export default class TileMapTile {


    get priority() {
        return this.#priority;
    }
    set priority(value) {
        this.#priority = value;
    }

    get palette() {
        return this.#palette;
    }
    set palette(value) {
        if (value < 0 || value > 1) throw new Error('Palette number can be only 0 or 1.');
        this.#palette = value;
    }

    get verticalFlip() {
        return this.#verticalFlip;
    }
    set verticalFlip(value) {
        this.#verticalFlip = value;
    }

    get horizontalFlip() {
        return this.#horizontalFlip;
    }
    set verticalFlip(value) {
        this.#horizontalFlip = value;
    }

    get tileNumber() {
        return this.#tileNumber;
    }
    set tileNumber(value) {
        this.#tileNumber = value;
    }

    get sourceTile() {
        return this.#sourceTile;
    }
    set sourceTile(value) {
        this.#sourceTile = value;
    }


    #priority = false;
    #palette = 0;
    #verticalFlip = 0;
    #horizontalFlip = 0;
    #tileNumber = 0;
    #sourceTile = null;


    constructor() {
    }


}