const deleteClaimFromExternal = require('../../data/delete-claim-from-external')
const { getDatabaseConnector } = require('../../../databaseConnector')
const log = require('../../log')

module.exports = (eligibilityId, claimId) => {
  const db = getDatabaseConnector()

  return db
    .transaction(trx => {
      return deleteClaimFromExternal(eligibilityId, claimId, trx)
    })
    .then(() => {
      log.info(`Bank Details for Claim with ClaimId: ${claimId} copied to internal`)
    })
    .catch(error => {
      log.error(`ERROR copying Bank Details for Claim with ClaimId: ${claimId} to internal`)
      throw error
    })
}
