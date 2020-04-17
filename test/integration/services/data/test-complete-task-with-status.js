const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const completeTaskWithStatus = require('../../../../app/services/data/complete-task-with-status')

describe('services/data/complete-task-with-status', function () {
  const newStatus = 'NEWSTAT'
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
        var currentDate = dateFormatter.now()
        var twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
        var twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
        expect(result.Status).to.be.equal(newStatus)
        expect(result.DateProcessed).to.be.within(twoMinutesAgo.toDate(), twoMinutesAhead.toDate())
      })
    })
  })

  after(function () {
    return knex('ExtSchema.Task').where('Task', 'TEST-TASK').del()
  })
})
