import Tile from './tile.js';

/**
 * Set of tiles.
 */
export default class TileSet {

    /** @type {Tile[]} */
    #tiles = [];
    #tileWidth = 1;
    #pxPerRow = 8;
    #totalRows = 0;
    #heightPx = 0;
    #totalPx = 0;

    /**
     * Creates a new instace of TileSet and fills the tiles from an array.
     * 
     * @constructor
     * @param {Uint8ClampedArray} [sourceArray=null] Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=64] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
    constructor(sourceArray, sourceIndex, sourceLength) {
        if (sourceArray) {
            this.fillFromArray(sourceArray, sourceIndex, sourceLength);
        }
    }

    #calculateTotalRows() {
        if (this.tileCount > 0) {
            this.#totalRows = Math.ceil(this.tileWidth / this.tileCount);
            this.#heightPx = this.#totalRows * 8;
            this.#totalPx = this.#pxPerRow * this.#totalRows;
        } else {
            this.#totalRows = 0;
            this.#heightPx = 0;
            this.#totalPx = 0;
        }
        this.#pxPerRow = this.tileCount * 8;
    }

    /**
     * The amount of tiles in this tile set.
     */
    get tileCount() {
        return this.#tiles.length;
    }

    /**
     * The width of the tile map (in 8x8 pixel tiles).
     */
    get tileWidth() {
        return this.#tileWidth;
    }
    set tileWidth(value) {
        if (value < 0) throw new Error('Tile width must be greater than 0.');
        this.#tileWidth = value;
        this.#calculateTotalRows();
    }

    /**
     * Gets the calculated tile height of the tile map.
     */
    get tileHeight() {
        return Math.ceil(this.tileCount / this.tileWidth);
    }

    /**
     * Gets the total amount of pixels in the tile set.
     */
    get totalPx() {
        return this.#totalPx;
    }

    /**
     * Adds a tile to the tile map.
     * @param {Tile} tile The tile to add.
     */
    addTile(tile) {
        if (!tile) throw new Error('Tile can not be null.');
        this.#tiles.push(tile);
        this.#calculateTotalRows();
    }

