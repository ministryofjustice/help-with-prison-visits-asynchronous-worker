const Promise = require('bluebird')
const config = require('../config')
const log = require('./services/log')
const statusEnum = require('./constants/status-enum')
const getPendingTasksAndMarkInProgress = require('./services/data/get-pending-tasks-and-mark-inprogress')
const completeTaskWithStatus = require('./services/data/complete-task-with-status')
const getWorkerForTask = require('./services/get-worker-for-task')

module.exports = function () {
  var batchSize = config.ASYNC_WORKER_BATCH_SIZE

  return getPendingTasksAndMarkInProgress(batchSize)
    .then(function (tasks) {
      log.info(`found ${tasks.length} tasks`)
      if (tasks.length === 0) { return }

      var promiseArray = []

      for (var task of tasks) {
        var worker = getWorkerForTask(task.task)

        if (worker) {
          log.info(`started task: ${task.taskId}-${task.task}`)

          promiseArray.push(worker.execute(task)
            .then(function () {
              return completeTaskWithStatus(task.taskId, statusEnum.COMPLETE)
            }).catch(function (error) {
              log.info(`error running task: ${task.taskId}-${task.task}, error: ${error}`)
              return completeTaskWithStatus(task.taskId, statusEnum.FAILED)
            }))
        } else {
          log.info(`unable to find worker for task: ${task.task}`)
        }
      }

      return Promise.each(promiseArray, function (result) {
        log.info(`completed task: ${task.taskId}-${task.task}`)
      })
    })
}
