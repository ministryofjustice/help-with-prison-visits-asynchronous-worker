const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')
const autoApproveClaimExpenseStub = sinon.stub().resolves()
const autoApproveClaim = proxyquire('../../../../app/services/data/auto-approve-claim', {
  './auto-approve-claim-expenses': autoApproveClaimExpenseStub
})

const reference = 'AUTOAPP'
var claimId

describe('services/data/auto-approve-claim', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the status of the claim to AUTOAPPROVED', function () {
    var claimData = testHelper.getClaimData(reference)
    return testHelper.insertClaimData('IntSchema', reference, claimData.Claim.EligibilityId, claimData)
      .then(function (id) {
        claimId = id
        return autoApproveClaim(claimData, 'donotsend@apvs.com')
          .then(function () {
            return knex('IntSchema.Claim')
              .where('ClaimId', claimId)
              .first()
              .then(function (claim) {
                expect(claim.Status).to.equal(statusEnum.AUTOAPPROVED)
              })
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
