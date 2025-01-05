import ProjectEntryFactory from '../factory/projectEntryFactory.js';
import ProjectEntry from '../models/projectEntry.js';


/**
 * Provides project entry serialisation functions.
 */
export default class ProjectEntryJsonSerialiser {


    /**
     * Serialises a project to a JSON string.
     * @param {ProjectEntry} value - Project entry to serialise.
     * @param {boolean} format - true for pretty format, otherwise false.
     * @throws When an invalid project entry object is passed.
     * @returns {string} 
     */
    static serialise(value, format) {
        if (!value instanceof ProjectEntry) throw new Error('Please pass a project entry.');
        if (!format) format = false;

        const result = ProjectEntryJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result, null, format ? ' ' : null);
    }

    /**
     * Returns a deserialised project entry.
     * @param {string} jsonString - JSON serialised project entry.
     * @throws When the JSON string is null or empty.
     * @returns {ProjectEntry}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Please pass a valid JSON string.');

        /** @type {ProjectEntrySerialisable} */
        const deserialised = JSON.parse(jsonString);
        return ProjectEntryJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project entry object to a serialisable one.
     * @param {ProjectEntry} value - Project entry to create serialisable from.
     * @throws When a valid project entry was not passed.
     * @returns {ProjectEntrySerialisable} 
     */
    static toSerialisable(value) {
        if (!value instanceof ProjectEntry) throw new Error('Please pass a project entry.');
      
        return {
            id: value?.id ?? null,
            title: value.title,
            systemType: value.systemType,
            dateLastModified: value.dateLastModified?.getTime() ?? Date.now()
        };
    }

    /**
     * Converts a serialisable project back to a project.
     * @param {ProjectEntrySerialisable} serialisable - Serialisable project to convert.
     * @returns {Project}
     */
    static fromSerialisable(serialisable) {
        return ProjectEntryFactory.create({
            id: serialisable.id ?? null,
            title: serialisable.title,
            systemType: serialisable.systemType,
            dateLastModified: new Date(serialisable.dateLastModified ?? 0)
        });
    }


}

/**
 * @typedef {Object} ProjectEntrySerialisable
 * @property {string} id
 * @property {string} title
 * @property {string} systemType
 * @property {number} dateLastModified
 * @exports
 */
