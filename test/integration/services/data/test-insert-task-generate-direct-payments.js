const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../../../app/constants/tasks-enum')
const statusEnum = require('../../../../app/constants/status-enum')

const insertTask = require('../../../../app/services/data/insert-task')

describe('services/data/insert-task', function () {
  it('should create Generate Direct Payments Task', function () {
    var currentDate = new Date()
    return insertTask('', '', '', tasksEnum.GENERATE_DIRECT_PAYMENTS)
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({'Task': tasksEnum.GENERATE_DIRECT_PAYMENTS, 'Status': statusEnum.PENDING})
          .first()
          .then(function (result) {
            expect(result.Task).to.be.equal(tasksEnum.GENERATE_DIRECT_PAYMENTS)
            expect(result.Status).to.be.equal(statusEnum.PENDING)
            expect(result.DateCreated).to.be.within(currentDate.setMinutes(currentDate.getMinutes() - 2), currentDate.setMinutes(currentDate.getMinutes() + 2))
          })
      })
  })

  after(function () {
    return knex('IntSchema.Task').first().del()
  })
})