    /**
     * Inserts a tile at the given index.
     * @param {Tile} tile The tile to insert.
     * @param {number} index Index in the tile map where the tile should reside.
     */
    insertTileAt(tile, index) {
        if (!tile) throw new Error('Tile can not be null.');
        if (index < 0 || index > this.#tiles.length) throw new Error('Index must be between 0 and tile map count.');
        this.#tiles.splice(index, 0, tile);
        this.#calculateTotalRows();
    }

    /**
     * Removes a tile from the tile map.
     * @param {number} index Index in the tile map where the tile should be removed.
     */
    removeTile(index) {
        if (index < 0 || index > this.#tiles.length) throw new Error('Index must be between 0 and tile map count.');
        this.#tiles.splice(index, 1);
        this.#calculateTotalRows();
    }

    /**
     * Gets a tile from the tile map.
     * @param {number} index Index in the tile map of the tile to get.
     * @returns {Tile} Tile found at the given index.
     */
    getTile(index) {
        if (index < 0 || index > this.#tiles.length) throw new Error(`getTile: Index must be between 0 and tile map count, tiles: ${this.#tiles.length}, index: ${index}.`);
        return this.#tiles[index];
    }

    /**
     * Gets all tiles.
     * @returns {Array<Tile>}
     */
    getTiles() {
        return this.#tiles;
    }

    /**
     * Sets the coordinate to read from.
     * @param {number} x X coordinate in the tile set.
     * @param {number} y Y coordinate in the tile set.
     */
    setReadCoordinate(x, y) {
        if (!(x >= 1 && x <= this.#pxPerRow)) throw new Error(`X coordinate must be between 1 and ${this.#pxPerRow}.`);
        if (!(y >= 1 && y <= this.#heightPx)) throw new Error(`Y coordinate must be between 1 and ${this.#heightPx}.`);

        const pxFromTopLeft = ((y - 1) * this.#pxPerRow) + x;

        this.#readTile = this.getTileByCoordinate(x, y);

    }

    /** @type {number} */
    #readIndex = 0;
    /** @type {Tile} */
    #readTile = null;

    /**
     * Sets the next pixel index to read in the overall tile map.
     * @param {number} index Pixel index.
     */
    setReadIndex(index) {
        if (index < 0 || index >= this.#totalRows * 64) throw new Error(`Index was out of range, between 0 and ${(this.#totalRows * 64)}.`);
        this.#readIndex = index;
    }

    #setReadTile() {
        // If the current tile 
        if (this.#readIndex >= this.#totalPx) {
            this.#readTile = null;
        } else if (this.#readTile === null) {
            this.#readTile = this.getTileByPixelIndex(this.#readIndex);
        } else if (this.#readIndex % 8 === 0) {
            this.#readTile = this.getTileByPixelIndex(this.#readIndex);
        }
    }

    /**
     * Reads the next pixel value or returns null when at the end of the stream.
     * @returns {number|null}
     */
    readNextPixel() {
        this.#setReadTile();
        // Now return the next pixel
        if (this.#readTile !== null) {
            const y = Math.ceil(index / this.#pxPerRow);
            const x = index - y;
            const tileY = y % 8;
            const tileX = x % 8;
            const readPixel = tileY * 8 + tileX;
            // Move to next pixel
            this.#readIndex++;
            // Return pixel value
            return this.#readTile.readAt(readPixel);
        } else {
            return null;
        }
    }

    /**
     * Reads the next pixel value or returns null when at the end of the stream.
     * @returns {Uint8ClampedArray}
     */
    readPixels(count) {

        let leftToRead = Math.min(count, this.#totalPx - this.#readIndex);
        let resultIndex = 0;
        const result = new Uint8ClampedArray(leftToRead);

        while (leftToRead > 0) {

            const y = Math.ceil(index / this.#pxPerRow);
            const x = index - y + 1;
            const tileIndex = ((y - 1 % 8) * 8) + (x - 1 % 8);
            const tileRowLeft = 8 - (tileIndex % 8);

            this.#setReadTile();

            if (this.#readTile !== null) {
                const pxData = this.#readTile.readFrom(tileIndex, tileIndex + tileRowLeft);
                result.set(pxData, pxData.length);
            }

            resultIndex += tileRowLeft;
            this.leftToRead -= tileRowLeft;
            this.#readIndex += tileRowLeft;
        }

        return result;
    }

    /**
     * Sets the coordinate to read from.
     * @param {number} x X coordinate in the tile set.
     * @param {number} y Y coordinate in the tile set.
     * @returns {Tile}
     */
    getTileByCoordinate(x, y) {
        if (!(x >= 1 && x <= this.#pxPerRow)) throw new Error(`X coordinate must be between 1 and ${this.#pxPerRow}.`);
        if (!(y >= 1 && y <= this.#heightPx)) throw new Error(`Y coordinate must be between 1 and ${this.#heightPx}.`);

        // Work out the amount of pixels counting horizontally from the top left corner, counting across and then down
        // From that, use the basis of 64 px per tile to get the tile index
        const xTileIndex = (x - (x % 8)) / 8;
        const yTileIndex = (y - (y % 8)) / 8;
        const tileIndex = (yTileIndex * this.#tileWidth) + xTileIndex;

        // Return the tile
        if (tileIndex >= 0 && tileIndex < this.tileCount) {
            // Our tile map contains tiles for this
            return this.getTile(tileIndex);
        } else if (tileIndex >= 0 && tileIndex < this.#tileWidth * this.#totalRows) {
            // There may not be enough tiles so just return a blank one
            return new Tile();
        } else {
            throw new Error(`There was an error when returning tile for coordinate of ${x},${y}.`);
        }
    }

    /**
     * Returns the tile associated with a given pixel index from top left.
     * @param {number} index Pixel from top left.
     * @returns {Tile}
     */
    getTileByPixelIndex(index) {
        const y = Math.ceil(index / this.#pxPerRow);
        const x = index - y;
        return this.getTileByCoordinate(x, y);
    }

    /**
     * Gets the pixel value at the given coordinate.
     * @param {number} x X coordinate in the tile set.
     * @param {number} y Y coordinate in the tile set.
     * @returns {number}
     */
    getPixelAt(x, y) {

        // Get the tile number
        const tileX = (x - (x % 8)) / 8;
        const tileY = (y - (y % 8)) / 8;
        const tileNum = tileY * this.tileWidth + tileX;

        // Work out the coordinates and byte number within the tile itself
        x = x % 8;
        y = y % 8;
        const byteNum = (y * 8) + x;

        return this.getTile(tileNum).readAt(byteNum);
    }

    setPixelAt(x, y, colourIndex) {
        if (colourIndex < 0 || colourIndex > 15) throw new Error('setPixelAt: Palette index must be between 0 and 15.');

        // Get the tile number
        const tileX = (x - (x % 8)) / 8;
        const tileY = (y - (y % 8)) / 8;
        const tileNum = tileY * this.tileWidth + tileX;

        // Work out the coordinates and byte number within the tile itself
        x = x % 8;
        y = y % 8;
        const byteNum = (y * 8) + x;

        this.getTile(tileNum).setValueAt(byteNum, colourIndex);
    }

    /** Clears the tile set. */
    clear() {
        this.#tiles = [];
        this.#calculateTotalRows();
    }

    /**
     * Creates a tile set from a given array.
     * @param {Uint8ClampedArray} sourceArray Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=null] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
    fillFromArray(sourceArray, sourceIndex, sourceLength) {
        if (!sourceArray) throw new Error('Source array was not valid.');
        if (!sourceIndex) sourceIndex = 0;

        if (sourceIndex >= sourceArray.length) throw new Error('The source index exceeds the bounds of the source array.');
        if (sourceIndex < 0) throw new Error('Source index must be 0 or greater.');

        if (sourceLength === null) sourceLength = sourceIndex - sourceArray.length;
        else if (sourceLength < 0) throw new Error('Source length must be greater than 0.');

        let leftToRead = sourceLength;
        while (sourceIndex < sourceArray.length) {
            let amtToRead = Math.min(leftToRead, 64);
            const sourceReadEnd = sourceIndex + amtToRead;
            if (sourceReadEnd > sourceArray.length) amtToRead = sourceIndex - sourceArray.length;

            const tile = new Tile(sourceArray, sourceIndex, amtToRead);
            this.#tiles.push(tile);
            this.#calculateTotalRows();

            sourceIndex += 64;
        }
    }

    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} array Array or tile data in planar format.
     * @returns {TileSet}
     */
    static parsePlanarFormat(array) {
        const tileSet = new TileSet();
        for (let i = 0; i < array.length; i += 32) {
            const arraySlice = array.slice(i, i + 32);
            const tile = Tile.parsePlanarFormat(arraySlice);
            tileSet.addTile(tile);
        }
        return tileSet;
    }

}
