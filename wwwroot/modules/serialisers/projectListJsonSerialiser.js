import ProjectList from "../models/projectList.js";
import ProjectJsonSerialiser from "./projectJsonSerialiser.js";


/**
 * Provides project list serialisation functions.
 */
export default class ProjectListJsonSerialiser {


    /**
     * Serialises a project list to JSON.
     * @param {ProjectList} value - Project list to serialise.
     * @throws If a project list was not passed.
     * @returns {string} 
     */
    static serialise(value) {
        if (!value || typeof value.getProjects !== 'function') throw new Error('Please pass a project list.');

        const result = ProjectJsonSerialiser.toSerialisable(value);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised project list.
     * @param {string} jsonString - JSON serialised project list.
     * @throws When the JSON string is null or empty.
     * @returns {ProjectList}
     */
    static deserialise(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Project list to deserialise must be passed as a JSON string.');

        /** @type {import('./projectJsonSerialiser').ProjectSerialisable[]} */
        const deserialised = JSON.parse(jsonString);
        return ProjectJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project object to a serialisable one.
     * @param {ProjectList} projectList - Project list to convert.
     * @throws When a valid project list was not passed.
     * @returns {import('./projectJsonSerialiser.js').ProjectSerialisable[]} 
     */
    static toSerialisable(projectList) {
        if (!value instanceof ProjectList) throw new Error('Please pass a project list.');

        return projectList.getProjects().map(project => ProjectJsonSerialiser.toSerialisable(project));
    }

    /**
     * Converts a serialisable project list back to a project list.
     * @param {import('./projectJsonSerialiser.js').ProjectSerialisable[]} serialisable - Serialisable project to convert.
     * @throws When the passed serialisable list of projects was not valid.
     * @returns {ProjectList}
     */
    static fromSerialisable(serialisable) {
        if (!serialisable || !Array.isArray(serialisable)) throw new Error('Please pass an array of serialisable projects.');

        const result = new ProjectList();
        serialisable.forEach(p => {
            try {
                result.addProject(ProjectJsonSerialiser.fromSerialisable(p));
            } catch (e) {
                console.error('Unable to restore project.', p);
                console.error(e);
            }
        });
        return result;
    }


}
