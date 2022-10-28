import Tile from '../models/tile.js';
import TileFactory from '../factory/tileFactory.js';


export default class TileBinarySerialiser {


    /**
     * Serialises a tile to a planar byte array.
     * @param {Tile} tile - Tile to serialise.
     */
    static serialise(tile) {
        const result = new Uint8ClampedArray(64);
        let index = 0;
        for (let row = 0; row < 8; row++) {
            const encoded = [0, 0, 0, 0];
            for (let col = 0; col < 8; col++) {
                const px = tile.readAt((row * 8) + col);
                const shift = 7 - col;
                encoded[0] = encoded[0] | (((px & masks[7]) >> 0) << shift);
                encoded[1] = encoded[1] | (((px & masks[6]) >> 1) << shift);
                encoded[2] = encoded[2] | (((px & masks[5]) >> 2) << shift);
                encoded[3] = encoded[3] | (((px & masks[4]) >> 3) << shift);
            }
            for (let e = 0; e < encoded.length; e++) {
                result[index] = encoded[e];
                index++;
            }
        }
        return result;
    }


    /**
     * Parses the tile data in planar format.
     * @param {Uint8ClampedArray} planarByteArray - Array or tile data in planar format.
     * @returns {Tile}
     */
    static deserialise(planarByteArray) {
        const pixelArray = new Uint8ClampedArray(8 * 8);
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

        return TileFactory.fromArray(pixelArray);
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
