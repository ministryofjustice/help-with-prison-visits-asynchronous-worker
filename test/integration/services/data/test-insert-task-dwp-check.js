const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../../../app/constants/tasks-enum')
const statusEnum = require('../../../../app/constants/status-enum')

const insertTaskDwpCheck = require('../../../../app/services/data/insert-task-dwp-check')

const reference = 'DWPTASK'
const claimId = '1234'

describe('services/data/insert-task-dwp-check', function () {
  it('should create Task with Reference, ClaimId, Status', function () {
    return insertTaskDwpCheck(reference, claimId)
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({'Reference': reference, 'ClaimId': claimId, 'Task': tasksEnum.DWP_CHECK})
          .first()
          .then(function (result) {
            expect(result.Status).to.be.equal(statusEnum.PENDING)
            expect(result.DateCreated).not.to.be.null
          })
      })
  })

  after(function () {
    return knex('IntSchema.Task').where({'Reference': reference, 'ClaimId': claimId}).del()
  })
})
