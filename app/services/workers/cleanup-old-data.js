const dateFormatter = require('../date-formatter')
const config = require('../../../config')

const getOldEligibilityData = require('../data/get-old-eligibility-data')
const getOldClaimData = require('../data/get-old-claim-data')
const getOldClaimDocumentData = require('../data/get-old-claim-document-data')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')
const deleteOldFiles = require('../cleanup-old-data/delete-old-files')

module.exports.execute = function (task) {
  var maxDaysBeforeDeleteData = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA)
  var dateThreshold = dateFormatter.now().subtract(maxDaysBeforeDeleteData, 'days').toDate()

  return cleanEligibilityData(dateThreshold)
    .then(function () {
      return cleanClaimData(dateThreshold)
        .then(function () {
          return cleanClaimDocumentData(dateThreshold)
        })
    })
}

function cleanEligibilityData (dateThreshold) {
  return getOldEligibilityData(dateThreshold)
    .then(function (oldEligibilityData) {
      oldEligibilityData.forEach(function (eligibilityData) {
        return deleteOldFiles(eligibilityData.EligibilityId, eligibilityData.ClaimId, eligibilityData.Reference)
          .then(function () {
            return deleteClaimFromExternal(eligibilityData.EligibilityId, eligibilityData.ClaimId)
          })
      })
    })
}

function cleanClaimData (dateThreshold) {
  return getOldClaimData(dateThreshold)
    .then(function (oldClaimData) {
      oldClaimData.forEach(function (claimData) {
        return deleteOldFiles(claimData.EligibilityId, claimData.ClaimId, claimData.Reference)
          .then(function () {
            return deleteClaimFromExternal(claimData.EligibilityId, claimData.ClaimId)
          })
      })
    })
}

function cleanClaimDocumentData (dateThreshold) {
  return getOldClaimDocumentData(dateThreshold)
    .then(function (oldClaimDocumentData) {
      oldClaimDocumentData.forEach(function (documentData) {
        return deleteOldFiles(documentData.EligibilityId, documentData.ClaimId, documentData.Reference)
          .then(function () {
            return deleteClaimFromExternal(documentData.EligibilityId, documentData.ClaimId)
          })
      })
    })
}
