import ProjectFactory from '../factory/projectFactory.js';
import Project from '../models/project.js';
import TileSetJsonSerialiser from './tileSetJsonSerialiser.js';
import PaletteListJsonSerialiser from './paletteListJsonSerialiser.js';
import TileMapListJsonSerialiser from './tileMapListJsonSerialiser.js';


/**
 * Provides project serialisation functions.
 */
export default class ProjectJsonSerialiser {


    /**
     * Serialises a project to a JSON string.
     * @param {Project} value - Project to serialise.
     * @param {boolean} format - true for pretty format, otherwise false.
     * @throws When an invalid project object is passed.
     * @returns {string} 
     */
    static serialise(value, format) {
        if (!value instanceof Project) throw new Error('Please pass a project.');
        if (!format) format = false;

        const result = ProjectJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result, null, format ? ' ' : null);
    }

    /**
     * Returns a deserialised project.
     * @param {string} jsonString - JSON serialised project.
     * @throws When the JSON string is null or empty.
     * @returns {Project}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {ProjectSerialisable} */
        const deserialised = JSON.parse(jsonString);
        return ProjectJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project object to a serialisable one.
     * @param {Project} value - Project to create serialisable from.
     * @throws When a valid project was not passed.
     * @returns {ProjectSerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof Project) throw new Error('Please pass a project.');
      
        return {
            id: value?.id ?? null,
            version: 1,
            title: value.title,
            systemType: value.systemType,
            dateLastModified: value.dateLastModified?.getTime() ?? Date.now(),
            tileSet: TileSetJsonSerialiser.toSerialisable(value.tileSet),
            tileMapList: TileMapListJsonSerialiser.toSerialisable(value.tileMapList),
            paletteList: PaletteListJsonSerialiser.toSerialisable(value.paletteList)
        };
    }

    /**
     * Converts a serialisable project back to a project.
     * @param {ProjectSerialisable} serialisable - Serialisable project to convert.
     * @returns {Project}
     */
    static fromSerialisable(serialisable) {
        return ProjectFactory.create({
            id: serialisable.id ?? null,
            title: serialisable.title,
            systemType: serialisable.systemType,
            dateLastModified: new Date(serialisable.dateLastModified ?? 0),
            tileSet: TileSetJsonSerialiser.fromSerialisable(serialisable.tileSet),
            tileMapList: TileMapListJsonSerialiser.fromSerialisable(serialisable.tileMapList ?? []),
            paletteList: PaletteListJsonSerialiser.fromSerialisable(serialisable.paletteList ?? [])
        });
    }


}

/**
 * @typedef {Object} ProjectSerialisable
 * @property {number} version
 * @property {string} id
 * @property {string} title
 * @property {string} systemType
 * @property {number} dateLastModified
 * @property {import('./tileSetJsonSerialiser').TileSetSerialisable} tileSet
 * @property {import('./tileMapJsonSerialiser.js').TileMapSerialisable} tileMapList
 * @property {import('./paletteJsonSerialiser').PaletteSerialisable} paletteList
 * @exports
 */


/**
 * Converts a project serialisable across versions.
 * @param {ProjectSerialisable} projectSerialisable - Serialisable project to convert.
 * @returns {ProjectSerialisable}
 */
function convertProjectVersion(projectSerialisable) {
    if (projectSerialisable.version === 1) {
        projectSerialisable.version = 2;

        if (typeof projectSerialisable.tileSet['tileWidth'] === 'number' && !projectSerialisable.tileSet.columnCount) {
            projectSerialisable.tileSet.columnCount = projectSerialisable.tileSet['tileWidth'];
        }
    }
}