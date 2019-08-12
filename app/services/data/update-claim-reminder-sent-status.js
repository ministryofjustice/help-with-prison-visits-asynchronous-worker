const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (claimId) {
  return knex('IntSchema.Claim')
  	.where({'ClaimId': claimId})
  	.update({'ReminderSent': true})
}
