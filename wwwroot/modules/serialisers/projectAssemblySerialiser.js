import Project from "../models/project.js";

export default class ProjectAssemblySerialiser {


    /**
     * Exports project tile set and colour palettes as WLA-DX compatible assembly code.
     * @param {Project} project - The project to export.
     * @param {ProjectAssemblySerialisationOptions?} options - Serialisation options.
     */
    static serialise(project, options) {
        throw new Error('Not implemented!')
    }


}
/**
 * Project assembly serialisation options.
 * @typedef {object} ProjectAssemblySerialisationOptions
 * @property {string[]?} [tileMapIds] - Tile map IDs to serialise, when omitted all tile maps are serialised, when null or empty none are serialised.
 * @property {string?} optimiseMode - Optimisation mode to use, 'default', 'always' or 'never'.
 * @property {number?} tileMapMemoryOffset - Memory offset of the tile map.
 * @property {boolean} exportTileMaps - Export tile maps?
 * @property {boolean} exportTileSet - Export the tile set?
 * @property {boolean} exportPalettes - Export palettes?
 * @exports
 */