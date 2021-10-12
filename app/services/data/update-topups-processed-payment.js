const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, paymentDate) {
  const db = getDatabaseConnector()

  return db('IntSchema.TopUp')
    .where('ClaimId', claimId)
    .andWhere('PaymentStatus', 'PENDING')
    .update({
      PaymentStatus: 'PROCESSED',
      PaymentDate: paymentDate
    })
}
