const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')

module.exports = function (claimData, additionalData, eligibilityId, claimId) {
  const db = getDatabaseConnector()

  return db.transaction(function (trx) {
    return copyClaimDataToInternal(claimData, additionalData, trx)
      .then(function () {
        return deleteClaimFromExternal(eligibilityId, claimId, trx)
      })
  })
    .then(function () {
      log.info(`Claim with ClaimId: ${claimData.Claim.ClaimId} copied to internal`)
    })
    .catch(function (error) {
      log.error(`ERROR copying claim with ClaimId: ${claimData.Claim.ClaimId} to internal`)
      throw error
    })
}
