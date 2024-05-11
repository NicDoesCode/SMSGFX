import path from "path";
import fs from "fs";
import url from 'url';
import dotenv from 'dotenv';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Load environment variables
dotenv.config();


function run() {
    makeConfig();
    makeGoogleAnalyticsConfig();
}


function makeConfig() {
    const config = {
        patreonHandle: process.env[`HANDLE_PATREON`] ?? null,
        kofiHandle: process.env[`HANDLE_KOFI`] ?? null,
        documentationUrl: process.env[`DOCUMENTATION_URL`] ?? null, 
        documentationInlineUrl: process.env[`DOCUMENTATION_INLINE_URL`] ?? null
    };
    const configString = JSON.stringify(config);
    const distDir = path.resolve(__dirname, '..', 'dist');
    const targetDir = path.join(distDir, 'config');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
    const filePath = path.join(targetDir, 'config.json');
    fs.writeFileSync(filePath, configString);
}

function makeGoogleAnalyticsConfig() {
    const useGA = (process.env[`GOOGLE_ANALYTICS_USE`] && process.env[`GOOGLE_ANALYTICS_USE`].toLowerCase() === 'true');
    const gaKey = process.env[`GOOGLE_ANALYTICS_KEY`] ?? null;

    const gaConfig = {
        useGoogleAnalytics: (useGA && gaKey) ? true : false,
        key: gaKey ?? 'YOUR_KEY'
    };
    const gaString = JSON.stringify(gaConfig);
    const distDir = path.resolve(__dirname, '..', 'dist');
    const targetDir = path.join(distDir, 'config');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
    const filePath = path.join(targetDir, 'googleAnalytics.json');
    fs.writeFileSync(filePath, gaString);
}

run();