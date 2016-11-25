const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (filePath, fileType) {
  var fileMetadata = {
    'FileType': fileType,
    'DateCreated': new Date(),
    'Filepath': filePath,
    'IsEnabled': true
  }

  return knex('IntSchema.DirectPaymentFile').insert(fileMetadata).returning('PaymentFileId')
}
