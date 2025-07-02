const dwpCheckResultEnum = require('../../../../app/constants/dwp-check-result-enum')

const visitorDwpBenefitCheckerData = { visitorId: 1234, surname: 'YELLOW', dateOfBirth: '19681210', nino: 'PW556356A' }
const benefitCheckerResult = { visitorId: 1234, result: dwpCheckResultEnum.YES }

const mockGetVisitorDwpBenefitCheckerData = jest.fn().mockResolvedValue(visitorDwpBenefitCheckerData)
const mockCallDwpBenefitCheckerSoapService = jest.fn().mockResolvedValue(benefitCheckerResult)
const mockUpdateVisitorWithDwpBenefitCheckerResult = jest.fn().mockResolvedValue()
const mockAutoApprovalProcess = jest.fn().mockResolvedValue()

jest.mock(
  '../../../../app/services/data/get-visitor-dwp-benefit-checker-data',
  () => mockGetVisitorDwpBenefitCheckerData,
)

jest.mock(
  '../../../../app/services/benefit-checker/call-dwp-benefit-checker-soap-service',
  () => mockCallDwpBenefitCheckerSoapService,
)

jest.mock(
  '../../../../app/services/data/update-visitor-with-dwp-benefit-checker-result',
  () => mockUpdateVisitorWithDwpBenefitCheckerResult,
)

jest.mock('../../../../app/services/auto-approval/auto-approval-process', () => mockAutoApprovalProcess)

const dwpCheck = require('../../../../app/services/workers/dwp-check')

const reference = '1234567'
const eligibilityId = '4321'
const claimId = 123

describe('services/workers/dwp-check', () => {
  it('should call to retrieve data then make benefit check call and finally run auto-approval checks', () => {
    return dwpCheck
      .execute({
        reference,
        eligibilityId,
        claimId,
      })
      .then(() => {
        expect(mockGetVisitorDwpBenefitCheckerData).toHaveBeenCalledWith(reference, eligibilityId, claimId)
        expect(mockCallDwpBenefitCheckerSoapService).toHaveBeenCalledWith(visitorDwpBenefitCheckerData)
        expect(mockUpdateVisitorWithDwpBenefitCheckerResult).toHaveBeenCalledWith(
          benefitCheckerResult.visitorId,
          benefitCheckerResult.result,
          null,
        )
        expect(mockAutoApprovalProcess).toHaveBeenCalledWith(reference, eligibilityId, claimId)
      })
  })
})
