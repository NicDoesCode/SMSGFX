import CacheUtil from '../util/cacheUtil.js';

export default class VersionManager {


    /**
     * @returns {Promise<VersionManager>}
     */
    static async getInstanceAsync() {
        if (!VersionManager.#instance) {
            VersionManager.#instance = await VersionManager.createAsync();
        }
        return VersionManager.#instance;
    }

    static #instance = null;


    get versions() {
        return this.#version.versions;
    }

    get channels() {
        return this.#version.channels;
    }


    /** @type {VersionManagerConfig} */
    #version = null;


    /**
     * Initialises a new instance of the Config manager.
     */
    constructor() {
    }


    /**
     * Creates a new instance of the config manager and loads the config from a file.
     * @returns {Promise<VersionManager>}
     */
    static async createAsync() {
        const result = new VersionManager();
        await result.loadConfigAsync();
        return result;
    }


    /**
     * Gets the configuration.
     * @returns {Promise<VersionManagerConfig>}
     */
    async loadConfigAsync() {
        if (this.#version) return this.#version;

        const url = `./metadata/version.json${CacheUtil.getCacheBuster() ?? ''}`;
        let resp = await fetch(url);
        if (resp.ok) {
            this.#version = JSON.parse(await resp.text());
        } else {
            this.#version = { versions: [], channels: {} };
        }

        return this.#version;
    }


    /**
     * Gets the channel of a given host name or null if not found.
     * @param {string} hostname - Host name to look up the channel reference for.
     * @returns {ChannelInformation?}
     */
    getChannel(hostname) {
        if (typeof hostname !== 'string') return null;
        if (this.#version.channelHostMappings[hostname]) {
            const channelName = this.#version.channelHostMappings[hostname];
            return this.#version.channels[channelName] ?? null;
        }
    }


}

/**
 * @typedef {Object} VersionManagerConfig
 * @property {Object<string, VersionInformation>} versions - Details on all of the versions.
 * @property {Object<string, ChannelInformation>} channels - Details on all of the channels.
 * @property {Object<string, string>} channelHostMappings - Host names to channel mappings.
 * @exports
 */
/**
 * @typedef {Object} VersionInformation
 * @property {string} releaseNotesUrl - URL for documentation inline help.
 * @property {number} major - Major version number.
 * @property {number} minor - Minor version number.
 * @property {number} patch - Patch version number.
 * @exports
 */
/**
 * @typedef {Object} ChannelInformation
 * @property {string} hidden - Hide the channel from the channel list?
 * @property {string} name - Name of the channel.
 * @property {string} description - Description of the channel.
 * @property {string} url - Accessible URL of the channel.
 * @exports
 */
