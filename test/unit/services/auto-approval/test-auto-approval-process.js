const expect = require('chai').expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const claimTypeEnum = require('../../../../app/constants/claim-type-enum')
const statusEnum = require('../../../../app/constants/status-enum')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const REFERENCE = 'AUTOAPP'
const ELIGIBILITY_ID = 1234
const CLAIM_ID = 4321

var validAutoApprovalData = testHelper.getAutoApprovalData(REFERENCE)
var validCheckResult = new AutoApprovalCheckResult('', true, '')
var invalidCheckResult = new AutoApprovalCheckResult('', false, '')

var autoApprovalDataConstructorStub
var getDataForAutoApprovalCheckStub
var insertClaimEventStub
var insertTaskStub
var autoApproveClaimStub
var autoApprovalDependencies

var autoApprovalProcess

describe('services/auto-approval/checks/auto-approval-process', function () {
  beforeEach(function () {
    autoApprovalDataConstructorStub = sinon.stub().returns(validAutoApprovalData)
    getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
    insertClaimEventStub = sinon.stub().resolves()
    insertTaskStub = sinon.stub().resolves()
    autoApproveClaimStub = sinon.stub().resolves()

    autoApprovalDependencies = {
      '../../../config': { AUTO_APPROVAL_ENABLED: 'true' },
      './auto-approval-data-constructor': autoApprovalDataConstructorStub,
      '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
      '../data/auto-approve-claim': autoApproveClaimStub,
      '../data/insert-claim-event': insertClaimEventStub,
      '../data/insert-task': insertTaskStub,
      // All checks
      './checks/are-children-under-18': sinon.stub().returns(validCheckResult),
      './checks/cost-and-variance-equal-or-less-than-first-time-claim': sinon.stub().returns(validCheckResult),
      './checks/do-expenses-match-first-time-claim': sinon.stub().returns(validCheckResult),
      './checks/has-claimed-less-than-max-times-this-year': sinon.stub().returns(validCheckResult),
      './checks/has-uploaded-prison-visit-confirmation-and-receipts': sinon.stub().returns(validCheckResult),
      './checks/is-claim-submitted-within-time-limit': sinon.stub().returns(validCheckResult),
      './checks/is-claim-total-under-limit': sinon.stub().returns(validCheckResult),
      './checks/is-latest-manual-claim-approved': sinon.stub().returns(validCheckResult),
      './checks/is-prison-not-in-guernsey-jersey': sinon.stub().returns(validCheckResult),
      './checks/is-no-previous-pending-claim': sinon.stub().returns(validCheckResult),
      './checks/is-visit-in-past': sinon.stub().returns(validCheckResult),
      './checks/visit-date-different-to-previous-claims': sinon.stub().returns(validCheckResult)
    }

    autoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', autoApprovalDependencies)
  })

  it('should not execute auto approval process if config is set to false', function () {
    autoApprovalDependencies['../../../config'] = { AUTO_APPROVAL_ENABLED: 'false' }
    var disabledConfigAutoApprovalProcess = proxyquire('../../../../app/services/auto-approval/auto-approval-process', autoApprovalDependencies)

    return disabledConfigAutoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result).to.be.null
        sinon.assert.notCalled(getDataForAutoApprovalCheckStub)
        sinon.assert.notCalled(autoApproveClaimStub)
      })
  })

  it('should return claimApproved false for FIRST_TIME claim', function () {
    var firstTimeData = {Claim: {ClaimType: claimTypeEnum.FIRST_TIME}}
    getDataForAutoApprovalCheckStub.resolves(firstTimeData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject FIRST_TIME claims for auto-approval').to.be.false
      })
  })

  it('should return claimApproved false for PENDING claim', function () {
    var pendingData = {Claim: {Status: statusEnum.PENDING}}
    getDataForAutoApprovalCheckStub.resolves(pendingData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject PENDING claims for auto-approval').to.be.false
      })
  })

  it('should return claimApproved false for Advance claim', function () {
    var advanceClaimData = {Claim: {ClaimType: claimTypeEnum.REPEAT_CLAIM, Status: statusEnum.NEW, IsAdvanceClaim: true}}
    getDataForAutoApprovalCheckStub.resolves(advanceClaimData)

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved, 'should reject Advance claims for auto-approval').to.be.false
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.true
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledOnce(autoApproveClaimStub)
        var keys = Object.keys(autoApprovalDependencies)
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('check') < 0) continue
          sinon.assert.calledOnce(autoApprovalDependencies[key])
        }
      })
  })

  it('should call all relevant functions to retrieve auto approval data and perform checks for invalid claim', function () {
    var inautoApprovalDependencies = autoApprovalDependencies
    var keys = Object.keys(inautoApprovalDependencies)

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      // Ignore mocked data functions and only set some auto approval checks to true
      if (key.indexOf('data') > -1 || i % 2 === 0) {
        continue
      } else {
        inautoApprovalDependencies[key].returns(invalidCheckResult)
      }
    }

    return autoApprovalProcess(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function (result) {
        expect(result.claimApproved).to.be.false
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledOnce(insertClaimEventStub)
        var keys = Object.keys(autoApprovalDependencies)
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i]
          // skip check for getDataForAutoApproval, this is done above
          if (key.indexOf('check') < 0) continue
          sinon.assert.calledOnce(autoApprovalDependencies[key])
        }
      })
  })
})
