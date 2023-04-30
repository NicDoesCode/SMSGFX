import Tile from '../models/tile.js';
import TileFactory from '../factory/tileFactory.js';


export default class GameBoyTileBinarySerialiser {


    /**
     * Serialises a tile to a planar byte array.
     * @param {Tile} tile - Tile to serialise.
     * @returns {Uint8ClampedArray}
     */
    static serialise(tile) {
        const result = new Uint8ClampedArray(16);
        let index = 0;
        for (let row = 0; row < 8; row++) {
            const encoded = [0, 0];
            for (let col = 0; col < 8; col++) {
                const px = tile.readAt((row * 8) + col);
                // const shift = 7 - col;
                const shift = col;
                encoded[1] = encoded[1] | (((px & masks[7]) >> 0) << shift);
                encoded[0] = encoded[0] | (((px & masks[6]) >> 1) << shift);
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
                const px0 = ((byte0 & masks[0]) >> 7) | ((byte1 & masks[0]) >> 6);
                const px1 = ((byte0 & masks[1]) >> 6) | ((byte1 & masks[1]) >> 5);
                const px2 = ((byte0 & masks[2]) >> 5) | ((byte1 & masks[2]) >> 4);
                const px3 = ((byte0 & masks[3]) >> 4) | ((byte1 & masks[3]) >> 3);
                const px4 = ((byte0 & masks[4]) >> 3) | ((byte1 & masks[4]) >> 2);
                const px5 = ((byte0 & masks[5]) >> 2) | ((byte1 & masks[5]) >> 1);
                const px6 = ((byte0 & masks[6]) >> 1) | ((byte1 & masks[6]) >> 0);
                const px7 = ((byte0 & masks[7]) >> 0) | ((byte1 & masks[7]) << 1);
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
