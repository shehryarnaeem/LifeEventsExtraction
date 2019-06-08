const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); 


const extractionRouter=require('./routes/extraction').extractionRouter;
app.use('/extract',extractionRouter)

const port=process.env.port
const server = app.listen(8085,function(){
  console.log("Connected")
  require('./routes/extraction').train()
  console.log("trained")
})
