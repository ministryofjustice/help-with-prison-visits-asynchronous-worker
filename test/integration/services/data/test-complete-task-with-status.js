const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const completeTaskWithStatus = require('../../../../app/services/data/complete-task-with-status')

describe('services/data/complete-task-with-status', function () {
  const newStatus = 'NEW-STATUS'
  var id

  before(function (done) {
    knex('ExtSchema.Task').insert(testHelper.getTaskObject('TEST', '1')).returning('TaskId')
    .then(function (taskId) {
      id = taskId
      done()
    })
  })

  it('should set status and set DateProcessed', function (done) {
    completeTaskWithStatus(id, newStatus).then(function () {
      return knex.first().table('ExtSchema.Task').where('TaskId', id).then(function (result) {
        var currentDate = new Date()
        expect(result.Status).to.be.equal(newStatus)
        expect(result.DateProcessed).to.be.within(currentDate.setMinutes(currentDate.getMinutes() - 2), currentDate.setMinutes(currentDate.getMinutes() + 2))
        done()
      })
    })
  })

  after(function (done) {
    // Clean up
    knex('ExtSchema.Task').where('TaskId', id).del().then(function () {
      done()
    })
  })
})
