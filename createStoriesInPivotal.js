const Monday = require('../ScriptsApis/MondayApi.js')
const PivotalStory = require('../ScriptsApis/PivotalStory.js')
const PivotalApi = require('../ScriptsApis/PivotalApi.js')
const Promise = require('bluebird')
const _ = require('lodash')
const config = require('../Config/mondayConfig.js')

const monday = new Monday();
const pivotal = new PivotalApi()

const filterCraetableItems = ({items,stories}) => {
	const __isListoAndHasSp = ({column_values}) => {
		return mapValue(column_values,"status") == "Lista Para Pivotal" && mapSpValue(column_values) !== ""
	}
	const __isNotInPivotal = (item,stories) => {
		return !_.some(stories,story => story.isThisMondayStory(item))
	}	
	return _(items)
	.filter(item => __isListoAndHasSp(item))
	.filter(item => __isNotInPivotal(item,stories))
	.value()
} 
const mapValue = (column_values,id) => {
	return _.get(_.find(column_values,{id}),'text')
}
const  mapSpValue = column_values => {
	return mapValue(column_values,"texto0")
}
const mapTypeValue = column_values => {
	return _.get(config.TYPES_MAPPING,mapValue(column_values,'estado7'),"")
}
const itemsToStoryFormat = items => {
	return _.map(items, ({id,name,column_values}) => {
		return {
			name : `[Monday Created] ${name}`,
			description:`https://producteca.monday.com/boards/427697446/pulses/${id}`,
			story_type: mapTypeValue(column_values),
			current_state: 'unStarted',
			estimate:parseInt(mapSpValue(column_values))
		}
	})
}
const create = stories => {
	const pivoCreation = story => {
	return pivotal.createStory(story)
	}
	return Promise.map(stories,pivoCreation,{concurrency:4})
}
const createStories = () => {
	return Promise.props({
		items: monday.getGroupsItems(['Sprint actual']),
		stories: pivotal.getNMonthInstancedStories(4)
	})
	.then(filterCraetableItems)
	.then(itemsToStoryFormat)
	.tap(console.log)
	.then(create)
}

module.exports = createStories