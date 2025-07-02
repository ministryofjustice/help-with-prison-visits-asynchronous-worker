const moment = require('moment')
const { getDatabaseConnector } = require('../../databaseConnector')
const statusEnum = require('../../constants/status-enum')

module.exports = (claimId, status) => {
  const db = getDatabaseConnector()

  if (status === statusEnum.PENDING || status === statusEnum.REQUEST_INFORMATION) {
    return db('IntSchema.Claim')
      .where({ ClaimId: claimId })
      .update({ Status: status, ReminderSent: false, DateReminderSent: null })
  }
  return db('IntSchema.Claim')
    .where({ ClaimId: claimId })
    .update({
      Status: status,
      ReminderSent: false,
      DateReminderSent: null,
      lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    })
}
