const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const log = require('../log')
const deleteClaimFromExternal = require('./delete-claim-from-external')

module.exports = function (eligibilityId, claimId) {
  return knex.transaction(function (trx) {
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
