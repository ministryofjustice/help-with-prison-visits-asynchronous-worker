const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, taskType, additionalData) {
  var task = {
    'Task': taskType,
    'Reference': reference,
    'EligibilityId': eligibilityId,
    'ClaimId': claimId,
    'AdditionalData': additionalData,
    'DateCreated': dateFormatter.now().toDate(),
    'Status': statusEnum.PENDING
  }

  return knex('IntSchema.Task').insert(task).returning('TaskId')
}
