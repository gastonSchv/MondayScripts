const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const natural = require('../ScriptsApis/natural.js')
const _ = require('lodash');

const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 


class Utils {
  filteredMondayRelatedStories(pivotalStories,mondayItems){
    return _.filter(pivotalStories, pivotalStory => new PivotalStory(pivotalStory).isMondayStory(mondayItems))
  }
  filteredMondayUnrelatedStories(pivotalStories,mondayItems){
    return _.filter(pivotalStories, pivotalStory => !new PivotalStory(pivotalStory).isMondayStory(mondayItems))
  }
  filterDefaultCreatableStories(pivotalStories,mondayItems){
    return  this.filteredMondayUnrelatedStories(pivotal.notIceboxedStories(pivotalStories),mondayItems)
  }
  creatableStories({pivotalStories,pivotalEpics,mondayItems,filterFunction}) { 
    const __creatableStories = () => {
      return filterFunction({
        pivotalStories:this.filterDefaultCreatableStories(pivotalStories,mondayItems),
        pivotalEpics,
        mondayItems     
      })
    }  
    const __editNameIfEpic = creatableStories => {
      return creatableStories.map(creatableStory => pivotal.changeNameIfEpic(creatableStory,pivotalEpics))
    }
    return __editNameIfEpic(__creatableStories())
  }
}

module.exports = new Utils