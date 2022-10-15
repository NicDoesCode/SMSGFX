import TileSet from '../models/tileSet.js'

export default class TileSetColourFillUtil {


    /**
     * Fills a contiguious area on a tile set of one colour with another colour.
     * @param {TileSet} tileSet - Tile set to fill.
     * @param {number} x - Origin X coordinate.
     * @param {number} y - Origin Y coordinate.
     * @param {number} fillColour - Palette index to fill with.
     */
    static fill(tileSet, x, y, fillColour) {
        const w = tileSet.tileWidth * 8;
        const h = tileSet.tileHeight * 8;
        if (x < 0 || x >= w || y < 0 || y >= h)
            throw 'Invalid origin coordinates.';

        const f = TileSetColourFillUtil;
        const originColour = tileSet.getPixelAt(x, y);
        const props = { tileSet, w, h, originColour };

        if (f.#inside(x, y, props)) {

            const coords = [{ x, y }];
            while (coords.length > 0) {

                const coord = coords.pop();

                // Fill left of the origin
                let leftX = coord.x;
                while (f.#inside(leftX - 1, coord.y, props)) {
                    f.#set(tileSet, leftX - 1, coord.y, fillColour);
                    leftX -= 1;
                }

                // Fill right of the origin
                let rightX = coord.x - 1;
                while (f.#inside(rightX + 1, coord.y, props)) {
                    f.#set(tileSet, rightX + 1, coord.y, fillColour);
                    rightX += 1;
                }

                // Now scan the line above and below this one, if any matching pixels 
                // found then add them to the coords list
                f.#scan(leftX, rightX, coord.y + 1, coords, props);
                f.#scan(leftX, rightX, coord.y - 1, coords, props);
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
     * @param {FillProps} props - Object containing fill properties.
     */
    static #scan(lx, rx, y, s, props) {
        const f = TileSetColourFillUtil;
        let added = false;
        for (let x = lx; x < rx; x++) {
            if (!f.#inside(x, y, props)) {
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
     * @param {number} x - Image X coordinate.
     * @param {number} y - Image Y coordinate.
     * @param {FillProps} props - Object containing fill properties.
     * @returns {boolean}
     */
    static #inside(x, y, props) {
        if (x < 0 || x >= props.w) {
            return false;
        } else if (y < 0 || y >= props.h) {
            return false;
        } else if (props.tileSet.getPixelAt(x, y) !== props.originColour) {
            return false;
        }
        return true;
    }

    /**
     * If the pixel falls within the constraints of the image and
     * is the same colour as the origin colour then returns true.
     * @param {TileSet} tileSet - Tile set to fill.
     * @param {number} x - Image X coordinate.
     * @param {number} y - Image Y coordinate.
     * @param {number} colour - Palette index to set.
     * @returns {boolean}
     */
    static #set(tileSet, x, y, colour) {
        tileSet.setPixelAt(x, y, colour);
    }


}

/** 
 * @typedef FillProps
 * @type {object}
 * @property {TileSet} tileSet - Tile set to fill.
 * @property {number} w - Tile set image width.
 * @property {number} h - Tile set image height.
 * @property {number} x - Image X coordinate.
 * @property {number} y - Image Y coordinate.
 * @property {number} originColour - Original colour of the pixel that the fill operation started from.
 */