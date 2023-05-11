import TileMapTile from "../models/tileMapTile.js";
import TileMapTileJsonSerialiser from "../serialisers/tileMapTileJsonSerialiser.js";

export default class TileMapTileFactory {


    /**
     * Creates a new instance of a tile map tile object.
     * @returns {TileMapTile}
     */
    static create() {
        return new TileMapTile();
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
