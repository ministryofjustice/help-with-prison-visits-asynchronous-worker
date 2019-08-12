const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (claimId, status) {
	if (status === statusEnum.PENDING || status === statusEnum.REQUEST_INFORMATION) {
	  return knex('IntSchema.Claim')
	  	.where({'ClaimId': claimId})
	  	.update({'Status': status, 'DateOfStatus': dateFormatter.now().toDate(), 'ReminderSent': false})
	} else {
	  return knex('IntSchema.Claim')
		.where({'ClaimId': claimId})
		.update({'Status': status, 'DateOfStatus': dateFormatter.now().toDate(), 'ReminderSent': null})
	}
}
