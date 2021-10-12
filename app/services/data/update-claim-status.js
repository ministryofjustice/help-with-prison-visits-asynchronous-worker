const { getDatabaseConnector } = require('../../databaseConnector')
const statusEnum = require('../../constants/status-enum')
const moment = require('moment')

module.exports = function (claimId, status) {
  const db = getDatabaseConnector()

  if (status === statusEnum.PENDING || status === statusEnum.REQUEST_INFORMATION) {
    return db('IntSchema.Claim')
      .where({ ClaimId: claimId })
      .update({ Status: status, ReminderSent: false, DateReminderSent: null })
  } else {
    return db('IntSchema.Claim')
      .where({ ClaimId: claimId })
      .update({ Status: status, ReminderSent: false, DateReminderSent: null, lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss.SSS') })
  }
}
