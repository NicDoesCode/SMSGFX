import CacheUtil from '../util/cacheUtil.js';

export default class GoogleAnalyticsManager {


    get useGoogleAnalytics() {
        return this.#config?.useGoogleAnalytics ?? false;
    }
    get key() {
        return this.#config?.key ?? null;
    }


    #injected = false;
    /** @type {GoogleAnalyticsConfig} */
    #config = null;


    /**
     * Initialises a new instance of the Google Analytics manager.
     */
    constructor() {
    }


    /**
     * Gets the Google Analytics configuration.
     * @returns {Promise<GoogleAnalyticsConfig>}
     */
    async loadConfigAsync() {
        if (this.#config) return this.#config;

        const url = `./config/googleAnalytics.json${CacheUtil.getCacheBuster() ?? ''}`;
        let resp = await fetch(url);
        if (resp.ok) {
            this.#config = JSON.parse(await resp.text());
        }

        return this.#config;
    }


    /**
     * Injects the Google Analytics script if configured.
     */
    async injectIfConfiguredAsync() {
        if (this.#injected) throw new Error('Script has already been injected.');
        const config = await this.loadConfigAsync();
        if (config?.useGoogleAnalytics && config?.key) {
            this.#injected = true;

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.key)}`;
            script.onload = (ev) => {
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', config.key);
            };
            document.head.append(script);
        }
    }


}

/**
 * @typedef {Object} 
 * @property {boolean} useGoogleAnalytics - Gets whether to use Google Analytics or not.
 * @property {string|undefined} key - Google Analytics key.
 * @exports
 */