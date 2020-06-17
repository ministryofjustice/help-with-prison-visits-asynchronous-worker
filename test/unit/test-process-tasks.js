const Promise = require('bluebird')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const statusEnum = require('../../app/constants/status-enum')

var processTasks
var getPendingTasksAndMarkInProgress
var completeTaskWithStatus
var getWorkerForTask
const batchSize = 3

describe('process-tasks', function () {
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

  it('should get pending tasks for ExtSchema/IntSchema and call worker to execute', function () {
    getPendingTasksAndMarkInProgress.resolves([{ taskId: 1, task: 'task1' }, { taskId: 2, task: 'task2' }])
    getWorkerForTask.returns({
      execute: function () {
        return new Promise(function (resolve) {
          resolve('Done!')
        })
      }
    })
    completeTaskWithStatus.resolves({})

    return processTasks().then(function () {
      expect(getPendingTasksAndMarkInProgress.calledWith('ExtSchema', batchSize)).to.be.true //eslint-disable-line
      expect(getWorkerForTask.calledWith('task1')).to.be.true //eslint-disable-line
      expect(getWorkerForTask.calledWith('task2')).to.be.true //eslint-disable-line

      expect(getPendingTasksAndMarkInProgress.calledWith('IntSchema', batchSize)).to.be.true //eslint-disable-line

      expect(completeTaskWithStatus.calledWith('ExtSchema', 1, statusEnum.COMPLETE)).to.be.true //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('ExtSchema', 2, statusEnum.COMPLETE)).to.be.true //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('IntSchema', 1, statusEnum.COMPLETE)).to.be.true //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('IntSchema', 2, statusEnum.COMPLETE)).to.be.true //eslint-disable-line
    })
  })
})
