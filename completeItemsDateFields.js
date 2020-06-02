const MondayApi = require('../ScriptsApis/MondayApi.js');
const mondayConfig = require('../Config/mondayConfig.js')
const PivotalApi = require('../ScriptsApis/PivotalApi.js');
const pivotalConfig = require('../Config/pivotalConfig.js')
const Promise = require('bluebird')
const PivotalStory = require('../ScriptsApis/PivotalStory.js')
const _ = require('lodash')

const pivotal = new PivotalApi(pivotalConfig.parsimotionProjectId) 
const monday = new MondayApi(mondayConfig.productBoardId);


const getDatesFieldsItems = (mondayItems,pivotalStories) => {
  const __matchingCouples = () => {
    const __findMondayItem = pivotalStoryInstance => {
    return _.find(mondayItems, {id: pivotalStoryInstance.getMondayItemId(mondayItems)})
  }//está rompiendo en algun lugar porque le esta pasando un undefined a natural. EStá consolelogeado en natural strict match.
    const __generateMondaytItem = pivotalStory => {
      var mondayItem = __findMondayItem(new PivotalStory(pivotalStory))
      return _.assign(mondayItem,{started_at : monday.getStartingDate(mondayItem)})
    }
    return _(pivotalStories)
    .filter(pivotalStory =>  new PivotalStory(pivotalStory).isMondayStory(mondayItems)) 
    .map(pivotalStory => {
      try { 
        return {
          pivotalStory,
         mondayItem: __generateMondaytItem(pivotalStory)
        }
      }catch(err){
        console.log(`error catched: ${err.message}`)
        return {err}
      }
    })
    .value()
  }
  const __pivotaMatchinglItems = matchingCouples => {
    matchingCouples = _.filter(matchingCouples,'pivotalStory')
    console.log('matchingCouples: ', matchingCouples.length)
    return _.map(matchingCouples, ({mondayItem,pivotalStory}) => {
      const __minDate = property => {
        console.log([_.get(mondayItem,property),_.get(pivotalStory,property)])
        return _.min([_.get(mondayItem,property),_.get(pivotalStory,property)])
      }
      return {
      item_id : _.get(mondayItem,'id'),
      dateObjects: [
        {columnName:'fecha_desarrollo6',date: __minDate('created_at')},
        {columnName:'fecha52',date:_.get(mondayItem,'started_at')},
        {columnName:'fecha_desarrollo', date: _.get(pivotalStory,'accepted_at','')}
      ]
      }
    })
  }
  return __pivotaMatchinglItems(__matchingCouples())
}
const completeItemDateFields = mondayItem => {
  const {item_id,dateObjects} = mondayItem
  return monday.changeDates(item_id,dateObjects)
  .catch(err => console.log(err.message))
}
const completeItemsDateFields = (pivotalStories,mondayItems) => {
  return Promise.map(getDatesFieldsItems(mondayItems,pivotalStories), mondayItem => completeItemDateFields(mondayItem),{concurrency:15})
}

const update = amountOfPivotalMonth => {
  return Promise.props({
    pivotalStories: pivotal.getNMonthStories(amountOfPivotalMonth),
    mondayItems: monday.getUpdateableGroupsItems('id name created_at updates(limit : 100) {created_at text_body}')
  })
  .then(({pivotalStories,mondayItems}) => {console.log('mondayItems Amount: ',mondayItems.length); return completeItemsDateFields(pivotalStories,mondayItems)})
}

update(6)