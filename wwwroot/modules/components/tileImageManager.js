import Tile from "./../models/tile.js";
import Palette from "./../models/palette.js";
import PaintUtil from "./../util/paintUtil.js";


/**
 * Acts as a shared tile image cache.
 */
export default class TileImageManager {


    /** @type {Object.<string, Object<string, Object<string, HTMLCanvasElement>>>} */
    #tileCanvases = {};


    /**
     * Constructor for the class.
     */
    constructor() {
    }


    /**
     * Gets the image for the tile.
     * @param {Tile} tile - Tile that we get the image for.
     * @param {Palette} palette - Colour palette to use.
     * @param {number[]} transparencyIndicies - Palette indicies to render as transparent.
     * @returns {HTMLCanvasElement}
     */
    getTileImage(tile, palette, transparencyIndicies) {
        let tileRec = this.#tileCanvases[tile.tileId];
        if (!tileRec) {
            tileRec = {};
            this.#tileCanvases[tile.tileId] = tileRec;
        }

        let paletteRec = tileRec[palette.paletteId];
        if (!paletteRec) {
            paletteRec = {};
            this.#tileCanvases[tile.tileId][palette.paletteId] = paletteRec;
        }

        let transId = `${transparencyIndicies.join('|')}`;
        let transRec = paletteRec[transId]
        if (!transRec) {
            transRec = PaintUtil.createTileCanvas(tile, palette, transparencyIndicies);
            this.#tileCanvases[tile.tileId][palette.paletteId][transId] = transRec;
        }

        return transRec;
    }


    /**
     * Clears all cached tile images.
     */
    clear() {
        const keys = Object.keys(this.#tileCanvases);
        keys.forEach((tileId) => this.clearByTile(tileId));
    }

    /**
     * Clears cached tile images for a particular tile. 
     * @param {string|string[]} value - Array or single unique ID of the tile whose cached images are to be discarded.
     */
    clearByTile(value) {
        if (!value) return;
        if (Array.isArray(value)) {
            value.forEach((tileId) => this.clearByTile(tileId));
        } else if (value && typeof value === 'string' && value.length > 0) {
            if (this.#tileCanvases[value]) {
                delete this.#tileCanvases[value];
            }
        }
    }

    /**
     * Clears cached tile images for a particular palette. 
     * @param {string|string[]} value - Array or single unique ID of the palette whose cached images are to be discarded.
     */
    clearByPalette(value) {
        if (!value) return;
        if (Array.isArray(value)) {
            value.forEach((paletteId) => this.clearByPalette(paletteId));
        } else if (value && typeof value === 'string' && value.length > 0) {
            Object.keys(this.#tileCanvases).forEach((tileId) => {
                if (this.#tileCanvases[tileId][value]) {
                    delete this.#tileCanvases[tileId][value];
                }
            });
        }
    }


}