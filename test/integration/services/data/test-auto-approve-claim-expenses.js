const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)

const autoApproveClaimExpenses = require('../../../../app/services/data/auto-approve-claim-expenses')
const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')

const reference = 'AUTOAPV'
let claimId

describe('services/data/auto-approve-claim-expenses', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the status and approved cost of all specified claim expenses', function () {
    return autoApproveClaimExpenses(claimId)
      .then(function () {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimId', claimId)
          .then(function (claimExpenses) {
            claimExpenses.forEach(function (claimExpense) {
              expect(claimExpense.Status).to.equal(statusEnum.APPROVED)
              expect(claimExpense.ApprovedCost).to.equal(claimExpense.Cost)
            })
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
