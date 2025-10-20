/* eslint-disable import/order */
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = () => {
  return knex('IntSchema.AutoApproval')
    .select('AutoApprovalId', 'EligibilityId', 'Reference', 'ClaimId', 'EmailAddress')
    .leftJoin('IntSchema.Claim', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.AutoApproval.ClaimId')
    .whereNotIn('IntSchema.Claim.Status', [statusEnum.APPROVED, statusEnum.AUTOAPPROVED, statusEnum.REJECTED])
}
