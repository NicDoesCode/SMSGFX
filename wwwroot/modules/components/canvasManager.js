import TileSet from "./../models/tileSet.js";
import Palette from "./../models/palette.js";
import ColourUtil from "./../util/colourUtil.js";

export default class CanvasManager {


    /**
     * Gets whether the canvas manager can draw an image (has a tile set and palette).
     */
    get canDraw() {
        return this.tileSet && this.palette;
    }

    /**
     * Gets or sets the tile set to draw.
     */
    get tileSet() {
        return this.#tileSet;
    }
    set tileSet(value) {
        this.invalidateImage()
        this.#tileSet = value;
    }

    /**
     * Gets or sets the colour palette to use.
     */
    get palette() {
        return this.#palette;
    }
    set palette(value) {
        this.invalidateImage();
        this.#palette = value;
    }

    /**
     * Gets or sets the image drawing scale between 1 and 50 (1:1 and 50:1).
     */
    get scale() {
        return this.#scale;
    }
    set scale(value) {
        if (value < 1 || value > 50) throw new Error('Scale factor must be between 1 and 50.');
        const newScale = Math.round(value);
        if (newScale !== this.#scale) {
            this.invalidateImage();
            this.#scale = Math.round(value);
        }
    }

    /**
     * Gets or sets the selected index of a tile, -1 means no selection.
     */
    get selectedTileIndex() {
        return this.#selectedTileIndex;
    }
    set selectedTileIndex(value) {
        if (value != this.#selectedTileIndex) {
            if (this.#tileSet && this.tileSet.length > 0 && value >= 0 && value < this.tileSet.length) {
                this.#selectedTileIndex = value;

            } else {
                this.#selectedTileIndex = -1;
            }
        }
    }

    /**
     * Gets or sets the cursor size between 1 and 50 tiles.
     */
    get cursorSize() {
        return this.#cursorSize;
    }
    set cursorSize(value) {
        if (value < 1 || value > 50) throw new Error('Cursor size must be between 1 and 50.');
        this.#cursorSize = value;
    }


    /** @type {HTMLCanvasElement} */
    #baseCanvas;
    /** @type {CanvasRenderingContext2D} */
    #baseCtx;
    /** @type {boolean} */
    #needToDrawBase = true;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {Palette} */
    #palette = null;
    /** @type {number} */
    #scale = 10;
    /** @type {number} */
    #selectedTileIndex = -1;
    #cursorSize = 1;


    /**
     * Creates a new instance of the tile canvas.
     * @param {TileSet} [tileSet] Tile set to draw.
     * @param {Palette} [palette] Colour palette to use.
     */
    constructor(tileSet, palette) {
        this.#baseCanvas = document.createElement('canvas');
        this.#baseCtx = this.#baseCanvas.getContext('2d');
        if (tileSet) this.#tileSet = tileSet;
        if (palette) this.#palette = palette;
    }


    /**
     * Invalidates the tile set image and forces a redraw.
     */
    invalidateImage() {
        this.#needToDrawBase = true;
    }

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     */
    #refreshBaseImage() {

        if (!this.tileSet) throw new Error('refreshBaseImage: No tile set.');
        if (!this.tileSet) throw new Error('refreshBaseImage: No palette.');

        const canvas = this.#baseCanvas;
        const ctx = this.#baseCtx;

        const tiles = Math.max(this.tileSet.tileWidth, 1);
        const rows = Math.ceil(this.tileSet.length / tiles);

        const pxSize = this.scale;

        canvas.width = tiles * 8 * pxSize;
        canvas.height = rows * 8 * pxSize;

