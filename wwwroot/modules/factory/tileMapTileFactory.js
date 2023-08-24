import TileMapTile from "../models/tileMapTile.js";
import TileMapTileJsonSerialiser from "../serialisers/tileMapTileJsonSerialiser.js";

export default class TileMapTileFactory {


    /**
     * Creates a new instance of a tile map tile object.
     * @param {TileMapTileFactoryCreateArgs} [args] - Arguments for tile map tile creation.
     * @returns {TileMapTile}
     */
    static create(args) {
        if (typeof args === 'undefined' || args === null) {
            return new TileMapTile();
        } else {
            const result = new TileMapTile();
            if (typeof args.tileId === 'string') result.tileId = args.tileId;
            if (typeof args.priority === 'boolean') result.priority = args.priority;
            if (typeof args.palette === 'number') result.palette = args.palette;
            if (typeof args.verticalFlip === 'boolean') result.verticalFlip = args.verticalFlip;
            if (typeof args.horizontalFlip === 'boolean') result.horizontalFlip = args.horizontalFlip;
            return result;
        }
    }

    /**
     * Creates a new instance of a tile map tile object from an existing.
     * @param {TileMapTile} tileMapTile - Tile map tile to clone.
     * @returns {TileMapTile}
     */
    static clone(tileMapTile) {
        const serialiseable = TileMapTileJsonSerialiser.toSerialisable(tileMapTile);
        return TileMapTileJsonSerialiser.fromSerialisable(serialiseable);
    }


}
/**
 * @typedef TileMapTileFactoryCreateArgs
 * @type {object}
 * @property {string?} tileId
 * @property {boolean?} priority
 * @property {number?} palette
 * @property {boolean?} verticalFlip
 * @property {boolean?} horizontalFlip
 * @exports
 */
