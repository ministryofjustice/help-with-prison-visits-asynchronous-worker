const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const completeTaskWithStatus = require('../../../../app/services/data/complete-task-with-status')

describe('services/data/complete-task-with-status', function () {
  const reference = 'COMPTAS'
  const newStatus = 'NEW-STATUS'
  var id

  before(function () {
    return knex('ExtSchema.Task')
    .insert(testHelper.getTaskObject('TEST-TASK', null, 'TEST'))
    .returning('TaskId')
    .then(function (taskId) {
      id = taskId
    })
  })

  it('should set status and set DateProcessed', function () {
    return completeTaskWithStatus('ExtSchema', id, newStatus).then(function () {
      return knex.first().table('ExtSchema.Task').where('TaskId', id).then(function (result) {
        var currentDate = new Date()
        expect(result.Status).to.be.equal(newStatus)
        expect(result.DateProcessed).to.be.within(currentDate.setMinutes(currentDate.getMinutes() - 2), currentDate.setMinutes(currentDate.getMinutes() + 2))
      })
    })
  })

  after(function () {
    return knex('ExtSchema.Task').where('Reference', reference).del()
  })
})
