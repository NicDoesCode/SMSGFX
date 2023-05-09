import TileSet from "../models/tileSet.js";
import PaletteList from "../models/paletteList.js";
import Project from "../models/project.js";

export default class ProjectFactory {


    /**
     * Creates a new instance of the project class.
     * @param {ProjectInitialValues} values - Initial values for the project.
     */
     static create(values) {
        return new Project(values.id, values.title, values.systemType, values.tileSet, values.paletteList);
    }


}

/**
 * @typedef {Object} ProjectInitialValues
 * @property {string?} id - Unique ID of the new project, if not supplied one will be created.
 * @property {string?} title - Title, if not supplied one will be created.
 * @property {string?} systemType - Type of system targetted, either 'smsgg' or 'gb', default is 'smsgg'.
 * @property {TileSet?} tileSet - Tile set, if not supplied one will be created.
 * @property {PaletteList?} paletteList - Colour palettes, if not supplied one will be created.
 * @exports
 */