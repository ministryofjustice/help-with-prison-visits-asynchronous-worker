const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const log = require('../log')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')

module.exports = function (claimData, additionalData, eligibilityId, claimId) {
  return knex.transaction(function (trx) {
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
