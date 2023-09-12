import TileSet from "../models/tileSet.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";
import TileFactory from "./tileFactory.js";

export default class TileSetFactory {


    /**
     * Creates a new instance of a tile set object.
     * @param {TileSetFactoryCreateArgs} [args] - Arguments for tile set creation.
     * @returns {TileSet}
     */
    static create(args) {
        const result = new TileSet();

        if (typeof args?.tileWidth === 'number') {
            result.tileWidth = args.tileWidth;
        }

        if (args?.tiles instanceof TileSet) {
            args.tiles.getTiles().forEach((tile) => result.addTile(tile));

        } else if (Array.isArray(args?.tiles)) {
            args.tiles.forEach((tile) => result.addTile(tile));

        } else if (typeof args?.numberOfTiles === 'number' && args?.numberOfTiles > 0) {
            const defaultColourIndex = Math.max(typeof args?.defaultColourIndex === 'number' ? args?.defaultColourIndex : 0, 0);
            for (let i = 0; i < args.numberOfTiles; i++) {
                result.addTile(TileFactory.create({
                    defaultColourIndex: defaultColourIndex
                }));
            }
        }

        return result;
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


    /**
     * Creates a deep copy of a tile set.
     * @param {TileSet} sourceTileSet - Tile set to clone.
     * @returns {TileSet}
     */
    static clone(sourceTileSet) {
        if (!sourceTileSet instanceof TileSet)
            throw new Error('Clone source was not a tile set.');

        const json = TileSetJsonSerialiser.serialise(sourceTileSet);
        const cloned = TileSetJsonSerialiser.deserialise(json);
        return cloned;
    }


}
/**
 * Arguments for creating a tile set.
 * @typedef {Object} TileSetFactoryCreateArgs
 * @property {number?} [tileWidth] - Display tile width.
 * @property {number?} [numberOfTiles] - Populate with a number of tiles.
 * @property {number?} [defaultColourIndex] - Colour index to set as the initial colour of the tile, defaults to 15 when not supplied.
 * @property {Tile[]|TileSet|null} [tiles] - List of tiles to be added, or tile set containing the tiles.
 * @exports
 */
