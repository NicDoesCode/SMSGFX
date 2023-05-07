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
 * @property {boolean?} optimiseTileMap - When true an optimised tile map is generated.
 * @property {number?} paletteIndex - Palette index to use for the tiles.
 * @property {number?} tileMapMemoryOffset - Memory offset of the tile map.
 * @exports
 */