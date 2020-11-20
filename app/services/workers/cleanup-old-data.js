const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const Promise = require('bluebird').Promise

const getOldEligibilityData = require('../data/get-old-eligibility-data')
const getOldClaimData = require('../data/get-old-claim-data')
const getOldClaimDocumentData = require('../data/get-old-claim-document-data')
const deleteOldFiles = require('../cleanup-old-data/delete-old-files')
const deleteFilesFromExternalAsTransaction = require('../data/delete-claim-from-external-as-transaction')

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
      return Promise.each(oldEligibilityData, function (eligibilityData) {
        return deleteOldFiles(eligibilityData.EligibilityId, eligibilityData.ClaimId, eligibilityData.Reference)
          .then(function () {
            return deleteFilesFromExternalAsTransaction(eligibilityData.EligibilityId, eligibilityData.ClaimId)
          })
      })
    })
}

function cleanClaimData (dateThreshold) {
  return getOldClaimData(dateThreshold)
    .then(function (oldClaimData) {
      return Promise.each(oldClaimData, function (claimData) {
        return deleteOldFiles(claimData.EligibilityId, claimData.ClaimId, claimData.Reference)
          .then(function () {
            return deleteFilesFromExternalAsTransaction(claimData.EligibilityId, claimData.ClaimId)
          })
      })
    })
}

function cleanClaimDocumentData (dateThreshold) {
  return getOldClaimDocumentData(dateThreshold)
    .then(function (oldClaimDocumentData) {
      return Promise.each(oldClaimDocumentData, function (documentData) {
        return deleteOldFiles(documentData.EligibilityId, documentData.ClaimId, documentData.Reference)
          .then(function () {
            return deleteFilesFromExternalAsTransaction(documentData.EligibilityId, documentData.ClaimId)
          })
      })
    })
}
