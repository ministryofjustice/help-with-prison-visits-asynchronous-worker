const sinon = require('sinon')
const proxyquire = require('proxyquire')
require('sinon-bluebird')

const testHelper = require('../../../test-helper')
const AutoApprovalCheckResult = require('../../../../app/services/domain/auto-approval-check-result')

const reference1 = 'AUTOAPP'

var validAutoApprovalData = testHelper.getAutoApprovalData(reference1)
var validCheckResult = new AutoApprovalCheckResult('', true, '')

var getDataForAutoApprovalCheckStub = sinon.stub().resolves(validAutoApprovalData)
var isLatestManualClaimApprovedStub = sinon.stub().resolves(validCheckResult)
var isNoPreviousPendingClaimStub = sinon.stub().resolves(validCheckResult)

var autoApprovalCheck = proxyquire('../../../../app/services/auto-approval/auto-approval-process', {
  '../data/get-data-for-auto-approval-check': getDataForAutoApprovalCheckStub,
  './checks/is-latest-manual-claim-approved': isLatestManualClaimApprovedStub,
  './checks/is-no-previous-pending-claim': isNoPreviousPendingClaimStub
})

describe('services/auto-approval/checks/auto-approval-process', function () {
  it('should call all relevant functions to retrieve auto approval data and perform checks', function () {
    return autoApprovalCheck(validAutoApprovalData)
      .then(function (result) {
        sinon.assert.calledOnce(getDataForAutoApprovalCheckStub)
        sinon.assert.calledWith(isLatestManualClaimApprovedStub, validAutoApprovalData)
        sinon.assert.calledWith(isNoPreviousPendingClaimStub, validAutoApprovalData)
      })
  })
})
