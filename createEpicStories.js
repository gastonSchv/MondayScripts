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

const creatableStories = (pivotalStories,pivotalEpics,mondayItems) => {
  const __filterCreatable = () => {
    return _(pivotal.notIceboxedStories(pivotalStories))
      .filter(notIceboxedStory => ! new PivotalStory(notIceboxedStory).isMondayStory(mondayItems))
      .filter(isMondayStory => pivotal.isEpicStory(isMondayStory,pivotalEpics))
      .value()
  }
  const __editNameIfEpic = creatableStories => {
    return creatableStories.map(creatableStory => pivotal.changeNameIfEpic(creatableStory,pivotalEpics))
  }
  return __editNameIfEpic(__filterCreatable())
} 
const createEpicStories = () => { 
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(2),
    pivotalEpics: pivotal.getEpics(),
    mondayItems: monday.getAllItems()    
  })
  .then(({pivotalStories,pivotalEpics,mondayItems}) => creatableStories(pivotalStories,pivotalEpics,mondayItems))
  .then(creatableStories => monday.createItems({
    pivotalStories:creatableStories,
    groupName:'PivotalBasket'     
    }))
  .catch(err => console.log(err))//agregar un then que toma la response y verifique si hubo errores
}

createEpicStories()