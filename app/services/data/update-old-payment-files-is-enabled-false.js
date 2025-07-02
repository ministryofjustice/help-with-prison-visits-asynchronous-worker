const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = oldPaymentIds => {
  const db = getDatabaseConnector()

  return db('IntSchema.DirectPaymentFile').whereIn('PaymentFileId', oldPaymentIds).update('IsEnabled', 'false')
}
