const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')
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
    var uniqueId = Math.floor(Date.now() / 100) - 14000000000
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
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(50, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'APPROVED'
        }
      },
      {
        Claim: { // Advance claim should not be used for auto-approval
          ClaimId: uniqueId + 1,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(70, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(70, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(71, 'days').toDate(),
          IsAdvanceClaim: true,
          Status: 'APPROVED'
        }
      },
      {
        Claim: {
          ClaimId: uniqueId + 2,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(60, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(50, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(40, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(30, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'REJECTED'
        }
      },
      {
        Claim: {
          ClaimId: uniqueId + 3,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(100, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(90, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(80, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(70, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'REJECTED'
        }
      },
      {
        Claim: { // This claim should be used for auto-approval time limit check
          ClaimId: uniqueId + 4,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(20, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'APPROVED'
        }
      },
      {
        Claim: { // Auto-approved claim should not be used for auto-approval
          ClaimId: uniqueId + 5,
          EligibilityId: claimData.Claim.EligibilityId,
          Reference: REFERENCE,
          DateOfJourney: dateFormatter.now().subtract(80, 'days').toDate(),
          DateCreated: dateFormatter.now().subtract(70, 'days').toDate(),
          DateSubmitted: dateFormatter.now().subtract(60, 'days').toDate(),
          DateReviewed: dateFormatter.now().subtract(10, 'days').toDate(),
          IsAdvanceClaim: false,
          Status: 'AUTO-APPROVED'
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
