const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')
const deleteClaimFromExternal = require('./delete-claim-from-external')

module.exports = (eligibilityId, claimId) => {
  const db = getDatabaseConnector()

  return db
    .transaction(trx => {
      return deleteClaimFromExternal(eligibilityId, claimId, trx)
    })
    .then(() => {
      log.info(`Claim with ClaimId: ${claimId} removed from external`)
    })
    .catch(error => {
      log.error(`ERROR removing claim with ClaimId: ${claimId} from external`)
      throw error
    })
}
