const express=require("express");
const extractionRouter=express.Router();
const helperFunctions=require('../utils/helperFunctions')


extractionRouter.post("/",extract)


function extract(req,res,next){
  result=helperFunctions.finalPipeline(req.body.tweet)
  res.json(result)
}

module.exports=extractionRouter