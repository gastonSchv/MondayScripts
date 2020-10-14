const MondayApi = require('../ScriptsApis/MondayApi.js');
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const PivotalStory = require('../ScriptsApis/PivotalStory.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const mondayConfig = require('../Config/mondayConfig.js')
const _ = require('lodash');
const Promise = require('bluebird')
const utils = require('./utils.js')

const monday = new MondayApi(mondayConfig.productBoardId);
const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 

const formatStory = (pivotalStory,mondayItems,itemsEnEspera) => {
  try {
	const item_id = parseInt(new PivotalStory(pivotalStory).getMondayItemId(mondayItems))
  	
  	const isInEspera = (item_id,itemsEnEspera) => {
  	return _(itemsEnEspera)
  	.some(mondayItem => _.get(mondayItem,'id') == item_id)
  	}

   	if(isInEspera(item_id,itemsEnEspera)) {return}

    return {
      item_id,
      columns : {
      status : pivotal.convertToMondayStatus(pivotalStory),
      texto0 : _.get(pivotalStory,'estimate','')
      }
    }
  }
  catch(e){console.log(e);return}
}
const formatedStories = (pivotalStories,mondayItems) => {
  return pivotalStories.map(pivotalStory => formatStory(pivotalStory,mondayItems,filterEnEspera(mondayItems))).filter(Boolean)
} 
const updateMondayStory = ({item_id,columns:{status,texto0}}) => {
  return monday.changeStatusAndSp(item_id,status,texto0)
  .catch(err => console.log(err.config))
}
const updateMondayStories = formattedStories => {
  return Promise.map(formattedStories,updateMondayStory,{concurrency:10})
}
const filterEnEspera = items => {
	return _.filter(items, ({column_values}) => _.find(column_values,{text:'En Espera'}))
}
const executeUpdate = () => {
  return Promise.props({
    twoMonthPivotalStories: pivotal.getNMonthStories(3),
    updateableItems: monday.getUpdateableGroupsItems()
  })
  .then(({twoMonthPivotalStories,updateableItems}) => {
    return formatedStories(utils.filteredMondayRelatedStories(twoMonthPivotalStories,updateableItems),updateableItems)
    }
  )
  .then(updateMondayStories)
  .catch(err => console.log(err))
}

module.exports = executeUpdate