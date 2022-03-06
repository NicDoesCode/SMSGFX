import TileSet from './tileSet.js';
import Palette from './palette.js';

export default class TileCanvas {

    /** @type {HTMLCanvasElement} */
    #canvas;
    /** @type {CanvasRenderingContext2D} */
    #ctx;
    /** @type {image} */
    #lastDrawnTileMapData;

    constructor() {
        this.#canvas = document.createElement('canvas');
        this.#ctx = this.#canvas.getContext('2d');
        this.#lastDrawnTileMapData = null;
    }

    /**
     * Gets the last drawn image data.
     */
    get lastDrawnTileMapData() {
        return this.#lastDrawnTileMapData;
    }

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     * @param {TileSet} tileSet Tile set to draw.
     * @param {Palette} palette Palette to use for colouring.
     * @param {boolean} [forceRedraw=false] Forces the image to be redrawn.
     * @returns {Promise<HTMLImageElement>}
     */
    async drawTileSetAsync(tileSet, palette, forceRedraw) {

        // Load the image async
        return new Promise((resolve, reject) => {

            if (forceRedraw || this.#lastDrawnTileMapData === null) {

                const canvas = this.#canvas;
                const ctx = this.#ctx;

                const tiles = Math.max(tileSet.tileWidth, 1);
                const rows = Math.ceil(tileSet.tileCount / tiles);

                const pxSize = 10;

                canvas.width = tiles * 8 * pxSize;
                canvas.height = rows * 8 * pxSize;

                tileSet.getTiles().forEach((tile, tileSetIndex) => {

                    const tileSetCol = tileSetIndex % tiles;
                    const tileSetRow = (tileSetIndex - tileSetCol) / tiles;

                    for (let tilePx = 0; tilePx < 64; tilePx++) {

                        const tileCol = tilePx % 8;
                        const tileRow = (tilePx - tileCol) / 8;

                        const x = ((tileSetCol * 8) + tileCol) * pxSize;
                        const y = ((tileSetRow * 8) + tileRow) * pxSize;

                        let pixelPaletteIndex = tile.readAt(tilePx);

                        // Set colour
                        if (pixelPaletteIndex >= 0 && pixelPaletteIndex < 16) {
                            ctx.fillStyle = palette.colours[pixelPaletteIndex].hex;
                        } else {
                            ctx.fillStyle = 'yellow';
                        }

                        ctx.moveTo(0, 0);
                        ctx.fillRect(x, y, pxSize, pxSize);
                    }

                });

                const image = new Image(canvas.width, canvas.height);
                image.src = canvas.toDataURL();
                image.onload = () => {
                    this.#lastDrawnTileMapData = image;
                    resolve(image);
                }
                image.onerror = () => {
                    reject();
                }
            } else {
                resolve(this.#lastDrawnTileMapData);
            }
        });


    }

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     * @param {TileSet} tileSet Tile set to draw.
     * @param {Palette} palette Palette to use for colouring.
     * @param {number} palette X position of the mouse on the image.
     * @param {number} palette Y position of the mouse on the image.
     * @param {boolean} [forceRedraw=false] Forces the image to be redrawn.
     * @returns {Promise<HTMLImageElement>}
     */
    async drawUIAsync(tileSet, palette, mouseX, mouseY, forceRedraw) {

        // Ensure we have a drawn tile set
        let baseImage = this.#lastDrawnTileMapData;
        if (forceRedraw) {
            baseImage = await this.drawTileSetAsync(tileSet, palette, true);
        }

        const canvas = this.#canvas;
        const ctx = this.#ctx;

        const pxSize = 10;

        let coords = {
            x: mouseX, y: mouseY,
            pxX: mouseX - (mouseX % pxSize),
            pxY: mouseY - (mouseY % pxSize),
            tileX: mouseX - (mouseX % (8 * pxSize)),
            tileY: mouseY - (mouseY % (8 * pxSize))
        }

        // Draw the cached image
        ctx.drawImage(baseImage, 0, 0);
        ctx.moveTo(0, 0);
        // Highlight the pixel
        ctx.strokeStyle = 'black';
        ctx.strokeRect(coords.pxX, coords.pxY, pxSize, pxSize);
        // Highlight the entire tile
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(coords.tileX, coords.tileY, (8 * pxSize), (8 * pxSize));

        // Load the image async
        return new Promise((resolve, reject) => {
            const image = new Image(baseImage.width, baseImage.height);
            image.src = canvas.toDataURL();
            image.onload = () => {
                resolve(image);
            }
            image.onerror = () => {
                reject();
            }
        });
    }

}