import HtmlWebpackPlugin from "html-webpack-plugin";
import Minimatch from 'minimatch';

const PLUGIN_NAME = 'HtmlWebpackExcludeScriptsPlugin';

export default class HtmlWebpackExcludeScriptsPlugin {


    /** @type {{skipAssets: Array<string|RegExp|Function>, excludeAssets: Array<string|RegExp|Function>}} */
    #config;


    /**
     * @param {{skipAssets: Array<string|RegExp|Function>, excludeAssets: Array<string|RegExp|Function>}} config 
     */
    constructor(config) {
        this.#config = config ?? [];
    }


    apply(compiler) {

        if (compiler.hooks) {
            // webpack 4 support
            compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {

                console.log('WP4'); // TMP 
                if (compilation.outputName === 'index.html') {
                    console.log(compilation); // TMP 
                    // data.plugin.userOptions.chunks.forEach(c => console.log(c));
                }

                // if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
                if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
                    // html webpack 3
                    console.log('html webpack 3'); // TMP 
                    compilation.hooks.beforeAssetTagGeneration.tapAsync(PLUGIN_NAME, (data, callback) => {
                        /** @type {Array<string|RegExp|Function>} */
                        const filters = [
                            ...(this.#config.skipAssets || []),
                            ...(this.#config.excludeAssets || []),
                            ...(data.plugin.options.skipAssets || []),
                            ...(data.plugin.options.excludeAssets || []),
                        ];
                        data.head = this.#skipAssets(data.head, filters);
                        data.body = this.#skipAssets(data.body, filters);
                        return callback(null, data);
                    });
                } else if (HtmlWebpackPlugin && HtmlWebpackPlugin.getHooks) {
                    // html-webpack 4
                    console.log('html-webpack 4'); // TMP 
                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                    // hooks.alterAssetTags.tapAsync(PLUGIN_NAME, (data, callback) => {
                    hooks.alterAssetTags.tapAsync(PLUGIN_NAME, (data, callback) => {
                        // console.log(data.outputName);
                        if (data.outputName === 'index.html') {
                            console.log(data); // TMP 
                            // data.plugin.userOptions.chunks.forEach(c => console.log(c));
                        }
                        // data.assetTags.scripts.forEach(s => console.log(s));
                        // /** @type {Array<string|RegExp|Function>} */
                        // const filters = [
                        //     ...(this.#config.skipAssets || []),
                        //     ...(this.#config.excludeAssets || []),
                        //     ...(data.plugin['options'].skipAssets || []),
                        //     ...(data.plugin['options'].excludeAssets || []),
                        // ];
                        // data.assetTags.scripts = this.#skipAssets(data.assetTags.scripts, filters);
                        // data.assetTags.styles = this.#skipAssets(data.assetTags.styles, filters);
                        // data.assetTags.meta = this.#skipAssets(data.assetTags.meta, filters);
                        // return callback(null, data);
                    });
                } else {
                    throw new Error('Cannot find appropriate compilation hook');
                }
            });

        } else {
            console.log('WP5'); // TMP 
            // Hook into the html-webpack-plugin processing
            compiler.plugin('compilation', (compilation) => {
                compilation.plugin('html-webpack-plugin-alter-asset-tags', (htmlPluginData, callback) => {
                    /** @type {Array<string|RegExp|Function>} */
                    const filters = [
                        ...(this.#config.skipAssets || []),
                        ...(this.#config.excludeAssets || []),
                        ...(htmlPluginData.plugin.options.skipAssets || []),
                        ...(htmlPluginData.plugin.options.excludeAssets || []),
                    ];
                    htmlPluginData.head = this.#skipAssets(htmlPluginData.head, filters);
                    htmlPluginData.body = this.#skipAssets(htmlPluginData.body, filters);
                    return callback(null, htmlPluginData);
                });
            });
        }


    }

    /**
     * @param {HtmlWebpackPlugin.HtmlTagObject[]} assets 
     * @param {Array<string|RegExp|Function>} matchers 
     * @returns {HtmlWebpackPlugin.HtmlTagObject[]}
     */
    #skipAssets(assets, matchers) {
        return assets.filter((asset) => {
            const assetUrl = `${(asset.attributes.src ?? asset.attributes.href ?? '')}`;
            console.log('assetUrl', assetUrl);
            const skipped = matchers.some((matcher) => {
                // if (!matcher) {
                //     return false;
                // }
                // const assetUrl = `${(asset.attributes.src ?? asset.attributes.href ?? '')}`;
                // if (typeof matcher === 'string') {
                //     return minimatch(assetUrl, matcher);
                // }
                // if (matcher.constructor && matcher.constructor.name === 'RegExp') {
                //     /** @type {RegExp} */
                //     const regexMatcher = matcher;
                //     return !!(assetUrl.match(regexMatcher));
                // }
                // if (typeof matcher === 'function') {
                //     const matchesCallback = matcher(asset);
                //     return !!(matchesCallback);
                // }
                return false;
            });
            return !skipped;
        });
    }

}

/** 
 * @typedef {Object} HtmlWebpackExcludeScriptsPluginFilters
 */