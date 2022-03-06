/**
 * Single 8x8 tile.
 */
export default class Tile {

    #data = new Uint8ClampedArray(64);

    /**
     * Creates a new instace of Tile and fills the tile from an array.
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

    /**
     * Fills the tile from an array.
     * @param {Uint8ClampedArray} sourceArray Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=64] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
    fillFromArray(sourceArray, sourceIndex, sourceLength) {
        if (!sourceArray) throw new Error('Source array was not valid.');
        if (!sourceIndex) sourceIndex = 0;
        if (sourceIndex >= sourceArray.length) throw new Error('The index exceeds the bounds of the source array.');
        if (sourceIndex < 0) throw new Error('Index must be 0 or greater.');
        if (!sourceLength) sourceLength = 64;
        if (sourceLength < 0 || sourceLength > 64) throw new Error('Length must be between 0 and 64.');

        this.clear();

        const sourceStopIndex = sourceIndex + sourceLength;
        let dataIndex = 0;
        for (let i = sourceIndex; i < sourceArray.length && i < sourceStopIndex; i++) {
            this.#data[dataIndex] = sourceArray[i];
            dataIndex++;
        }
    }

    /**
     * Clears the contents of the tile.
     */
    clear() {
        this.#data = new Uint8ClampedArray(64);
    }


    /**
     * Gets the palette index of a pixal at the given index.
     * @param {number} index Index of the pixel to read.
     * @returns {number} Palette index of the pixel at the given index.
     */
    readAt(index) {
        if (!index) throw new Error('Read index not specified.');
        if (index < 0 || index > 8) throw new Error('Read index must be between 0 and 8.');
        return this.#data[index];
    }

    /**
     * Gets the palette index of a pixal at the given X and Y coordinate.
     * @param {number} x X coordinate to read from (0 to 7).
     * @param {number} y Y coordinate to read from (0 to 7).
     * @returns {number} Palette index of the pixel at the given coordinate.
     */
    readAtCoord(x, y) {
        if (!x) throw new Error('X coordinate not specified.');
        if (x < 0 || x > 8) throw new Error('X coordinate must be between 0 and 8.');
        if (!y) throw new Error('Y coordinate not specified.');
        if (y < 0 || y > 8) throw new Error('Y coordinate must be between 0 and 8.');
        return this.readAt(y * 8 + x);
    }

    /**
     * Sets the palette index of a pixel at the given index.
     * @param {number} index Index of the pixel to set.
     * @param {number} value Palette index of the pixel to set.
     */
    setValueAt(index, value) {
        if (!index) throw new Error('Read index not specified.');
        if (index < 0 || index > 8) throw new Error('Read index must be between 0 and 8.');
        if (value < 0 || value > 255) throw new Error('Value must be between 0 and 255.');
        this.#data[index] = value;
    }

    /**
     * Sets the palette index of a pixel at the given X and Y coordinate.
     * @param {number} x X coordinate to read from (0 to 7).
     * @param {number} y Y coordinate to read from (0 to 7).
     * @param {number} value Palette index of the pixel to set.
     */
    setValueAtCoord(x, y, value) {
        if (!x) throw new Error('X coordinate not specified.');
        if (x < 0 || x > 8) throw new Error('X coordinate must be between 0 and 8.');
        if (!y) throw new Error('Y coordinate not specified.');
        if (y < 0 || y > 8) throw new Error('Y coordinate must be between 0 and 8.');
        this.setValueAt(y * 8 + x, value);
    }

    /**
     * Converts the tile map to a hex encoded sytring.
     * @returns {string}
     */
    toHexString() {
        let result = '';
        for (let i = 0; i < this.#data.length; i++) {
            let byte = this.#data[i].toString(16);
            if (byte % 2 !== 0) result += '0';
            result += byte;
        }
        return result;
    }

    /**
     * Converts a hexadecimal string to a tile object.
     * @param {string} hexString String of hexadecimal data.
     * @returns {Tile}
     */
    static fromHex(hexString) {

        if (hexString.length % 2 !== 0) throw new Error('Hex string length must align to 2.');

        let result = new Uint8ClampedArray(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            let byte = parseInt(hexString.substring(i, i + 2), 16);
            result[i / 2] = byte;
        }

        return new Tile(result);
    }

    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} planarByteArray Array or tile data in planar format.
     * @returns {Tile}
     */
    static parsePlanarFormat(planarByteArray) {
        const pixelArray = new Uint8ClampedArray(8*8);
        let resultIndex = 0;

        for (let i = 0; i < planarByteArray.length; i++) {
            if (i % 4 === 0) {
                const byte0 = planarByteArray[i + 0];
                const byte1 = planarByteArray[i + 1];
                const byte2 = planarByteArray[i + 2];
                const byte3 = planarByteArray[i + 3];
                const px0 = ((byte0 & masks[0]) >> 7) | ((byte1 & masks[0]) >> 6) | ((byte2 & masks[0]) >> 5) | ((byte3 & masks[0]) >> 4);
                const px1 = ((byte0 & masks[1]) >> 6) | ((byte1 & masks[1]) >> 5) | ((byte2 & masks[1]) >> 4) | ((byte3 & masks[1]) >> 3);
                const px2 = ((byte0 & masks[2]) >> 5) | ((byte1 & masks[2]) >> 4) | ((byte2 & masks[2]) >> 3) | ((byte3 & masks[2]) >> 2);
                const px3 = ((byte0 & masks[3]) >> 4) | ((byte1 & masks[3]) >> 3) | ((byte2 & masks[3]) >> 2) | ((byte3 & masks[3]) >> 1);
                const px4 = ((byte0 & masks[4]) >> 3) | ((byte1 & masks[4]) >> 2) | ((byte2 & masks[4]) >> 1) | ((byte3 & masks[4]) >> 0);
                const px5 = ((byte0 & masks[5]) >> 2) | ((byte1 & masks[5]) >> 1) | ((byte2 & masks[5]) >> 0) | ((byte3 & masks[5]) << 1);
                const px6 = ((byte0 & masks[6]) >> 1) | ((byte1 & masks[6]) >> 0) | ((byte2 & masks[6]) << 1) | ((byte3 & masks[6]) << 2);
                const px7 = ((byte0 & masks[7]) >> 0) | ((byte1 & masks[7]) << 1) | ((byte2 & masks[7]) << 2) | ((byte3 & masks[7]) << 3);
                pixelArray[resultIndex + 0] = px0;
                pixelArray[resultIndex + 1] = px1;
                pixelArray[resultIndex + 2] = px2;
                pixelArray[resultIndex + 3] = px3;
                pixelArray[resultIndex + 4] = px4;
                pixelArray[resultIndex + 5] = px5;
                pixelArray[resultIndex + 6] = px6;
                pixelArray[resultIndex + 7] = px7;
                resultIndex += 8;
            }
        }

        return new Tile(pixelArray);
    }
}

const masks = [
    parseInt('10000000', 2),
    parseInt('01000000', 2),
    parseInt('00100000', 2),
    parseInt('00010000', 2),
    parseInt('00001000', 2),
    parseInt('00000100', 2),
    parseInt('00000010', 2),
    parseInt('00000001', 2)
];