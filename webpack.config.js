const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const fs = require('fs');

module.exports = {
    mode: 'production',
    entry: './wwwroot/modules/main.js',
    output: {
        filename: 'modules/main.js',
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
                    filename: 'assets/[name]-[hash][ext]'
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
            inject: 'body'
        }),
        new HtmlWebpackPlugin({
            templateContent: bundleHtmlTempatesIntoSingleFile(),
            filename: 'modules/ui/ui.html',
            inject: false,
            minify: false
        }),
        new HtmlWebpackPlugin({
            template: './wwwroot/privacy.html',
            filename: 'privacy.html',
            inject: false
        }),
        new HtmlWebpackPlugin({
            template: './wwwroot/404.html',
            filename: '404.html',
            inject: false
        }),
        new CopyPlugin({
            patterns: [
                { from: 'wwwroot/assets/image', to: 'assets/image' },
                { from: 'wwwroot/config', to: 'config' }
            ]
        })
    ]
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