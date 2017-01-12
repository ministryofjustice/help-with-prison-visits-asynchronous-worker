const moment = require('moment')
const config = require('../../../knexfile')

const getOldEligibilityData = require('../data/get-old-eligibility-data')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')

module.exports.execute = function (task) {
  var maxHoursBeforeDeleteData = parseInt(config.EXTERNAL_MAX_HOURS_BEFORE_DELETE_OLD_DATA)
  var dateThreshold = moment().subtract(maxHoursBeforeDeleteData, 'hours').toDate()

  return getOldEligibilityData(dateThreshold)
    .then(function (oldEligibilityData) {
      oldEligibilityData.forEach(function (eligibilityData) {
        return deleteClaimFromExternal(eligibilityData.EligibilityId, eligibilityData.ClaimId)
      })
    })
}
