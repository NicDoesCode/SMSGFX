import CacheUtil from '../util/cacheUtil.js';

export default class ConfigManager {


    /**
     * @returns {Promise<ConfigManager>}
     */
    static async getInstanceAsync() {
        if (!ConfigManager.#instance) {
            ConfigManager.#instance = await ConfigManager.createAsync();
        }
        return ConfigManager.#instance;
    }

    static #instance = null;


    get config() {
        return this.#config;
    }


    /** @type {ConfigManagerConfig} */
    #config = null;


    /**
     * Initialises a new instance of the Config manager.
     */
    constructor() {
    }


    /**
     * Creates a new instance of the config manager and loads the config from a file.
     * @returns {Promise<ConfigManager>}
     */
    static async createAsync() {
        const result = new ConfigManager();
        await result.loadConfigAsync();
        return result;
    }


    /**
     * Gets the configuration.
     * @returns {Promise<ConfigManagerConfig>}
     */
    async loadConfigAsync() {
        if (this.#config) return this.#config;

        const url = `./config/config.json${CacheUtil.getCacheBuster() ?? ''}`;
        let resp = await fetch(url);
        if (resp.ok) {
            this.#config = JSON.parse(await resp.text());
        } else {
            this.#config = {};
        }

        if (typeof this.#config.patreonHandle !== 'string') this.#config.patreonHandle = null;
        if (typeof this.#config.kofiHandle !== 'string') this.#config.kofiHandle = null;
        if (typeof this.#config.documentationUrl !== 'string') this.#config.documentationUrl = null;
        if (typeof this.#config.documentationInlineUrl !== 'string') this.#config.documentationInlineUrl = null;

        return this.#config;
    }


}

/**
 * @typedef ConfigManagerConfig
 * @type {object}
 * @property {string?} patreonHandle - Patreon handle.
 * @property {string?} kofiHandle - Ko-Fi handle.
 * @property {string?} documentationUrl - URL for main documentation site.
 * @property {string?} documentationInlineUrl - URL for documentation inline help.
 * @exports
 */