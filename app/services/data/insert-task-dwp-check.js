const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, claimId) {
  var task = {
    'Task': tasksEnum.DWP_CHECK,
    'Reference': reference,
    'ClaimId': claimId,
    'DateCreated': new Date(),
    'Status': statusEnum.PENDING
  }

  return knex('IntSchema.Task').insert(task).returning('TaskId')
}
