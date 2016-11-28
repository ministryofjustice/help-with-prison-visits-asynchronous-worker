const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const statusEnum = require('../../../../app/constants/status-enum')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const reference1 = 'AUTOAPP'

var validAutoApprovalData = testHelper.getAutoApprovalData(reference1)
var validCheckResult = new AutoApprovalCheckResult('', true, '')

var getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
var autoApproveClaim = sinon.stub().resolves()
var areChildrenUnder18Stub = sinon.stub().returns(validCheckResult)
var costAndVarianceEqualOrLessThanFirstTimeClaimStub = sinon.stub().returns(validCheckResult)
var doExpensesMatchFirstTimeClaimStub = sinon.stub().returns(validCheckResult)
var hasClaimedLessThanMaxTimesThisYearStub = sinon.stub().returns(validCheckResult)
var hasUploadedPrisonVisitConfirmationAndReceiptsStub = sinon.stub().returns(validCheckResult)
var isClaimSubmittedWithinTimeLimitStub = sinon.stub().returns(validCheckResult)
var isClaimTotalUnderLimitStub = sinon.stub().returns(validCheckResult)
var isLatestManualClaimApprovedStub = sinon.stub().returns(validCheckResult)
var isNoPreviousPendingClaimStub = sinon.stub().returns(validCheckResult)
var isVisitInPastStub = sinon.stub().returns(validCheckResult)
var visitDateDifferentToPreviousClaimsStub = sinon.stub().returns(validCheckResult)

var autoApprovalChecks = {
  '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
  '../data/auto-approve-claim': autoApproveClaim,
  './checks/are-children-under-18': areChildrenUnder18Stub,
  './checks/cost-and-variance-equal-or-less-than-first-time-claim': costAndVarianceEqualOrLessThanFirstTimeClaimStub,
  './checks/do-expenses-match-first-time-claim': doExpensesMatchFirstTimeClaimStub,
  './checks/has-claimed-less-than-max-times-this-year': hasClaimedLessThanMaxTimesThisYearStub,
  './checks/has-uploaded-prison-visit-confirmation-and-receipts': hasUploadedPrisonVisitConfirmationAndReceiptsStub,
  './checks/is-claim-submitted-within-time-limit': isClaimSubmittedWithinTimeLimitStub,
  './checks/is-claim-total-under-limit': isClaimTotalUnderLimitStub,
  './checks/is-latest-manual-claim-approved': isLatestManualClaimApprovedStub,
  './checks/is-no-previous-pending-claim': isNoPreviousPendingClaimStub,
  './checks/is-visit-in-past': isVisitInPastStub,
  './checks/visit-date-different-to-previous-claims': visitDateDifferentToPreviousClaimsStub
}

var autoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', autoApprovalChecks)

describe('services/auto-approval/checks/auto-approval-process', function () {
  it('should return claimApproved false for PENDING claim', function () {
    var pendingData = {Claim: {Status: statusEnum.PENDING}}
    return autoApprovalProcess(pendingData)
      .then(function (result) {
        expect(result.claimApproved, 'should reject PENDING claims for auto-approval').to.be.false
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalProcess(validAutoApprovalData)
      .then(function (result) {
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledOnce(autoApproveClaim)
        for (var i = 0; i < Object.keys(autoApprovalChecks).length; i++) {
          // skip check for getDataForAutoApproval and autoApproveClaim, this is done above
          if (i < 2) continue

          var key = Object.keys(autoApprovalChecks)[i]
          var stub = autoApprovalChecks[key]

          sinon.assert.calledWith(stub, validAutoApprovalData)
        }
      })
  })
})
