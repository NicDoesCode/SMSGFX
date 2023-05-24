import TileSet from "./../models/tileSet.js";
import Palette from "./../models/palette.js";
import PaletteList from "./../models/paletteList.js";
import ColourUtil from "./../util/colourUtil.js";
import ReferenceImage from "../models/referenceImage.js";
import TileGridProvider from "../models/tileGridProvider.js";

const highlightModes = {
    pixel: 'pixel',
    tile: 'tile',
    row: 'row',
    column: 'column',
    rowIndex: 'rowIndex',
    columnIndex: 'columnIndex'
}

export default class CanvasManager {


    /**
     * Enumerates all of the possible highlight modes for the canvas manager.
     */
    static get highlightModes() {
        return highlightModes;
    }


    /**
     * Gets whether the canvas manager can draw an image (has a tile set and palette).
     */
    get canDraw() {
        return this.tileSet && this.tileGrid && this.paletteList && this.paletteList.length > 0;
    }

    /**
     * Gets or sets the highlighting mode for the canvas manager.
     */
    get highlightMode() {
        return this.#highlightMode;
    }
    set highlightMode(value) {
        if (!value || value === null) {
            this.#highlightMode = CanvasManager.highlightModes.pixel;
        } else if (Object.keys(CanvasManager.highlightModes).includes(value)) {
            this.#highlightMode = value;
        } else {
            throw new Error('Unknown highlight mode.');
        }
    }

