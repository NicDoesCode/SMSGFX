import TileCanvas from './tileCanvas.js'
import TileSet from './tileSet.js'

export default class Fill {

    /** @type {TileCanvas} */
    #canvas = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {number} */
    #originColour = 0;
    /** @type {number} */
    #w = 0;
    /** @type {number} */
    #h = 0;

    /**
     * Initialises a new instance of the fill class.
     * @param {TileCanvas} canvas Canvas containing the tile data.
     */
    constructor(canvas) {
        this.#w = canvas.tileSet.tileWidth * 8;
        this.#h = canvas.tileSet.tileHeight * 8;
        this.#canvas = canvas;
        this.#tileSet = this.#canvas.tileSet;
    }

    /**
     * Fill.
     * @param {number} x Origin X coordinate.
     * @param {number} y Origin Y coordinate.
     * @param {TileCanvas} canvas Tile data.
     * @param {number} fillColour Palette index to fill with.
     */
    fill(x, y, fillColour) {
        if (x < 0 || x >= this.#w || y < 0 || y >= this.#h)
            throw 'Invalid origin coordinates.';

        this.#originColour = this.#tileSet.getPixelAt(x, y);

        if (this.#inside(x, y)) {

            const coords = [{ x, y }];
            while (coords.length > 0) {

                const coord = coords.pop();

                // Fill left of the origin
                let leftX = coord.x;
                while (this.#inside(leftX - 1, coord.y)) {
                    this.#set(leftX - 1, coord.y, fillColour);
                    leftX -= 1;
                }

                // Fill right of the origin
                let rightX = coord.x - 1;
                while (this.#inside(rightX + 1, coord.y)) {
                    this.#set(rightX + 1, coord.y, fillColour);
                    rightX += 1;
                }

                // Now scan the line above and below this one, if any matching pixels 
                // found then add them to the coords list
                this.#scan(leftX, rightX, coord.y + 1, coords);
                this.#scan(leftX, rightX, coord.y - 1, coords);
            }

        }

    }

    /**
     * Performs a scan on a given horizontal line and adds one
     * entry to the coordinate array per uninterrupted line of
     * origin colour. 
     * @param {*} lx 
     * @param {*} rx 
     * @param {*} y 
     * @param {*} s 
     */
    #scan(lx, rx, y, s) {
        let added = false;
        for (let x = lx; x < rx; x++) {
            if (!this.#inside(x, y)) {
                added = false;
            } else if (!added) {
                s.push({ x, y });
                added = true;
            }
        }
    }

    /**
     * If the pixel falls within the constraints of the image and
     * is the same colour as the origin colour then returns true.
     * @param {number} x Image X coordinate.
     * @param {number} y Image Y coordinate.
     * @returns {boolean}
     */
    #inside(x, y) {
        if (x < 0 || x > this.#w) {
            return false;
        } else if (y < 0 || y > this.#h) {
            return false;
        } else if (this.#getColour(x, y) !== this.#originColour) {
            return false;
        }
        return true;
    }

    /**
     * Gets the palette index at the given coordinates.
     * @param {number} x Image X coordinate.
     * @param {number} y Image Y coordinate.
     * @returns {number}
     */
    #getColour(x, y) {
        return this.#tileSet.getPixelAt(x, y);
    }

    #set(x, y, colour) {
        return this.#tileSet.setPixelAt(x, y, colour);
    }

}