require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('', (req, res) => {
    res.send('hugo');
});

app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});
