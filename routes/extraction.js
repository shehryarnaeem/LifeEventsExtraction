const express=require("express");
const extractionRouter=express.Router();
const extractionService=require('../services/extractionService')


extractionRouter.post("/",extract)
extractionRouter.get("/train",train)


function extract(req,res,next){
  extractionService.extract(req.body.tweet)
  .then(result=>res.json(result))
  .catch(err=>next(err))
}

function train(req,res,next){
  extractionService.train()
  .then(result=>{
  console.log(result)
  })
  .catch(err=>console.log(err))
}

module.exports={extractionRouter,train}