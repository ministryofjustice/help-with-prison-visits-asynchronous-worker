const dateFormatter = require('../date-formatter')
const config = require('../../../config')
require('../promise-each')

const getOldEligibilityData = require('../data/get-old-eligibility-data')
const getOldClaimData = require('../data/get-old-claim-data')
const getOldClaimDocumentData = require('../data/get-old-claim-document-data')
const deleteOldFiles = require('../cleanup-old-data/delete-old-files')
const deleteFilesFromExternalAsTransaction = require('../data/delete-claim-from-external-as-transaction')
const log = require('../log')

const cleanupOldData = () => {
  log.info('Clean up old data')
  const maxDaysBeforeDeleteData = parseInt(config.EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA, 10)
  const dateThreshold = dateFormatter.now().subtract(maxDaysBeforeDeleteData, 'days').toDate()

  return cleanEligibilityData(dateThreshold).then(() => {
    return cleanClaimData(dateThreshold).then(() => {
      return cleanClaimDocumentData(dateThreshold)
    })
  })
}

function cleanEligibilityData(dateThreshold) {
  return getOldEligibilityData(dateThreshold).then(oldEligibilityData => {
    return Promise.each(oldEligibilityData, eligibilityData => {
      return deleteOldFiles(eligibilityData.EligibilityId, eligibilityData.ClaimId, eligibilityData.Reference).then(
        () => {
          return deleteFilesFromExternalAsTransaction(eligibilityData.EligibilityId, eligibilityData.ClaimId)
        },
      )
    })
  })
}

function cleanClaimData(dateThreshold) {
  return getOldClaimData(dateThreshold).then(oldClaimData => {
    return Promise.each(oldClaimData, claimData => {
      return deleteOldFiles(claimData.EligibilityId, claimData.ClaimId, claimData.Reference).then(() => {
        return deleteFilesFromExternalAsTransaction(claimData.EligibilityId, claimData.ClaimId)
      })
    })
  })
}

function cleanClaimDocumentData(dateThreshold) {
  return getOldClaimDocumentData(dateThreshold).then(oldClaimDocumentData => {
    return Promise.each(oldClaimDocumentData, documentData => {
      return deleteOldFiles(documentData.EligibilityId, documentData.ClaimId, documentData.Reference).then(() => {
        return deleteFilesFromExternalAsTransaction(documentData.EligibilityId, documentData.ClaimId)
      })
    })
  })
}

module.exports = {
  cleanupOldData,
}
