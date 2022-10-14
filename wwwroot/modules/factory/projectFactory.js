import TileSet from "../models/tileSet.js";
import PaletteList from "../models/paletteList.js";
import Project from "../models/project.js";

export default class ProjectFactory {


    /**
     * Creates a new instance of the project class.
     * @param {TileSet} tileSet - Tile set.
     * @param {PaletteList} paletteList - Colour palettes.
     */
     static create(tileSet, paletteList) {
        return new Project(tileSet, paletteList);
    }


}