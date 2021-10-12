const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, now) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where({ ClaimId: claimId })
    .update({
      ReminderSent: true,
      DateReminderSent: now
    })
}
