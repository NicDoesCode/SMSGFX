import ProjectEntryList from "../models/projectEntryList.js";
import ProjectEntryJsonSerialiser from "./projectEntryJsonSerialiser.js";


/**
 * Provides project entry list serialisation functions.
 */
export default class ProjectEntryListJsonSerialiser {


    /**
     * Serialises a project entry list to JSON.
     * @param {ProjectEntryList} value - Project entry list to serialise.
     * @throws If a project entry list was not passed.
     * @returns {string} 
     */
    static serialise(value) {
        if (!value instanceof ProjectEntryList) throw new Error('Please pass a project entry list.');

        const result = ProjectEntryListJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised project entry list.
     * @param {string} jsonString - JSON serialised project entry list.
     * @throws When the JSON string is null or empty.
     * @returns {ProjectEntryList}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Project list to deserialise must be passed as a JSON string.');

        /** @type {import('./projectEntryJsonSerialiser.js').ProjectEntrySerialisable[]} */
        const deserialised = JSON.parse(jsonString);
        return ProjectEntryListJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project entry list object to a serialisable one.
     * @param {ProjectEntryList} projectEntryList - Project entry list to convert.
     * @throws When a valid project list was not passed.
     * @returns {import('./projectEntryJsonSerialiser.js').ProjectEntrySerialisable[]} 
     */
    static toSerialisable(projectEntryList) {
        if (!projectEntryList instanceof ProjectEntryList) throw new Error('Please pass a project entry list.');

        return projectEntryList.getProjectEntries().map((entry) => ProjectEntryJsonSerialiser.toSerialisable(entry));
    }

    /**
     * Converts a serialisable project entry list back to a project list.
     * @param {import('./projectEntryJsonSerialiser.js').ProjectEntrySerialisable[]} serialisable - Serialisable project entry array to convert.
     * @throws When the passed serialisable list of project entries was not valid.
     * @returns {ProjectEntryList}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable || !Array.isArray(serialisable)) throw new Error('Please pass an array of serialisable project entries.');

        const result = new ProjectEntryList();
        serialisable.forEach((entry) => {
            try {
                result.addProjectEntry(ProjectEntryJsonSerialiser.fromSerialisable(entry));
            } catch (e) {
                console.error('Unable to restore project entry.', entry);
                console.error(e);
            }
        });
        return result;
    }


}
