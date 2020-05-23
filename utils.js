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


class Utils {
  filterDefaultCreatableStories(pivotalStories,mondayItems){
    return _(pivotal.notIceboxedStories(pivotalStories))
    .filter(notIceboxedStory => ! new PivotalStory(notIceboxedStory).isMondayStory(mondayItems))
    .value()
  }
  creatableStories({pivotalStories,pivotalEpics,mondayItems,filterFunction}) {
    const __filterDefaultCreatable = () => {
      return this.filterDefaultCreatableStories(pivotalStories,mondayItems)
    }
    const __creatableStories = () => {
      return filterFunction({
        pivotalStories:__filterDefaultCreatable(),
        pivotalEpics,
        mondayItems     
      })
    }  
    const __editNameIfEpic = creatableStories => {
      return creatableStories.map(creatableStory => pivotal.changeNameIfEpic(creatableStory,pivotalEpics))
    }

    return __editNameIfEpic(__creatableStories())
  }
  filteredMondayRelatedStories(pivotalStories,mondayItems){
    return pivotalStories.filter(pivotalStory => new PivotalStory(pivotalStory).isMondayStory(mondayItems))
  }
}

module.exports = new Utils