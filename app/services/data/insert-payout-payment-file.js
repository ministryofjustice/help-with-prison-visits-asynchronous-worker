const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (filePath) {
  var fileMetadata = {
    'DateCreated': new Date(),
    'Filepath': filePath,
    'IsEnabled': true
  }

  return knex('IntSchema.PayoutPaymentFile').insert(fileMetadata).returning('PayoutPaymentFileId')
}
