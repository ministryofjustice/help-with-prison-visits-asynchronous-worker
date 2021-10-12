const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, reference, amount, days) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where({ ClaimId: claimId, Reference: reference })
    .update({ IsOverpaid: true, OverpaymentAmount: amount, RemainingOverpaymentAmount: amount, OverpaymentReason: `Evidence not uploaded within ${days} days` })
}
