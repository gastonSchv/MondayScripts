const createStoriesInPivotal = require('./createStoriesInPivotal.js')
const createEpicsItems = require('./createRecentEpicsStories.js') 
const updateItems = require('./updateRecentMondayItems.js')
const CompareStoriesAndItems = require('./CompareStoriesAndItems.js')

const execute = () => {
	return createStoriesInPivotal()
	.then(() => createEpicsItems())
	.then(() => updateItems())
	.then(() => CompareStoriesAndItems(1))
	.catch(err => console.log(err.message))
}

execute()