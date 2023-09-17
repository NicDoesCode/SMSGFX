import TileSet from "./../models/tileSet.js";
import PaletteList from "./../models/paletteList.js";
import ColourUtil from "./../util/colourUtil.js";
import ReferenceImage from "../models/referenceImage.js";
import TileGridProvider from "../models/tileGridProvider.js";
import Tile from "../models/tile.js";
import TileMap from "../models/tileMap.js";
import TileMapFactory from "../factory/tileMapFactory.js";
import PaletteListFactory from "../factory/paletteListFactory.js";
import PaintUtil from "../util/paintUtil.js";


const highlightModes = {
    pixel: 'pixel',
    tile: 'tile',
    tileBlock: 'tileBlock',
    row: 'row',
    column: 'column',
    rowBlock: 'rowBlock',
    columnBlock: 'columnBlock',
    rowIndex: 'rowIndex',
    columnIndex: 'columnIndex',
    rowBlockIndex: 'rowBlockIndex',
    columnBlockIndex: 'columnBlockIndex'
}

const referenceImageDrawMode = {
    overIndex: 'overIndex',
    overlay: 'overlay',
    underlay: 'underlay'
};


/**
 * The CanvasManager class renders a tile grid onto a HTMLCanvasElement, as well as other features
 * such as the tile / pixel grid, the cursor, etc.
 */
export default class CanvasManager {


    /**
     * Enumerates highlight modes.
     */
    static get HighlightModes() {
        return highlightModes;
    }

    /**
     * Enumerates draw modes reference images.
     */
    static get ReferenceImageDrawMode() {
        return referenceImageDrawMode;
    }


    /**
     * Gets whether the canvas manager can draw an image (has a tile set and palette).
     */
    get canDraw() {
        return this.tileSet && this.tileGrid && this.paletteList && this.paletteList.length > 0;
    }

