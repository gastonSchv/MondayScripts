const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const getTwoMonthPivotalStories = () => {
  const twoMonthAgo = moment().subtract(2,'month').format('MM/DD/YYYY');
  const today = moment().format('MM/DD/YYYY');

  return pivotal.getStoriesFromPeriod(twoMonthAgo,today)
}
const filteredMondayRelatedStories = (pivotalStories,mondayItems) => {
  return pivotalStories.filter(story => new PivotalStory(story).isMondayStory(mondayItems))
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
  return pivotalStories.map(story => formatStory(story,mondayItems)).filter(Boolean)
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
    twoMonthPivotalStories: getTwoMonthPivotalStories(),
    sprintAndTerminadoItems: monday.getSprintAndTerminadoItems()
  })
  .then(({twoMonthPivotalStories,sprintAndTerminadoItems}) => {
    return formatedStories(filteredMondayRelatedStories(twoMonthPivotalStories,sprintAndTerminadoItems),sprintAndTerminadoItems)
    }
  )
  .then(updateMondayStories)
  .catch(err => console.log(err))
}

executeUpdate()