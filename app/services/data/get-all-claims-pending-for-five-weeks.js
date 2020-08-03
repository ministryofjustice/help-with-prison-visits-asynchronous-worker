const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = function (reminderCutoffDate) {
  return knex('IntSchema.Claim')
    .join('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .where('Claim.LastUpdated', '<', reminderCutoffDate)
    .where(function () {
      this.where('IntSchema.Claim.ReminderSent', false)
        .orWhereNull('IntSchema.Claim.ReminderSent')
    })
    .whereIn('Claim.Status', [claimStatusEnum.PENDING, claimStatusEnum.REQUEST_INFORMATION, claimStatusEnum.REQUEST_INFO_PAYMENT])
    .select('IntSchema.Claim.EligibilityId', 'IntSchema.Claim.Reference', 'IntSchema.Claim.ClaimId', 'IntSchema.Visitor.EmailAddress')
}
