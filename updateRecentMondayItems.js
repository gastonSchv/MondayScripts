const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const _ = require('lodash');
const Promise = require('bluebird')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const filteredMondayRelatedStories = (pivotalStories,mondayItems) => {
  return pivotalStories.filter(pivotalStory => new PivotalStory(pivotalStory).isMondayStory(mondayItems))
}
const formatStory = (pivotalStory,mondayItems) => {
  try {
    return {
      item_id: parseInt(new PivotalStory(pivotalStory).getMondayItemId(mondayItems)),
      columns : {
      status : pivotal.convertToMondayStatus(pivotalStory),
      texto0 : _.get(pivotalStory,'estimate','')
      }
    }
  }
  catch {return}
}
const formatedStories = (pivotalStories,mondayItems) => {
  return pivotalStories.map(pivotalStory => formatStory(pivotalStory,mondayItems)).filter(Boolean)
} 
const updateMondayStory = ({item_id,columns:{status,texto0}}) => {
  return monday.changeStatusAndSp(item_id,status,texto0)
  .catch(err => console.log(err))
}
const updateMondayStories = formattedStories => {
  return Promise.map(formattedStories,updateMondayStory,{concurrency:10})
}
const executeUpdate = () => {
  return Promise.props({
    twoMonthPivotalStories: pivotal.getNMonthStories(5),
    updateableItems: monday.getUpdateableItems()
  })
  .then(({twoMonthPivotalStories,updateableItems}) => {  
    return formatedStories(filteredMondayRelatedStories(twoMonthPivotalStories,updateableItems),updateableItems)
    }
  )
  .then(updateMondayStories)
  .catch(err => console.log(err))
}

executeUpdate()