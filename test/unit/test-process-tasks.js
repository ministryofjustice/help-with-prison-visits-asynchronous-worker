const sinon = require('sinon')

const statusEnum = require('../../app/constants/status-enum')

let processTasks
let getPendingTasksAndMarkInProgress
let completeTaskWithStatus
let getWorkerForTask
const batchSize = 3

jest.mock('../config', () => ({
  ASYNC_WORKER_BATCH_SIZE: batchSize
}));

jest.mock('./services/log', () => ({
  info: function (message) {}
}));

jest.mock(
  './services/data/get-pending-tasks-and-mark-inprogress',
  () => getPendingTasksAndMarkInProgress
);

jest.mock('./services/data/complete-task-with-status', () => completeTaskWithStatus);
jest.mock('./services/get-worker-for-task', () => getWorkerForTask);

describe('process-tasks', function () {
  beforeEach(function (done) {
    getPendingTasksAndMarkInProgress = sinon.stub()
    completeTaskWithStatus = sinon.stub()
    getWorkerForTask = sinon.stub()

    processTasks = require('../../app/process-tasks')
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
      expect(getPendingTasksAndMarkInProgress.calledWith('ExtSchema', batchSize)).toBe(true) //eslint-disable-line
      expect(getWorkerForTask.calledWith('task1')).toBe(true) //eslint-disable-line
      expect(getWorkerForTask.calledWith('task2')).toBe(true) //eslint-disable-line

      expect(getPendingTasksAndMarkInProgress.calledWith('IntSchema', batchSize)).toBe(true) //eslint-disable-line

      expect(completeTaskWithStatus.calledWith('ExtSchema', 1, statusEnum.COMPLETE)).toBe(true) //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('ExtSchema', 2, statusEnum.COMPLETE)).toBe(true) //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('IntSchema', 1, statusEnum.COMPLETE)).toBe(true) //eslint-disable-line
      expect(completeTaskWithStatus.calledWith('IntSchema', 2, statusEnum.COMPLETE)).toBe(true) //eslint-disable-line
    });
  })
})
