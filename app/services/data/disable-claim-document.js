const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const log = require('../log')

module.exports = function (schema, claimDocumentId) {
  log.info(`disableClaimDocument (${claimDocumentId})`)
  return knex(`${schema}.ClaimDocument`).update('IsEnabled', false).where('ClaimDocumentId', claimDocumentId)
}
