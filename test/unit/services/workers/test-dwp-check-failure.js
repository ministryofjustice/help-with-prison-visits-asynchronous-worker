const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const dwpCheckResultEnum = require('../../../../app/constants/dwp-check-result-enum')

const statusEnum = require('../../../../app/constants/status-enum')

var visitorDwpBenefitCheckerData = { visitorId: 1234, surname: 'YELLOW', dateOfBirth: '19681210', nino: 'PW556356A', benefit: 'employment-support' }
var benefitCheckerResult = { visitorId: 1234, result: dwpCheckResultEnum.NO }

var getVisitorDwpBenefitCheckerData = sinon.stub().resolves(visitorDwpBenefitCheckerData)
var callDwpBenefitCheckerSoapService = sinon.stub().resolves(benefitCheckerResult)
var updateVisitorWithDwpBenefitCheckerResult = sinon.stub().resolves()
var autoApprovalProcess = sinon.stub().resolves()

var insertTask = sinon.stub().resolves()
var insertDummyUploadLaterBenefitDocument = sinon.stub().resolves()
var insertClaimEventSystemMessage = sinon.stub().resolves()
var updateClaimStatus = sinon.stub().resolves()

const dwpCheck = proxyquire('../../../../app/services/workers/dwp-check', {
  '../data/get-visitor-dwp-benefit-checker-data': getVisitorDwpBenefitCheckerData,
  '../benefit-checker/call-dwp-benefit-checker-soap-service': callDwpBenefitCheckerSoapService,
  '../data/update-visitor-with-dwp-benefit-checker-result': updateVisitorWithDwpBenefitCheckerResult,
  '../auto-approval/auto-approval-process': autoApprovalProcess,
  '../data/insert-task': insertTask,
  './helpers/insert-dummy-upload-later-benefit-document': insertDummyUploadLaterBenefitDocument,
  '../data/insert-claim-event-system-message': insertClaimEventSystemMessage,
  '../data/update-claim-status': updateClaimStatus
})

const reference = '1234567'
const eligibilityId = '4321'
const claimId = 123

describe('services/workers/dwp-check', function () {
  it('should call to retrieve data then make benefit check call and NOT run auto-approval checks', function () {
    return dwpCheck.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getVisitorDwpBenefitCheckerData.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(callDwpBenefitCheckerSoapService.calledWith(visitorDwpBenefitCheckerData)).to.be.true //eslint-disable-line
      expect(updateVisitorWithDwpBenefitCheckerResult.calledWith(benefitCheckerResult.visitorId, benefitCheckerResult.result, statusEnum.REQUEST_INFORMATION)).to.be.true //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.false //eslint-disable-line
      sinon.assert.notCalled(autoApprovalProcess)
    })
  })
})
