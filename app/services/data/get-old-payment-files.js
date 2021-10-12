const { getDatabaseConnector } = require('../../databaseConnector')
const config = require('../../../config')
const dateFormatter = require('../date-formatter')

const numberOfDays = config.PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS
const cleanupDate = dateFormatter.now().subtract(numberOfDays, 'days')

const getOldPaymentFiles = function () {
  const db = getDatabaseConnector()

  return db('IntSchema.DirectPaymentFile')
    .where('DateCreated', '<', cleanupDate.toDate())
    .where('IsEnabled', 'true')
}

module.exports = {
  getOldPaymentFiles
}
