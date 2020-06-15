const PivotalApi = require('../ScriptsApis/PivotalApi.js')
const PivotalStory = require('../ScriptsApis/PivotalStory.js')
const MondayApi = require('../ScriptsApis/MondayApi.js')
const Promise = require('bluebird')
const _ = require('lodash')

const pivotal = new PivotalApi();
const monday = new MondayApi();
let index = 0 

const compare = (amountOfMonth = 2) => {
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(amountOfMonth),
    mondayItems: monday.getGroupsItems(['Sprint actual'])
  })
  .then(({pivotalStories,mondayItems}) => {
    const __pivotalAndMonday = pivotalNotMonday => {
        return _.difference(pivotalStories,pivotalNotMonday)
    }
    const __itemsIdsInPivotalStories = pivotalAndMonday => {
      return _.map(pivotalAndMonday, pivotalStory => {
        return new PivotalStory(pivotalStory).getMondayItemId(mondayItems)
      })
    }
    var pivotalNotMonday = _.filter(pivotalStories, pivotalStory => {
      return !new PivotalStory(pivotalStory).isMondayStory(mondayItems)
    })
    var pivotalAndMonday = __pivotalAndMonday(pivotalNotMonday)
    var itemsIdsInPivotalStories = __itemsIdsInPivotalStories(pivotalAndMonday) 
    var mondaySprintAndPivotal = _.filter(mondayItems,mondayItem => {
      return _.some(itemsIdsInPivotalStories, id => id == mondayItem.id)  
    })
    return {
      pivotalTot: pivotalStories.length,
      mondaySprintTot: mondayItems.length,
      pivotalNotMonday,
      pivotalAndMonday,
      mondaySprintAndPivotal
    }
  })
  .then(({pivotalTot,mondaySprintTot,pivotalNotMonday,pivotalAndMonday,mondaySprintAndPivotal}) => {
    const __console = (name,log,divider) => {
      const loger = divider? `\n${name} : ${log} || ${_.round(log/divider,3)*100}%` : `\n${name} : ${log}`
      console.log(loger)
    }
    __console('Amount Of Month',amountOfMonth)
    __console('pivotalTot',pivotalTot)
    __console('pivotalNotMonday', pivotalNotMonday.length,pivotalTot)
    __console('pivotalAndMonday', pivotalAndMonday.length,pivotalTot)
    __console('mondaySprintTot',mondaySprintTot)
    __console('mondaySprintAndPivotal',mondaySprintAndPivotal.length,mondaySprintTot)
  })//work in progres

}

compare(1)