const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const natural = require('../ScriptsApis/natural.js')
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const creatableStories = (pivotalStories,mondayItems) => {
  return _.filter(pivotal.notIceboxedStories(pivotalStories),story => ! new PivotalStory(story).isMondayStory(mondayItems))
} 
const createUncreatedEpicStories = () => {
  return Promise.props({
    pivotalStories: pivotal.getNMonthEpicStories(1),
    mondayItems: monday.getAllItems()
  })
  .then(({pivotalStories,mondayItems}) => creatableStories(pivotalStories,mondayItems))
}