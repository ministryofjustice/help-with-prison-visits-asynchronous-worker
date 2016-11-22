const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../../../app/constants/tasks-enum')
const statusEnum = require('../../../../app/constants/status-enum')

const insertTaskGenerateDirectPayments = require('../../../../app/services/data/insert-task-generate-direct-payments')

describe('services/data/insert-task-generate-direct-payments', function () {
  it('should create Generate Direct Payments Task', function () {
    return insertTaskGenerateDirectPayments()
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({'Task': tasksEnum.GENERATE_DIRECT_PAYMENTS})
          .first()
          .then(function (result) {
            expect(result.Status).to.be.equal(statusEnum.PENDING)
            expect(result.DateCreated).not.to.be.null
          })
      })
  })

  after(function () {
    return knex('IntSchema.Task').first().del()
  })
})
