import Tile from "./../models/tile.js";
import Palette from "./../models/palette.js";
import PaintUtil from "./../util/paintUtil.js";
import TileSet from "../models/tileSet.js";


/**
 * Acts as a shared tile image cache.
 */
export default class TileImageManager {


    /** @type {Object.<string, Object<string, Object<string, ImageBitmap>>>} */
    #bitmapCache = {};
    /** @type {OffscreenCanvas} */
    #tileCanvas;


    /**
     * Constructor for the class.
     */
    constructor() {
        this.#tileCanvas = new OffscreenCanvas(8, 8);
    }


    /**
     * Creates pre cached versions of tile images.
     * @param {Tile[]|TileSet} tiles - Tile set or array of tiles to pre cache images for.
     * @param {Palette} palette - Colour palette to use.
     * @param {number[]} transparencyIndicies - Palette indicies to render as transparent.
     */
    async batchCacheTileImagesAsync(tiles, palette, transparencyIndicies) {
        const queueSize = 8;

        // Create an array of canvases to do the processing 
        const canvases = new Array(queueSize);
        for (let t = 0; t < queueSize; t++) {
            canvases[t] = new OffscreenCanvas(8, 8);
        }

        // Create batches of tiles to process
        /** @type {Tile[][]} */
        const tileArray = tiles instanceof TileSet ? tiles.getTiles().slice() : Array.isArray(tiles) ? tiles.slice() : null;
        const tileBatches = new Array(queueSize);
        for (let t = 0; t < tileArray.length; t++) {
            const tile = tileArray[t];
            const chunk = t % queueSize;
            if (!tileBatches[chunk]) tileBatches[chunk] = [];
            tileBatches[chunk].push(tile);
        }

        // Create an array of promises that will process the tile images
        const workerQueue = tileBatches.map((chunk, chunkIndex) => new Promise((resolve, reject) => {
            const canvas = canvases[chunkIndex];
            chunk.forEach((tile) => {
                this.#createTileImageBitmap(canvas, tile, palette, transparencyIndicies);
            });
            resolve();
        }));
        await Promise.all(workerQueue);
    }

    /**
     * Create the image for the tile.
     * @param {OffscreenCanvas|HTMLCanvasElement} canvas - Canvas to use to do the rendering.
     * @param {Tile} tile - Tile that we get the image for.
     * @param {Palette} palette - Colour palette to use.
     * @param {number[]} transparencyIndicies - Palette indicies to render as transparent.
     * @returns {ImageBitmap}
     */
    #createTileImageBitmap(canvas, tile, palette, transparencyIndicies) {
        let tileSlot = this.#bitmapCache[tile.tileId];
        if (!tileSlot) {
            tileSlot = {};
            this.#bitmapCache[tile.tileId] = tileSlot;
        }

        let paletteSlot = tileSlot[palette.paletteId];
        if (!paletteSlot) {
            paletteSlot = {};
            tileSlot[palette.paletteId] = paletteSlot;
        }

        let transparencyId = `[${transparencyIndicies.join(',')}]`;
        let transparencySlot = paletteSlot[transparencyId]
        if (!transparencySlot) {
            PaintUtil.drawTileImageOntoCanvas(canvas, tile, palette, transparencyIndicies);
            transparencySlot = canvas.transferToImageBitmap();
            paletteSlot[transparencyId] = transparencySlot;
        }

        return transparencySlot;
    }

    /**
     * Gets the image for the tile.
     * @param {Tile} tile - Tile that we get the image for.
     * @param {Palette} palette - Colour palette to use.
     * @param {number[]} transparencyIndicies - Palette indicies to render as transparent.
     * @returns {ImageBitmap}
     */
    getTileImageBitmap(tile, palette, transparencyIndicies) {
        return this.#createTileImageBitmap(this.#tileCanvas, tile, palette, transparencyIndicies);
    }


    /**
     * Clears all cached tile images.
     */
    clear() {
        const keys = Object.keys(this.#bitmapCache);
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
            if (this.#bitmapCache[value]) {
                delete this.#bitmapCache[value];
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
            Object.keys(this.#bitmapCache).forEach((tileId) => {
                if (this.#bitmapCache[tileId][value]) {
                    delete this.#bitmapCache[tileId][value];
                }
            });
        }
    }


}
