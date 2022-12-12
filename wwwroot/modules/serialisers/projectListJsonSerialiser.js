import ProjectList from "../models/projectList.js";
import ProjectJsonSerialiser from "./projectJsonSerialiser.js";

export default class ProjectListJsonSerialiser {


    /**
     * Serialises a project list to JSON.
     * @param {ProjectList} projectList - Project list to serialise.
     * @returns {string} 
     */
    static serialise(projectList) {
        if (!projectList || typeof projectList.getProjects !== 'function') throw new Error('Please pass a project list.');

        const result = ProjectJsonSerialiser.toSerialisable(projectList);
        return JSON.stringify(result);
    }

    /**
     * Returns a deserialised project list.
     * @param {string} jsonProjectList - JSON serialised project list.
     * @returns {ProjectList}
     */
    static deserialise(jsonProjectList) {
        if (!jsonProjectList || typeof jsonProjectList !== 'string') throw new Error('Project list to deserialise must be passed as a JSON string.');

        /** @type {import('./projectJsonSerialiser').ProjectSerialisable[]} */
        const deserialised = JSON.parse(jsonProjectList);
        return ProjectJsonSerialiser.fromSerialisable(deserialised);
    }

    /**
     * Converts a project object to a serialisable one.
     * @param {ProjectList} projectList - Project list to convert.
     * @returns {import('./projectJsonSerialiser.js').ProjectSerialisable[]} 
     */
    static toSerialisable(projectList) {
        if (!projectList || typeof projectList.getProjects !== 'function') throw new Error('Please pass a project list.');

        return projectList.getProjects().map(project => ProjectJsonSerialiser.toSerialisable(project));
    }

    /**
     * Converts a serialisable project array array back to a project list.
     * @param {import('./projectJsonSerialiser.js').ProjectSerialisable[]} projectSerialisableArray - Serialisable project to convert.
     * @returns {ProjectList}
     */
    static fromSerialisable(projectSerialisableArray) {
        if (!projectSerialisableArray || !Array.isArray(projectSerialisableArray)) throw new Error('Please pass an array of serialisable projects.');

        const result = new ProjectList();
        projectSerialisableArray.forEach(p => {
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
