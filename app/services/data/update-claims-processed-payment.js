const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, paymentAmount, paymentDate) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update({
      PaymentStatus: 'PROCESSED',
      PaymentAmount: Number(paymentAmount).toFixed(2),
      PaymentDate: paymentDate
    })
}
