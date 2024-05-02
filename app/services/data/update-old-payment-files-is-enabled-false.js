const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (oldPaymentIds) {
  const db = getDatabaseConnector()

  return db('IntSchema.DirectPaymentFile').whereIn('PaymentFileId', oldPaymentIds).update('IsEnabled', 'false')
}
