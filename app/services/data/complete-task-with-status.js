const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (schema, taskId, status) {
  return knex(`${schema}.Task`).where('TaskId', taskId)
    .update({
      Status: status,
      DateProcessed: dateFormatter.now().toDate()
    })
}
