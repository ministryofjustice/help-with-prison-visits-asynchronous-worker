/* eslint-disable import/order */
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = () => {
  return knex('IntSchema.AutoApproval')
    .select(
      'IntSchema.AutoApproval.AutoApprovalId',
      'IntSchema.AutoApproval.EligibilityId',
      'IntSchema.AutoApproval.Reference',
      'IntSchema.AutoApproval.ClaimId',
      'IntSchema.AutoApproval.EmailAddress',
    )
    .leftJoin('IntSchema.Claim', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.AutoApproval.ClaimId')
    .whereNotIn('IntSchema.Claim.Status', [statusEnum.APPROVED, statusEnum.AUTOAPPROVED, statusEnum.REJECTED])
}
