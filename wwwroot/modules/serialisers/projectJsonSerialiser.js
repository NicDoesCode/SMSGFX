import ProjectFactory from '../factory/projectFactory.js';
import Project from '../models/project.js';
import TileSetJsonSerialiser from './tileSetJsonSerialiser.js';
import PaletteListJsonSerialiser from './paletteListJsonSerialiser.js';

export default class ProjectJsonSerialiser {


    /**
     * Serialises a project to a JSON string.
     * @param {Palette} project - Project to serialise.
     * @param {boolean} format - true for pretty format, otherwise false.
     * @returns {string} 
     */
    static serialise(project, format) {
        if (!project) throw new Error('Please pass a project.');
        if (!format) format = false;

        const result = ProjectJsonSerialiser.toSerialisable(project);
        return JSON.stringify(result, null, format ? ' ' : null);
    }

    /**
     * Returns a deserialised project.
     * @param {string} jsonProject - JSON serialised project.
     * @returns {Project}
     */
    static deserialise(jsonProject) {
        if (!jsonProject || typeof jsonProject !== 'string') throw new Error('Project to deserialise must be passed as a JSON string.');

        /** @type {ProjectSerialisable} */
        const deserialised = JSON.parse(jsonProject);
        return ProjectJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project object to a serialisable one.
     * @param {Project} project - Project to create serialisable from.
     * @returns {ProjectSerialisable} 
     */
    static toSerialisable(project) {
        const version = 1;
        const title = project.title;
        const paletteList = PaletteListJsonSerialiser.toSerialisable(project.paletteList);
        const tileSet = TileSetJsonSerialiser.toSerialisable(project.tileSet);
        return {
            version, title, tileSet, paletteList
        };
    }

    /**
     * Converts a serialisable project back to a project.
     * @param {ProjectSerialisable} projectSerialisable - Serialisable project to convert.
     * @returns {Project}
     */
    static fromSerialisable(projectSerialisable) {
        const title = projectSerialisable.title;
        const tileSet = TileSetJsonSerialiser.fromSerialisable(projectSerialisable.tileSet);
        const paletteList = PaletteListJsonSerialiser.fromSerialisable(projectSerialisable.paletteList);
        return ProjectFactory.create(title, tileSet, paletteList);
    }


}

/**
 * @typedef ProjectSerialisable
 * @type {object}
 * @property {number} version
 * @property {string} title
 * @property {import('./tileSetJsonSerialiser').TileSetSerialisable} tileSet
 * @property {import('./paletteJsonSerialiser').PaletteSerialisable} paletteList
 * @exports
 */