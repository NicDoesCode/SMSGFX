import CacheUtil from '../util/cacheUtil.js';
import Project from '../models/project.js';
import ProjectJsonSerialiser from '../serialisers/projectJsonSerialiser.js';

export default class SampleProjectManager {


    static async getInstanceAsync() {
        if (!SampleProjectManager.#instance) {
            SampleProjectManager.#instance = await SampleProjectManager.createAsync();
        }
        return SampleProjectManager.#instance;
    }

    /** @type {SampleProjectManager} */
    static #instance = null;


    get samples() {
        return this.#samples;
    }


    /** @type {SampleProject[]} */
    #samples = null;


    /**
     * Initialises a new instance of the sample manager.
     */
    constructor() {
    }


    /**
     * Creates a new instance of the sample manager and loads the config from a file.
     * @returns {Promise<SampleProjectManager>}
     */
    static async createAsync() {
        const result = new SampleProjectManager();
        await result.getSampleProjectsAsync();
        return result;
    }


    /**
     * Gets the list of samples.
     * @returns {Promise<SampleProject[]>}
     */
    async getSampleProjectsAsync() {
        if (this.#samples) return this.#samples;

        this.#samples = [];

        const url = `./assets/sample/samples.json${CacheUtil.getCacheBuster() ?? ''}`;
        try {
            let resp = await fetch(url);
            if (resp.ok) {
                this.#samples = JSON.parse(await resp.text());
            } 
        } catch {
            console.error('Unable to get list of samples.');
        }

        return this.#samples;
    }


    /**
     * Loads a sample project.
     * @param {string} relativeUrl - Url where to find the project, relative to the site root.
     * @returns {Promise<Project>}
     */
    async loadSampleProjectAsync(relativeUrl) {
        if (typeof relativeUrl !== 'string') throw new Error('Relative URL was not valid.');

        const url = `${relativeUrl}${CacheUtil.getCacheBuster() ?? ''}`;
        let resp = await fetch(url);
        if (resp.ok) {
            const jsonString = await resp.text();
            return ProjectJsonSerialiser.deserialise(jsonString);
        } else {
            throw new Error(`Project not found: ${relativeUrl}`);
        }
    }


}

/**
 * @typedef {import('../types.js').SampleProject} SampleProject
 */