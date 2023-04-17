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
            templateContent: getUITemplates(),
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

function getUITemplates() {
    const files = fs.readdirSync(path.join(__dirname, 'wwwroot', 'modules', 'ui'));
    const htmlFiles = files.filter((file) => /\.html$/i.test(file)).map(file => {
        return path.join(__dirname, 'wwwroot', 'modules', 'ui', file)
    });
    const result = htmlFiles.map((file) => {
        return fs.readFileSync(file);
    });
    return result.join(' ');
}