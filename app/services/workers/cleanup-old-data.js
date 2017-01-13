const moment = require('moment')
const config = require('../../../knexfile')

const getOldEligibilityData = require('../data/get-old-eligibility-data')
const getOldClaimData = require('../data/get-old-claim-data')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')

module.exports.execute = function (task) {
  var maxDaysBeforeDeleteData = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  var dateThreshold = moment().subtract(maxDaysBeforeDeleteData, 'days').toDate()

  return cleanEligibilityData(dateThreshold)
    .then(function () {
      return cleanClaimData(dateThreshold)
    })
}

function cleanEligibilityData (dateThreshold) {
  return getOldEligibilityData(dateThreshold)
    .then(function (oldEligibilityData) {
      oldEligibilityData.forEach(function (eligibilityData) {
        return deleteClaimFromExternal(eligibilityData.EligibilityId, eligibilityData.ClaimId)
      })
    })
}

function cleanClaimData (dateThreshold) {
  return getOldClaimData(dateThreshold)
    .then(function (oldClaimData) {
      oldClaimData.forEach(function (claimData) {
        return deleteClaimFromExternal(claimData.EligibilityId, claimData.ClaimId)
      })
    })
}
