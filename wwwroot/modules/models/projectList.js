import Project from "./project.js";

export default class ProjectList {


    /**
     * Gets the count of items. 
     */
    get length() {
        return this.#projects.length;
    }


    /** @type {Project[]} */
    #projects = [];


    /**
     * Creates a new instance of a project list.
     * @param {Project[]?} items - Initial array of items to populate.
     */
    constructor(items) {
        if (items && !Array.isArray(items)) throw new Error('Array of projects must be passed.');
        if (items && Array.isArray(items)) {
            items.forEach(p => this.addProject(p));
        }
    }


    /**
     * Returns all items.
     * @returns {Project[]}
     */
    getProjects() {
        return this.#projects.slice();
    }

    /**
     * Does the project list contain a project with a given unique ID.
     * @param {string} projectId - Unique ID of the item to check.
     * @returns {boolean}
     */
    containsProjectById(projectId) {
        if (projectId) {
            return this.#projects.filter(p => p.id === projectId).length > 0;
        }
        return false;
    }

    /**
     * Gets an item by ID.
     * @param {string} projectId - ID of the item to get.
     * @returns {Project|null}
     */
    getProjectById(projectId) {
        if (projectId) {
            const found = this.#projects.filter(p => p.id === projectId);
            if (found.length > 0) {
                return found[0];
            }
        }
        return null;
    }

    /**
     * Gets an item by index.
     * @param {number} index - Index of the item to get.
     * @returns {Project}
     */
    getProject(index) {
        if (index >= 0 && index < this.#projects.length) {
            return this.#projects[index];
        } else {
            throw new Error('Index out of range.');
        }
    }

    /**
     * Adds an item to the list.
     * @param {Project|Project[]} value - Item or array of items to add.
     */
    addProject(value) {
        if (Array.isArray(value)) {
            value.forEach(item => this.#projects.push(item));
        } else {
            this.#projects.push(value);
        }
    }

    /**
     * Inserts an item by index.
     * @param {number} index - Index of where to insert the item.
     * @param {Project} value - Value to insert.
     */
    insertAt(index, value) {
        index = Math.max(index, 0);
        index = Math.min(index, this.#projects.length);
        if (index === 0) this.#projects.unshift(value);
        else if (index === this.#projects.length) this.#projects.push(value);
        else this.#projects = this.#projects.splice(index, 0, value);
    }

    /**
     * Sets an item by index.
     * @param {number} index - Index of the item to set.
     * @param {Project} value - Project value to set.
     */
    setProject(index, value) {
        if (index >= 0 && index < this.#projects.length) {
            this.#projects[index] = value;
        } else throw new Error('Index out of range.');
    }

    /**
     * Removes an item at a given index.
     * @param {number} index - Index of the item to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#projects.length) {
            this.#projects.splice(index, 1);
        } else throw new Error('Index out of range.');
    }

    /**
     * Clears the list.
     */
    clear() {
        this.#projects.splice(0, this.#projects.length);
    }


}
