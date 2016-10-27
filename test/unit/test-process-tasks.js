const Promise = require('bluebird')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

var processTasks
var getPendingTasksAndMarkInProgress
var completeTaskWithStatus
var getWorkerForTask
const batchSize = 3

describe('processTasks', function () {
  beforeEach(function (done) {
    getPendingTasksAndMarkInProgress = sinon.stub()
    completeTaskWithStatus = sinon.stub()
    getWorkerForTask = sinon.stub()

    processTasks = proxyquire('../../app/process-tasks', {
      '../config': { ASYNC_WORKER_BATCH_SIZE: batchSize },
      './services/log': { info: function (message) {} },
      './services/data/get-pending-tasks-and-mark-inprogress': getPendingTasksAndMarkInProgress,
      './services/data/complete-task-with-status': completeTaskWithStatus,
      './services/get-worker-for-task': getWorkerForTask
    })
    done()
  })

  it('should get pending tasks and call worker to execute', function (done) {
    getPendingTasksAndMarkInProgress.resolves([{taskId: 1, task: 'task1'}, {taskId: 1, task: 'task2'}])
    getWorkerForTask.returns({
      execute: function () {
        return new Promise(function (resolve) {
          resolve('Done!')
        })
      }})
    completeTaskWithStatus.resolves({})

    processTasks().then(function () {
      expect(getPendingTasksAndMarkInProgress.calledWith(batchSize)).to.be.true
      expect(getWorkerForTask.calledWith('task1')).to.be.true
      expect(getWorkerForTask.calledWith('task2')).to.be.true
      expect(completeTaskWithStatus.calledTwice).to.be.true
      done()
    })
  })
})
