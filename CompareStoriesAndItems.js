const PivotalApi = require('../ScriptsApis/PivotalApi.js')
const PivotalStory = require('../ScriptsApis/PivotalStory.js')
const MondayApi = require('../ScriptsApis/MondayApi.js')
const Promise = require('bluebird')
const _ = require('lodash')

const pivotal = new PivotalApi();
const monday = new MondayApi();
let index = 0 

const __mondayItems = mondayItems => {
	return _.filter(mondayItems,({name}) => !(/dummy|dumy/gi.test(name)))
}

const compare = (amountOfMonth = 2) => {
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(amountOfMonth),
    allPivotalStories: pivotal.getNMonthStories(amountOfMonth+6),
    mondayItems: monday.getGroupsItems(['Sprint actual']),
    allMondayItems: monday.getAllItems()
  })
  .then(({pivotalStories,allPivotalStories,mondayItems,allMondayItems}) => {
    const __pivotalAndMonday = pivotalNotMonday => {
        return _.difference(pivotalStories,pivotalNotMonday)
    }
    const __itemsIdsInPivotalStories = allPivotalStories => {
      return _(allPivotalStories) 
      .map(pivotalStory => {
        try {
          return new PivotalStory(pivotalStory).getMondayItemId(allMondayItems)
        }catch(err){return ''}
      })
      .compact()
      .value()
    }
    var pivotalNotMonday = _.filter(pivotalStories, pivotalStory => {
      return !new PivotalStory(pivotalStory).isMondayStory(allMondayItems)
    })
    var pivotalAndMonday = __pivotalAndMonday(pivotalNotMonday)
    var itemsIdsInPivotalStories = __itemsIdsInPivotalStories(allPivotalStories) 
    var mondaySprintAndPivotal = _.filter(mondayItems,mondayItem => {
      return _.some(itemsIdsInPivotalStories, id => id == mondayItem.id)  
    })
    return {
      pivotalTot: pivotalStories.length,
      mondaySprintTot: __mondayItems(mondayItems).length,
      pivotalNotMonday,
      pivotalAndMonday,
      mondaySprintAndPivotal
    }
  })
  .then(({pivotalTot,mondaySprintTot,pivotalNotMonday,pivotalAndMonday,mondaySprintAndPivotal}) => {
      const __console = (name,log,divider) => {
      const loger = divider? `\n${name} : ${log} || ${_.round((log/divider)*100,1)}%` : `\n${name} : ${log}`
      console.log(loger)
    }
    __console('\n\nAmount Of Month',amountOfMonth)
    __console('pivotalTot',pivotalTot)
    __console('pivotalNotMonday', pivotalNotMonday.length,pivotalTot)
    __console('pivotalAndMonday', pivotalAndMonday.length,pivotalTot)
    __console('mondaySprintTot',mondaySprintTot)
    __console('mondaySprintAndPivotal',mondaySprintAndPivotal.length,mondaySprintTot)
  })
}

module.exports = compare