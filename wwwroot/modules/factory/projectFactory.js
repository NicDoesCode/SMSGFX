import TileSet from "../models/tileSet.js";
import PaletteList from "../models/paletteList.js";
import Project from "../models/project.js";

export default class ProjectFactory {


    /**
     * Creates a new instance of the project class.
     * @param {string?} title - Title, if not supplied one will be created.
     * @param {TileSet?} tileSet - Tile set, if not supplied one will be created.
     * @param {PaletteList?} paletteList - Colour palettes, if not supplied one will be created.
     */
     static create(title, tileSet, paletteList) {
        return new Project(title, tileSet, paletteList);
    }


}