const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const moment = require('moment')

module.exports = function (claimId, status) {
  if (status === statusEnum.PENDING || status === statusEnum.REQUEST_INFORMATION) {
    return knex('IntSchema.Claim')
      .where({ ClaimId: claimId })
      .update({ Status: status, ReminderSent: false, DateReminderSent: null })
  } else {
    return knex('IntSchema.Claim')
      .where({ ClaimId: claimId })
      .update({ Status: status, ReminderSent: false, DateReminderSent: null, lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss.SSS') })
  }
}
