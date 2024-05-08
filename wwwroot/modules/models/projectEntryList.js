import Project from "./project.js";
import ProjectEntry from "./projectEntry.js";

export default class ProjectEntryList {


    /**
     * Gets the count of items. 
     */
    get length() {
        return this.#entries.length;
    }


    /** @type {ProjectEntry[]} */
    #entries = [];


    /**
     * Creates a new instance of a project entry list.
     * @param {ProjectEntry[]?} items - Initial array of items to populate.
     */
    constructor(items) {
        if (items && !Array.isArray(items)) throw new Error('Array of project entries must be passed.');
        if (items && Array.isArray(items)) {
            items.forEach(p => this.addProjectEntry(p));
        }
    }


    /**
     * Returns all items.
     * @returns {ProjectEntry[]}
     */
    getProjectEntries() {
        return this.#entries.slice();
    }

    /**
     * Does the project list contain a project with a given unique ID.
     * @param {string} projectId - Unique ID of the item to check.
     * @returns {boolean}
     */
    containsProjectEntryById(projectId) {
        if (projectId) {
            return this.#entries.filter(p => p.id === projectId).length > 0;
        }
        return false;
    }

    /**
     * Gets the index of a given project entry by project ID.
     * @param {string} projectId - Unique ID of the item to check.
     * @returns {number} Index, or `-1` if not found.
     */
    indexById(projectId) {
        if (projectId) {
            for (let i = 0; i < this.#entries.length; i++) {
                if (this.#entries[p].id === projectId) return i;
            }
        }
        return -1;
    }

    /**
     * Gets an item by ID.
     * @param {string} projectId - ID of the item to get.
     * @returns {ProjectEntry|null}
     */
    getProjectEntryById(projectId) {
        if (projectId) {
            const found = this.#entries.filter(p => p.id === projectId);
            if (found.length > 0) {
                return found[0];
            }
        }
        return null;
    }

    /**
     * Gets an item by index.
     * @param {number} index - Index of the item to get.
     * @throws Index is out of range.
     * @returns {ProjectEntry}
     */
    getProjectEntry(index) {
        if (index >= 0 && index < this.#entries.length) {
            return this.#entries[index];
        } else {
            throw new Error('Index out of range.');
        }
    }

    /**
     * Gets an item by index, or null if out of range.
     * @param {number} index - Index of the item to get.
     * @returns {ProjectEntry?}
     */
    getProjectEntryByIndex(index) {
        if (index >= 0 && index < this.#entries.length) {
            return this.#entries[index];
        } else {
            return null;
        }
    }

    /**
     * Adds an item to the list.
     * @param {ProjectEntry|ProjectEntry[]} value - Item or array of items to add.
     */
    addProjectEntry(value) {
        if (Array.isArray(value)) {
            value.forEach(item => this.#entries.push(item));
        } else {
            this.#entries.push(value);
        }
    }

    /**
     * Inserts an item by index.
     * @param {number} index - Index of where to insert the item.
     * @param {ProjectEntry} value - Value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#entries.length);
        if (index === 0) this.#entries.unshift(value);
        else if (index === this.#entries.length) this.#entries.push(value);
        else this.#entries = this.#entries.splice(index, 0, value);
    }

    /**
     * Sets an item by index.
     * @param {number} index - Index of the item to set.
     * @param {ProjectEntry} value - Project value to set.
     */
    setProject(index, value) {
        if (index >= 0 && index < this.#entries.length) {
            this.#entries[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes an item at a given index.
     * @param {number} index - Index of the item to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#entries.length) {
            this.#entries.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the list.
     */
    clear() {
        this.#entries.splice(0, this.#entries.length);
    }


    /**
     * Adds or updates the project entry that matches the given project object.
     * @param {Project} project - Project to add or update the entry from.
     * @returns {ProjectEntry} The updated project entry.
     */
    addOrUpdateFromProject(project) {
        const entry = this.getProjectEntryById(project.id);
        if (entry) {
            entry.title = project.title;
            entry.systemType = project.systemType;
            entry.dateLastModified = project.dateLastModified;
        } else {
            this.addProjectEntry({
                id: project.id,
                title: project.title,
                systemType: project.systemType,
                dateLastModified: project.dateLastModified
            });
        }
        return this.getProjectEntryById(project.id);
    }


}
