import TileSet from "./../models/tileSet.js";
import Palette from "./../models/palette.js";
import ColourUtil from "./../util/colourUtil.js";
import ReferenceImage from "../models/referenceImage.js";

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

    /**
     * Gets or sets whether to draw grid lines for the tiles.
     */
    get showTileGrid() {
        return this.#drawTileGrid;
    }
    set showTileGrid(value) {
        this.#drawTileGrid = value;
    }

    /**
     * Gets or sets whether to draw grid lines for the pixels.
     */
    get showPixelGrid() {
        return this.#drawPixelGrid;
    }
    set showPixelGrid(value) {
        this.#drawPixelGrid = value;
    }

    /**
     * Gets or sets the colour index for transparency, 0 to 15, -1 for none.
     */
    get transparencyIndex() {
        return this.#transparencyIndex;
    }
    set transparencyIndex(value) {
        this.#transparencyIndex = value;
    }

    get offsetX() {
        return this.#offsetX;
    }
    set offsetX(value) {
        this.#offsetX = value;
    }

    get offsetY() {
        return this.#offsetY;
    }
    set offsetY(value) {
        this.#offsetY = value;
    }

    get backgroundColour() {
        return this.#backgroundColour;
    }
    set backgroundColour(value) {
        this.#backgroundColour = value;
    }


    /** @type {HTMLCanvasElement} */
    #baseCanvas;
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
    #transparencyIndex = 15;
    #drawTileGrid = false;
    #drawPixelGrid = false;
    /** @type {ReferenceImage[]} */
    #referenceImages = [];
    /** @type {number[]} */
    #redrawTiles = [];
    #offsetX = 0;
    #offsetY = 0;
    #backgroundColour = '#FFFFFF';


    /**
     * Creates a new instance of the tile canvas.
     * @param {TileSet} [tileSet] Tile set to draw.
     * @param {Palette} [palette] Colour palette to use.
     */
    constructor(tileSet, palette) {
        this.#baseCanvas = document.createElement('canvas');
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
     * Invalidates and forces a redraw of an individual tile on the base image.
     */
    invalidateTile(index) {
        this.#redrawTiles.push(index);
    }


    /**
     * Returns a bitmap that represents the tile set as a PNG data URL.
     */
    toDataURL() {
        const canvas = document.createElement('canvas');
        this.#drawBaseImage(canvas, -1);
        return canvas.toDataURL('image/png');
    }


    /**
     * Sets the reference image.
     * @param {ReferenceImage} referenceImage - Reference image to draw.
     */
    addReferenceImage(referenceImage) {
        if (referenceImage) {
            this.#referenceImages.push(referenceImage);
        }
    }

    clearReferenceImages() {
        this.#referenceImages = [];
    }


    resolveMouseX(canvas, value) {
        if (this.#baseCanvas && this.#baseCanvas.width && this.#baseCanvas.height) {
            const drawX = ((canvas.width - this.#baseCanvas.width) / 2) + this.#offsetX;
            const result = value - drawX;
            if (result >= 0 && result < this.#baseCanvas.width) {
                return result;
            }
        }
        return null;
    }

    resolveMouseY(canvas, value) {
        if (this.#baseCanvas && this.#baseCanvas.width && this.#baseCanvas.height) {
            const drawY = ((canvas.height - this.#baseCanvas.height) / 2) + this.#offsetY;
            const result = value - drawY;
            if (result >= 0 && result < this.#baseCanvas.height) {
                return result;
            }
        }
        return null;
    }


    /**
     * Ensures the tile set image is displayed witin the canvas bounds.
     * @param {HTMLCanvasElement} canvas - The canvas to measure against.
     * @param {number} [padding=0] - Maximum amount that the image is allowed to exceed the canvas bounds.
     */
    clipCanvas(canvas, padding) {
        padding = typeof padding === 'number' ? padding : 0;

        const clipL = 0 - (canvas.width / 2) - (this.#baseCanvas.width / 2) - padding;
        const clipR = 0 + (canvas.width / 2) + (this.#baseCanvas.width / 2) + padding;
        const clipT = 0 - (canvas.height / 2) - (this.#baseCanvas.height / 2) - padding;
        const clipB = 0 + (canvas.height / 2) + (this.#baseCanvas.height / 2) + padding;

        if (this.offsetX < clipL) this.offsetX = clipL;
        if (this.offsetX > clipR) this.offsetX = clipR;
        if (this.offsetY < clipT) this.offsetY = clipT;
        if (this.offsetY > clipB) this.offsetY = clipB;
    }


    /**
     * Refreshes the entire base image.
     */
    #refreshBaseImage() {
        const transColour = this.#referenceImages.filter(r => r.image !== null).length > 0 ? this.#transparencyIndex : -1;
        this.#drawBaseImage(this.#baseCanvas, transColour);
    }

    /**
     * Draws the base image onto a canvas element.
     * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
     * @param {number} transparencyColour - Render this colour as transparent.
     */
    #drawBaseImage(canvas, transparencyColour) {
        if (!this.tileSet) throw new Error('refreshBaseImage: No tile set.');
        if (!this.palette) throw new Error('refreshBaseImage: No palette.');

        const context = canvas.getContext('2d');

        const tiles = Math.max(this.tileSet.tileWidth, 1);
        const rows = Math.ceil(this.tileSet.length / tiles);

        const pxSize = this.scale;

        canvas.width = tiles * 8 * pxSize;
        canvas.height = rows * 8 * pxSize;

        for (let tileIndex = 0; tileIndex < this.tileSet.length; tileIndex++) {
            this.#drawTile(context, tileIndex, transparencyColour);
        }
    }

    /**
     * Refreshes a single tile on the base image.
     */
    #refreshBaseImageTile(tileIndex) {
        const transColour = this.#referenceImages.filter(r => r.image !== null).length > 0 ? this.#transparencyIndex : -1;
        this.#drawBaseImageTile(this.#baseCanvas, tileIndex, transColour);
    }

    /**
     * Updates a single tile on the base image onto a canvas element.
     * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
     * @param {number} tileIndex - Index of the tile to update on the base image.
     * @param {number} transparencyColour - Render this colour as transparent.
     */
    #drawBaseImageTile(canvas, tileIndex, transparencyColour) {
        if (!this.tileSet) throw new Error('refreshBaseImage: No tile set.');
        if (!this.palette) throw new Error('refreshBaseImage: No palette.');

        const context = canvas.getContext('2d');
        this.#drawTile(context, tileIndex, transparencyColour);
    }

    #drawTile(context, tileindex, transparencyColour) {
        const pxSize = this.scale;
        const tile = this.tileSet.getTile(tileindex);
        const tileCount = Math.max(this.tileSet.tileWidth, 1);
        const tileSetCol = tileindex % tileCount;
        const tileSetRow = (tileindex - tileSetCol) / tileCount;

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
                context.fillStyle = hex;
            }

            if (transparencyColour === -1 || pixelPaletteIndex !== transparencyColour) {
                context.moveTo(0, 0);
                context.fillRect(x, y, pxSize, pxSize);
            }
        }
    }

    /**
     * @typedef CanvCoords
     * @property {number} x
     * @property {number} y
     * @property {number} pxX
     * @property {number} pxY
     * @property {number} tileX
     * @property {number} tileY
     * @property {number} pxSize
     * @property {number} drawX
     * @property {number} drawY
     */

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     * @param {HTMLCanvasElement} canvas - Canvas to draw onto.
     * @param {number} mouseX - X position of the cursor on the image.
     * @param {number} mouseY - Y position of the cursor on the image.
     */
    drawUI(canvas, mouseX, mouseY) {
        if (!canvas) throw new Error('drawUI: No canvas.');

        this.clipCanvas(canvas, -10)

        if (this.#needToDrawBase) {
            this.#refreshBaseImage();
            this.#redrawTiles = [];
            this.#needToDrawBase = false;
        }

        while (this.#redrawTiles.length > 0) {
            const tileIndex = this.#redrawTiles.pop();
            this.#refreshBaseImageTile(tileIndex);
        }

        const pxSize = this.scale;

        const baseCanvas = this.#baseCanvas;
        const context = canvas.getContext('2d');

        // Ensure the canvas itself is the correct height
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        let drawX = ((canvas.width - baseCanvas.width) / 2) + this.#offsetX;
        let drawY = ((canvas.height - baseCanvas.height) / 2) + this.#offsetY;

        /** @type {CanvCoords} */
        const coords = {
            x: mouseX, y: mouseY,
            pxX: (mouseX * pxSize),
            pxY: (mouseY * pxSize),
            tileX: (mouseX - (mouseX % 8)) * pxSize,
            tileY: (mouseY - (mouseY % 8)) * pxSize,
            pxSize: pxSize,
            drawX: drawX, drawY: drawY
        }

        context.fillStyle = this.backgroundColour;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the reference image below
        if (this.transparencyIndex >= 0 && this.transparencyIndex < 16) {
            this.#drawReferenceImages(context, coords);
        }

        // Determine the crop of the base image to use
        const baseX = Math.max(0, -drawX);
        const baseY = Math.max(0, -drawY);
        const canvX = Math.max(0, drawX);
        const canvY = Math.max(0, drawY);
        const baseW = Math.min(baseCanvas.width, baseCanvas.width - baseX);
        const baseH = Math.min(baseCanvas.height, baseCanvas.height - baseY);

        // Draw the border around the canvas
        context.lineWidth = 1;
        context.strokeStyle = '#888888';
        context.strokeRect(canvX - 1, canvY - 1, baseW + 2, baseH + 2);
        context.strokeStyle = '#CCCCCC';
        context.strokeRect(canvX - 2, canvY - 2, baseW + 4, baseH + 4);

        // Draw the cached image
        context.drawImage(baseCanvas, baseX, baseY, baseW, baseH, canvX, canvY, baseW, baseH);

        // Reset things
        context.filter = 'none';
        context.moveTo(0, 0);

        // If drawing reference images above
        if (this.transparencyIndex === -1) {
            this.#drawReferenceImages(context, coords);
        }

        // Draw tile grid
        if (this.showTileGrid) {
            context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            context.beginPath();
            for (let x = 0; x <= this.#baseCanvas.width; x += pxSize * 8) {
                context.moveTo(x + drawX, drawY);
                context.lineTo(x + drawX, this.#baseCanvas.height + drawY);
            }
            for (let y = 0; y <= this.#baseCanvas.height; y += pxSize * 8) {
                context.moveTo(0 + drawX, y + drawY);
                context.lineTo(this.#baseCanvas.width + drawX, y + drawY);
            }
            context.closePath();
            context.stroke();
        }

        // Draw pixel grid
        if (this.showPixelGrid && this.scale >= 5) {
            context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            context.beginPath();
            for (let x = 0; x <= this.#baseCanvas.width; x += pxSize) {
                context.moveTo(x + drawX, 0 + drawY);
                context.lineTo(x + drawX, this.#baseCanvas.height + drawY);
            }
            for (let y = 0; y <= this.#baseCanvas.height; y += pxSize) {
                context.moveTo(0 + drawX, y + drawY);
                context.lineTo(this.#baseCanvas.width + drawX, y + drawY);
            }
            context.closePath();
            context.stroke();
        }

        // Highlight the entire tile
        context.strokeStyle = 'yellow';
        context.strokeRect(coords.tileX + drawX, coords.tileY + drawY, (8 * pxSize), (8 * pxSize));

        // Draw the cursor
        context.strokeStyle = 'white';
        this.drawBrushBorder(context, coords, 1);
        context.strokeStyle = 'black';
        this.drawBrushBorder(context, coords, 2);

        // Highlight selected tile
        if (this.selectedTileIndex >= 0 && this.selectedTileIndex < this.tileSet.length) {
            const selCol = this.selectedTileIndex % this.tileSet.tileWidth;
            const selRow = Math.floor(this.selectedTileIndex / this.tileSet.tileWidth);
            const tileX = 8 * selCol * pxSize;
            const tileY = 8 * selRow * pxSize;

            // Highlight the pixel
            context.strokeStyle = 'black';
            context.strokeRect(tileX + drawX, tileY + drawY, (8 * pxSize), (8 * pxSize));
            context.strokeStyle = 'yellow';
            context.setLineDash([2, 2]);
            context.strokeRect(tileX + drawX, tileY + drawY, (8 * pxSize), (8 * pxSize));
            context.setLineDash([]);
        }
    }


    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {CanvCoords} coords 
     */
    #drawReferenceImages(context, coords) {
        const pxSize = coords.pxSize;
        context.globalAlpha = 0.5;
        this.#referenceImages.forEach(ref => {
            if (ref.image) {
                const bounds = ref.getBounds();
                const x = (bounds.x * pxSize) + coords.drawX;
                const y = (bounds.y * pxSize) + coords.drawY;
                context.drawImage(ref.image, x, y, bounds.width * pxSize, bounds.height * pxSize);
            }
        });
        context.globalAlpha = 1;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {CanvCoords} coords 
     * @param {number} drawOffset 
     */
    drawBrushBorder(context, coords, drawOffset) {
        const drawX = coords.drawX, drawY = coords.drawY;
        const offset = drawOffset;
        const pxSize = coords.pxSize;
        const startX = (coords.pxX - (pxSize * Math.floor(this.#cursorSize / 2))) + drawX;
        const startY = coords.pxY - (pxSize * Math.floor(this.#cursorSize / 2)) + drawY;
        if (this.#cursorSize < 4) {
            context.strokeRect(startX - offset, startY - offset, (pxSize * this.#cursorSize) + (offset * 2), (pxSize * this.#cursorSize) + (offset * 2));
        } else {
            context.beginPath();
            /* .       */ context.moveTo(startX - offset, startY + pxSize - offset);
            /* _       */ context.lineTo(startX + pxSize - offset, startY + pxSize - offset);
            /* _|      */ context.lineTo(startX + pxSize - offset, startY - offset);
            /* _|---   */ context.lineTo(startX + (pxSize * this.cursorSize - pxSize) + offset, startY - offset);
            /* _|---|  */ context.lineTo(startX + (pxSize * this.cursorSize - pxSize) + offset, startY + pxSize - offset);
            /* _|---|_ */ context.lineTo(startX + (pxSize * this.cursorSize) + offset, startY + pxSize - offset);
            /* R bdr   */ context.lineTo(startX + (pxSize * this.cursorSize) + offset, startY + (pxSize * this.cursorSize - pxSize) + offset);
            /*       - */ context.lineTo(startX + (pxSize * this.cursorSize - pxSize) + offset, startY + (pxSize * this.cursorSize - pxSize) + offset);
            /*      |- */ context.lineTo(startX + (pxSize * this.cursorSize - pxSize) + offset, startY + (pxSize * this.cursorSize) + offset);
            /*   ___|- */ context.lineTo(startX + pxSize - offset, startY + (pxSize * this.cursorSize) + offset);
            /*  |___|- */ context.lineTo(startX + pxSize - offset, startY + (pxSize * this.cursorSize - pxSize) + offset);
            /* -|___|- */ context.lineTo(startX - offset, startY + (pxSize * this.cursorSize - pxSize) + offset);
            /* L bdr   */ context.lineTo(startX - offset, startY + pxSize - offset);
            context.stroke();
        }
    }


}
