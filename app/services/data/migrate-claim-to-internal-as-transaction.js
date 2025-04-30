const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')
const copyClaimDataToInternal = require('./copy-claim-data-to-internal')
const deleteClaimFromExternal = require('./delete-claim-from-external')

module.exports = (claimData, additionalData, eligibilityId, claimId) => {
  const db = getDatabaseConnector()

  return db
    .transaction(trx => {
      return copyClaimDataToInternal(claimData, additionalData, trx).then(() => {
        return deleteClaimFromExternal(eligibilityId, claimId, trx)
      })
    })
    .then(() => {
      log.info(`Claim with ClaimId: ${claimData.Claim.ClaimId} copied to internal`)
    })
    .catch(error => {
      log.error(`ERROR copying claim with ClaimId: ${claimData.Claim.ClaimId} to internal`)
      throw error
    })
}
