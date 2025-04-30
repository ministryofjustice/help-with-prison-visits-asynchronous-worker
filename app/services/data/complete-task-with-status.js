const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const log = require('../log')

module.exports = (schema, taskId, status) => {
  const db = getDatabaseConnector()

  return db(`${schema}.Task`)
    .where('TaskId', taskId)
    .update({
      Status: status,
      DateProcessed: dateFormatter.now().toDate(),
    })
    .catch(error => {
      log.error(`Failed to complete task with status: ${status}`)
      log.error(error)
      throw new Error(error)
    })
}
