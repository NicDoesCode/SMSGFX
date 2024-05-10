import ProjectEntry from "../models/projectEntry.js";

export default class ProjectEntryFactory {


    /**
     * Creates a new instance of the project entry class.
     * @param {ProjectEntryInitialValues} values - Initial values for the project entry.
     */
     static create(values) {
        return new ProjectEntry(values.id, values.title, values.systemType, values.dateLastModified);
    }


}

/**
 * @typedef {Object} ProjectEntryInitialValues
 * @property {string?} id - Unique ID of the new project, if not supplied one will be created.
 * @property {string?} title - Title, if not supplied one will be created.
 * @property {string?} systemType - Type of system targetted, either 'smsgg', 'gb' or 'nes', default is 'smsgg'.
 * @property {Date|number} dateLastModified - Date of last modification for the project.
 * @exports
 */