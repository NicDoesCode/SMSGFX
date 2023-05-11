import TileMapList from "../models/tileMapList.js";

export default class TileMapListFactory {


    /**
     * Creates a new instance of a tile map list object.
     * @param {TileMapList[]?} [tileMaps] - Initial array of tile maps to populate.
     */
     static create(tileMaps) {
        return new TileMapList(tileMaps);
    }


}