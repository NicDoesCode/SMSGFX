import GeneralUtil from "../util/generalUtil.js";

/**
 * Represents basic information about a project.
 */
export default class ProjectEntry {


    /** Gets or sets the project id. */
    get id() {
        return this.#id;
    }
    set id(value) {
        this.#id = value;
    }

    /** Gets or sets the project title. */
    get title() {
        return this.#title;
    }
    set title(value) {
        this.#title = value;
    }

    /** Gets or sets the system type (either 'smsgg' or 'gb'). */
    get systemType() {
        return this.#systemType;
    }
    set systemType(value) {
        this.#systemType = value;
    }

    /** Gets or sets the date that this project was last modified. */
    get dateLastModified() {
        return this.#dateLastModified;
    }
    set dateLastModified(value) {
        this.#dateLastModified = value;
    }


    /** @type {string} */
    #id = null;
    /** @type {string} */
    #title;
    /** @type {string} */
    #systemType;
    /** @type {Date} */
    #dateLastModified;


    /**
     * Creates a new instance of the project entry class.
     * @param {string?} id - ID of the project.
     * @param {string?} title - Title, if not supplied one will be created.
     * @param {string?} systemType - Type of system targetted, either 'smsgg', 'gb' or 'nes', default is 'smsgg'.
     * @param {Date|number|null} dateLastModified - Date that the project was last modified.
     */
    constructor(id, title, systemType, dateLastModified) {

        if (typeof id !== 'undefined' && id !== null && id.length > 0) {
            this.#id = id;
        } else {
            this.id = GeneralUtil.generateRandomString(16);
        }

        if (typeof title !== 'undefined' && title !== null) {
            this.title = title;
        } else {
            this.title = 'New project';
        }

        if (typeof systemType !== 'undefined' && systemType !== null) {
            switch (systemType) {
                case 'gb': this.systemType = 'gb'; break;
                case 'nes': this.systemType = 'nes'; break;
                case 'smsgg': default: this.systemType = 'smsgg'; break;
            }
        } else {
            this.systemType = 'smsgg';
        }

        if (dateLastModified instanceof Date) {
            this.#dateLastModified = dateLastModified;
        } else if (typeof dateLastModified === 'number') {
            this.#dateLastModified = new Date(dateLastModified);
        } else {
            this.#dateLastModified = new Date();
        }
    }


}