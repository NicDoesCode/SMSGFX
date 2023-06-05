/**
 * Abstract class for an object that provides tile grid query functions.
 */
export default class TileGridProvider {


    /**
     * Gets whether this object is a tile set.
     * @returns {boolean}
     */
    get isTileSet() {
        throw new Error('Not implemented.');
    }

    /**
     * Gets whether this object is a tile map.
     * @returns {booelan}
     */
    get isTileMap() {
        throw new Error('Not implemented.');
    }

    /**
     * Gets the total amount of tiles.
     * @returns {number}
     */
    get tileCount() {
        throw new Error('Not implemented.');
    }

    /**
     * Gets the amount of tiles per row.
     * @returns {number}
     */
    get columnCount() {
        throw new Error('Not implemented.');
    }

    /**
     * Gets the amount of rows in the grid.
     * @returns {number}
     */
    get rowCount() {
        throw new Error('Not implemented.');
    }


    /**
     * Gets information about a tile by the tile index.
     * @param {number} tileIndex - Index of the tile.
     * @returns {TileProviderTileInfo}
     */
    getTileInfoByIndex(tileIndex) {
        throw new Error('Not implemented.');
    }

    /**
     * Gets information about a tile by a row and column coordinate.
     * @param {number} rowIndex - Zero based index of the row within the tile grid.
     * @param {number} columnIndex - Zero based index of the column of the tile within the tile grid.
     * @returns {TileProviderTileInfo}
     */
    getTileInfoByRowAndColumn(rowIndex, columnIndex) {
        throw new Error('Not implemented.');
    }

    /**
     * Gets information about a tile by the X and Y coordinate within the image.
     * @param {number} x - X pixel within the tile image.
     * @param {number} y - Y pixel within the tile image.
     * @returns {TileProviderTileInfo?}
     */
    getTileInfoByPixel(x, y) {
        throw new Error('Not implemented.');
    }

    /**
     * Gets all indexes where a given tile ID occurs.
     * @param {string} tileId - Unique ID of the tile.
     * @returns {number[]}
     */
    getTileIdIndexes(tileId) {
        throw new Error('Not implemented.');
    }


    /**
     * Gets the tile at a given X and Y coordinate, or null if out of range.
     * @param {number} x - X coordinate in the tile grid.
     * @param {number} y - Y coordinate in the tile grid.
     * @returns {number?}
     */
    getTileIndexByCoordinate(x, y) {
        throw new Error('Not implemented.');
    }


}

/**
 * Provides information about a tile.
 * @typedef {object} TileProviderTileInfo
 * @property {string} tileId - Unique ID of the tile.
 * @property {number?} paletteIndex - Index of the palette to render the tile, null if none specified.
 * @property {boolean} horizontalFlip - Mirror the tile horizontally?
 * @property {boolean} verticalFlip - Mirror tile vertically?
 * @property {number} tileIndex - Index of the tile within the tile grid.
 * @exports
 */

 