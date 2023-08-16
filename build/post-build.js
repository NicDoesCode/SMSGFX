const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();


function run() {
    makeGoogleAnalyticsConfig();
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
    const filePath = path.join(distDir, 'config', 'googleAnalytics.json');
    fs.writeFileSync(filePath, gaString);
}

run();