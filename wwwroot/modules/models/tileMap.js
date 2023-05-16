import TileMapTile from "./tileMapTile.js";
import Tile from "./../models/tile.js";
import TileSet from "./../models/tileSet.js";
import TileUtil from "../util/tileUtil.js";
import TileMapTileFactory from "../factory/tileMapTileFactory.js";

/**
 * Tile map.
 */
export default class TileMap {


    get tileMapId() {
        return this.#tileMapId;
    }
    set tileMapId(value) {
        this.#tileMapId = value;
    }

    get title() {
        return this.#title;
    }
    set title(value) {
        this.#title = value;
    }

    get vramOffset() {
        return this.#vramOffset;
    }
    set vramOffset(value) {
        this.#vramOffset = value;
    }

    get columnsPerRow() {
        return this.#columns;
    }

    get rowCount() {
        return this.#rows;
    }

    get tileCount() {
        return this.#tiles.length;
    }

    get optimise() {
        return this.#optimise;
    }
    set optimise(value) {
        this.#optimise = value;
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
    /** @type {TileMapTile[]} */
    #tiles;


    /**
     * Initialises a new instanve of the tile map class.
     * @param {number} rows - Initial number of rows for the tile map, default is '1'.
     * @param {number} columns - Initial number of columns for the tile map, default is '1'.
     */
    constructor(rows, columns) {
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
        } else throw new Error('Index out of range.');
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
     * @returns {TileMapTile | null}
     */
    getTileByCoordinate(rowIndex, columnIndex) {
        const index = (rowIndex * this.columnsPerRow) + columnIndex;
        return this.getTileByIndex(index);
    }


    /**
     * Returns an array of tile map tiles from a given row index.
     * @param {number} index - Row index of tile map tiles to obtain.
     * @returns {TileMapTile[]}
     */
    getTileMapRow(index) {
        if (index >= 0 && index <= this.rowCount) {

            const startIndex = this.columnsPerRow * index;
            const endIndex = startIndex + this.columnsPerRow;
            return this.#tiles.slice(startIndex, endIndex);

        } else throw new Error('Index out of range.');
    }

    /**
     * Returns an array of tile map tiles from a given column index.
     * @param {number} index - Column index of tile map tiles to obtain.
     * @returns {TileMapTile[]}
     */
    getTileMapColumn(index) {
        if (index >= 0 && index <= this.columnsPerRow) {

            /** @type {TileMapTile[]} */
            const result = [];
            for (let tileIndex = index; tileIndex < this.#tiles.length; tileIndex += this.columnsPerRow) {
                result.push(this.getTileByIndex(tileIndex));
            }
            return result;

        } else throw new Error('Index out of range.');
    }


    /**
     * Adds a row to the tile map.
     */
    addRow() {
        this.#rows++; 0
        const newRow = createNewTileMapRow(this.columnsPerRow);
        this.#tiles = this.#tiles.concat(newRow);
    }


    /**
     * Inserts a row into to the tile map.
     * @param {number} index - Index to place the new row.
     */
    insertRow(index) {
        if (index >= 0 && index <= this.rowCount) {

            const startIndex = this.columnsPerRow * index;
            const before = this.#tiles.slice(0, startIndex);
            const newRow = createNewTileMapRow(this.columnsPerRow);
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

            const thisRowIndex = this.columnsPerRow * index;
            const nextTileIndex = thisRowIndex + this.columnsPerRow;
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
        this.insertColumn(this.columnsPerRow);
    }

    /**
     * Inserts a column into to the tile map.
     * @param {number} index - Index to place the new column.
     */
    insertColumn(index) {
        if (index >= 0 && index < this.columnsPerRow) {

            /** @type {TileMapTile[]} */
            const result = [];
            for (let idx = index; idx < this.#tiles.length; idx += this.columnsPerRow) {
                const rowStart = idx - index;
                const row = this.#tiles.slice(rowStart, this.columnsPerRow);
                result = result
                    .concat(row.slice(0, index))
                    .concat([TileMapTileFactory.create()])
                    .concat(row.slice(index));
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
        if (index >= 0 && index < this.columnsPerRow) {

            /** @type {TileMapTile[]} */
            const result = [];
            for (let idx = index; idx < this.#tiles.length; idx += this.columnsPerRow) {
                const rowStart = idx - index;
                const row = this.#tiles.slice(rowStart, this.columnsPerRow);
                result = result
                    .concat(row.slice(0, index))
                    .concat(row.slice(index + 1));
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
     * @returns {string}
     */
    getPalette(index) {
        if (index < 0 || index >= this.#paletteIds.length) {
            throw new Error('Index out of range.');
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




    // /**
    //  * Adds a tile to the tile set.
    //  * @param {Tile} tile - Tile reference to add.
    //  * @param {TileMapTileParams} params - Parameters.
    //  */
    // addTile(tile, params) {
    //     this.#tiles.push({
    //         tileIndex: this.#tiles.length,
    //         sourceTile: tile,
    //         horizontalFlip: params.horizontalFlip,
    //         verticalFlip: params.verticalFlip,
    //         palette: params.palette,
    //         priority: params.priority
    //     });
    // }

    // getTileMapTiles() {
    //     return this.#tiles.map((tileMapTile) => {
    //         /** @type {TileMapTile} */
    //         const result = {
    //             tileIndex: tileMapTile.tileIndex + this.vramOffset,
    //             horizontalFlip: tileMapTile.horizontalFlip,
    //             verticalFlip: tileMapTile.verticalFlip,
    //             palette: tileMapTile.palette,
    //             priority: tileMapTile.priority
    //         };
    //         return result;
    //     });
    // }


    // toTileSet() {
    //     const result = new TileSet();
    //     result.tileWidth = this.columns;
    //     if (!this.optimise) {
    //         this.#tiles.forEach((tile) => {
    //             result.addTile(tile.sourceTile);
    //         });
    //     } else {
    //         Object.keys(this.#uniqueTiles).forEach(key => {
    //             result.addTile(this.#uniqueTiles[key].tile);
    //         });
    //     }
    //     return result;
    // }


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
