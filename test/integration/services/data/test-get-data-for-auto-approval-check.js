const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const testHelper = require('../../../test-helper')
const moment = require('moment')
require('sinon-bluebird')

const REFERENCE = 'AUTOAPD'
var eligibilityId
var claimId

var claimData
var previousClaims

var getAllClaimDataStub
var getDataForAutoApprovalCheck

describe('services/data/get-data-for-auto-approval-check', function () {
  before(function () {
    var uniqueId = Math.floor(Date.now() / 100) - 13000000000
    claimData = testHelper.getClaimData(REFERENCE)

    getAllClaimDataStub = sinon.stub().resolves(claimData)

    getDataForAutoApprovalCheck = proxyquire('../../../../app/services/data/get-data-for-auto-approval-check', {
      './get-all-claim-data': getAllClaimDataStub })

    eligibilityId = claimData.Claim.EligibilityId
    claimId = claimData.Claim.ClaimId

    previousClaims = [
      {
        Claim: {
          ClaimId: uniqueId,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: moment().subtract(80, 'days').toDate(),
          DateCreated: moment().subtract(70, 'days').toDate(),
          DateSubmitted: moment().subtract(60, 'days').toDate(),
          DateReviewed: moment().subtract(50, 'days').toDate(),
          Status: 'APPROVED'
        }
      },
      {
        Claim: {
          ClaimId: uniqueId + 1,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: moment().subtract(60, 'days').toDate(),
          DateCreated: moment().subtract(50, 'days').toDate(),
          DateSubmitted: moment().subtract(40, 'days').toDate(),
          DateReviewed: moment().subtract(30, 'days').toDate(),
          Status: 'REJECTED'
        }
      },
      {
        Claim: {
          ClaimId: uniqueId + 2,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: moment().subtract(100, 'days').toDate(),
          DateCreated: moment().subtract(90, 'days').toDate(),
          DateSubmitted: moment().subtract(80, 'days').toDate(),
          DateReviewed: moment().subtract(70, 'days').toDate(),
          Status: 'REJECTED'
        }
      }
    ]

    var createClaims = []
    previousClaims.forEach(function (previousClaim) {
      createClaims.push(testHelper.insertClaimData('IntSchema', REFERENCE, uniqueId + 1, previousClaim))
    })

    return Promise.all(createClaims)
  })

  it('should return all current and previous claim data associated to the claimant', function () {
    return getDataForAutoApprovalCheck(REFERENCE, eligibilityId, claimId)
      .then(function (result) {
        expect(result.previousClaims).to.not.be.null
        expect(result.latestManuallyApprovedClaim).to.not.be.null
        expect(result.latestManuallyApprovedClaim.ClaimId).to.equal(result.previousClaims[1].ClaimId)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
