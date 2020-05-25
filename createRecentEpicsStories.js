const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const utils = require('./utils.js')
const _ = require('lodash');
const Promise = require('bluebird')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const filterFunction = ({pivotalStories,pivotalEpics,mondayItems}) => {
  return _.filter(pivotalStories, pivotalStory => pivotal.isEpicStory(pivotalStory,pivotalEpics))
} 
const createEpicStories = () => { 
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(1),
    pivotalEpics: pivotal.getEpics(),
    mondayItems: monday.getAllItems()    
  })
  .then(({pivotalStories,pivotalEpics,mondayItems}) => Promise.props({
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


createEpicStories()