import TileSet from "../models/tileSet.js";

export default class TileSetFactory {


    /**
     * Creates a new instance of a tile set object.
     * @returns {TileSet}
     */
    static create() {
        return new TileSet();
    }

    /**
     * Creates a tile set from a given array.
     * @param {Uint8ClampedArray} sourceArray Contains the values for each pixel.
     * @param {number} [sourceIndex=0] Optional. Index to start reading from.
     * @param {number} [sourceLength=null] Optional. Number of items to read, if the end of the array is reached then reading will stop.
     */
     static fromArray(sourceArray, sourceIndex, sourceLength) {
        if (!sourceArray) throw new Error('Source array was not valid.');
        if (!sourceIndex) sourceIndex = 0;
        if (sourceIndex >= sourceArray.length) throw new Error('The source index exceeds the bounds of the source array.');
        if (sourceIndex < 0) throw new Error('Source index must be 0 or greater.');
        if (sourceLength === null) sourceLength = sourceIndex - sourceArray.length;
        else if (sourceLength < 0) throw new Error('Source length must be greater than 0.');

        const result = TileSetFactory.create();
        let leftToRead = sourceLength;
        while (sourceIndex < sourceArray.length) {
            let amtToRead = Math.min(leftToRead, 64);
            const sourceReadEnd = sourceIndex + amtToRead;
            if (sourceReadEnd > sourceArray.length) amtToRead = sourceIndex - sourceArray.length;

            const tile = TileFactory.fromArray(sourceArray, sourceIndex, amtToRead);
            result.addTile(tile);

            sourceIndex += 64;
        }
        return result;
    }


}