    /**
     * Gets or sets how the canvas highlights what is under the mouse cursor (pixel, row, column, etc).
     */
    get highlightMode() {
        return this.#highlightMode;
    }
    set highlightMode(value) {
        if (!value || value === null) {
            this.#highlightMode = CanvasManager.HighlightModes.pixel;
        } else if (Object.keys(CanvasManager.HighlightModes).includes(value)) {
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
        if (this.#tileGrid !== value) {
            this.invalidateImage()
            this.#tileGrid = value;
        }
    }

    /**
     * Gets or sets the tile set to draw.
     */
    get tileSet() {
        return this.#tileSet;
    }
    set tileSet(value) {
        if (this.#tileSet !== value) {
            this.invalidateImage()
            this.#tileSet = value;
        }
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
        this.#renderPaletteList = null;
    }

    /**
     * Gets or sets the image drawing scale between 1 and 100 (1:1 and 100:1).
     */
    get scale() {
        return this.#scale;
    }
    set scale(value) {
        if (value < 1 || value > 100) throw new Error('Scale factor must be between 1 and 100.');
        const newScale = Math.round(value);
        if (newScale !== this.#scale) {
            this.invalidateImage();
            this.#scale = Math.round(value);
        }
    }

    /**
     * Gets or sets the size of each block of tiles.
     */
    get tilesPerBlock() {
        return this.#tilesPerBlock;
    }
    set tilesPerBlock(value) {
        if (value < 1 || value > 50) throw new Error('Tile block size factor must be between 1 and 50.');
        this.#tilesPerBlock = Math.round(value);
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
     * Gets or sets the palette indicies for transparency.
     */
    get transparencyIndicies() {
        return this.#transparencyIndicies.slice();
    }
    set transparencyIndicies(value) {
        if (Array.isArray(value)) {
            this.#transparencyIndicies = value.filter((v) => typeof v === 'number');
        } else if (typeof value === 'number') {
            this.#transparencyIndicies = [value];
        } else {
            this.#transparencyIndicies = [];
        }
    }

    /**
     * Gets or sets the locked palette slot index from 0 to 15, null for none.
     */
    get lockedPaletteSlotIndex() {
        return this.#lockedPaletteSlotIndex;
    }
    set lockedPaletteSlotIndex(value) {
        this.#lockedPaletteSlotIndex = value;
    }

    /**
     * Gets or sets the X offset of the tile grid image.
     */
    get offsetX() {
        return this.#offsetX;
    }
    set offsetX(value) {
        this.#offsetX = Math.round(value);
    }

    /**
     * Gets or sets the Y offset of the tile grid image.
     */
    get offsetY() {
        return this.#offsetY;
    }
    set offsetY(value) {
        this.#offsetY = Math.round(value);
    }

    /**
     * Gets or sets the background colour of the viewport, set to null for transparency.
     */
    get backgroundColour() {
        return this.#backgroundColour;
    }
    set backgroundColour(value) {
        this.#backgroundColour = value;
    }

    /**
     * Gets or sets the colour of the pixel grid.
     */
    get pixelGridColour() {
        return this.#pixelGridColour;
    }
    set pixelGridColour(value) {
        this.#pixelGridColour = value;
    }

    /**
     * Gets or sets the opacity of the pixel grid.
     */
    get pixelGridOpacity() {
        return this.#pixelGridOpacity;
    }
    set pixelGridOpacity(value) {
        this.#pixelGridOpacity = value;
    }

    /**
     * Gets or sets the colour of the tile grid.
     */
    get tileGridColour() {
        return this.#tileGridColour;
    }
    set tileGridColour(value) {
        this.#tileGridColour = value;
    }

    /**
     * Gets or sets the opacity of the tile grid.
     */
    get tileGridOpacity() {
        return this.#tileGridOpacity;
    }
    set tileGridOpacity(value) {
        this.#tileGridOpacity = value;
    }

    /**
     * Gets or sets the opacity of transparency grid.
     */
    get transparencyGridOpacity() {
        return this.#transparencyGridOpacity;
    }
    set transparencyGridOpacity(value) {
        if (value !== this.#transparencyGridOpacity) {
            this.#transparencyGridOpacity = value;
            this.#refreshTileImage();
            createGridPatternCanvas(this.scale, value);
        }
    }

    /**
     * Gets or sets the draw mode for the reference image.
     */
    get referenceImageDrawMode() {
        return this.#referenceImageDrawMode;
    }
    set referenceImageDrawMode(value) {
        this.#referenceImageDrawMode = value;
    }


    /** @type {OffscreenCanvas} */
    #tileCanvas;
    /** @type {boolean} */
    #needToDrawTileImage = true;
    /** @type {TileGridProvider?} */
    #tileGrid = null;
    /** @type {TileMap?} */
    #tilePreviewMap = null;
    /** @type {OffscreenCanvas} */
    #tilePreviewCanvas = null;
    /** @type {ImageBitmap} */
    #tilePreviewImage = null;
    /** @type {ImageBitmap} */
    #gridPatternImage = null;
    /** @type {TileSet} */
    #tileSet = null;
    /** @type {PaletteList} */
    #paletteList = null;
    /** @type {PaletteList} */
    #renderPaletteList = null;
    /** @type {number} */
    #scale = 10;
    /** @type {number} */
    #tilesPerBlock = 2;
    /** @type {number} */
    #selectedTileIndex = -1;
    /** @type {import("../models/tileGridProvider.js").TileGridRegion?} */
    #selectedRegion = null;
    #cursorSize = 1;
    /** @type {number[]} */
    #transparencyIndicies = [];
    /** @type {number?} */
    #lockedPaletteSlotIndex = null;
    #drawTileGrid = false;
    #drawPixelGrid = false;
    /** @type {ReferenceImage[]} */
    #referenceImages = [];
    /** @type {string} */
    #referenceImageDrawMode = referenceImageDrawMode.overIndex;
    /** @type {number[]} */
    #redrawTiles = [];
    #offsetX = 0;
    #offsetY = 0;
    #backgroundColour = '#FFFFFF';
    #pixelGridColour = '#FFFFFF';
    #pixelGridOpacity = 0.2;
    #tileGridColour = '#000000';
    #tileGridOpacity = 0.4;
    #transparencyGridOpacity = 0.25;
    #highlightMode = CanvasManager.HighlightModes.pixel;


    /**
     * Constructor for the class.
     * @param {TileGridProvider} [tileGrid] - Object that contains the tile grid to render.
     * @param {TileSet} [tileSet] - Tile set that is the source of tiles.
     * @param {PaletteList} [paletteList] - Colour palette list to use.
     */
    constructor(tileGrid, tileSet, paletteList) {
        this.#tileCanvas = new OffscreenCanvas(8, 8);
        if (tileGrid) this.#tileGrid = tileGrid;
        if (tileSet) this.#tileSet = tileSet;
        if (paletteList) this.#paletteList = paletteList;
    }


    /**
     * Invalidates the tile set image and forces a redraw.
     */
    invalidateImage() {
        // Set redraw variables
        this.#needToDrawTileImage = true;
        // this.#renderPaletteList = null;
        this.#tilePreviewCanvas = null;
    }

    /**
     * Invalidates and forces a redraw of an individual tile on the tile set image.
     * @param {number} index - Index of the tile to invalidate.
     */
    invalidateTile(index) {
        // Set redraw variables
        this.#redrawTiles.push(index);
        this.#tilePreviewCanvas = null;
    }

    /**
     * Invalidates and forces a redraw of an individual tile on the tile set image.
     * @param {string} tileId - Unique ID of the tile to invalide.
     */
    invalidateTileId(tileId) {
        this.tileGrid.getTileIdIndexes(tileId).forEach((index) => {
            this.#redrawTiles.push(index);
        });
        this.#tilePreviewCanvas = null;
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
     * Returns a bitmap that represents the tile set as a PNG data URL.
     */
    toImageBitmap() {
        const canvas = new OffscreenCanvas(this.#tileCanvas.width, this.#tileCanvas.height);
        canvas.getContext('2d').drawImage(this.#tileCanvas, 0, 0);
        return canvas.transferToImageBitmap();
    }


    /**
     * Sets the tile preview image, this will be drawn over the tile index where the mouse is.
     * @param {string|Tile|TileMap|null} tileOrTileIdOrTileMap 
     */
    setTilePreview(tileOrTileIdOrTileMap) {
        /** @type {TileMap} */ let tileMap = null;
        if (tileOrTileIdOrTileMap instanceof Tile || typeof tileOrTileIdOrTileMap === 'string') {
            const tile = tileOrTileIdOrTileMap instanceof Tile ? tileOrTileIdOrTileMap : this.#tileSet.getTileById(tileOrTileIdOrTileMap);
            if (tile) {
                tileMap = TileMapFactory.create({ defaultTileId: tile.tileId, rows: 1, columns: 1 });
            } else {
                const tileId = tileOrTileIdOrTileMap instanceof Tile ? tileOrTileIdOrTileMap.tileId : tileOrTileIdOrTileMap;
                console.warn(`CanvasManager.setTilePreview: Tile with ID '${tileId}' not found, tile preview will be skipped.`);
            }
        } else if (tileOrTileIdOrTileMap instanceof TileMap) {
            tileMap = tileOrTileIdOrTileMap;
        }
        this.#tilePreviewMap = tileMap;
    }

    /**
     * Sets the selected region in the tile grid.
     * @param {number} rowIndex - Row index that the selection begins.
     * @param {number} columnIndex - Column index that the selection begins.
     * @param {number} width - Width of the selection.
     * @param {number} height - Height of the selection.
     */
    setSelectedTileRegion(rowIndex, columnIndex, width, height) {
        this.#selectedRegion = {
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            width: width,
            height: height
        };
    }

    /**
     * Clears the selected region in the tile grid.
     */
    clearSelectedTileRegion() {
        this.#selectedRegion = null;
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
     * Gets the top left coordinate of where the tile image is to be drawn.
     * @param {HTMLCanvasElement} canvas - Canvas where the image is to be drawn.
     * @returns {import("../types.js").Coordinate}
     */
    getDrawCoords(canvas) {
        return {
            x: Math.floor((canvas.width - this.#tileCanvas.width) / 2) + this.#offsetX,
            y: Math.floor((canvas.height - this.#tileCanvas.height) / 2) + this.#offsetY
        }
    }

    /**
     * Converts mouse X and Y coordinates from the viewport to X and Y coordinates relative to a given canvas object.
     * @param {HTMLCanvasElement} canvas - Canvas element to use for the conversion.
     * @param {number} viewportX - Y pixel coordinate within the viewport.
     * @param {number} viewportY - Y pixel coordinate within the viewport.
     * @returns {import("../types.js").Coordinate}
     */
    convertViewportCoordsToCanvasCoords(canvas, viewportX, viewportY) {
        const canvasRect = canvas.getBoundingClientRect();
        return {
            x: viewportX - canvasRect.left - (this.scale / 2),
            y: viewportY - canvasRect.top - (this.scale / 2)
        };
    }

    /**
     * Converts mouse X and Y coordinates from the viewport to the corresponding tile grid coordinate.
     * @param {HTMLCanvasElement} canvas - Canvas element to use for the conversion.
     * @param {number} viewportX - Y pixel coordinate within the viewport.
     * @param {number} viewportY - Y pixel coordinate within the viewport.
     * @returns {import("../types.js").Coordinate}
     */
    convertViewportCoordsToTileGridCoords(canvas, viewportX, viewportY) {
        const canvasRect = canvas.getBoundingClientRect();
        const canvasX = viewportX - canvasRect.left - (this.scale / 2);
        const canvasY = viewportY - canvasRect.top - (this.scale / 2);
        return this.convertCanvasCoordsToTileGridCoords(canvas, canvasX, canvasY);
    }

    /**
     * Converts mouse X and Y coordinates from the viewport to the corresponding tile grid coordinate.
     * @param {HTMLCanvasElement} canvas - Canvas element to use for the conversion.
     * @param {number} canvasX - Y pixel coordinate within the canvas.
     * @param {number} canvasY - Y pixel coordinate within the canvas.
     * @returns {{x: number, y: number}}
     */
    convertCanvasCoordsToTileGridCoords(canvas, canvasX, canvasY) {
        const drawCoords = this.getDrawCoords(canvas);
        canvasX -= drawCoords.x;
        canvasY -= drawCoords.y;
        return {
            x: Math.round(canvasX / this.scale),
            y: Math.round(canvasY / this.scale)
        };
    }

    /**
     * @typedef RowAndColumnInfo
     * @property {number} rowIndex - Index of the row relative to the given coordinate, this value may be out of bounds.
     * @property {number} columnIndex - Index of the row relative to the given coordinate, this value may be out of bounds.
     * @property {number} clampedRowIndex - Row index but clamped to a dafe value between 0 and the amount of rows.
     * @property {number} clampedColumnIndex - Column index but clamped to a dafe value between 0 and the amount of columns.
     * @property {number} nearestRowIndex - Nearest row index to the given coordinate.
     * @property {number} nearestColumnIndex - Nearest column index to the given coordinate.
     * @property {number} rowBlockIndex - Index of the row block relative to the given coordinate, this value may be out of bounds.
     * @property {number} columnBlockIndex - Index of the row block relative to the given coordinate, this value may be out of bounds.
     * @property {number} nearestRowBlockIndex - Row block index but clamped to a dafe value between 0 and the amount of rows.
     * @property {number} nearestColumnBlockIndex - Column block index but clamped to a dafe value between 0 and the amount of columns.
     * @property {boolean} rowIsInBounds - True when the coordinate is witin the bounds of the row count, otherwise false.
     * @property {boolean} columnIsInBounds - True when the coordinate is witin the bounds of the column count, otherwise false.
     * @property {boolean} isInBounds - True when the coordinate is witin the bounds of the row and column count, otherwise false.
     * @exports
     */

    /**
     * Gets the top left coordinate of where the tile image is to be drawn.
     * @param {HTMLCanvasElement} canvas - Canvas where the image is to be drawn.
     * @param {number} tileGridX - X coordinate within the tile grid.
     * @param {number} tileGridY - Y coordinate within the tile grid.
     * @returns {RowAndColumnInfo}
     */
    getRowAndColumnInfo(tileGridX, tileGridY) {
        const row = Math.floor(tileGridY / 8);
        const col = Math.floor(tileGridX / 8);
        const clampedRow = Math.min(Math.max(row, 0), this.tileGrid.rowCount);
        const clampedCol = Math.min(Math.max(col, 0), this.tileGrid.columnCount);
        const blockRow = Math.floor(clampedRow / this.tilesPerBlock);
        const blockCol = Math.floor(clampedCol / this.tilesPerBlock);
        const nearNextRowAdditionalOffset = tileGridY % 8 >= 4 ? 1 : 0;
        const nearNextColAdditionalOffset = tileGridX % 8 >= 4 ? 1 : 0;
        const nearestBlockRow = Math.min(Math.round(clampedRow / this.tilesPerBlock) + nearNextRowAdditionalOffset, this.tileGrid.rowCount);
        const nearestBlockCol = Math.min(Math.round(clampedCol / this.tilesPerBlock) + nearNextColAdditionalOffset, this.tileGrid.columnCount);
        return {
            rowIndex: row,
            columnIndex: col,
            clampedRowIndex: clampedRow,
            clampedColumnIndex: clampedCol,
            nearestRowIndex: (tileGridY % 4 > 4) ? clampedRow + 1 : clampedRow,
            nearestColumnIndex: (tileGridX % 4 > 4) ? clampedCol + 1 : clampedCol,
            rowBlockIndex: blockRow,
            columnBlockIndex: blockCol,
            nearestRowBlockIndex: nearestBlockRow,
            nearestColumnBlockIndex: nearestBlockCol,
            rowIsInBounds: row === clampedRow,
            columnIsInBounds: col === clampedCol,
            isInBounds: row === clampedRow && col === clampedCol
        };
    }

    /**
     * Returns a tile row index based on the mouse position over the canvas image.
     * @param {number} pixelY - Y pixel coordinate on the canvas image.
     * @returns {number}
     */
    getTileRowIndex(pixelY) {
        return Math.floor(pixelY / 8);
    }

    /**
     * Returns a tile column index based on the mouse position over the canvas image.
     * @param {number} pixelX - X pixel coordinate on the canvas image.
     * @returns {number}
     */
    getTileColIndex(pixelX) {
        return Math.floor(pixelX / 8);
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
        this.#gridPatternImage = createGridPatternCanvas(this.scale, this.transparencyGridOpacity);
        if (this.tileGrid) {
            this.#drawTileImage(this.#tileCanvas, this.#transparencyIndicies);
        }
    }

    /**
     * Draws the tile image onto a canvas element.
     * @param {HTMLCanvasElement|OffscreenCanvas} tileCanvas - Canvas element to draw onto.
     * @param {number[]} transparencyIndicies - Render this colour as transparent.
     */
    #drawTileImage(tileCanvas, transparencyIndicies) {
        if (!this.tileGrid) throw new Error('drawTileImage: No tile grid.');
        if (!this.tileSet) throw new Error('drawTileImage: No tile set.');
        if (!this.paletteList) throw new Error('drawTileImage: No palette list.');

        const context = tileCanvas.getContext('2d');

        const tiles = Math.max(this.tileGrid.columnCount, 1);
        const rows = Math.ceil(this.tileGrid.tileCount / tiles);

        const pxSize = this.scale;

        tileCanvas.width = tiles * 8 * pxSize;
        tileCanvas.height = rows * 8 * pxSize;

        this.#buildRenderPaletteList();

        for (let tileIndex = 0; tileIndex < this.tileGrid.tileCount; tileIndex++) {
            this.#drawTile(context, tileIndex, transparencyIndicies);
        }
    }

    /**
     * Refreshes a single tile on the tile image.
     */
    #refreshSingleTile(tileIndex) {
        this.#drawIndividualTile(this.#tileCanvas, tileIndex, this.#transparencyIndicies);
    }

    /**
     * Updates a single tile on the main tile canvas.
     * @param {HTMLCanvasElement|OffscreenCanvas} canvas - Canvas element to draw onto.
     * @param {number} tileIndex - Index of the tile to update on the tile image.
     * @param {number[]} transparencyIndicies - Render this colour as transparent.
     */
    #drawIndividualTile(canvas, tileIndex, transparencyIndicies) {
        if (!this.tileGrid) throw new Error('drawTileImage: No tile grid.');
        if (!this.tileSet) throw new Error('drawTileImage: No tile set.');
        if (!this.paletteList) throw new Error('drawTileImage: No palette list.');

        const context = canvas.getContext('2d');
        this.#drawTile(context, tileIndex, transparencyIndicies);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} tileindex 
     * @param {number} transparencyIndicies 
     */
    #drawTile(context, tileindex, transparencyIndicies) {
        this.#buildRenderPaletteList();

        const pxSize = this.scale;
        const tileInfo = this.tileGrid.getTileInfoByIndex(tileindex);
        const tile = this.tileSet.getTileById(tileInfo.tileId);
        const tileWidth = Math.max(this.tileGrid.columnCount, 1);
        const tileGridCol = tileindex % tileWidth;
        const tileGridRow = (tileindex - tileGridCol) / tileWidth;
        const palette = this.#renderPaletteList.getPalette(tileInfo.paletteIndex);

        context.imageSmoothingEnabled = false;

        if (!tile || transparencyIndicies >= 0) {
            // Draw in transparency pixel mesh when the tile doesn't exist
            const originX = (tileGridCol * 8) * pxSize;
            const originY = (tileGridRow * 8) * pxSize;
            const sizeXY = pxSize * 8;
            context.clearRect(originX, originY, sizeXY, sizeXY);
            context.drawImage(this.#gridPatternImage, originX, originY);
        }
        if (tile) {
            // Tile exists 
            const x = tileGridCol * 8 * pxSize;
            const y = tileGridRow * 8 * pxSize;
            const sizeXY = pxSize * 8;
            if (tileInfo.horizontalFlip && tileInfo.verticalFlip) {
                context.scale(-1, -1);
                context.drawImage(tileImage, -x, -y, -sizeXY, -sizeXY);
                context.setTransform(1, 0, 0, 1, 0, 0);
            } else if (tileInfo.horizontalFlip) {
                context.scale(-1, 1);
                context.drawImage(tileImage, -x, y, -sizeXY, sizeXY);
                context.setTransform(1, 0, 0, 1, 0, 0);
            } else if (tileInfo.verticalFlip) {
                context.scale(1, -1);
                context.drawImage(tileImage, x, -y, sizeXY, -sizeXY);
                context.setTransform(1, 0, 0, 1, 0, 0);
            } else {
                PaintUtil.drawTileImage(context, x, y, sizeXY, sizeXY, tile, palette, transparencyIndicies);
            }
        }
    }

    #buildRenderPaletteList() {
        if (this.#renderPaletteList !== null) return;
        if (this.lockedPaletteSlotIndex !== null && this.lockedPaletteSlotIndex >= 0 && this.lockedPaletteSlotIndex < this.paletteList.getPalette(0).getColours().length) {
            const list = PaletteListFactory.clone(this.paletteList, { preserveIds: true });
            const lockColour = this.paletteList.getPalette(0).getColour(this.lockedPaletteSlotIndex);
            for (let i = 1; i < list.getPalettes().length; i++) {
                const colour = list.getPalette(i).getColour(this.lockedPaletteSlotIndex);
                colour.r = lockColour.r;
                colour.g = lockColour.g;
                colour.b = lockColour.b;
            }
            list.getPalettes().forEach((p) => {
                p.paletteId = `${p.paletteId}[lock:${this.lockedPaletteSlotIndex}]`;
            });
            this.#renderPaletteList = list;
        } else {
            this.#renderPaletteList = this.paletteList;
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
     * @property {{row: number, col: number, sizePx: number}} tile
     * @property {{row: number, col: number, sizeTiles: number, sizePx: number}} block
     * @property {number} pxSize
     * @property {number} drawX
     * @property {number} drawY
     * @property {number} gridRows
     * @property {number} gridColumns
     */

    /**
     * Draws a tile set and then returns the image as a base 64 URL.
     * @param {CanvasRenderingContext2D} context - Canvas rendering context.
     * @param {{width: number, height: number}} canvas - Canvas to draw onto.
     * @param {number} mouseX - X position of the cursor on the image.
     * @param {number} mouseY - Y position of the cursor on the image.
     */
    drawUI(context, canvas, mouseX, mouseY) {
        if (!context) throw new Error('drawUI: No canvas.');

        const tileCanvas = this.#tileCanvas;
        // const context = canvas.getContext('2d');

        // Fill canvas background
        if (this.backgroundColour === null || this.backgroundColour === 'transparent') {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            context.fillStyle = this.backgroundColour;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

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

        const drawCoords = this.getDrawCoords(canvas);

        let drawX = drawCoords.x;
        let drawY = drawCoords.y;
        /** @type {CanvCoords} */
        const coords = {
            x: mouseX, y: mouseY,
            pxX: (mouseX * pxSize),
            pxY: (mouseY * pxSize),
            tileX: (mouseX - (mouseX % 8)) * pxSize,
            tileY: (mouseY - (mouseY % 8)) * pxSize,
            pxSize: pxSize,
            drawX: drawCoords.x, drawY: drawCoords.y,
            gridColumns: this.#tileGrid.columnCount,
            gridRows: this.#tileGrid.rowCount
        }
        coords.tile = typeof mouseX !== 'undefined' ? {
            col: Math.floor((mouseX - (mouseX % 8)) / 8),
            row: Math.floor((mouseY - (mouseY % 8)) / 8),
            sizePx: this.scale * 8
        } : null;
        coords.block = typeof mouseX !== 'undefined' ? {
            col: Math.floor(coords.tile.col / this.tilesPerBlock),
            row: Math.floor(coords.tile.row / this.tilesPerBlock),
            sizePx: (this.scale * 8) * this.tilesPerBlock,
            sizeTiles: this.tilesPerBlock
        } : null;

        // Draw the reference image below
        if (this.referenceImageDrawMode === referenceImageDrawMode.underlay) {
            this.#drawReferenceImages(context, coords);
        } else if (this.referenceImageDrawMode === referenceImageDrawMode.overIndex && this.transparencyIndicies.length > 0) {
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
        context.imageSmoothingEnabled = false;
        context.drawImage(tileCanvas, baseX, baseY, baseW, baseH, canvX, canvY, baseW, baseH);

        // Reset things
        context.filter = 'none';
        context.moveTo(0, 0);

        // If drawing reference images above
        if (this.referenceImageDrawMode === referenceImageDrawMode.overlay) {
            this.#drawReferenceImages(context, coords);
        }

        // TODO - Come up with some generic draw functions here and re-use code.

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
        if (this.highlightMode === CanvasManager.HighlightModes.pixel) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                // Highlight the tile
                context.strokeStyle = 'yellow';
                context.strokeRect(coords.tileX + drawX, coords.tileY + drawY, (8 * pxSize), (8 * pxSize));

                // Draw the cursor
                context.strokeStyle = 'white';
                this.#drawBrushBorder(context, coords, 1);
                context.strokeStyle = 'black';
                this.#drawBrushBorder(context, coords, 2);
            }
        }

        // Highlight mode is tile
        if (this.#highlightMode === CanvasManager.HighlightModes.tile) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const tile = coords.tile;
                const originX = drawX + (tile.sizePx * tile.col);
                const originY = drawY + (tile.sizePx * tile.row);
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, tile.sizePx, tile.sizePx);
                context.strokeStyle = 'yellow';
                context.strokeRect(originX - 1, originY - 1, tile.sizePx + 2, tile.sizePx + 2);
            }
        }

        // Highlight mode is tile block
        if (this.#highlightMode === CanvasManager.HighlightModes.tileBlock) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const block = coords.block;
                const originX = drawX + (block.sizePx * block.col);
                const originY = drawY + (block.sizePx * block.row);
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, block.sizePx, block.sizePx);
                context.strokeStyle = 'yellow';
                context.strokeRect(originX - 1, originY - 1, block.sizePx + 2, block.sizePx + 2);
            }
        }

        // Highlight mode is row
        if (this.#highlightMode === CanvasManager.HighlightModes.row) {
            if (coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const tile = coords.tile;
                const rowWidth = coords.gridColumns * coords.tile.sizePx;
                const originX = drawX;
                const originY = drawY + (tile.sizePx * tile.row);
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY, rowWidth, tile.sizePx);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, rowWidth, tile.sizePx);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY + 1, rowWidth - 2, tile.sizePx - 2);
            }
        }

        // Highlight mode is row block
        if (this.#highlightMode === CanvasManager.HighlightModes.rowBlock) {
            if (coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const block = coords.block;
                const rowWidth = coords.gridColumns * coords.tile.sizePx;
                const originX = drawX;
                const originY = drawY + (block.sizePx * block.row);
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY, rowWidth, block.sizePx);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, rowWidth, block.sizePx);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY + 1, rowWidth - 2, block.sizePx - 2);
            }
        }

