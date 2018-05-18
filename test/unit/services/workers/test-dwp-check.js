const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const log = require('../../../../app/services/log')
const dwpCheckResultEnum = require('../../../../app/constants/dwp-check-result-enum')
require('sinon-bluebird')

var visitorDwpBenefitCheckerData = {'visitorId': 1234, 'surname': 'YELLOW', 'dateOfBirth': '19681210', 'nino': 'PW556356A'}
var benefitCheckerResult = {'visitorId': 1234, 'result': dwpCheckResultEnum.YES}
var failedBenefitCheckerResult = {'visitorId': 1234, 'result': dwpCheckResultEnum.NO}

var getVisitorDwpBenefitCheckerData = sinon.stub().resolves(visitorDwpBenefitCheckerData)
var callDwpBenefitCheckerSoapService = sinon.stub().resolves(benefitCheckerResult)
var updateVisitorWithDwpBenefitCheckerResult = sinon.stub().resolves()
var autoApprovalProcess = autoApprovalProcess = sinon.stub().resolves()

const dwpCheck = proxyquire('../../../../app/services/workers/dwp-check', {
  '../data/get-visitor-dwp-benefit-checker-data': getVisitorDwpBenefitCheckerData,
  '../benefit-checker/call-dwp-benefit-checker-soap-service': callDwpBenefitCheckerSoapService,
  '../data/update-visitor-with-dwp-benefit-checker-result': updateVisitorWithDwpBenefitCheckerResult,
  '../auto-approval/auto-approval-process': autoApprovalProcess
})

const reference = '1234567'
const eligibilityId = '4321'
const claimId = 123

describe('services/workers/dwp-check', function () {
  it('should call to retrieve data then make benefit check call and finally run auto-approval checks', function () {
    return dwpCheck.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getVisitorDwpBenefitCheckerData.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(callDwpBenefitCheckerSoapService.calledWith(visitorDwpBenefitCheckerData)).to.be.true
      expect(updateVisitorWithDwpBenefitCheckerResult.calledWith(benefitCheckerResult.visitorId, benefitCheckerResult.result, null)).to.be.true
      // sinon.assert.called(autoApprovalProcess)
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true
    })
  })
  it('should call to retrieve data then make benefit check call and NOT run auto-approval checks', function () {
    callDwpBenefitCheckerSoapService.resolves(failedBenefitCheckerResult)
    log.info(failedBenefitCheckerResult)
    return dwpCheck.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getVisitorDwpBenefitCheckerData.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(callDwpBenefitCheckerSoapService.calledWith(visitorDwpBenefitCheckerData)).to.be.true
      expect(updateVisitorWithDwpBenefitCheckerResult.calledWith(failedBenefitCheckerResult.visitorId, failedBenefitCheckerResult.result, null)).to.be.true
      sinon.assert.notCalled(autoApprovalProcess)
    })
  })
})
