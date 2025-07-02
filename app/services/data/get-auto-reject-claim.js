const { getDatabaseConnector } = require('../../databaseConnector')
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = rejectionCutoffDate => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .join('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .where('Claim.DateReminderSent', '<', rejectionCutoffDate)
    .where('Claim.ReminderSent', true)
    .whereIn('Claim.Status', [
      claimStatusEnum.PENDING,
      claimStatusEnum.REQUEST_INFORMATION,
      claimStatusEnum.REQUEST_INFO_PAYMENT,
    ])
    .select(
      'IntSchema.Claim.EligibilityId',
      'IntSchema.Claim.Reference',
      'IntSchema.Claim.ClaimId',
      'IntSchema.Visitor.EmailAddress',
    )
}