        // Highlight mode is column
        if (this.#highlightMode === CanvasManager.HighlightModes.column) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8) {
                const tile = coords.tile;
                const columnHeight = coords.gridRows * coords.tile.sizePx;
                const originX = drawX + (tile.sizePx * tile.col);
                const originY = drawY;
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY, tile.sizePx, columnHeight);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, tile.sizePx, columnHeight);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY + 1, tile.sizePx - 2, columnHeight - 2);
            }
        }

        // Highlight mode is column block
        if (this.#highlightMode === CanvasManager.HighlightModes.columnBlock) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8) {
                const block = coords.block;
                const columnHeight = coords.gridRows * coords.tile.sizePx;
                const originX = drawX + (block.sizePx * block.col);
                const originY = drawY;
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY, block.sizePx, columnHeight);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY, block.sizePx, columnHeight);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY + 1, block.sizePx - 2, columnHeight - 2);
            }
        }

        // Highlight mode is row index
        if (this.#highlightMode === CanvasManager.HighlightModes.rowIndex) {
            const pxInRow = 8;
            if (coords.y >= -(pxInRow / 2) && coords.y < (coords.gridRows * pxInRow) + (pxInRow / 2)) {
                const tile = coords.tile;
                const snapNextIndex = (coords.y % pxInRow >= (pxInRow / 2));
                const rowWidth = coords.gridColumns * coords.tile.sizePx;
                const rowIndex = tile.row + (snapNextIndex ? 1 : 0);
                const originX = drawX;
                const originY = drawY + (rowIndex * tile.sizePx);
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY - (tile.sizePx / 2), rowWidth, tile.sizePx);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY - 1, rowWidth, 2);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY, rowWidth - 2, 1);
            }
        }

        // Highlight mode is row block index
        if (this.#highlightMode === CanvasManager.HighlightModes.rowBlockIndex) {
            const pxInRow = 8;
            const pxInBlock = this.tilesPerBlock * 8;
            if (coords.y >= -(pxInRow / 2) && coords.y < (coords.gridRows * pxInRow) + (pxInRow / 2)) {
                const block = coords.block;
                const snapNextIndex = (coords.y % pxInBlock >= (pxInBlock / 2));
                const rowWidth = coords.gridColumns * coords.tile.sizePx;
                const rowIndex = block.row + (snapNextIndex ? 1 : 0);
                const originX = drawX;
                const originY = drawY + (rowIndex * block.sizePx);
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX, originY - (block.sizePx / 2), rowWidth, block.sizePx);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX, originY - 1, rowWidth, 2);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY, rowWidth - 2, 1);
            }
        }

        // Highlight mode is column index
        if (this.#highlightMode === CanvasManager.HighlightModes.columnIndex) {
            const pxInCol = 8;
            if (coords.x >= -(pxInCol / 2) && coords.x < (coords.gridColumns * pxInCol) + (pxInCol / 2)) {
                const tile = coords.tile;
                const snapNextIndex = (coords.x % pxInCol >= (pxInCol / 2));
                const colHeight = coords.gridRows * coords.tile.sizePx;
                const colIndex = tile.col + (snapNextIndex ? 1 : 0);
                const originX = drawX + (colIndex * tile.sizePx);
                const originY = drawY;
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX - (tile.sizePx / 2), originY, tile.sizePx, colHeight);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX - 1, originY, 2, colHeight);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY, 1, colHeight - 2);
            }
        }

        // Highlight mode is column block index
        if (this.#highlightMode === CanvasManager.HighlightModes.columnBlockIndex) {
            const pxInCol = 8;
            const pxInBlock = this.tilesPerBlock * 8;
            if (coords.x >= -(pxInCol / 2) && coords.x < (coords.gridColumns * pxInCol) + ((pxInCol / 2) - 2)) {
                const block = coords.block;
                const snapNextIndex = (coords.x % pxInBlock >= (pxInBlock / 2));
                const colHeight = coords.gridRows * coords.tile.sizePx;
                const colIndex = block.col + (snapNextIndex ? 1 : 0);
                const originX = drawX + (colIndex * block.sizePx);
                const originY = drawY;
                context.filter = 'opacity(0.25)';
                context.fillStyle = 'yellow';
                context.fillRect(originX - (block.sizePx / 2), originY, block.sizePx, colHeight);
                context.filter = 'none';
                context.strokeStyle = 'black';
                context.strokeRect(originX - 1, originY, 2, colHeight);
                context.strokeStyle = 'white';
                context.strokeRect(originX + 1, originY, 1, colHeight - 2);
            }
        }

        // Highlight selected tile
        if (this.selectedTileIndex >= 0 && this.selectedTileIndex < this.tileGrid.tileCount) {
            const selCol = this.selectedTileIndex % this.tileGrid.columnCount;
            const selRow = Math.floor(this.selectedTileIndex / this.tileGrid.columnCount);
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

        // Tile stamp tool, draw a preview of the selected tile / tile map
        if (this.#tilePreviewMap && coords.tile && isInBounds(this.tileGrid, coords.tile.row, coords.tile.col)) {
            let redraw = false;
            if (!this.#tilePreviewCanvas) {
                this.#tilePreviewCanvas = new OffscreenCanvas(1, 1);
                redraw = true;
            }
            // Set the palette slot on the preview tile set
            for (let r = 0; r < this.#tilePreviewMap.rowCount; r++) {
                const tsRow = coords.tile.row + r;
                for (let c = 0; c < this.#tilePreviewMap.columnCount; c++) {
                    const tsCol = coords.tile.col + r;
                    if (isInBounds(this.tileGrid, tsRow, tsCol)) {
                        const tsTile = this.tileGrid.getTileInfoByRowAndColumn(tsRow, tsCol);
                        const pTile = this.#tilePreviewMap.getTileByCoordinate(r, c);
                        if (tsTile && (pTile.paletteIndex !== tsTile.paletteIndex || pTile.horizontalFlip !== tsTile.horizontalFlip || pTile.verticalFlip !== tsTile.verticalFlip)) {
                            pTile.palette = tsTile.paletteIndex;
                            pTile.horizontalFlip = tsTile.horizontalFlip;
                            pTile.verticalFlip = tsTile.verticalFlip;
                            redraw = true;
                        }
                    }
                }
            }
            // Redraw
            if (redraw) {
                drawTileImage(this.#tilePreviewMap, this.tileSet, this.paletteList, this.#tilePreviewCanvas, this.transparencyIndicies, this.scale);
                this.#tilePreviewImage = this.#tilePreviewCanvas.transferToImageBitmap();
            }
            // Place the preview image
            const tileX = 8 * coords.tile.col * coords.pxSize;
            const tileY = 8 * coords.tile.row * coords.pxSize;
            context.drawImage(this.#tilePreviewImage, tileX + drawX, tileY + drawY, this.#tilePreviewCanvas.width, this.#tilePreviewCanvas.height);
        }

        // Highlight the selected tile region
        if (this.#selectedRegion) {
            // if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
            const r = this.#selectedRegion;
            const originX = drawX + (coords.pxSize * r.columnIndex * 8);
            const originY = drawY + (coords.pxSize * r.rowIndex * 8);
            const width = coords.pxSize * r.width * 8;
            const height = coords.pxSize * r.height * 8;
            context.setLineDash([1, 1]);
            context.strokeStyle = 'white';
            context.strokeRect(originX - 1, originY - 1, width + 2, height + 2);
            context.strokeStyle = 'black';
            context.strokeRect(originX, originY, width, height);
            context.strokeStyle = 'white';
            context.strokeRect(originX + 1, originY + 1, width - 2, height - 2);
            context.setLineDash([]);
            // }
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
    #drawBrushBorder(context, coords, drawOffset) {
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

/**
 * 
 * @param {TileGridProvider} tileGrid 
 * @param {TileSet} tileSet 
 * @param {PaletteList} paletteList 
 * @param {OffscreenCanvas} canvas 
 * @param {number?} [transparencyColour]
 * @param {number?} [pxSize]
 */
function drawTileImage(tileGrid, tileSet, paletteList, canvas, transparencyColour, pxSize) {
    if (!tileGrid) throw new Error('drawTileImage: No tile grid.');
    if (!tileSet) throw new Error('drawTileImage: No tile set.');
    if (!paletteList) throw new Error('drawTileImage: No palette list.');

    if (typeof pxSize !== 'number') pxSize = 1;
    if (pxSize < 1) pxSize = 1;

    if (typeof transparencyColour !== 'number') transparencyColour = -1;

    const context = canvas.getContext('2d');

    const tiles = Math.max(tileGrid.columnCount, 1);
    const rows = Math.ceil(tileGrid.tileCount / tiles);

    canvas.width = tiles * 8 * pxSize;
    canvas.height = rows * 8 * pxSize;

    for (let tileIndex = 0; tileIndex < tileGrid.tileCount; tileIndex++) {
        drawTile(tileGrid, tileSet, paletteList, context, tileIndex, transparencyColour, pxSize);
    }
}


/**
 * @param {TileGridProvider} tileGrid 
 * @param {TileSet} tileSet 
 * @param {PaletteList} paletteList 
 * @param {CanvasRenderingContext2D} context 
 * @param {number} tileindex 
 * @param {number?} [transparencyColour]
 * @param {number?} [pxSize]
 */
function drawTile(tileGrid, tileSet, paletteList, context, tileindex, transparencyColour, pxSize) {
    const tileInfo = tileGrid.getTileInfoByIndex(tileindex);
    const tile = tileSet.getTileById(tileInfo.tileId);
    const tileWidth = Math.max(tileGrid.columnCount, 1);
    const tileGridCol = tileindex % tileWidth;
    const tileGridRow = (tileindex - tileGridCol) / tileWidth;
    const palette = paletteList.getPalette(tileInfo.paletteIndex);
    const numColours = palette.getColours().length;

    if (tile) {
        let pixelPaletteIndex = 0;
        for (let tilePx = 0; tilePx < 64; tilePx++) {

            const tileCol = tilePx % 8;
            const tileRow = (tilePx - tileCol) / 8;

            const x = ((tileGridCol * 8) + tileCol) * pxSize;
            const y = ((tileGridRow * 8) + tileRow) * pxSize;

            if (tileInfo.horizontalFlip && tileInfo.verticalFlip) {
                pixelPaletteIndex = tile.readAt(63 - tilePx);
            } else if (tileInfo.horizontalFlip) {
                const readPx = (tileRow * 8) + (7 - tileCol);
                pixelPaletteIndex = tile.readAt(readPx);
            } else if (tileInfo.verticalFlip) {
                const readPx = ((7 - tileRow) * 8) + tileCol;
                pixelPaletteIndex = tile.readAt(readPx);
            } else {
                pixelPaletteIndex = tile.readAt(tilePx);
            }

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
    } else {
        const originX = (tileGridCol * 8) * pxSize;
        const originY = (tileGridRow * 8) * pxSize;

        context.fillStyle = '#FFFFFF';
        context.fillRect(originX, originY, pxSize * 8, pxSize * 8);
        context.fillStyle = '#777777';
        for (let x = 0; x < pxSize * 8; x++) {
            const drawX = originX + x;
            for (let y = 0; y < pxSize * 8; y++) {
                const drawY = originY + y;
                if ((x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0)) {
                    context.fillRect(drawX, drawY, 1, 1);
                }
            }
        }
    }
}

/**
 * @param {TileGridProvider} tileGrid 
 * @param {number} row 
 * @param {number} column 
 * @returns {boolean}
 */
function isInBounds(tileGrid, row, column) {
    if (row < 0 || row >= tileGrid.rowCount) return false;
    if (column < 0 || column >= tileGrid.columnCount) return false;
    return true;
}

/**
 * @param {number} scale 
 * @returns {ImageBitmap}
 */
function createGridPatternCanvas(scale, opacity) {
    const gridColour1 = `rgba(255,255,255,${opacity})`;
    const gridColour2 = `rgba(0,0,0,${opacity})`;
    const gridSizePx = 2;
    const gridCanvas = new OffscreenCanvas(scale * 8, scale * 8);
    const gridCtx = gridCanvas.getContext('2d');
    for (let y = 0; y < gridCanvas.height; y += gridSizePx) {
        for (let x = 0; x < gridCanvas.width; x += gridSizePx) {
            gridCtx.fillStyle = (x + y) % (gridSizePx * 2) === 0 ? gridColour1 : gridColour2;
            gridCtx.fillRect(x, y, gridSizePx, gridSizePx);
        }
    }
    return gridCanvas.transferToImageBitmap();
}
