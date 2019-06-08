const helperFunction=require('../utils/helperFunctions')
var classificationArray=[]

async function train(){
  try{
  classificationArray=helperFunction.finalTrainingPipeline(null)
    return {
      success:true
    }
  
  }
  catch(err){
    return {
      success:false,
      error:err
    }
  }
}
async function extract(tweet){
  try{
    result=helperFunction.extractEvent(tweet,classificationArray)
    return{
      success:true,
      result:result
    }
  }
  catch(err){
    return{
      success:false,
      error:err
    }
  }
}


module.exports={
  train,
  classificationArray,
  extract
}