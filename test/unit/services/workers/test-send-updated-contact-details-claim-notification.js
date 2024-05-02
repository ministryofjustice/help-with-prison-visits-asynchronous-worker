const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const FIRST_NAME = 'Joe'

const mockSendNotification = jest.fn().mockResolvedValue()
const mockGetFirstNameByClaimId = jest.fn().mockResolvedValue(FIRST_NAME)

jest.mock('../../../../app/services/notify/send-notification', () => mockSendNotification)
jest.mock('../../../../app/services/data/get-first-name-by-claimId', () => mockGetFirstNameByClaimId)

const sendUpdatedContactDetailsClaimNotification = require('../../../../app/services/workers/send-updated-contact-details-claim-notification')

describe('services/send-updated-contact-details-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendUpdatedContactDetailsClaimNotification
      .execute({
        reference: REFERENCE,
        claimId: CLAIM_ID,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
      })
      .then(function () {
        expect(mockGetFirstNameByClaimId).toHaveBeenCalledWith('IntSchema', CLAIM_ID)
        expect(mockSendNotification).toHaveBeenCalled()
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockSendNotification.mock.calls[0][2].first_name).toBe(FIRST_NAME)
        expect(mockSendNotification.mock.calls[0][2].technicalHelpUrl).not.toBeNull()
      })
  })
})
