const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')

const getPendingTasksAndMarkInProgress = require('../../../../app/services/data/get-pending-tasks-and-mark-inprogress')

describe('services/data/get-pending-tasks-and-mark-inprogress', function () {
  const batchSize = 3
  let ids = []
  const taskType = 'PENDING-TEST'
  beforeAll(function (done) {
    const db = getDatabaseConnector()

    db('ExtSchema.Task')
      .insert([
        testHelper.getTaskObject(taskType, '1'),
        testHelper.getTaskObject(taskType, '2'),
        testHelper.getTaskObject(taskType, '3'),
        testHelper.getTaskObject(taskType, '4'),
      ])
      .returning('TaskId')
      .then(function (taskIds) {
        ids = taskIds.map(task => task.TaskId)
        done()
      })
  })

  it('should return pending tasks and update task status to in progress', function (done) {
    getPendingTasksAndMarkInProgress('ExtSchema', batchSize).then(function (tasks) {
      const testTasks = []
      tasks.forEach(function (task) {
        if (task.task === taskType) {
          testTasks.push(task)
        }
      })

      expect(testTasks.length).toBe(batchSize)

      expect(testTasks[0].additionalData).toBe('1')
      expect(testTasks[1].additionalData).toBe('2')
      expect(testTasks[2].additionalData).toBe('3')

      expect(testTasks[0].status).toBe(statusEnum.INPROGRESS)
      expect(testTasks[1].status).toBe(statusEnum.INPROGRESS)
      expect(testTasks[2].status).toBe(statusEnum.INPROGRESS)

      done()
    })
  })

  afterAll(function (done) {
    // Clean up
    const db = getDatabaseConnector()

    db('ExtSchema.Task')
      .whereIn('TaskId', ids)
      .del()
      .then(function () {
        done()
      })
  })
})
