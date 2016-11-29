const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const statusEnum = require('../../../../app/constants/status-enum')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const reference1 = 'AUTOAPP'

var validAutoApprovalData = testHelper.getAutoApprovalData(reference1)
var validCheckResult = new AutoApprovalCheckResult('', true, '')
var invalidCheckResult = new AutoApprovalCheckResult('', false, '')

var autoApprovalDataConstructorStub = sinon.stub().returns(validAutoApprovalData)
var getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
var insertClaimEventDataStub = sinon.stub().resolves()
var insertTaskStub = sinon.stub().resolves()
var autoApproveClaimStub = sinon.stub().resolves()
var areChildrenUnder18Stub = sinon.stub().returns(validCheckResult)
var costAndVarianceEqualOrLessThanFirstTimeClaimStub = sinon.stub().returns(validCheckResult)
var doExpensesMatchFirstTimeClaimStub = sinon.stub().returns(validCheckResult)
var hasClaimedLessThanMaxTimesThisYearStub = sinon.stub().returns(validCheckResult)
var hasUploadedPrisonVisitConfirmationAndReceiptsStub = sinon.stub().returns(validCheckResult)
var isClaimSubmittedWithinTimeLimitStub = sinon.stub().returns(validCheckResult)
var isClaimTotalUnderLimitStub = sinon.stub().returns(validCheckResult)
var isLatestManualClaimApprovedStub = sinon.stub().returns(validCheckResult)
var isNoPreviousPendingClaimStub = sinon.stub().returns(validCheckResult)
var isPrisonNotInGuernseyJerseyStub = sinon.stub().returns(validCheckResult)
var isVisitInPastStub = sinon.stub().returns(validCheckResult)
var visitDateDifferentToPreviousClaimsStub = sinon.stub().returns(validCheckResult)

var validAutoApprovalChecks = {
  './auto-approval-data-constructor': autoApprovalDataConstructorStub,
  '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
  '../data/auto-approve-claim': autoApproveClaimStub,
  '../data/insert-claim-event-data': insertClaimEventDataStub,
  '../data/insert-task': insertTaskStub,
  './checks/are-children-under-18': areChildrenUnder18Stub,
  './checks/cost-and-variance-equal-or-less-than-first-time-claim': costAndVarianceEqualOrLessThanFirstTimeClaimStub,
  './checks/do-expenses-match-first-time-claim': doExpensesMatchFirstTimeClaimStub,
  './checks/has-claimed-less-than-max-times-this-year': hasClaimedLessThanMaxTimesThisYearStub,
  './checks/has-uploaded-prison-visit-confirmation-and-receipts': hasUploadedPrisonVisitConfirmationAndReceiptsStub,
  './checks/is-claim-submitted-within-time-limit': isClaimSubmittedWithinTimeLimitStub,
  './checks/is-claim-total-under-limit': isClaimTotalUnderLimitStub,
  './checks/is-latest-manual-claim-approved': isLatestManualClaimApprovedStub,
  './checks/is-prison-not-in-guernsey-jersey': isPrisonNotInGuernseyJerseyStub,
  './checks/is-no-previous-pending-claim': isNoPreviousPendingClaimStub,
  './checks/is-visit-in-past': isVisitInPastStub,
  './checks/visit-date-different-to-previous-claims': visitDateDifferentToPreviousClaimsStub
}

var autoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', validAutoApprovalChecks)

describe('services/auto-approval/checks/auto-approval-process', function () {
  it('should return claimApproved false for FIRST_TIME claim', function () {
    var firstTimeData = {Claim: {ClaimType: claimTypeEnum.FIRST_TIME}}
    return autoApprovalProcess(firstTimeData)
      .then(function (result) {
        expect(result.claimApproved, 'should reject FIRST_TIME claims for auto-approval').to.be.false
      })
  })

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
        var keys = Object.keys(validAutoApprovalChecks)
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('check') < 0) continue

          var stub = validAutoApprovalChecks[key]

          sinon.assert.calledWith(stub, validAutoApprovalData)
        }
      })
  })

  it('should return false if any of the auto approval checks fail', function () {
    var invalidAutoApprovalChecks = validAutoApprovalChecks
    var invalidCheckResultStub = sinon.stub().returns(invalidCheckResult)

    for (var i = 0; i < Object.keys(invalidAutoApprovalChecks).length; i++) {
      var key = Object.keys(invalidAutoApprovalChecks)[i]
      // Ignore mocked data functions and only set some auto approval checks to true
      if (key.indexOf('data') > -1 || i % 2 === 0) {
        continue
      } else {
        invalidAutoApprovalChecks[key] = invalidCheckResultStub
      }
    }

    var invalidAutoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', invalidAutoApprovalChecks)
    return invalidAutoApprovalProcess(validAutoApprovalData)
      .then(function (result) {
        expect(result.claimApproved).to.be.false
      })
  })
})
