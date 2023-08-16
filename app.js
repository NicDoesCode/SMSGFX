import path from "path";
import fs from "fs";
import url from 'url';
import express from 'express';
import https from 'https';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express();
const portHttp = 8080;
const portHttps = 8443;


function startServer() {

    let servPath = getPath();
    if (!['wwwroot', 'dist'].includes(servPath)) servPath = 'wwwroot';

    app.use(express.static(servPath));

    console.log(`Path: ${path.join(__dirname, servPath)}`);
    
    app.listen(portHttp, () => {
        console.log(`Server running at: http://localhost:${portHttp}`);
    });

    if (fs.existsSync('./cert/server.key') && fs.existsSync('./cert/server.cert')) {
        https.createServer({
            key: fs.readFileSync('./cert/server.key'),
            cert: fs.readFileSync('./cert/server.cert')
        }, app).listen(8443, () => {
            console.log(`Server running at: https://localhost:${portHttps}`);
        });
    } else {
        console.warn(`Unable to create HTTPS server on port ${portHttps} because the files './cert/server.key' and './cert/server.cert' do not exist.`);
    }

}


/**
 * Gets the environment from the '--path' or '-p' parameter.
 * @returns {string}
 */
function getPath() {
    let result = null;
    process.argv.forEach((arg, index, args) => {
        if (arg === '--path' || arg === '-p') {
            if (index + 1 < args.length) {
                const env = args[index + 1];
                if (!env.startsWith('-')) {
                    result = env;
                }
            }
        }
    });
    return result;
}


startServer();