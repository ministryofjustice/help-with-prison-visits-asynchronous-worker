const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, eligibilityId, claimId, taskType, additionalData) {
  var task = {
    'Task': taskType,
    'Reference': reference,
    'EligibilityId': eligibilityId,
    'ClaimId': claimId,
    'AdditionalData': additionalData,
    'DateCreated': new Date(),
    'Status': statusEnum.PENDING
  }

  return knex('IntSchema.Task').insert(task).returning('TaskId')
}
