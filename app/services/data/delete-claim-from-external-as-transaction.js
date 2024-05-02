const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')
const deleteClaimFromExternal = require('./delete-claim-from-external')

module.exports = function (eligibilityId, claimId) {
  const db = getDatabaseConnector()

  return db
    .transaction(function (trx) {
      return deleteClaimFromExternal(eligibilityId, claimId, trx)
    })
    .then(function () {
      log.info(`Claim with ClaimId: ${claimId} removed from external`)
    })
    .catch(function (error) {
      log.error(`ERROR removing claim with ClaimId: ${claimId} from external`)
      throw error
    })
}
