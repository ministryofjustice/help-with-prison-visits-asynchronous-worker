const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const log = require('../log')
const Promise = require('bluebird').Promise

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
      return Promise.each(oldEligibilityData, function (eligibilityData) {
        return deleteOldFiles(eligibilityData.EligibilityId, eligibilityData.ClaimId, eligibilityData.Reference)
          .then(function () {
            return knex.transaction(function (trx) {
              return deleteClaimFromExternal(eligibilityData.EligibilityId, eligibilityData.ClaimId, trx)
            })
              .then(function () {
                log.info(`Claim with ClaimId: ${eligibilityData.ClaimId} removed from external`)
              })
              .catch(function (error) {
                log.error(`ERROR removing claim with ClaimId: ${eligibilityData.ClaimId} from external 1`)
                throw error
              })
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
            return knex.transaction(function (trx) {
              return deleteClaimFromExternal(claimData.EligibilityId, claimData.ClaimId, trx)
            })
              .then(function () {
                log.info(`Claim with ClaimId: ${claimData.ClaimId} removed from external`)
              })
              .catch(function (error) {
                log.error(`ERROR removing claim with ClaimId: ${claimData.ClaimId} from external 2`)
                throw error
              })
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
            return knex.transaction(function (trx) {
              return deleteClaimFromExternal(documentData.EligibilityId, documentData.ClaimId, trx)
            })
              .then(function () {
                log.info(`Claim with ClaimId: ${documentData.ClaimId} removed from external`)
              })
              .catch(function (error) {
                log.error(`ERROR removing claim with ClaimId: ${documentData.ClaimId} from external 3`)
                throw error
              })
          })
      })
    })
}
