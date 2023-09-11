import TileMapTile from "./tileMapTile.js";
import TileGridProvider from './tileGridProvider.js';
import TileMapTileFactory from "../factory/tileMapTileFactory.js";

/**
 * Represents a tile map, which is a structured collection of tiles with attributes. 
 * Extends TileGridProvider.
 */
export default class TileMap extends TileGridProvider {

    
    /**
     * Gets whether this is a tile set (part of TileGridProvider).
     */
    get isTileSet() {
        return false;
    }

    /**
     * Gets whether this is a tile map (part of TileGridProvider).
     */
    get isTileMap() {
        return true;
    }

    /**
     * Gets or sets the unique ID of the tile map.
     */
    get tileMapId() {
        return this.#tileMapId;
    }
    set tileMapId(value) {
        this.#tileMapId = value;
    }

    /**
     * Gets or sets the unique ID of the tile.
     */
    get title() {
        return this.#title;
    }
    set title(value) {
        this.#title = value;
    }

    /**
     * Gets or sets the tile offset in VRAM.
     */
    get vramOffset() {
        return this.#vramOffset;
    }
    set vramOffset(value) {
        this.#vramOffset = value;
    }

    /**
     * Gets the column count.
     */
    get columnCount() {
        return this.#columns;
    }

    /**
     * Gets the row count.
     */
    get rowCount() {
        return this.#rows;
    }

    /**
     * Gets the tile count.
     */
    get tileCount() {
        return this.#tiles.length;
    }

    /**
     * Gets whether the tile map will be optimised on export.
     * The results of this vary per system.
     */
    get optimise() {
        return this.#optimise;
    }
    set optimise(value) {
        this.#optimise = value;
    }

    /**
     * Gets whether the tile map is to be treated as a sprite which will have an effect on 
     * the code export of the tile map.
     */
    get isSprite() {
        return this.#isSprite;
    }
    set isSprite(value) {
        this.#isSprite = value;
    }


    /** @type {string} */
    #tileMapId = null;
    /** @type {string[]} */
    #paletteIds;
    #title = null;
    #vramOffset = 0;
    #columns = 1;
    #rows = 1;
    #optimise = false;
    #isSprite = false;
    /** @type {TileMapTile[]} */
    #tiles;


    /**
     * Constructor for the class.
     * @param {number} rows - Initial number of rows for the tile map, default is '1'.
     * @param {number} columns - Initial number of columns for the tile map, default is '1'.
     */
    constructor(rows, columns) {
        super();

        if (typeof rows === 'undefined' || rows === null) rows = 1;
        if (typeof columns === 'undefined' || columns === null) columns = 1;

        if (!typeof rows === 'number' || rows <= 0) throw new Error('Invalid value given for "rows" parameter.');
        if (!typeof columns === 'number' || columns <= 0) throw new Error('Invalid value given for "columns" parameter.');

        this.#rows = rows;
        this.#columns = columns;

        this.#tiles = new Array(rows * columns);
        this.#tiles.fill(null);

        this.#paletteIds = new Array(16);
        this.#paletteIds.fill(null);
    }


    /**
     * Gets the entire tile array.
     * @returns {TileMapTile[]}
     */
    getTiles() {
        return this.#tiles.slice();
    }


    /**
     * Returns a tile map tile by index.
     * @param {number} index - Index of the tile to return.
     * @returns {TileMapTile | null}
     */
    getTileByIndex(index) {
        if (index >= 0 && index <= this.tileCount) {
            return this.#tiles[index];
        } else return null;
    }

    /**
     * Sets a tile map tile by index.
     * @param {number} index - Index of the tile to return.
     * @param {TileMapTile?} tileMapTile - Tile map tile item to set.
     */
    setTileByIndex(index, tileMapTile) {
        if (!tileMapTile && !tileMapTile instanceof TileMapTile) throw new Error('Please supply a tile map tile.');
        if (index >= 0 && index <= this.tileCount) {
            this.#tiles[index] = tileMapTile;
        } else throw new Error('Index out of range.');
    }

    /**
     * Returns a tile map tile by row and column index.
     * @param {number} rowIndex - Row index to obtain the tile from.
     * @param {number} columnIndex - Column index to obtain the tile from.
     * @returns {TileMapTile?}
     */
    getTileByCoordinate(rowIndex, columnIndex) {
        const index = (rowIndex * this.columnCount) + columnIndex;
        return this.getTileByIndex(index);
    }


