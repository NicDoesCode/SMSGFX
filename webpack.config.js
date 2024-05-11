import HtmlWebpackPlugin from "html-webpack-plugin";
// import HtmlWebpackExcludeScriptsPlugin from "./build/plugins/HtmlWebpackExcludeScriptsPlugin.js";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import fs from "fs";
import url from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const environment = process.env[`ENVIRONMENT`]?.toLowerCase() ?? null;

console.log(`Environment: ${(environment ?? '')}`);
console.log(`(Configure using 'ENVIRONMENT' environment variable, eg. ENVIRONMENT=develop)`);

const envSettings = {
    mode: 'production'
};
if (environment === 'develop') {
    envSettings.mode = 'development';
    envSettings.devtool = 'source-map';
}

export default {
    ...envSettings,
    entry: {
        main: './wwwroot/modules/main.js',
        pages: './wwwroot/pages/pages.js',
        tileEditorViewportWorker: './wwwroot/modules/worker/tileEditorViewportWorker.js',
        tileImageWorker: './wwwroot/modules/worker/tileImageWorker.js',
    },
    output: {
        filename: (pathData) => {
            if (pathData.chunk.name === 'main') {
                return 'modules/[name].js?v=[hash]';
            } else if (pathData.chunk.name === 'pages') {
                return 'pages/[name].js?v=[hash]';
            } else if (pathData.chunk.name.toLowerCase().includes('worker')) {
                return 'modules/worker/[name].js?v=[hash]';
            } else {
                return 'assets/scripts/[name].js?v=[hash]';
            }
        },
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                use: 'html-loader'
            },
            {
                test: /\.(png|jpg|gif|svg|ico)$/i,
                type: 'asset',
                generator: {
                    filename: `assets/[name]-[hash][ext]`
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './wwwroot/index.html',
            filename: 'index.html',
            chunks: ['main'],
            inject: 'body',
            hash: true,
            // excludeAssets: [
            //     (asset) => {
            //         console.log('ASSET!', asset);
            //         return asset.attributes && asset.attributes["x-skip"]
            //     }
            // ],
        }),
        new CopyPlugin({
            patterns: [
                { from: 'wwwroot/assets/image', to: 'assets/image' },
                { from: 'wwwroot/assets/sample', to: 'assets/sample', noErrorOnMissing: true },
                { from: 'wwwroot/config', to: 'config', noErrorOnMissing: true },
                { from: 'wwwroot/metadata', to: 'metadata' },
            ]
        }),
        new HtmlWebpackPlugin({
            templateContent: bundleHtmlTempatesIntoSingleFile(),
            filename: 'modules/ui/ui.html',
            inject: false,
            minify: false
        }),
        ...createPagesHtmlWebpackPlugins(),
        // new HtmlWebpackSkipAssetsPlugin()
        // new HtmlWebpackExcludeScriptsPlugin(),
    ]
}


/**
 * Scans for HTML files in the UI path and returns them as a single file.
 * @param {Array} pluginsArray - Array of webpack plugins.
 * @returns {Array}
 */
function createPagesHtmlWebpackPlugins() {
    const baseDirectory = path.join(__dirname, 'wwwroot', 'pages');
    const foundFiles = fs.readdirSync(baseDirectory).filter((filePath) => filePath.toLowerCase().endsWith('.html') && filePath.toLowerCase() !== 'index.html');
    return foundFiles.map((htmlFileName) => {
        return new HtmlWebpackPlugin({
            template: path.join(__dirname, 'wwwroot', 'pages', htmlFileName),
            filename: `pages/${htmlFileName}`,
            chunks: ['pages'],
            inject: "head",
            hash: true,
            scriptLoading: "blocking",
            minify: false, 
            // excludeAssets: ['**.js'],
        });
    });
}

/**
 * Generates a random string.
 * @param {number} length - Length of the string to generate.
 */
function generateRandomString(length) {
    if (length < 0) throw new Error('Length must be greater than 0.');
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(Math.round(Math.random() * 15).toString(16));
    }
    return result.join('');
}

/**
 * Scans for HTML files in the UI path and returns them as a single file.
 * @returns {string}
 */
function bundleHtmlTempatesIntoSingleFile() {
    const baseDirectory = path.join(__dirname, 'wwwroot', 'modules', 'ui');
    const foundHtmlFiles = getHtmlFilesRecursive(baseDirectory, []);
    const result = foundHtmlFiles.map((htmlFilePath) => {
        return fs.readFileSync(htmlFilePath);
    });
    return result.join(' ');
}

/**
 * Gets an array of HTML files from a path recursively.
 * @param {string} directoryToScan - Directory to recursively scan for HTML files.
 * @param {string[]} foundHtmlFiles - Array of files to append to.
 * @returns {string[]}
 */
function getHtmlFilesRecursive(directoryToScan, foundHtmlFiles) {
    const foundFiles = fs.readdirSync(directoryToScan);
    foundFiles.forEach((foundFile) => {
        const fullFilePath = path.join(directoryToScan, foundFile);
        if (/\.html$/i.test(foundFile)) {
            // If HTML file then add full path to array.
            foundHtmlFiles.push(fullFilePath);
        } else if (fs.statSync(fullFilePath).isDirectory()) {
            // If directory then enter it and find more HTML files.
            getHtmlFilesRecursive(fullFilePath, foundHtmlFiles);
        }
    });
    return foundHtmlFiles;
}
