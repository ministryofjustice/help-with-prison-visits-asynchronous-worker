const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, now) {
  return knex('IntSchema.Claim')
    .where({ ClaimId: claimId })
    .update({
      ReminderSent: true,
      DateReminderSent: now
    })
}
