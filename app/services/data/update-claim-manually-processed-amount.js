const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, manuallyProcessedAmount) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update('ManuallyProcessedAmount', Number(manuallyProcessedAmount).toFixed(2))
}
