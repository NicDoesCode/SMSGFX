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

        let global = {};
        let instance = {};

        let resp = await fetch('config/googleAnalytics.json');
        if (resp.ok) {
            global = JSON.parse(await resp.text());
            if (global.useGoogleAnalytics) {
                resp = await fetch('config/googleAnalytics.instance.json');
                if (resp.ok) {
                    instance = JSON.parse(await resp.text());
                }
            }
        }
        this.#config = {
            ...global,
            ...instance
        }
        return this.#config;
    }


    /**
     * Injects the Google Analytics script if configured.
     */
    async injectIfConfiguredAsync() {
        if (this.#injected) throw new Error('Script has already been injected.');
        const config = await this.loadConfigAsync();
        if (config.useGoogleAnalytics && config.key) {
            this.#injected = true;

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.key}`;
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
 * @typedef GoogleAnalyticsConfig
 * @type {object}
 * @property {boolean} useGoogleAnalytics - Gets whether to use Google Analytics or not.
 * @property {string|undefined} key - Google Analytics key.
 * @exports
 */