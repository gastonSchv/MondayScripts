const MondayApi = require('../ScriptsApis/MondayApi.js');
const mondayConfig = require('../Config/mondayConfig.js')
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const Promise = require('bluebird')

const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 
const monday = new MondayApi(mondayConfig.productBoardId);



const completeItemsDateField = (pivotalStories,mondayItems) => {
  return Promise.map(pivotalStories, pivotalStory => completeItemDateField(pivotalStory,mondayItems)
}//to be continued

const update = amountOfMonth => {
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(amountOfMonth),
    mondayItems: monday.getNMonthItems(amountOfMonth)
  })
  .then(({pivotalStories,mondayItems}) => completeItemsDateField(pivotalStories,mondayItems))
} 
