const { getDatabaseConnector } = require('../../databaseConnector')
const statusEnum = require('../../constants/status-enum')
const Task = require('../domain/task')
const log = require('../log')

module.exports = function (schema, batchSize) {
  const db = getDatabaseConnector()

  return db
    .select()
    .table(`${schema}.Task`)
    .where('Status', statusEnum.PENDING)
    .orderBy('DateCreated', 'asc')
    .limit(batchSize)
    .then(function (results) {
      const tasks = []
      const ids = []
      if (results) {
        log.info(`Found pending tasks for ${schema}`)
        results.forEach(result => {
          ids.push(result.TaskId)
          tasks.push(
            new Task(
              result.TaskId,
              result.Task,
              result.Reference,
              result.EligibilityId,
              result.ClaimId,
              result.AdditionalData,
              result.DateCreated,
              result.DateProcessed,
              schema,
              statusEnum.INPROGRESS,
            ),
          )
        })
      } else {
        log.info(`Found no pending tasks for ${schema}`)
        return []
      }

      log.info(`Updating pending tasks status for ${schema}`)
      return db(`${schema}.Task`)
        .whereIn('TaskId', ids)
        .update('Status', statusEnum.INPROGRESS)
        .then(function () {
          log.info(`Pending tasks status updated for ${schema}`)
          return tasks
        })
        .catch(function (error) {
          log.error(error)
          return []
        })
    })
    .catch(function (error) {
      log.error(error)
      return []
    })
}
