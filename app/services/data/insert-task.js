const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, eligibilityId, claimId, taskType) {
  var task = {
    'Task': taskType,
    'Reference': reference,
    'EligibilityId': eligibilityId,
    'ClaimId': claimId,
    'DateCreated': new Date(),
    'Status': statusEnum.PENDING
  }

  return knex('IntSchema.Task').insert(task).returning('TaskId')
}