    /**
     * Gets or sets the tile grid to draw.
     */
    get tileGrid() {
        return this.#tileGrid;
    }
    set tileGrid(value) {
        this.invalidateImage()
        this.#tileGrid = value;
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
     * Gets or sets the colour palette list to use.
     */
    get paletteList() {
        return this.#paletteList;
    }
    set paletteList(value) {
        this.invalidateImage();
        this.#paletteList = value;
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
            if (this.tileGrid && this.tileGrid.tileCount > 0 && value >= 0 && value < this.tileGrid.tileCount) {
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

    get pixelGridColour() {
        return this.#pixelGridColour;
    }
    set pixelGridColour(value) {
        this.#pixelGridColour = value;
    }

    get pixelGridOpacity() {
        return this.#pixelGridOpacity;
    }
    set pixelGridOpacity(value) {
        this.#pixelGridOpacity = value;
    }

    get tileGridColour() {
        return this.#tileGridColour;
    }
    set tileGridColour(value) {
        this.#tileGridColour = value;
    }

    get tileGridOpacity() {
        return this.#tileGridOpacity;
    }
    set tileGridOpacity(value) {
        this.#tileGridOpacity = value;
    }


    /** @type {HTMLCanvasElement} */
    #tileCanvas;
    /** @type {boolean} */
    #needToDrawTileImage = true;
    /** @type {TileGridProvider} */
    #tileGrid = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {PaletteList} */
    #paletteList = null;
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
    #pixelGridColour = '#FFFFFF';
    #pixelGridOpacity = 0.2;
    #tileGridColour = '#000000';
    #tileGridOpacity = 0.4;
    #highlightMode = CanvasManager.highlightModes.pixel;


    /**
     * Creates a new instance of the tile canvas.
     * @param {TileGridProvider} [tileGrid] - Object that contains the tile grid to render.
     * @param {TileSet} [tileSet] - Tile set that is the source of tiles.
     * @param {PaletteList} [paletteList] - Colour palette list to use.
     */
    constructor(tileGrid, tileSet, paletteList) {
        this.#tileCanvas = document.createElement('canvas');
        if (tileGrid) this.#tileGrid = tileGrid;
        if (tileSet) this.#tileSet = tileSet;
        if (paletteList) this.#paletteList = paletteList;
    }


    /**
     * Invalidates the tile set image and forces a redraw.
     */
    invalidateImage() {
        this.#needToDrawTileImage = true;
    }

    /**
     * Invalidates and forces a redraw of an individual tile on the tile set image.
     */
    invalidateTile(index) {
        this.#redrawTiles.push(index);
    }


    /**
     * Returns a bitmap that represents the tile set as a PNG data URL.
     */
    toDataURL() {
        const canvas = document.createElement('canvas');
        this.#drawTileImage(canvas, -1);
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
        if (this.#tileCanvas && this.#tileCanvas.width && this.#tileCanvas.height) {
            const drawX = ((canvas.width - this.#tileCanvas.width) / 2) + this.#offsetX;
            const result = value - drawX;
            if (result >= 0 && result < this.#tileCanvas.width) {
                return result;
            }
        }
        return null;
    }

    resolveMouseY(canvas, value) {
        if (this.#tileCanvas && this.#tileCanvas.width && this.#tileCanvas.height) {
            const drawY = ((canvas.height - this.#tileCanvas.height) / 2) + this.#offsetY;
            const result = value - drawY;
            if (result >= 0 && result < this.#tileCanvas.height) {
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

        const clipL = 0 - (canvas.width / 2) - (this.#tileCanvas.width / 2) - padding;
        const clipR = 0 + (canvas.width / 2) + (this.#tileCanvas.width / 2) + padding;
        const clipT = 0 - (canvas.height / 2) - (this.#tileCanvas.height / 2) - padding;
        const clipB = 0 + (canvas.height / 2) + (this.#tileCanvas.height / 2) + padding;

        if (this.offsetX < clipL) this.offsetX = clipL;
        if (this.offsetX > clipR) this.offsetX = clipR;
        if (this.offsetY < clipT) this.offsetY = clipT;
        if (this.offsetY > clipB) this.offsetY = clipB;
    }


    /**
     * Refreshes the entire tile image.
     */
    #refreshTileImage() {
        const transColour = this.#referenceImages.filter(r => r.image !== null).length > 0 ? this.#transparencyIndex : -1;
        this.#drawTileImage(this.#tileCanvas, transColour);
    }

    /**
     * Draws the tile image onto a canvas element.
     * @param {HTMLCanvasElement} tileCanvas - Canvas element to draw onto.
     * @param {number} transparencyColour - Render this colour as transparent.
     */
    #drawTileImage(tileCanvas, transparencyColour) {
        if (!this.tileGrid) throw new Error('drawTileImage: No tile grid.');
        if (!this.tileSet) throw new Error('drawTileImage: No tile set.');
        if (!this.paletteList) throw new Error('drawTileImage: No palette list.');

        const context = tileCanvas.getContext('2d');

        const tiles = Math.max(this.tileGrid.columnCount, 1);
        const rows = Math.ceil(this.tileGrid.tileCount / tiles);

        const pxSize = this.scale;

        tileCanvas.width = tiles * 8 * pxSize;
        tileCanvas.height = rows * 8 * pxSize;

        for (let tileIndex = 0; tileIndex < this.tileGrid.tileCount; tileIndex++) {
            this.#drawTile(context, tileIndex, transparencyColour);
        }
    }

    /**
     * Refreshes a single tile on the tile image.
     */
    #refreshSingleTile(tileIndex) {
        const transColour = this.#referenceImages.filter(r => r.image !== null).length > 0 ? this.#transparencyIndex : -1;
        this.#drawIndividualTile(this.#tileCanvas, tileIndex, transColour);
    }

    /**
     * Updates a single tile on the main tile canvas.
     * @param {HTMLCanvasElement} canvas - Canvas element to draw onto.
     * @param {number} tileIndex - Index of the tile to update on the tile image.
     * @param {number} transparencyColour - Render this colour as transparent.
     */
    #drawIndividualTile(canvas, tileIndex, transparencyColour) {
        if (!this.tileGrid) throw new Error('drawTileImage: No tile grid.');
        if (!this.tileSet) throw new Error('drawTileImage: No tile set.');
        if (!this.paletteList) throw new Error('drawTileImage: No palette list.');

        const context = canvas.getContext('2d');
        this.#drawTile(context, tileIndex, transparencyColour);
    }

    #drawTile(context, tileindex, transparencyColour) {
        const pxSize = this.scale;
        const tileInfo = this.tileGrid.getTileInfoByIndex(tileindex);
        const tile = this.tileSet.getTileById(tileInfo.tileId);
        const tileWidth = Math.max(this.tileGrid.columnCount, 1);
        const tileGridCol = tileindex % tileWidth;
        const tileGridRow = (tileindex - tileGridCol) / tileWidth;
        const palette = this.paletteList.getPalette(tileInfo.paletteIndex);
        const numColours = palette.getColours().length;

        for (let tilePx = 0; tilePx < 64; tilePx++) {

            const tileCol = tilePx % 8;
            const tileRow = (tilePx - tileCol) / 8;

            const x = ((tileGridCol * 8) + tileCol) * pxSize;
            const y = ((tileGridRow * 8) + tileRow) * pxSize;

            let pixelPaletteIndex = tile.readAt(tilePx);

            // Set colour
            if (pixelPaletteIndex >= 0 && pixelPaletteIndex < numColours) {
                const colour = palette.getColour(pixelPaletteIndex);
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

        const tileCanvas = this.#tileCanvas;
        const context = canvas.getContext('2d');

        // Ensure the canvas itself is the correct height
        const rect = canvas.parentElement.getBoundingClientRect();
        // const lastRect = canvas.getBoundingClientRect();
        canvas.width = rect.width - 15;
        canvas.height = rect.height - 10;
        // const thisRect = canvas.getBoundingClientRect();
        // if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        //     // // TODO
        //     // const lastHeight = canvas.clientHeight;
        //     // const lwstWidth = canvas.clientHeight;
        //     // // canvas.style.boxSizing = 'border-box';
        //     // canvas.width = canvas.clientWidth;
        //     // canvas.height -= canvas.clientHeight - lastHeight;
        //     // canvas.height = canvas.clientHeight;
        //     // canvas.height = canvas.clientHeight - 7;
        //     // canvas.height -= canvas.clientHeight - lastHeight;
        //     // console.log(canvas.clientHeight - lastHeight);
        //     // const parent = canvas.parentElement;
        //     // const parentRect = parent.getBoundingClientRect();
        //     // canvas.width = parentRect.width;
        //     // canvas.height = parentRect.height;
        // }

        // Fill canvas background
        context.fillStyle = this.backgroundColour;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Leave if no tile set or tile grid
        if (!this.tileSet || !this.tileGrid) return;

        // Otherwise continue drawing
        const pxSize = this.scale;

        this.clipCanvas(canvas, -10)

        if (this.#needToDrawTileImage) {
            this.#refreshTileImage();
            this.#redrawTiles = [];
            this.#needToDrawTileImage = false;
        }

        while (this.#redrawTiles.length > 0) {
            const tileIndex = this.#redrawTiles.pop();
            this.#refreshSingleTile(tileIndex);
        }

        let drawX = ((canvas.width - tileCanvas.width) / 2) + this.#offsetX;
        let drawY = ((canvas.height - tileCanvas.height) / 2) + this.#offsetY;

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

        // Draw the reference image below
        if (this.transparencyIndex >= 0 && this.transparencyIndex < 16) {
            this.#drawReferenceImages(context, coords);
        }

        // Determine the crop of the base image to use
        const baseX = Math.max(0, -drawX);
        const baseY = Math.max(0, -drawY);
        const canvX = Math.max(0, drawX);
        const canvY = Math.max(0, drawY);
        const baseW = Math.min(tileCanvas.width, tileCanvas.width - baseX);
        const baseH = Math.min(tileCanvas.height, tileCanvas.height - baseY);

        // Draw the border around the canvas
        context.lineWidth = 1;
        context.strokeStyle = '#888888';
        context.strokeRect(canvX - 1, canvY - 1, baseW + 2, baseH + 2);
        context.strokeStyle = '#CCCCCC';
        context.strokeRect(canvX - 2, canvY - 2, baseW + 4, baseH + 4);

        // Draw the cached image
        context.drawImage(tileCanvas, baseX, baseY, baseW, baseH, canvX, canvY, baseW, baseH);

        // Reset things
        context.filter = 'none';
        context.moveTo(0, 0);

        // If drawing reference images above
        if (this.transparencyIndex === -1) {
            this.#drawReferenceImages(context, coords);
        }

        // Draw tile grid
        if (this.showTileGrid) {
            const tileGridColour = ColourUtil.rgbFromHex(this.tileGridColour);
            context.strokeStyle = `rgba(${tileGridColour.r}, ${tileGridColour.g}, ${tileGridColour.b}, ${this.tileGridOpacity})`;
            context.beginPath();
            for (let x = 0; x <= this.#tileCanvas.width; x += pxSize * 8) {
                context.moveTo(x + drawX, drawY);
                context.lineTo(x + drawX, this.#tileCanvas.height + drawY);
            }
            for (let y = 0; y <= this.#tileCanvas.height; y += pxSize * 8) {
                context.moveTo(0 + drawX, y + drawY);
                context.lineTo(this.#tileCanvas.width + drawX, y + drawY);
            }
            context.closePath();
            context.stroke();
        }

        // Draw pixel grid
        if (this.showPixelGrid && this.scale >= 5) {
            const pixelGridColour = ColourUtil.rgbFromHex(this.pixelGridColour);
            context.strokeStyle = `rgba(${pixelGridColour.r}, ${pixelGridColour.g}, ${pixelGridColour.b}, ${this.pixelGridOpacity})`;
            context.beginPath();
            for (let x = 0; x <= this.#tileCanvas.width; x += pxSize) {
                context.moveTo(x + drawX, 0 + drawY);
                context.lineTo(x + drawX, this.#tileCanvas.height + drawY);
            }
            for (let y = 0; y <= this.#tileCanvas.height; y += pxSize) {
                context.moveTo(0 + drawX, y + drawY);
                context.lineTo(this.#tileCanvas.width + drawX, y + drawY);
            }
            context.closePath();
            context.stroke();
        }

        // Highlight mode is pixel
        if (this.highlightMode === CanvasManager.highlightModes.pixel) {
            // Highlight the tile
            context.strokeStyle = 'yellow';
            context.strokeRect(coords.tileX + drawX, coords.tileY + drawY, (8 * pxSize), (8 * pxSize));

            // Draw the cursor
            context.strokeStyle = 'white';
            this.drawBrushBorder(context, coords, 1);
            context.strokeStyle = 'black';
            this.drawBrushBorder(context, coords, 2);
        }

        // Highlight mode is entire tile
        if (this.#highlightMode === CanvasManager.highlightModes.tile) {
            context.strokeStyle = 'white';
            context.strokeRect(coords.tileX + drawX, coords.tileY + drawY, (8 * pxSize), (8 * pxSize));
            context.strokeStyle = 'black';
            context.strokeRect(coords.tileX + drawX - 1, coords.tileY + drawY - 1, (8 * pxSize) + 2, (8 * pxSize) + 2);
        }

        // Highlight mode is entire row
        if (this.#highlightMode === CanvasManager.highlightModes.row) {
            const rowWidth = this.tileGrid.columnCount * (8 * pxSize);
            const tileY = coords.tileY;
            context.filter = 'opacity(0.25)';
            context.fillStyle = 'yellow';
            context.fillRect(0 + drawX, tileY + drawY, rowWidth, (8 * pxSize));
            context.filter = 'none';
            context.strokeStyle = 'black';
            context.strokeRect(0 + drawX, tileY + drawY, rowWidth, (8 * pxSize));
            context.strokeStyle = 'white';
            context.strokeRect(1 + drawX, tileY + drawY + 1, rowWidth - 2, (8 * pxSize) - 2);
        }

        // Highlight mode is entire column
        if (this.#highlightMode === CanvasManager.highlightModes.column) {
            const columnHeight = this.tileGrid.rowCount * (8 * pxSize);
            const tileX = coords.tileX;
            context.filter = 'opacity(0.25)';
            context.fillStyle = 'yellow';
            context.fillRect(tileX + drawX, 0 + drawY, (8 * pxSize), columnHeight);
            context.filter = 'none';
            context.strokeStyle = 'black';
            context.strokeRect(tileX + drawX, 0 + drawY, (8 * pxSize), columnHeight);
            context.strokeStyle = 'white';
            context.strokeRect(tileX + drawX + 1, 1 + drawY, (8 * pxSize) - 2, columnHeight - 2);
        }

        // Highlight mode is row index
        if (this.#highlightMode === CanvasManager.highlightModes.rowIndex) {
            const rowWidth = this.tileGrid.columnCount * (8 * pxSize);
            const imgY = coords.y;
            const tileRowIndex = Math.round(imgY / 8);
            const rowY = tileRowIndex * (pxSize * 8);
            context.filter = 'opacity(0.25)';
            context.fillStyle = 'yellow';
            context.fillRect(0 + drawX, (rowY - (pxSize * 2)) + drawY, rowWidth, (4 * pxSize));
            context.filter = 'none';
            context.strokeStyle = 'black';
            context.strokeRect(0 + drawX, rowY + drawY - 1, rowWidth, 2);
            context.strokeStyle = 'white';
            context.strokeRect(1 + drawX, rowY + drawY, rowWidth - 2, 1);
        }

        // Highlight mode is column index
        if (this.#highlightMode === CanvasManager.highlightModes.columnIndex) {
            const columnHeight = this.tileGrid.rowCount * (8 * pxSize);
            const imgX = coords.x;
            const tileColumnIndex = Math.round(imgX / 8);
            const rowX = tileColumnIndex * (pxSize * 8);
            context.filter = 'opacity(0.25)';
            context.fillStyle = 'yellow';
            context.fillRect((rowX - (pxSize * 2)) + drawX, 0 + drawY, (4 * pxSize), columnHeight);
            context.filter = 'none';
            context.strokeStyle = 'black';
            context.strokeRect(rowX + drawX - 1, 0 + drawY, 2, columnHeight);
            context.strokeStyle = 'white';
            context.strokeRect(rowX + drawX, 1 + drawY, 1, columnHeight - 2);
        }

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
