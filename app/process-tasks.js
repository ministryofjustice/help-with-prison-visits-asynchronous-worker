const Promise = require('bluebird')
const config = require('../config')
const statusEnum = require('./constants/status-enum')
const getPendingTasksAndMarkInProgress = require('./services/data/get-pending-tasks-and-mark-inprogress')
const completeTaskWithStatus = require('./services/data/complete-task-with-status')
const getWorkerForTask = require('./services/get-worker-for-task')

// TODO replace console logging with logger
module.exports = function () {
  var batchSize = config.ASYNC_WORKER_BATCH_SIZE

  return getPendingTasksAndMarkInProgress(batchSize).then(function (tasks) {
    console.log(`found ${tasks.length} tasks`)
    if (tasks.length === 0) { return }

    var promiseArray = []

    for (var task of tasks) {
      var worker = getWorkerForTask(task.task)

      if (worker) {
        console.log(`started task: ${task.taskId}-${task.task}`)

        promiseArray.push(worker.execute(task).then(function () {
          return completeTaskWithStatus(task.taskId, statusEnum.COMPLETE)
        }).catch(function (error) {
          console.log(`error running task: ${task.taskId}-${task.task}, error: ${error}`)
          return completeTaskWithStatus(task.taskId, statusEnum.FAILED)
        }))
      } else {
        console.log(`unable to find worker for task: ${task.task}`)
      }
    }

    return Promise.each(promiseArray, function (result) {
      console.log(`completed task: ${task.taskId}-${task.task}`)
    })
  })
}
