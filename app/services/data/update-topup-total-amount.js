const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, totalAmount, deductionApplied) {
  const db = getDatabaseConnector()

  return db('IntSchema.TopUp')
    .where('claimId', claimId)
    .andWhere('PaymentStatus', 'PENDING')
    .update({ PaymentAmount: Number(totalAmount).toFixed(2), DeductionApplied: Number(deductionApplied).toFixed(2) })
}
