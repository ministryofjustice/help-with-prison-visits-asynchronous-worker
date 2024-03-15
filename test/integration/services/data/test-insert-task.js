const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const statusEnum = require('../../../../app/constants/status-enum')

const insertTask = require('../../../../app/services/data/insert-task')

const reference = 'DWPTASK'
const eligibilityId = '4321'
const claimId = '1234'

describe('services/data/insert-task', function () {
  it('should create Task with Reference, ClaimId, Status and TaskType', function () {
    return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK)
      .then(function () {
        const db = getDatabaseConnector()

        return db.table('IntSchema.Task')
          .where({ Reference: reference, EligibilityId: eligibilityId, ClaimId: claimId, Task: tasksEnum.DWP_CHECK })
          .first()
          .then(function (result) {
            expect(result.Status).toBe(statusEnum.PENDING)
            expect(result.DateCreated).not.toBeNull() //eslint-disable-line
          })
      })
  })

  it('should set the AdditionalData field when an AdditionalData parameter is supplied', function () {
    const emailAddress = 'donotsend@apvs.com'
    return insertTask(reference, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, emailAddress)
      .then(function () {
        const db = getDatabaseConnector()

        return db.table('IntSchema.Task')
          .where({ Task: tasksEnum.ACCEPT_CLAIM_NOTIFICATION, Status: statusEnum.PENDING, Reference: reference, ClaimId: claimId })
          .first()
          .then(function (result) {
            expect(result.AdditionalData).toBe(emailAddress)
          })
      })
  })

  afterAll(function () {
    const db = getDatabaseConnector()

    return db('IntSchema.Task').where('Reference', reference).del()
  })
})
