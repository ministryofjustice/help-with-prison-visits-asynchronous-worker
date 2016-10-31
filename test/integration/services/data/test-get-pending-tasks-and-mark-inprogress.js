const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')

const getPendingTasksAndMarkInProgress = require('../../../../app/services/data/get-pending-tasks-and-mark-inprogress')

describe('services/data/get-pending-tasks-and-mark-inprogress', function () {
  const batchSize = 3
  var ids = []
  var taskType = 'PENDING-TEST'
  before(function (done) {
    knex('ExtSchema.Task').insert([
      testHelper.getTaskObject(taskType, '1'),
      testHelper.getTaskObject(taskType, '2'),
      testHelper.getTaskObject(taskType, '3'),
      testHelper.getTaskObject(taskType, '4')
    ]).returning('TaskId')
    .then(function (taskIds) {
      ids = taskIds
      done()
    })
  })

  it('should return pending tasks and update task status to in progress', function (done) {
    getPendingTasksAndMarkInProgress(batchSize).then(function (tasks) {
      var testTasks = []
      tasks.forEach(function (task) {
        if (task.task === taskType) {
          testTasks.push(task)
        }
      })

      expect(testTasks.length).to.be.equal(batchSize)

      expect(testTasks[0].additionalData).to.be.equal('1')
      expect(testTasks[1].additionalData).to.be.equal('2')
      expect(testTasks[2].additionalData).to.be.equal('3')

      expect(testTasks[0].status).to.be.equal(statusEnum.INPROGRESS)
      expect(testTasks[1].status).to.be.equal(statusEnum.INPROGRESS)
      expect(testTasks[2].status).to.be.equal(statusEnum.INPROGRESS)

      done()
    })
  })

  after(function (done) {
    // Clean up
    knex('ExtSchema.Task').whereIn('TaskId', ids).del().then(function () {
      done()
    })
  })
})