    /**
     * Returns an array of tile map tiles from a given row index.
     * @param {number} index - Row index of tile map tiles to obtain.
     * @returns {TileMapTile[]?}
     */
    getTileMapRow(index) {
        if (index >= 0 && index <= this.rowCount) {

            const startIndex = this.columnCount * index;
            const endIndex = startIndex + this.columnCount;
            return this.#tiles.slice(startIndex, endIndex);

        } else return null;
    }

    /**
     * Returns an array of tile map tiles from a given column index.
     * @param {number} index - Column index of tile map tiles to obtain.
     * @returns {TileMapTile[]}
     */
    getTileMapColumn(index) {
        if (index >= 0 && index <= this.columnCount) {

            /** @type {TileMapTile[]} */
            const result = [];
            for (let i = 0; i < this.#tiles.length; i += this.columnCount) {
                result.push(this.#tiles[i + index]);
            }
            // for (let row = 0; row < this.rowCount; row++) {
            //     result.push(this.#tiles[row + index]);
            // }
            // for (let tileIndex = index; tileIndex < this.#tiles.length; tileIndex += this.columnCount) {
            //     result.push(this.getTileByIndex(tileIndex));
            // }
            return result;

        } else throw new Error('Index out of range.');
    }


    /**
     * Adds a row to the tile map.
     */
    addRow() {
        this.#rows++; 0
        const newRow = createNewTileMapRow(this.columnCount);
        this.#tiles = this.#tiles.concat(newRow);
    }


    /**
     * Inserts a row into to the tile map.
     * @param {number} index - Index to place the new row.
     */
    insertRow(index) {
        if (index >= 0 && index <= this.rowCount) {

            const startIndex = this.columnCount * index;
            const before = this.#tiles.slice(0, startIndex);
            const newRow = createNewTileMapRow(this.columnCount);
            const after = this.#tiles.slice(startIndex);

            this.#rows++;
            this.#tiles = before.concat(newRow).concat(after);

        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a tile map row by index.
     * @param {number} index - Index of the row to remove.
     */
    removeRow(index) {
        if (index >= 0 && index < this.rowCount) {

            const thisRowIndex = this.columnCount * index;
            const nextTileIndex = thisRowIndex + this.columnCount;
            const before = this.#tiles.slice(0, thisRowIndex);
            const after = this.#tiles.slice(nextTileIndex);
            this.#tiles = before.concat(after);
            this.#rows--;

        } else throw new Error('Index out of range.');
    }


    /**
     * Adds a column to the tile map.
     */
    addColumn() {
        this.insertColumn(this.columnCount);
    }

    /**
     * Inserts a column into to the tile map.
     * @param {number} index - Index to place the new column.
     */
    insertColumn(index) {
        if (index >= 0 && index <= this.columnCount) {

            /** @type {TileMapTile[]} */
            let result = [];
            for (let idx = 0; idx < this.#tiles.length; idx += this.columnCount) {
                const row = this.#tiles.slice(idx, idx + this.columnCount);
                if (index > 0) {
                    result = result.concat(row.slice(0, index));
                }
                result.push(TileMapTileFactory.create());
                result = result.concat(row.slice(index));
            }

            this.#columns++;
            this.#tiles = result;

        } else throw new Error('Index out of range.');
    }

    /**
     * Removes a tile map column by index.
     * @param {number} index - Index of the column to remove.
     */
    removeColumn(index) {
        if (index >= 0 && index < this.columnCount) {

            /** @type {TileMapTile[]} */
            let result = [];
            for (let i = 0; i < this.rowCount; i++) {
                let row = this.getTileMapRow(i);
                if (index > 0) {
                    result = result.concat(row.slice(0, index));
                }
                if (index < this.columnCount - 1) {
                    result = result.concat(row.slice(index + 1, this.columnCount));
                }
            }

            this.#columns--;
            this.#tiles = result;

        } else throw new Error('Index out of range.');
    }


    /**
     * Gets all palettes used by this tile map.
     * @returns {Array<string|null>}
     */
    getPalettes() {
        return this.#paletteIds.slice();
    }

    /**
     * Sets the unique palette ID associated with a given index.
     * @param {number} index - Index of the palette to set.
     * @param {string} paletteId - Unique ID of the palette.
     */
    setPalette(index, paletteId) {
        if (index < 0 || index >= this.#paletteIds.length) {
            throw new Error('Index out of range.');
        }
        if (!paletteId || typeof paletteId !== 'string' || paletteId.length === 0 || paletteId.length > 100) {
            throw new Error('Invalid palette ID.');
        }
        this.#paletteIds[index] = paletteId;
    }

    /**
     * Gets the ID of the palette associated with a given index.
     * @param {number} index - Index of the palette ID to return.
     * @returns {string?}
     */
    getPalette(index) {
        if (index < 0 || index >= this.#paletteIds.length) {
            return null;
        }
        return this.#paletteIds[index];
    }

    /**
     * Clears the ID of the palette associated with a given index.
     * @param {number} index - Index of the palette ID to return.
     */
    resetPalette(index) {
        if (index < 0 || index >= this.#paletteIds.length) {
            throw new Error('Index out of range.');
        }
        this.#paletteIds[index] = null;
    }

    /**
     * Clears all palette IDs.
     */
    clearPalettes() {
        this.#paletteIds = new Array(this.#paletteIds.length);
        this.#paletteIds.fill(null);
    }


    /**
     * Gets information about a tile by the tile index.
     * @param {number} tileIndex - Index of the tile grid.
     * @returns {import('./tileGridProvider.js').TileProviderTileInfo}
     */
    getTileInfoByIndex(tileIndex) {
        const tileMapTile = this.getTileByIndex(tileIndex);
        return this.#createTileInfo(tileMapTile, tileIndex);
    }

    /**
     * Gets information about a tile by a row and column coordinate.
     * @param {number} rowIndex - Row within the tile grid.
     * @param {number} columnIndex - Column of the tile within the tile grid.
     * @returns {import('./tileGridProvider.js').TileProviderTileInfo}
     */
    getTileInfoByRowAndColumn(rowIndex, columnIndex) {
        if (rowIndex < 0 || rowIndex >= this.rowCount) throw new Error('Row index must be greater then zero and less then the row count.');
        if (columnIndex < 0 || columnIndex >= this.columnCount) throw new Error('Column index must be greater then zero and less then the column count.');
        const index = (rowIndex * this.columnCount) + columnIndex;
        return this.getTileInfoByIndex(index);
    }

    /**
     * Gets information about a tile by the X and Y coordinate within the image.
     * @param {number} x - X pixel within the tile image.
     * @param {number} y - Y pixel within the tile image.
     * @returns {import('./tileGridProvider.js').TileProviderTileInfo?}
     */
    getTileInfoByPixel(x, y) {
        const index = this.getTileIndexByCoordinate(x, y);
        if (index !== null) {
            return this.getTileInfoByIndex(index);
        } else return null;
    }

    /**
     * Gets all indexes where a given tile ID occurs.
     * @param {string} tileId - Unique ID of the tile.
     * @returns {number[]}
     */
    getTileIdIndexes(tileId) {
        const result = [];
        this.#tiles.map((tile, index) => {
            if (tile.tileId === tileId) {
                result.push(index);
            }
        });
        return result;
    }


    /**
     * Gets the tile at a given X and Y coordinate, or null if out of range.
     * @param {number} x - X coordinate in the tile map.
     * @param {number} y - Y coordinate in the tile map.
     * @returns {number?}
     */
    getTileIndexByCoordinate(x, y) {
        const numAcrossXAxis = (x - (x % 8)) / 8;
        const numAcrossYAxis = (y - (y % 8)) / 8;
        const tileIndex = (numAcrossYAxis * this.columnCount) + numAcrossXAxis;

        if (tileIndex >= 0 && tileIndex < this.tileCount) {
            return tileIndex;
        } else {
            return null;
        }
    }

    /**
     * @param {TileMapTile} tileMapTile - Tile map tile to convert.
     * @param {number} tileIndex
     * @returns {import('./tileGridProvider.js').TileProviderTileInfo}
     */
    #createTileInfo(tileMapTile, tileIndex) {
        return {
            tileId: tileMapTile.tileId,
            paletteIndex: tileMapTile.palette,
            horizontalFlip: tileMapTile.horizontalFlip,
            verticalFlip: tileMapTile.verticalFlip,
            tileIndex: tileIndex
        };
    }


}

/**
 * Parameters for tile map tiles.
 * @typedef {object} TileMapTileParams
 * @property {number} tileIndex - Index of the tile within the tile map.
 * @property {boolean} horizontalFlip - Mirror tile horizontally?
 * @property {boolean} verticalFlip - Mirror tile vertically?
 * @property {number} palette - Palette index to use for the tile.
 * @property {boolean} priority - Does this tile have a higher priority? (in SMS+GG means it draws on-top of sprites).
 * @exports
 */


/**
 * @param {number} columns - Number of columns in row.
 * @returns {TileMapTile[]}
 */
function createNewTileMapRow(columns) {
    /** @type {TileMapTile[]} */
    const result = [];
    for (let c = 0; c < columns; c++) {
        result.push(TileMapTileFactory.create());
    }
    return result;
}
