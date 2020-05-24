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


const createStoriesFromEpic = (epicName) => { 
  const filterFunction = ({pivotalStories,pivotalEpics,mondayItems}) => {
  return _.filter(pivotalStories, pivotalStory =>  new PivotalStory(pivotalStory).hasLabel(epicName))
} 
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(3),
    pivotalEpics: pivotal.getEpics(),
    mondayItems: monday.getAllItems()    
  })
  .then(({pivotalStories,pivotalEpics,mondayItems}) => Promise.props ({
    creatableStories: utils.creatableStories({pivotalStories,pivotalEpics,mondayItems,filterFunction}),
    mondayItems :mondayItems
  }))
  .then(({creatableStories,mondayItems}) => monday.createItems({
    pivotalStories:creatableStories,
    groupName:'Pivotal Basket',
    mondayItems     
    }))
  .catch(err => console.log(err))
}

createStoriesFromEpic('')