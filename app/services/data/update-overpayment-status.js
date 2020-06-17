const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, reference, amount, days) {
  return knex('IntSchema.Claim')
    .where({ ClaimId: claimId, Reference: reference })
    .update({ IsOverpaid: true, OverpaymentAmount: amount, RemainingOverpaymentAmount: amount, OverpaymentReason: `Evidence not uploaded within ${days} days` })
}
