const fs = require('fs');
const express = require('express');
const https = require('https');
const app = express();
const portHttp = 8080;
const portHttps = 8443;

app.use(express.static('wwwroot'));
// app.use(express.static('dist'));

if (fs.existsSync('./cert/server.key') && fs.existsSync('./cert/server.cert')) {
    https.createServer({
        key: fs.readFileSync('./cert/server.key'),
        cert: fs.readFileSync('./cert/server.cert')
    }, app).listen(8443, () => {
        console.log(`Server running at http://localhost:${portHttps}.`);
    });
} else {
    console.warn(`Unable to create HTTPS server on port ${portHttps} because the files './cert/server.key' and './cert/server.cert' do not exist.`);
}

app.listen(portHttp, () => {
    console.log(`Server running at http://localhost:${portHttp}.`);
});