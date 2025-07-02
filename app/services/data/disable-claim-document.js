const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')

module.exports = (schema, claimDocumentId) => {
  log.info(`disableClaimDocument (${claimDocumentId})`)
  const db = getDatabaseConnector()

  return db(`${schema}.ClaimDocument`).update('IsEnabled', false).where('ClaimDocumentId', claimDocumentId)
}
