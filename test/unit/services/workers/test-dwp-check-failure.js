const dwpCheckResultEnum = require('../../../../app/constants/dwp-check-result-enum')

const statusEnum = require('../../../../app/constants/status-enum')

const visitorDwpBenefitCheckerData = {
  visitorId: 1234,
  surname: 'YELLOW',
  dateOfBirth: '19681210',
  nino: 'PW556356A',
  benefit: 'employment-support',
}
const benefitCheckerResult = { visitorId: 1234, result: dwpCheckResultEnum.NO }

const mockGetVisitorDwpBenefitCheckerData = jest.fn().mockResolvedValue(visitorDwpBenefitCheckerData)
const mockCallDwpBenefitCheckerSoapService = jest.fn().mockResolvedValue(benefitCheckerResult)
const mockUpdateVisitorWithDwpBenefitCheckerResult = jest.fn().mockResolvedValue()
const mockAutoApprovalProcess = jest.fn().mockResolvedValue()

const mockInsertTask = jest.fn().mockResolvedValue()
const mockInsertDummyUploadLaterBenefitDocument = jest.fn().mockResolvedValue()
const mockInsertClaimEventSystemMessage = jest.fn().mockResolvedValue()
const mockUpdateClaimStatus = jest.fn().mockResolvedValue()

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
jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)

jest.mock(
  '../../../../app/services/workers/helpers/insert-dummy-upload-later-benefit-document',
  () => mockInsertDummyUploadLaterBenefitDocument,
)

jest.mock('../../../../app/services/data/insert-claim-event-system-message', () => mockInsertClaimEventSystemMessage)

jest.mock('../../../../app/services/data/update-claim-status', () => mockUpdateClaimStatus)

const dwpCheck = require('../../../../app/services/workers/dwp-check')

const reference = '1234567'
const eligibilityId = '4321'
const claimId = 123

describe('services/workers/dwp-check', function () {
  it('should call to retrieve data then make benefit check call and NOT run auto-approval checks', function () {
    return dwpCheck
      .execute({
        reference,
        eligibilityId,
        claimId,
      })
      .then(function () {
        expect(mockGetVisitorDwpBenefitCheckerData).toHaveBeenCalledWith(reference, eligibilityId, claimId)
        expect(mockCallDwpBenefitCheckerSoapService).toHaveBeenCalledWith(visitorDwpBenefitCheckerData)
        expect(mockUpdateVisitorWithDwpBenefitCheckerResult).toHaveBeenCalledWith(
          benefitCheckerResult.visitorId,
          benefitCheckerResult.result,
          statusEnum.REQUEST_INFORMATION,
        )
        expect(mockAutoApprovalProcess).not.toHaveBeenCalled()
      })
  })
})
