const deleteClaimFromExternal = require('../../data/delete-claim-from-external')
const { getDatabaseConnector } = require('../../../databaseConnector')
const log = require('../../log')

module.exports = function (eligibilityId, claimId) {
  const db = getDatabaseConnector()

  return db
    .transaction(function (trx) {
      return deleteClaimFromExternal(eligibilityId, claimId, trx)
    })
    .then(function () {
      log.info(`Bank Details for Claim with ClaimId: ${claimId} copied to internal`)
    })
    .catch(function (error) {
      log.error(`ERROR copying Bank Details for Claim with ClaimId: ${claimId} to internal`)
      throw error
    })
}
