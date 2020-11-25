const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (filePath, fileType) {
  const fileMetadata = {
    FileType: fileType,
    DateCreated: dateFormatter.now().toDate(),
    Filepath: filePath,
    IsEnabled: true
  }

  return knex('IntSchema.DirectPaymentFile').insert(fileMetadata).returning('PaymentFileId')
}
