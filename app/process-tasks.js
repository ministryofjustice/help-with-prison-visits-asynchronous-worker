const config = require('../config')
const log = require('./services/log')
const statusEnum = require('./constants/status-enum')
const getPendingTasksAndMarkInProgress = require('./services/data/get-pending-tasks-and-mark-inprogress')
const completeTaskWithStatus = require('./services/data/complete-task-with-status')
const getWorkerForTask = require('./services/get-worker-for-task')

module.exports = function () {
  const batchSize = parseInt(config.ASYNC_WORKER_BATCH_SIZE)

  return processTasksForSchema('ExtSchema', batchSize).then(function () {
    return processTasksForSchema('IntSchema', batchSize)
  })
}

function processTasksForSchema (schema, batchSize) {
  log.info(`Processing tasks for ${schema}`)

  return getPendingTasksAndMarkInProgress(schema, batchSize)
    .then(function (tasks) {
      log.info(`Found ${tasks.length} ${schema} tasks`)
      if (tasks.length === 0) { return }

      const promiseArray = []

      for (const task of tasks) {
        const worker = getWorkerForTask(task.task)

        if (worker) {
          promiseArray.push(executeWorkerForTask(schema, worker, task))
        } else {
          log.info(`Unable to find worker for task: ${task.task}`)
        }
      }

      return Promise.all(promiseArray)
    })
}

function executeWorkerForTask (schema, worker, task) {
  log.info(`Started task: ${schema}-${task.taskId}-${task.task}`)

  return worker.execute(task)
    .then(function () {
      log.info(`Completed running task: ${schema}-${task.taskId}-${task.task}`)
      return completeTaskWithStatus(schema, task.taskId, statusEnum.COMPLETE)
    }).catch(function (error) {
      log.error(`Failed running task: ${schema}-${task.taskId}-${task.task}`)
      log.error(error)
      return completeTaskWithStatus(schema, task.taskId, statusEnum.FAILED)
    })
}
