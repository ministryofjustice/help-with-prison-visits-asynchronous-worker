const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const tasksEnum = require('../../../../app/constants/tasks-enum')
const statusEnum = require('../../../../app/constants/status-enum')
const dateFormatter = require('../../../../app/services/date-formatter')

const insertTask = require('../../../../app/services/data/insert-task')

const reference = 'DWPTASK'
const eligibilityId = '4321'
const claimId = '1234'

describe('services/data/insert-task', function () {
  it('should create Task with Reference, ClaimId, Status and TaskType', function () {
    return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK)
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({ Reference: reference, EligibilityId: eligibilityId, ClaimId: claimId, Task: tasksEnum.DWP_CHECK })
          .first()
          .then(function (result) {
            expect(result.Status).to.be.equal(statusEnum.PENDING)
            expect(result.DateCreated).not.to.be.null //eslint-disable-line
          })
      })
  })

  it('should create Generate Direct Payments Task', function () {
    var currentDate = dateFormatter.now()
    var twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
    var twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
    return insertTask(reference, '', '', tasksEnum.GENERATE_DIRECT_PAYMENTS)
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({ Task: tasksEnum.GENERATE_DIRECT_PAYMENTS, Status: statusEnum.PENDING })
          .first()
          .then(function (result) {
            expect(result.Task).to.be.equal(tasksEnum.GENERATE_DIRECT_PAYMENTS)
            expect(result.Status).to.be.equal(statusEnum.PENDING)
            expect(result.DateCreated).to.be.within(twoMinutesAgo.toDate(), twoMinutesAhead.toDate())
          })
      })
  })

  it('should set the AdditionalData field when an AdditionalData parameter is supplied', function () {
    var emailAddress = 'donotsend@apvs.com'
    return insertTask(reference, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, emailAddress)
      .then(function () {
        return knex.table('IntSchema.Task')
          .where({ Task: tasksEnum.ACCEPT_CLAIM_NOTIFICATION, Status: statusEnum.PENDING, Reference: reference, ClaimId: claimId })
          .first()
          .then(function (result) {
            expect(result.AdditionalData).to.be.equal(emailAddress)
          })
      })
  })

  after(function () {
    return knex('IntSchema.Task').where('Reference', reference).del()
  })
})
