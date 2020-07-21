const createStoriesInPivotal = require('./createStoriesInPivotal.js')
const createEpicsItems = require('./createRecentEpicsStories.js') 
const updateItems = require('./updateRecentMondayItems.js')

const execute = () => {
	return createStoriesInPivotal()
	.then(() => createEpicsItems())
	.delay(10*1000)
	.then(() => updateItems())
	.catch(err => console.log(err.message))
}

execute()