require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {mongoose} = require('./db/mongoose');


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use(require('./routes'));


app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});
