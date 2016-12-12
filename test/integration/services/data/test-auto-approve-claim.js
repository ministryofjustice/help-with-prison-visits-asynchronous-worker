const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')
const tasksEnum = require('../../../../app/constants/tasks-enum')

const autoApproveClaimExpenseStub = sinon.stub().resolves()
const insertTaskStub = sinon.stub().resolves()
const insertClaimEventStub = sinon.stub().resolves()

const autoApproveClaim = proxyquire('../../../../app/services/data/auto-approve-claim', {
  './auto-approve-claim-expenses': autoApproveClaimExpenseStub,
  '../data/insert-task': insertTaskStub,
  '../data/insert-claim-event': insertClaimEventStub
})

const REFERENCE = 'AUTOAPP'
const EMAIL_ADDRESS = 'donotsend@apvs.com'
var eligibilityId
var claimId

describe('services/data/auto-approve-claim', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
  })

  it('should update the status of the claim to AUTOAPPROVED, call to update expenses, send accept email and add claim event', function () {
    const CLAIM_EVENT = 'CLAIM-APPROVED'

    return autoApproveClaim(REFERENCE, eligibilityId, claimId, EMAIL_ADDRESS)
      .then(function () {
        return knex('IntSchema.Claim')
          .where('ClaimId', claimId)
          .first()
          .then(function (claim) {
            expect(claim.Status).to.equal(statusEnum.AUTOAPPROVED)
            expect(autoApproveClaimExpenseStub.calledWith(claimId)).to.be.true
            expect(insertTaskStub.calledWith(REFERENCE, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, EMAIL_ADDRESS)).to.be.true
            expect(insertClaimEventStub.calledWith(REFERENCE, eligibilityId, claimId, CLAIM_EVENT, null, null, false)).to.be.true
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
