const deleteClaimFromExternal = require('../../data/delete-claim-from-external')
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const log = require('../../log')

module.exports = function (eligibilityId, claimId) {
  return knex.transaction(function (trx) { return deleteClaimFromExternal(eligibilityId, claimId, trx) })
    .then(function () {
      log.info(`Bank Details for Claim with ClaimId: ${claimId} copied to internal`)
    })
    .catch(function (error) {
      log.error(`ERROR copying Bank Details for Claim with ClaimId: ${claimId} to internal`)
      throw error
    })
}
