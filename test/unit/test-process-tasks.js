const statusEnum = require('../../app/constants/status-enum')

let processTasks
let mockGetPendingTasksAndMarkInProgress
let mockCompleteTaskWithStatus
let mockGetWorkerForTask
const batchSize = 3

jest.mock('../../config', () => ({
  ASYNC_WORKER_BATCH_SIZE: batchSize,
}))

jest.mock('../../app/services/log', () => ({
  info(_message) {}, // eslint-disable-line no-empty-function
}))

jest.mock('../../app/services/data/get-pending-tasks-and-mark-inprogress', () => mockGetPendingTasksAndMarkInProgress)

jest.mock('../../app/services/data/complete-task-with-status', () => mockCompleteTaskWithStatus)
jest.mock('../../app/services/get-worker-for-task', () => mockGetWorkerForTask)

describe('process-tasks', function () {
  beforeEach(function (done) {
    mockGetPendingTasksAndMarkInProgress = jest.fn()
    mockCompleteTaskWithStatus = jest.fn()
    mockGetWorkerForTask = jest.fn()

    processTasks = require('../../app/process-tasks')
    done()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should get pending tasks for ExtSchema/IntSchema and call worker to execute', function () {
    mockGetPendingTasksAndMarkInProgress.mockResolvedValue([
      { taskId: 1, task: 'task1' },
      { taskId: 2, task: 'task2' },
    ])
    mockGetWorkerForTask.mockReturnValue({
      execute() {
        return new Promise(function (resolve) {
          resolve('Done!')
        })
      },
    })
    mockCompleteTaskWithStatus.mockResolvedValue({})

    return processTasks().then(function () {
      expect(mockGetPendingTasksAndMarkInProgress).toHaveBeenCalledWith('ExtSchema', batchSize)
      expect(mockGetWorkerForTask).toHaveBeenCalledWith('task1')
      expect(mockGetWorkerForTask).toHaveBeenCalledWith('task2')

      expect(mockGetPendingTasksAndMarkInProgress).toHaveBeenCalledWith('IntSchema', batchSize)

      expect(mockCompleteTaskWithStatus).toHaveBeenCalledWith('ExtSchema', 1, statusEnum.COMPLETE)
      expect(mockCompleteTaskWithStatus).toHaveBeenCalledWith('ExtSchema', 2, statusEnum.COMPLETE)
      expect(mockCompleteTaskWithStatus).toHaveBeenCalledWith('IntSchema', 1, statusEnum.COMPLETE)
      expect(mockCompleteTaskWithStatus).toHaveBeenCalledWith('IntSchema', 2, statusEnum.COMPLETE)
    })
  })
})
