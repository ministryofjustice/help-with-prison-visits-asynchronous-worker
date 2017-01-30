const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const config = require('../../../config')
const dateFormatter = require('../date-formatter')

const numberOfDays = config.PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS
const cleanupDate = dateFormatter.now().subtract(numberOfDays, 'days')

module.exports = function () {
  return knex('IntSchema.DirectPaymentFile')
    .where('DateCreated', '<', cleanupDate.toDate())
    .where('IsEnabled', 'true')
}