        this.tileSet.getTiles().forEach((tile, tileSetIndex) => {

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
                    const colour = this.palette.getColour(pixelPaletteIndex);
                    const hex = ColourUtil.toHex(colour.r, colour.g, colour.b);
                    ctx.fillStyle = hex;
                } else {
                    ctx.fillStyle = 'yellow';
                }

                ctx.moveTo(0, 0);
                ctx.fillRect(x, y, pxSize, pxSize);
            }

        });
    }

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     * @param {HTMLCanvasElement} canvas - Canvas to draw onto.
     * @param {number} mouseX - X position of the cursor on the image.
     * @param {number} mouseY - Y position of the cursor on the image.
     */
    drawUI(canvas, mouseX, mouseY) {
        if (!canvas) throw new Error('drawUI: No canvas.');

        if (this.#needToDrawBase) {
            this.#refreshBaseImage();
        }

        const pxSize = this.scale;

        const coords = {
            x: mouseX, y: mouseY,
            pxX: mouseX * pxSize,
            pxY: mouseY * pxSize,
            tileX: (mouseX - (mouseX % 8)) * pxSize,
            tileY: (mouseY - (mouseY % 8)) * pxSize
        }

        const baseCanvas = this.#baseCanvas;
        const ctx = canvas.getContext('2d');

        // Equalise width and height
        canvas.width = baseCanvas.width;
        canvas.height = baseCanvas.height;

        // Draw the cached image
        ctx.drawImage(baseCanvas, 0, 0);
        ctx.moveTo(0, 0);

        // Highlight the entire tile
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(coords.tileX, coords.tileY, (8 * pxSize), (8 * pxSize));

        // Draw the cursor
        ctx.strokeStyle = 'black';
        const startX = coords.pxX - (pxSize * Math.floor(this.#cursorSize / 2));
        const startY = coords.pxY - (pxSize * Math.floor(this.#cursorSize / 2));
        if (this.#cursorSize < 4) {
            ctx.strokeRect(startX, startY, pxSize * this.#cursorSize, pxSize * this.#cursorSize);
        } else {
            ctx.beginPath();
            ctx.moveTo(startX, startY + pxSize);                                  // .
            ctx.lineTo(startX + pxSize, startY + pxSize);                         // _
            ctx.lineTo(startX + pxSize, startY);                                  // _|
            ctx.lineTo(startX + (pxSize * this.cursorSize - pxSize), startY);          // _|---
            ctx.lineTo(startX + (pxSize * this.cursorSize - pxSize), startY + pxSize); // _|---|
            ctx.lineTo(startX + (pxSize * this.cursorSize), startY + pxSize);     // _|---|_
            ctx.lineTo(startX + (pxSize * this.cursorSize), startY + (pxSize * this.cursorSize - pxSize)); // Right border
            ctx.lineTo(startX + (pxSize * this.cursorSize - pxSize), startY + (pxSize * this.cursorSize - pxSize)); //        -
            ctx.lineTo(startX + (pxSize * this.cursorSize - pxSize), startY + (pxSize * this.cursorSize));     //       |-
            ctx.lineTo(startX + pxSize, startY + (pxSize * this.cursorSize));                             //    ___|-
            ctx.lineTo(startX + pxSize, startY + (pxSize * this.cursorSize - pxSize));                         //   |___|-
            ctx.lineTo(startX, startY + (pxSize * this.cursorSize - pxSize));                                  //  -|___|-
            ctx.lineTo(startX, startY + pxSize); // Left border
            ctx.stroke();
        }

        // Highlight selected tile
        if (this.selectedTileIndex >= 0 && this.selectedTileIndex < this.tileSet.length) {
            const selCol = this.selectedTileIndex % this.tileSet.tileWidth;
            const selRow = Math.floor(this.selectedTileIndex / this.tileSet.tileWidth);
            const tileX = 8 * selCol * pxSize;
            const tileY = 8 * selRow * pxSize;

            // Highlight the pixel
            ctx.strokeStyle = 'black';
            ctx.strokeRect(tileX, tileY, (8 * pxSize), (8 * pxSize));
            ctx.strokeStyle = 'yellow';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(tileX, tileY, (8 * pxSize), (8 * pxSize));
            ctx.setLineDash([]);
        }
    }


}