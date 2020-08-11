const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = function (rejectionCutoffDate) {
  return knex('IntSchema.Claim')
    .join('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .where('Claim.DateReminderSent', '<', rejectionCutoffDate)
    .where('Claim.ReminderSent', true)
    .whereIn('Claim.Status', [claimStatusEnum.PENDING, claimStatusEnum.REQUEST_INFORMATION, claimStatusEnum.REQUEST_INFO_PAYMENT])
    .select('IntSchema.Claim.EligibilityId', 'IntSchema.Claim.Reference', 'IntSchema.Claim.ClaimId', 'IntSchema.Visitor.EmailAddress')
}
