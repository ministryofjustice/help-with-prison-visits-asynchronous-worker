const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function () {
  var task = {
    'Task': tasksEnum.GENERATE_DIRECT_PAYMENTS,
    'DateCreated': new Date(),
    'Status': statusEnum.PENDING
  }

  return knex('IntSchema.Task').insert(task).returning('TaskId')
}
