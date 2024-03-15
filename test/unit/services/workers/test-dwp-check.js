const sinon = require('sinon')
const dwpCheckResultEnum = require('../../../../app/constants/dwp-check-result-enum')

const visitorDwpBenefitCheckerData = { visitorId: 1234, surname: 'YELLOW', dateOfBirth: '19681210', nino: 'PW556356A' }
const benefitCheckerResult = { visitorId: 1234, result: dwpCheckResultEnum.YES }

const getVisitorDwpBenefitCheckerData = sinon.stub().resolves(visitorDwpBenefitCheckerData)
const callDwpBenefitCheckerSoapService = sinon.stub().resolves(benefitCheckerResult)
const updateVisitorWithDwpBenefitCheckerResult = sinon.stub().resolves()
const autoApprovalProcess = sinon.stub().resolves()

jest.mock(
  '../data/get-visitor-dwp-benefit-checker-data',
  () => getVisitorDwpBenefitCheckerData
);

jest.mock(
  '../benefit-checker/call-dwp-benefit-checker-soap-service',
  () => callDwpBenefitCheckerSoapService
);

jest.mock(
  '../data/update-visitor-with-dwp-benefit-checker-result',
  () => updateVisitorWithDwpBenefitCheckerResult
);

jest.mock('../auto-approval/auto-approval-process', () => autoApprovalProcess);

const dwpCheck = require('../../../../app/services/workers/dwp-check')

const reference = '1234567'
const eligibilityId = '4321'
const claimId = 123

describe('services/workers/dwp-check', function () {
  it('should call to retrieve data then make benefit check call and finally run auto-approval checks', function () {
    return dwpCheck.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getVisitorDwpBenefitCheckerData.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(callDwpBenefitCheckerSoapService.calledWith(visitorDwpBenefitCheckerData)).toBe(true) //eslint-disable-line
      expect(updateVisitorWithDwpBenefitCheckerResult.calledWith(benefitCheckerResult.visitorId, benefitCheckerResult.result, null)).toBe(true) //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      sinon.toHaveBeenCalled()
    });
  })
})
