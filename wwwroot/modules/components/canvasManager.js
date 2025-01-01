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
        this.#paletteList = value;
        this.#renderPaletteList = null;
        this.invalidateImage();
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
     * Gets or sets a list of IDs of tiles to draw a border around.
     */
    get outlineTileIds() {
        return this.#outlineTileIds;
    }
    set outlineTileIds(value) {
        if (Array.isArray(value)) {
            this.#outlineTileIds = value.filter((tileId) => typeof tileId === 'string');
        } else {
            this.#outlineTileIds = [];
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
     * Gets or sets the colour of the highlighted item (tile, pixel, row, etc).
     */
    get primaryHoverHighlightColour() {
        return this.#primaryHoverHighlightColour;
    }
    set primaryHoverHighlightColour(value) {
        this.#primaryHoverHighlightColour = value;
    }

    /**
     * Gets or sets the shadow or background colour of the highlighted item (tile, pixel, row, etc).
     */
    get primaryHoverShadowColour() {
        return this.#primaryHoverShadowColour;
    }
    set primaryHoverShadowColour(value) {
        this.#primaryHoverShadowColour = value;
    }

    /**
     * Gets or sets the colour of the sub object (such as tile that contains the pixel, etc).
     */
    get secondaryHoverHighlightColour() {
        return this.#secondaryHoverHighlightColour;
    }
    set secondaryHoverHighlightColour(value) {
        this.#secondaryHoverHighlightColour = value;
    }

    /**
     * Gets or sets the border colour of masked tiles in the tile grid.
     */
    get maskingBorderColour() {
        return this.#maskingBorderColour;
    }
    set maskingBorderColour(value) {
        this.#maskingBorderColour = value;
    }

    /**
     * Gets or sets the colour of the mask applied when tiles are hidden.
     */
    get maskingColour() {
        return this.#maskingColour;
    }
    set maskingColour(value) {
        this.#maskingColour = value;
    }

    /**
     * Gets or sets the primary colour of the selection box.
     */
    get primarySelectionColour() {
        return this.#primarySelectionColour;
    }
    set primarySelectionColour(value) {
        this.#primarySelectionColour = value;
    }

    /**
     * Gets or sets the secondary colour of the selection box.
     */
    get secondarySelectionColour() {
        return this.#secondarySelectionColour;
    }
    set secondarySelectionColour(value) {
        this.#secondarySelectionColour = value;
    }

    /**
     * Gets or sets the primary colour of the canvas border.
     */
    get canvasBorderPrimaryColour() {
        return this.#canvasBorderPrimaryColour;
    }
    set canvasBorderPrimaryColour(value) {
        this.#canvasBorderPrimaryColour = value;
    }

    /**
     * Gets or sets the secondary colour of the canvas border.
     */
    get canvasBorderSecondaryColour() {
        return this.#canvasBorderSecondaryColour;
    }
    set canvasBorderSecondaryColour(value) {
        this.#canvasBorderSecondaryColour = value;
    }

    /**
     * Gets or sets the opacity of the mask applied when tiles are hidden.
     */
    get maskingOpacity() {
        return this.#maskingOpacity;
    }
    set maskingOpacity(value) {
        this.#maskingOpacity = value;
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
    /** @type {number[]} */
    #attentionTiles = [];
    /** @type {string[]} */
    #outlineTileIds = [];
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
    #pixelGridColour = '#000000';
    #pixelGridOpacity = 0.2;
    #tileGridColour = '#000000';
    #tileGridOpacity = 0.4;
    #transparencyGridOpacity = 0.9;
    #highlightMode = CanvasManager.HighlightModes.pixel;
    #primaryHoverHighlightColour = '#FFFF00';
    #primaryHoverShadowColour = '#000000';
    #secondaryHoverHighlightColour = '#FFFF00';
    #maskingBorderColour = '#000000';
    #maskingColour = '#888888';
    #maskingOpacity = 0.65;
    #primarySelectionColour = '#FFFF00';
    #secondarySelectionColour = '#000000';
    #canvasBorderPrimaryColour = '#888888';
    #canvasBorderSecondaryColour = '#CCCCCC';


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
        if (!this.#redrawTiles.includes(index)) {
            this.#redrawTiles.push(index);
        }
        this.#tilePreviewCanvas = null;
    }

    /**
     * Invalidates and forces a redraw of an individual tile on the tile set image.
     * @param {string} tileId - Unique ID of the tile to invalide.
     */
    invalidateTileId(tileId) {
        this.tileGrid.getTileIdIndexes(tileId).forEach((index) => {
            if (!this.#redrawTiles.includes(index)) {
                this.#redrawTiles.push(index);
            }
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
     * Gets the reference image count.
     */
    getReferenceImageCount() {
        return this.#referenceImages.length;
    }

    /**
     * Gets the reference images.
     */
    getReferenceImages() {
        return this.#referenceImages.slice();
    }

    /**
     * Gets a reference image by index.
     * @param {number} index - Index of the reference image.
     */
    getReferenceImageByIndex(index) {
        return this.#referenceImages[index];
    }

    /**
     * Sets the reference image.
     * @param {ReferenceImage} value - Reference image to draw.
     */
    addReferenceImage(value) {
        if (value) {
            this.#referenceImages.push(value);
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
        const palette = this.#renderPaletteList.getPalette(Math.min(tileInfo.paletteIndex, this.#renderPaletteList.getPalettes().length - 1));

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
            PaintUtil.drawTileImage(context, x, y, sizeXY, sizeXY, tile, palette, {
                transparencyIndexes: transparencyIndicies,
                horizontalFlip: tileInfo.horizontalFlip,
                verticalFlip: tileInfo.verticalFlip
            });
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
        if (!context) throw new Error('drawUI: No canvas draw context.');

        const tileCanvas = this.#tileCanvas;

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
        } else {
            while (this.#redrawTiles.length > 0) {
                const tileIndex = this.#redrawTiles.pop();
                this.#refreshSingleTile(tileIndex);
            }
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
        context.strokeStyle = this.canvasBorderPrimaryColour;
        context.strokeRect(canvX - 1, canvY - 1, baseW + 2, baseH + 2);
        context.strokeStyle = this.canvasBorderSecondaryColour;
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

        // Draw pixel grid
        if (this.showPixelGrid && this.scale >= 5) {
            this.#drawGrid({
                context, 
                x: drawX, y: drawY, 
                columnCount: this.tileGrid.columnCount * 8, 
                rowCount: this.tileGrid.rowCount * 8, 
                lineSpacingPx: this.scale, 
                gridColour: this.pixelGridColour, 
                gridOpacity: this.pixelGridOpacity
            });
        }

        // Draw tile grid
        if (this.showTileGrid) {
            this.#drawGrid({
                context, 
                x: drawX, y: drawY, 
                columnCount: this.tileGrid.columnCount, 
                rowCount: this.tileGrid.rowCount, 
                lineSpacingPx: this.scale * 8, 
                gridColour: this.tileGridColour, 
                gridOpacity: this.tileGridOpacity
            });
        }

        // Highlight mode is pixel
        if (this.highlightMode === CanvasManager.HighlightModes.pixel) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                this.#strokeSecondaryArea(context, coords.tileX + drawX, coords.tileY + drawY, (8 * pxSize), (8 * pxSize));
                this.#strokeBrushBorder(context, coords);
            }
        }

        // Highlight mode is tile
        if (this.#highlightMode === CanvasManager.HighlightModes.tile) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const tile = coords.tile;
                const originX = drawX + (tile.sizePx * tile.col);
                const originY = drawY + (tile.sizePx * tile.row);
                this.#strokePrimaryArea(context, originX - 1, originY - 1, tile.sizePx + 2, tile.sizePx + 2);
            }
        }

        // Highlight mode is tile block (NES 4x4 tile blockes for palettes, etc)
        if (this.#highlightMode === CanvasManager.HighlightModes.tileBlock) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8 && coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const block = coords.block;
                const originX = drawX + (block.sizePx * block.col);
                const originY = drawY + (block.sizePx * block.row);
                this.#strokePrimaryArea(context, originX, originY, block.sizePx, block.sizePx);
            }
        }

        // Highlight mode is row block (eg. delete row)
        if (this.#highlightMode === CanvasManager.HighlightModes.rowBlock) {
            if (coords.y >= 0 && coords.y < coords.gridRows * 8) {
                const block = coords.block;
                this.#highlightRows(context, drawX, drawY, block.row, block.sizeTiles, block.sizePx);
            }
        }

        // Highlight mode is column block (eg. delete column)
        if (this.#highlightMode === CanvasManager.HighlightModes.columnBlock) {
            if (coords.x >= 0 && coords.x < coords.gridColumns * 8) {
                const block = coords.block;
                this.#highlightColumns(context, drawX, drawY, block.col, block.sizeTiles, block.sizePx);
            }
        }

        // Highlight mode is row block index (eg. add row)
        if (this.#highlightMode === CanvasManager.HighlightModes.rowBlockIndex) {
            const pxInRow = 8;
            const pxInBlock = this.tilesPerBlock * 8;
            if (coords.y >= -(pxInRow / 2) && coords.y < (coords.gridRows * pxInRow) + (pxInRow / 2)) {
                const block = coords.block;
                const snapNextIndex = (coords.y % pxInBlock >= (pxInBlock / 2));
                const rowIndex = block.row + (snapNextIndex ? 1 : 0);
                this.#highlightRowIndex(context, drawX, drawY, rowIndex, block.sizeTiles, block.sizePx);
            }
        }

        // Highlight mode is column block index (eg. add column)
        if (this.#highlightMode === CanvasManager.HighlightModes.columnBlockIndex) {
            const pxInCol = 8;
            const pxInBlock = this.tilesPerBlock * 8;
            if (coords.x >= -(pxInCol / 2) && coords.x < (coords.gridColumns * pxInCol) + ((pxInCol / 2) - 2)) {
                const block = coords.block;
                const snapNextIndex = (coords.x % pxInBlock >= (pxInBlock / 2));
                const columnIndex = block.col + (snapNextIndex ? 1 : 0);
                this.#highlightColumnIndex(context, drawX, drawY, columnIndex, block.sizeTiles, block.sizePx);
            }
        }

        // Outlining tiles by ID
        if (this.#outlineTileIds.length > 0) {
            const tileSizePx = (8 * pxSize);

            // Fill each tile
            context.filter = `opacity(${this.maskingOpacity})`;
            context.fillStyle = this.maskingColour;
            for (let col = 0; col < this.tileGrid.columnCount; col++) {
                for (let row = 0; row < this.tileGrid.rowCount; row++) {
                    const thisTile = this.#tileGrid.getTileInfoByRowAndColumn(row, col);
                    if (!this.#outlineTileIds.includes(thisTile?.tileId)) {
                        const tileX = tileSizePx * col + drawX;
                        const tileY = tileSizePx * row + drawY;
                        context.fillRect(tileX, tileY, tileSizePx, tileSizePx);
                    }
                }
            }
            context.filter = 'none';

            // Outline each tile
            this.#outlineTileIds.forEach((outlineTileId) => {
                const indicies = this.tileGrid.getTileIdIndexes(outlineTileId);
                context.beginPath();
                for (let tileIndex of indicies) {
                    const selCol = tileIndex % this.tileGrid.columnCount;
                    const selRow = Math.floor(tileIndex / this.tileGrid.columnCount);

                    const surroundingTiles = {
                        t: (selRow > 0) ? this.#tileGrid.getTileInfoByRowAndColumn(selRow - 1, selCol)?.tileId ?? '' : '',
                        b: (selRow < this.tileGrid.rowCount - 1) ? this.#tileGrid.getTileInfoByRowAndColumn(selRow + 1, selCol)?.tileId ?? '' : '',
                        l: (selCol > 0) ? this.#tileGrid.getTileInfoByRowAndColumn(selRow, selCol - 1)?.tileId ?? '' : '',
                        r: (selCol < this.tileGrid.columnCount - 1) ? this.#tileGrid.getTileInfoByRowAndColumn(selRow, selCol + 1)?.tileId ?? '' : ''
                    }

                    const tileX = tileSizePx * selCol;
                    const tileY = tileSizePx * selRow;

                    if (!this.#outlineTileIds.includes(surroundingTiles.t)) {
                        context.moveTo(tileX + drawX, tileY + drawY);
                        context.lineTo(tileX + drawX + tileSizePx, tileY + drawY);
                    }

                    if (!this.#outlineTileIds.includes(surroundingTiles.b)) {
                        context.moveTo(tileX + drawX, tileY + drawY + tileSizePx);
                        context.lineTo(tileX + drawX + tileSizePx, tileY + drawY + tileSizePx);
                    }

                    if (!this.#outlineTileIds.includes(surroundingTiles.l)) {
                        context.moveTo(tileX + drawX, tileY + drawY);
                        context.lineTo(tileX + drawX, tileY + drawY + tileSizePx);
                    }

                    if (!this.#outlineTileIds.includes(surroundingTiles.r)) {
                        context.moveTo(tileX + drawX + tileSizePx, tileY + drawY);
                        context.lineTo(tileX + drawX + tileSizePx, tileY + drawY + tileSizePx);
                    }
                }
                context.closePath();
                context.strokeStyle = this.maskingBorderColour;
                context.stroke();
            });
        }

        // Highlight selected tile
        if (this.selectedTileIndex >= 0 && this.selectedTileIndex < this.tileGrid.tileCount) {
            const selCol = this.selectedTileIndex % this.tileGrid.columnCount;
            const selRow = Math.floor(this.selectedTileIndex / this.tileGrid.columnCount);
            const tileX = 8 * selCol * pxSize;
            const tileY = 8 * selRow * pxSize;

            // Highlight the tile
            context.strokeStyle = this.primarySelectionColour;
            context.strokeRect(tileX + drawX, tileY + drawY, (8 * pxSize), (8 * pxSize));
            context.strokeStyle = this.secondarySelectionColour;
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
                        const pTile = this.#tilePreviewMap.getTileByRowAndColumn(r, c);
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
            context.strokeStyle = this.primarySelectionColour;
            context.strokeRect(originX - 1, originY - 1, width + 2, height + 2);
            context.strokeStyle = this.secondarySelectionColour;
            context.strokeRect(originX, originY, width, height);
            context.strokeStyle = this.primarySelectionColour;
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
        const originalSmoothingEnabled = context.imageSmoothingEnabled;
        const originalSmoothingQuality = context.imageSmoothingQuality;

        context.imageSmoothingEnabled = false;
        context.imageSmoothingQuality = 'high';

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

        context.imageSmoothingEnabled = originalSmoothingEnabled;
        context.imageSmoothingQuality = originalSmoothingQuality;
    }

    /**
     * @param {{context: CanvasRenderingContext2D, x: number, y: number, columnCount: number, rowCount: number, lineSpacingPx: number, gridColour: string, gridOpacity: number}} context 
     */
    #drawGrid({context, x, y, columnCount, rowCount, lineSpacingPx, gridColour, gridOpacity}) {
        const oldStrokeStyle = context.strokeStyle;
        const oldFilter = context.filter;

        context.strokeStyle = gridColour;
        context.filter = `opacity(${gridOpacity})`;
        context.beginPath();

        const widthPx = columnCount * lineSpacingPx;
        const heightPx = rowCount * lineSpacingPx;
       
        for (let col = 0; col <= widthPx; col += lineSpacingPx) {
            context.moveTo(x + col, y);
            context.lineTo(x + col, y + heightPx);
        }

        for (let row = 0; row <= heightPx; row += lineSpacingPx) {
            context.moveTo(x, y + row);
            context.lineTo(x + widthPx, y + row);
        }

        context.closePath();
        context.stroke();

        context.strokeStyle = oldStrokeStyle;
        context.filter = oldFilter;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {{rows: number[], cols: number[], tiles: {row: number, col: number}[]}} nonMasked
     * @param {number} tileSizePx 
     */
    #maskTiles(context, nonMasked, offsetX, offsetY, tileSizePx) {

        // Walk the path, starting at the top

    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {{rows: number[], cols: number[], tiles: {row: number, col: number}[]}} nonMasked
     * @param {number} tileSizePx 
     */
    #maskOutTiles(context, nonMasked, offsetX, offsetY, tileSizePx) {
        const oldFilter = context.filter;
        const oldFillStyle = context.fillStyle;
        const oldStrokeStyle = context.strokeStyle;

        context.beginPath();

        // Draw outer rectangle
        context.moveTo(0 + offsetX, 0 + offsetY);
        context.lineTo(this.tileGrid.columnCount * tileSizePx + offsetX, 0 + offsetY);
        context.lineTo(this.tileGrid.columnCount * tileSizePx + offsetX, this.tileGrid.rowCount * tileSizePx + offsetY);
        context.lineTo(0 + offsetX, this.tileGrid.rowCount * tileSizePx + offsetY);
        context.lineTo(0 + offsetX, 0 + offsetY);

        let tileX = 0 + offsetX + tileSizePx;
        let tileY = 0 + offsetY + tileSizePx;

        context.moveTo(tileX, tileY);
        context.lineTo(tileX, tileY + tileSizePx); // Left
        context.lineTo(tileX + tileSizePx, tileY + tileSizePx); // Bottom
        // context.lineTo(tileX + tileSizePx, tileY); // Right
        context.moveTo(tileX + tileSizePx, tileY); // Right
        context.lineTo(tileX, tileY); // Top

        tileX = 0 + offsetX + tileSizePx + tileSizePx;
        tileY = 0 + offsetY + tileSizePx;

        context.moveTo(tileX, tileY);
        // context.lineTo(tileX, tileY + tileSizePx); // Left
        context.moveTo(tileX, tileY + tileSizePx); // Left
        context.lineTo(tileX + tileSizePx, tileY + tileSizePx); // Bottom
        context.lineTo(tileX + tileSizePx, tileY); // Top
        context.lineTo(tileX, tileY); // Right

        // // Punch out non masked areas
        // if (Array.isArray(nonMasked.rows)) {
        //     for (let row of nonMasked.rows) {
        //         if (row >= 0 && row < this.tileGrid.rowCount) {

        //         }
        //     }
        // }

        // for (let tile of nonMaskedTiles) {

        // }

        // for (let col = 0; col < this.tileGrid.columnCount; col++) {
        //     for (let row = 0; row < this.tileGrid.rowCount; row++) {
        //         context.strokeRect
        //     }
        // }

        context.filter = `opacity(${this.maskingOpacity})`;
        context.fillStyle = this.maskingColour;
        context.fill();

        context.filter = `none`;
        context.lineWidth = 2;
        context.strokeStyle = this.maskingBorderColour;
        context.stroke();


        // context.filter = 'none';
        // context.lineWidth = 3;
        // context.strokeStyle = this.primaryHoverShadowColour;
        // context.strokeRect(x - 2, y - 2, width + 2, height + 2);
        // context.lineWidth = 2;
        // context.strokeStyle = this.primaryHoverHighlightColour;
        // context.strokeRect(x - 1, y - 1, width + 1, height + 1);

        // Revert
        context.filter = oldFilter;
        context.fillStyle = oldFillStyle;
        context.strokeStyle = oldStrokeStyle;
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    #strokePrimaryArea(context, x, y, width, height) {
        context.filter = 'none';
        context.lineWidth = 3;
        context.strokeStyle = this.primaryHoverShadowColour;
        context.strokeRect(x - 2, y - 2, width + 2, height + 2);
        context.lineWidth = 2;
        context.strokeStyle = this.primaryHoverHighlightColour;
        context.strokeRect(x - 1, y - 1, width + 1, height + 1);
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} rowIndex
     * @param {number} rowWidth
     * @param {number} tileSizePx 
     */
    #highlightRows(context, x, y, rowIndex, rowWidth, tileSizePx) {
        this.#highlightArea({
            context,
            originX: x,
            originY: y + (tileSizePx * rowIndex),
            widthPx: this.tileGrid.columnCount * tileSizePx,
            heightPx: rowWidth * tileSizePx
        });
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} columnIndex
     * @param {number} columnWidth
     * @param {number} tileSizePx 
     */
    #highlightColumns(context, x, y, columnIndex, columnWidth, tileSizePx) {
        this.#highlightArea({
            context,
            originX: x + (tileSizePx * columnIndex),
            originY: y,
            widthPx: columnWidth * tileSizePx,
            heightPx: this.tileGrid.columnCount * tileSizePx
        });
    }

    /**
     * @param {{context: CanvasRenderingContext2D, originX: number, originY: number, widthPx: number, heightPx: number}} context 
     */
    #highlightArea({ context, originX, originY, widthPx, heightPx }) {
        context.filter = `opacity(${this.transparencyGridOpacity})`;
        context.fillStyle = this.primaryHoverShadowColour;
        context.fillRect(originX, originY, widthPx, heightPx);
        context.filter = 'none';
        context.strokeStyle = this.primaryHoverHighlightColour;
        context.strokeRect(originX, originY, widthPx, heightPx);
        context.strokeStyle = this.secondaryHoverHighlightColour;
        context.strokeRect(originX + 1, originY + 1, widthPx - 2, heightPx - 2);
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} rowIndex
     * @param {number} rowWidth
     * @param {number} tileSizePx 
     */
    #highlightRowIndex(context, x, y, rowIndex, rowWidth, tileSizePx) {
        const blockSizePx = tileSizePx * rowWidth;
        const rowWidthPx = this.tileGrid.columnCount * tileSizePx;
        const originX = x;
        const originY = y + (rowIndex * blockSizePx);
        context.filter = `opacity(${this.transparencyGridOpacity})`;
        context.fillStyle = this.primaryHoverShadowColour;
        context.fillRect(originX, originY - (blockSizePx / 2), rowWidthPx, blockSizePx);
        context.filter = 'none';
        context.strokeStyle = this.primaryHoverHighlightColour;
        context.strokeRect(originX, originY - 1, rowWidthPx, 2);
        context.strokeStyle = this.secondaryHoverHighlightColour;
        context.strokeRect(originX + 1, originY, rowWidthPx - 2, 1);
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} columnIndex
     * @param {number} columnWidth
     * @param {number} tileSizePx 
     */
    #highlightColumnIndex(context, x, y, columnIndex, columnWidth, tileSizePx) {
        const blockSizePx = tileSizePx * columnWidth;
        const columnWidthPx = this.tileGrid.rowCount * tileSizePx;
        const originX = x + (columnIndex * blockSizePx);
        const originY = y;
        context.filter = `opacity(${this.transparencyGridOpacity})`;
        context.fillStyle = this.primaryHoverShadowColour;
        context.fillRect(originX - (blockSizePx / 2), originY, blockSizePx, columnWidthPx);
        context.filter = 'none';
        context.strokeStyle = this.primaryHoverHighlightColour;
        context.strokeRect(originX - 1, originY, 2, columnWidthPx);
        context.strokeStyle = this.secondaryHoverHighlightColour;
        context.strokeRect(originX, originY + 1, 1, columnWidthPx - 2);
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    #strokeSecondaryArea(context, x, y, width, height) {
        context.filter = 'none';
        context.lineWidth = 2;
        context.strokeStyle = this.secondaryHoverHighlightColour;
        context.strokeRect(x - 1, y - 1, width + 1, height + 1);
    }

    /**
     * @param {CanvasRenderingContext2D} context 
     * @param {CanvCoords} coords 
     */
    #strokeBrushBorder(context, coords) {
        context.filter = 'none';
        context.lineWidth = 2;
        context.strokeStyle = this.primaryHoverHighlightColour;
        this.#drawBrushBorder(context, coords, 1);
        context.strokeStyle = this.primaryHoverShadowColour;
        this.#drawBrushBorder(context, coords, 2);
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
