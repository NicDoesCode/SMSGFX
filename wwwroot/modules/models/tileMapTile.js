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
        if (value < 0 || value > 100) throw new Error('Invaliud palette index.');
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
    set horizontalFlip(value) {
        this.#horizontalFlip = value;
    }

    // TODO - convert tile number to tile ID

    get tileNumber() {
        return this.#tileNumber;
    }
    set tileNumber(value) {
        this.#tileNumber = value;
    }

    // TODO - remove sourceTile

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