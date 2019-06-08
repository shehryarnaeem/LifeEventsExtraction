const natural=require('natural')
const fs = require('fs') 
const util=require('util')
const stopword=require('stopword')
const xlsx = require('node-xlsx');
const wordnet=natural.WordNet
const stemmer=natural.PorterStemmer

function readPosTweets(){
  data=fs.readFileSync('data/pos.txt')
  tweets=[]
  tweets=data.toString()
  tweets=tweets.split('\t')
  return tweets
}

function readNegTweets(){
  data=fs.readFileSync('data/neg.txt')
  tweets=[]
  tweets=data.toString()
  tweets=tweets.split('\n')
  return tweets
}

function lowercase(tweets){
  if(typeof(tweets)==String){
    return tweets.toLowerCase()
  }

  for( i=0;i<tweets.length;i++){
    tweets[i]=tweets[i].toLowerCase()
  }
  return tweets
}

function removePunctuation(tweets){
  if(typeof(tweets)==String){
    return tweets.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"")
  }
  for(i=0;i<tweets.length;i++){
    tweets[i]=tweets[i].replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"")
  }
  return tweets
}

function removeStopWord(tweets){
  if(typeof(tweets)==String){
    return stopword.removeStopwords(tweets.split(" "))
  }
  for(i=0;i<tweets.length;i++){
    tweets[i]=stopword.removeStopwords(tweets[i].split(" "))
  }
  return tweets
}

function lemmatize(tweets){
  if(typeof(tweets)==String){
    for(i=0;i<tweets.length;i++){
      tweets[i]=stemmer.stem(tweets[i])
      return tweets
    }
  }
  for(i=0;i<tweets.length;i++){
    for (j=0;j<tweets[i].length;j++){
    tweets[i][j]=stemmer.stem(tweets[i][j])
    }
  }
  return tweets
}

function preProcessingPipeline(tweet){
  tweet=lowercase(tweet)
  tweet=removePunctuation(tweet)
  tweet=removeStopWord(tweet)
  tweet=lemmatize(tweet)
  return tweet
}


function train(model,tweets,tag){
  for(i=0;i<tweets.length;i++){
    model.addDocument(tweets[i],tag)
  }

  model.train()
  a=new natural.BayesClassifier()
  // model.events.on('trainedWithDocument',function(obj){
  //   console.log(obj)
  // })

  return model

}


function trainingPosTweets(model){
  tweets=readPosTweets()
  tweets=removePunctuation(tweets)
  tweets=lowercase(tweets)
  tweets=removeStopWord(tweets)
  tweets=lemmatize(tweets)
  model=train(model,tweets,'pos')
  return model
}


function trainingNegTweets(model){
  tweets=readNegTweets()
  tweets=removePunctuation(tweets)
  tweets=lowercase(tweets)
  tweets=removeStopWord(tweets)
  tweets=lemmatize(tweets)
  model=train(model,tweets,'neg')
  return model
}

function trainingPipeline(model){
  if(model==null){
    model=new natural.BayesClassifier()
  }
  model=trainingPosTweets(model)
  model=trainingNegTweets(model)
  model.save("data/posOrNeg.json")
  return model
}

function classifyPosOrNeg(tweet,model){
  tweet=lowercase(tweet)
  tweet=removePunctuation(tweet)
  tweet=removeStopWord(tweet)
  tweet=lemmatize(tweet)
  res=model.classify(tweet)
  return res

}

function preProcessCategories(categories){
  for(var keys in categories){
    categories[keys]=categories[keys].replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"")
    categories[keys]=categories[keys].split(" ")
    categories[keys]=categories[keys].filter(function(value,index,arr){
      return value!=""
    })
  }
  return categories
}

function readCat(){
  var categories={}
  cat=xlsx.parse(fs.readFileSync('data/Categories.xlsx'))
  for(i=1;i<cat[0]['data'].length;i++){
    categories[cat[0]['data'][i][0]]=cat[0]['data'][i][1]
  }
  return categories
  
}

function trainCategories(model){
  if(model==null){
    model=new natural.BayesClassifier()
  }
  categories=readCat()
  categories=preProcessCategories(categories)
  for(var keys in categories){
    for(i=0;i<categories[keys].length;i++){
      model.addDocument(categories[keys][i],keys)
    }
  }
  model.train()
  model.save("data/categories.json")
  return model
}


function classifyCategory(model,tweet){
  return model.classify(tweet)
}
function finalTrainingPipeline(){
  posOrNeg=trainingPipeline(null)
  catClassify=trainCategories(null)
  return [posOrNeg,catClassify]
}
function extractEvent(tweet,classifcationArray){
  try{
  tweet=preProcessingPipeline(tweet)
  posOrNeg=classifyPosOrNeg(tweet,classifcationArray[0])
  if(posOrNeg=='pos'){
    return classifyCategory(classifcationArray[1],tweet)
  }
  return "Not Recognized"
  }
  catch(err){
    console.log(err)
    return err
  }

}

module.exports={
  readPosTweets,
  readNegTweets,
  lowercase,
  removePunctuation,
  removeStopWord,
  lemmatize,
  train,
  trainingPosTweets,
  trainingNegTweets,
  trainingPipeline,
  classifyPosOrNeg,
  readCat,
  preProcessCategories,
  trainCategories,
  classifyCategory,
  finalTrainingPipeline,
  extractEvent
}