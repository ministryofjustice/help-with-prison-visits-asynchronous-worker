/* eslint-disable import/order */
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = () => {
  return knex('IntSchema.AutoApproval').select(
    'AutoApprovalId',
    'EligibilityId',
    'Reference',
    'ClaimId',
    'EmailAddress',
  )
}
