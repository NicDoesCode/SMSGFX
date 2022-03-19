const port = 8080;
const express = require('express');
const app = express();

app.use(express.static('wwwroot'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}.`);
});