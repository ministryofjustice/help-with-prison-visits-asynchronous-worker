const sinon = require('sinon')
const proxyquire = require('proxyquire')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const reference1 = 'AUTOAPP'

var validAutoApprovalData = testHelper.getAutoApprovalData(reference1)
var validCheckResult = new AutoApprovalCheckResult('', true, '')

var getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
var areChildrenUnder18Stub = sinon.stub().resolves(validCheckResult)
var costAndVarianceEqualOrLessThanFirstTimeClaimStub = sinon.stub().resolves(validCheckResult)
var doExpensesMatchFirstTimeClaimStub = sinon.stub().resolves(validCheckResult)
var hasClaimedLessThanMaxTimesThisYearStub = sinon.stub().resolves(validCheckResult)
var hasUploadedPrisonVisitConfirmationAndReceiptsStub = sinon.stub().resolves(validCheckResult)
var isClaimSubmittedWithinTimeLimitStub = sinon.stub().resolves(validCheckResult)
var isClaimTotalUnderLimitStub = sinon.stub().resolves(validCheckResult)
var isLatestManualClaimApprovedStub = sinon.stub().resolves(validCheckResult)
var isNoPreviousPendingClaimStub = sinon.stub().resolves(validCheckResult)
var isVisitInPastStub = sinon.stub().resolves(validCheckResult)
var visitDateDifferentToPreviousClaimsStub = sinon.stub().resolves(validCheckResult)

var autoApprovalChecks = {
  '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
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
  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalProcess(validAutoApprovalData)
      .then(function (result) {
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        for (var i = 0; i < Object.keys(autoApprovalChecks).length; i++) {
          // skip check for getDataForAutoApproval, this is done above
          if (i === 0) continue

          var key = Object.keys(autoApprovalChecks)[i]
          var stub = autoApprovalChecks[key]
          console.dir(stub)

          sinon.assert.calledWith(stub, validAutoApprovalData)
        }
      })
  })
})
