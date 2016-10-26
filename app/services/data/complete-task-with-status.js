const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (taskId, status) {
  return knex('ExtSchema.Task').where('TaskId', taskId)
  .update({
    'Status': status,
    'DateProcessed': new Date()
  })
}
