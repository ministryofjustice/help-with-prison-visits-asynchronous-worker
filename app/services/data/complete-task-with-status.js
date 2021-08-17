const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')
const log = require('../log')

module.exports = function (schema, taskId, status) {
  return knex(`${schema}.Task`).where('TaskId', taskId)
    .update({
      Status: status,
      DateProcessed: dateFormatter.now().toDate()
    })
    .catch(function (error) {
      log.error(`Failed to complete task with status: ${status}`)
      log.error(error)
      throw new Error(error)
    })
}
