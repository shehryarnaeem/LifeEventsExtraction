const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const helperFunctions=require('./utils/helperFunctions')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); 


const extractionRouter=require('./routes/extraction');
app.use('/extract',extractionRouter)

const port=process.env.port
const server = app.listen(8000, function () {
  console.log('Server listening on port '+port);
})
