const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const natural = require('../ScriptsApis/natural.js')
const utils = require('./utils.js')
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const filterFunction = ({pivotalStories,pivotalEpics,mondayItems}) => {
  return _.filter(pivotalStories, pivotalStory => pivotal.isEpicStory(pivotalStory,pivotalEpics))
} 
const createEpicStories = () => { 
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(2),
    pivotalEpics: pivotal.getEpics(),
    mondayItems: monday.getAllItems()    
  })
  .then(({pivotalStories,pivotalEpics,mondayItems}) => utils.creatableStories({pivotalStories,pivotalEpics,mondayItems,filterFunction}))
  .then(creatableStories => monday.createItems({
    pivotalStories:creatableStories,
    groupName:'Pivotal Basket'     
    }))
  .catch(err => console.log(err))
}

createEpicStories()