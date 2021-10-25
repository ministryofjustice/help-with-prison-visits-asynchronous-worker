const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = function (filePath, fileType) {
  const db = getDatabaseConnector()

  const fileMetadata = {
    FileType: fileType,
    DateCreated: dateFormatter.now().toDate(),
    Filepath: filePath,
    IsEnabled: true
  }

  return db('IntSchema.DirectPaymentFile').insert(fileMetadata).returning('PaymentFileId')
}
