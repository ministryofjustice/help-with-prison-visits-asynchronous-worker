const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../../../app/constants/status-enum')

const getPendingTasksAndMarkInProgress = require('../../../../app/services/data/get-pending-tasks-and-mark-inprogress')

describe('services/data/getPendingTasksAndMarkInProgress', function () {
  const batchSize = 3
  var ids = []

  before(function (done) {
    knex('ExtSchema.Task').insert([
      getTaskObject('TEST', '1'),
      getTaskObject('TEST', '2'),
      getTaskObject('TEST', '3'),
      getTaskObject('TEST', '4')
    ]).returning('TaskId')
    .then(function (taskIds) {
      ids = taskIds
      done()
    })
  })

  it('should return pending tasks and update task status to in progress', function (done) {
    getPendingTasksAndMarkInProgress(batchSize).then(function (tasks) {
      expect(tasks.length).to.be.equal(batchSize)

      expect(tasks[0].additionalData).to.be.equal('1')
      expect(tasks[1].additionalData).to.be.equal('2')
      expect(tasks[2].additionalData).to.be.equal('3')

      expect(tasks[0].status).to.be.equal(statusEnum.INPROGRESS)
      expect(tasks[1].status).to.be.equal(statusEnum.INPROGRESS)
      expect(tasks[2].status).to.be.equal(statusEnum.INPROGRESS)
    }).then(function () {
      return knex.select().table('ExtSchema.Task').where('Status', statusEnum.PENDING).then(function (results) {
        expect(results.length).to.be.equal(1)
        expect(results[0].AdditionalData).to.be.equal('4')
        done()
      })
    })
  })

  after(function (done) {
    // Clean up
    knex('ExtSchema.Task').whereIn('TaskId', ids).del().then(function () {
      done()
    })
  })
})

function getTaskObject (taskType, additionalData) {
  var reference = '1234567'
  var claimId = 123
  var dateCreated = new Date()
  var dateProcessed = null
  var status = 'PENDING'

  return {
    Task: taskType,
    Reference: reference,
    ClaimId: claimId,
    AdditionalData: additionalData,
    DateCreated: dateCreated,
    DateProcessed: dateProcessed,
    Status: status
  }
}
